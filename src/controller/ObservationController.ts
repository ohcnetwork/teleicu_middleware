import type { Request, Response } from "express";

import { BadRequestException } from "@/Exception/BadRequestException";
import { NotFoundException } from "@/Exception/NotFoundException";
import type {
  LastObservationData,
  Observation,
  ObservationStatus,
  ObservationType,
  ObservationTypeWithWaveformTypes,
  StaticObservation,
} from "@/types/observation";
import { WebSocket } from "@/types/ws";
import { ObservationsMap } from "@/utils/ObservationsMap";
import { catchAsync } from "@/utils/catchAsync";
import { filterClients } from "@/utils/wsUtils";

export var staticObservations: StaticObservation[] = [];
var activeDevices: string[] = [];
var lastRequestData = {};
var logData: {
  dateTime: string;
  data: Observation[][];
}[] = [];
var statusData: ObservationStatus[] = [];
var lastObservationData: LastObservationData = {};
export let observationData: { time: Date; data: Observation[][] }[] = [];

const DEFAULT_LISTING_LIMIT = 10;

const getTime = (date: string) =>
  new Date(date.replace(" ", "T").concat("+0530"));

type _Observation = Observation | _Observation[];
const flattenObservations = (observations: _Observation): Observation[] => {
  if (Array.isArray(observations)) {
    return observations.reduce((acc, observation) => {
      return (acc as _Observation[]).concat(flattenObservations(observation));
    }, []) as Observation[];
  } else {
    return [observations];
  }
};

const addObservation = (observation: Observation) => {
  // console.log(
  //   observation["date-time"],
  //   ": ",
  //   observation.device_id,
  //   "|",
  //   observation.observation_id
  // );
  if (activeDevices.includes(observation.device_id)) {
    staticObservations = staticObservations.map((item) => {
      if (item.device_id === observation.device_id) {
        // Slice the observations to the last DEFAULT_LISTING_LIMIT entries
        const slicedObservations =
          item.observations[observation.observation_id]?.slice(
            -DEFAULT_LISTING_LIMIT,
          ) || [];
        return {
          ...item,
          observations: {
            ...item.observations,
            [observation.observation_id]: [...slicedObservations, observation],
          },
          last_updated: new Date(),
        };
      }
      return item;
    });
  } else {
    activeDevices.push(observation.device_id);
    staticObservations = [
      ...staticObservations,
      {
        device_id: observation.device_id,
        observations: {
          [observation.observation_id]: [observation],
        } as Record<ObservationType, Observation[]>,
        last_updated: new Date(),
      },
    ];
  }
};

const addLogData = (newData: Observation[][]) => {
  // Slice the log data to the last DEFAULT_LISTING_LIMIT entries
  logData = logData.slice(logData.length - DEFAULT_LISTING_LIMIT);
  logData = [
    ...logData,
    {
      dateTime: new Date().toISOString(),
      data: newData,
    },
  ];
};

const updateLastObservationData = (
  flattenedObservations: Observation[],
  skipEmpty = true,
) => {
  flattenedObservations.forEach((observation) => {
    const observationId: ObservationTypeWithWaveformTypes =
      observation.observation_id === "waveform"
        ? `waveform_${observation["wave-name"]}`
        : observation.observation_id;

    if (
      skipEmpty &&
      !observation.value &&
      !observation.data &&
      observation.status !== "final"
    ) {
      return;
    }

    lastObservationData[observationId] ??= {};
    lastObservationData[observationId]![observation.device_id] = observation;
  });
};

const filterStatusData = () => {
  const MIN_IN_MS = 60000;
  statusData = statusData.filter(
    (status) =>
      new Date().getTime() - new Date(status.time).getTime() <= 30 * MIN_IN_MS,
  );
};

const parseDataAsStatus = (data: Observation[][]) => {
  return {
    time: new Date(new Date().setSeconds(0, 0)).toISOString(),

    status: data.reduce(
      (acc, device_observations) => {
        device_observations.forEach((observation) => {
          const { device_id, status } = observation;
          acc[device_id] =
            status?.toLowerCase() === "disconnected" ? "down" : "up";
        });

        return acc;
      },
      {} as ObservationStatus["status"],
    ),
  };
};

const addStatusData = (data: Observation[][]) => {
  filterStatusData();

  const newStatus = parseDataAsStatus(data);

  const index = statusData.findIndex(
    (status) => status.time === newStatus.time,
  );

  if (index === -1) {
    statusData.push(newStatus);
    return;
  }

  statusData[index] = {
    time: newStatus.time,
    status: {
      ...statusData[index].status,
      ...newStatus.status,
    },
  };
};

export class ObservationController {
  // static variable to hold the latest observations

  static latestObservation = new ObservationsMap();

  static getObservations(req: Request, res: Response) {
    const limit = req.query?.limit || DEFAULT_LISTING_LIMIT;
    const ip = req.query?.ip;

    if (!ip) {
      return res.json(staticObservations);
    }
    // console.log("Filtering");
    const filtered = staticObservations.filter(
      (observation) => observation.device_id === ip,
    );
    // Sort the observation by last updated time.
    // .sort(
    //   (a, b) => new Date(a.lastObservationAt) - new Date(b.lastObservationAt)
    // )
    // // Limit the results
    // .slice(0, limit);

    return res.json(filtered ?? []);
  }

  static getLogData(req: Request, res: Response) {
    return res.json(logData);
  }

  static getLastRequestData(req: Request, res: Response) {
    return res.json(lastRequestData);
  }

  static updateObservations = (req: Request, res: Response) => {
    // database logic
    lastRequestData = req.body;
    // console.log("updateObservations", req.body);
    addLogData(req.body);
    addStatusData(req.body);
    const observations = req.body;
    observationData.push({ time: new Date(), data: observations });
    // If req.body.observations is an array, then we need to loop through it and create a new observation for each one
    // If req.body.observations is a single object, then we need to create a new observation for it
    // If req.body.observations is undefined, then we need to return an error
    // If req.body.observations is not an array or object, then we need to return an error
    if (!observations)
      throw new BadRequestException("No observations provided");

    if (typeof observations !== "object")
      throw new BadRequestException("Invalid observations provided");

    const flattenedObservations = flattenObservations(observations);

    updateLastObservationData(flattenedObservations);
    this.latestObservation.set(flattenedObservations);

    filterClients(req.wsInstance.getWss(), "/observations", undefined).forEach(
      (client: WebSocket) => {
        const filteredObservations = flattenedObservations?.filter(
          (observation: Observation) =>
            observation?.device_id === client?.params?.ip,
        );

        if (lastObservationData["blood-pressure"]?.[client?.params?.ip!]) {
          filteredObservations?.push(
            lastObservationData["blood-pressure"][client?.params?.ip!],
          );
        }

        if (filteredObservations.length) {
          client.send(JSON.stringify(filteredObservations));
        }
      },
    );

    flattenedObservations.forEach((observation: Observation) => {
      addObservation(observation);
    });

    return res.send(req.body);
  };

  static getTime = async (req: Request, res: Response) => {
    res.send({
      time: new Date().toISOString(),
    });
  };

  static getLatestVitals = catchAsync(async (req: Request, res: Response) => {
    const { device_id } = req.query;
    console.log(this.latestObservation);
    const data = this.latestObservation.get(device_id as string);

    if (!data)
      throw new NotFoundException(`No data found with device id ${device_id}`);

    res.send({
      status: "success",
      data,
    });
  });

  static status = catchAsync(async (req: Request, res: Response) => {
    filterStatusData();
    return res.json(statusData);
  });
}

import { BadRequestException } from "../Exception/BadRequestException.js";
import { NotFoundException } from "../Exception/NotFoundException.js";
import { catchAsync } from "../utils/catchAsync.js";
import { getAsset, getPatientId } from "../utils/dailyRoundUtils.js";
import { ObservationsMap } from "../utils/ObservationsMap.js";
import { filterClients } from "../utils/wsUtils.js";
import axios from 'axios'
import { careApi } from "../utils/configs.js";
import dayjs from "dayjs";
import { generateHeaders } from "../utils/assetUtils.js";
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

const dailyRoundTag = () => new Date().toISOString() + " [Daily Round] "

var staticObservations = [];
var activeDevices = [];
var lastRequestData = {};
var logData = [];

// start updating after 1 minutes of starting the middleware
let lastUpdatedToCare = new Date() - (59 * 60 * 1000)

const UPDATE_INTERVAL = 60 * 60 * 1000 // 1 hour
const DEFAULT_LISTING_LIMIT = 10;

const flattenObservations = (observations) => {
  if (Array.isArray(observations)) {
    return observations.reduce((acc, observation) => {
      return acc.concat(flattenObservations(observation));
    }, []);
  } else {
    return [observations];
  }
};

const addObservation = (observation) => {
  console.log(
    observation["date-time"],
    ": ",
    observation.device_id,
    "|",
    observation.observation_id
  );
  if (activeDevices.includes(observation.device_id)) {
    staticObservations = staticObservations.map((item) => {
      if (item.device_id === observation.device_id) {
        // Slice the observations to the last DEFAULT_LISTING_LIMIT entries
        const slicedObservations =
          item.observations[observation.observation_id]?.slice(
            -DEFAULT_LISTING_LIMIT
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
        },
        last_updated: new Date(),
      },
    ];
  }
};

const addLogData = (newData) => {
  // Slice the log data to the last DEFAULT_LISTING_LIMIT entries
  logData = logData.slice(logData.length - DEFAULT_LISTING_LIMIT);
  logData = [
    ...logData,
    {
      dateTime: new Date(),
      data: newData,
    },
  ];
};

const updateObservationsToCare = async () => {
  // console.log(dailyRoundTag() + "updateObservationsToCare called")
  const now = new Date()
  if (now - lastUpdatedToCare < UPDATE_INTERVAL) {
    // only update once per hour
    // console.log(dailyRoundTag() + "updateObservationsToCare skipped")
    return
  };
  lastUpdatedToCare = now

  const getValueFromData = (data) => {
    const stale = now - dayjs(data?.["date-time"], "YYYY-MM-DD HH:mm:ss") < UPDATE_INTERVAL
    if (data?.status === "final" && !stale) {
      return data?.value ?? null
    }
    return null
  }

  console.log(dailyRoundTag() + "Performing daily round")
  for (const observation of staticObservations) {
    try {
      if (now - observation.last_updated > UPDATE_INTERVAL) {
        console.log(dailyRoundTag() + "Skipping stale observations for device: " + observation.device_id)
        continue
      }

      console.log(dailyRoundTag() + ">> Updating observation for device:" + observation.device_id);

      const asset = await getAsset(observation.device_id);
      if (asset === null) {
        console.error(dailyRoundTag() + "Asset not found for assetIp: " + observation.device_id)
        continue
      }

      const { consultation_id, patient_id } = await getPatientId(asset.externalId);
      if (!patient_id) {
        console.error(dailyRoundTag() + "Patient not found for assetExternalId: " + asset.externalId)
        continue
      }

      console.error(dailyRoundTag() + "Compiling data for assetIp: " + asset.ipAddress)

      const data = observation.observations

      const rawValues = {
        taken_at: observation.last_updated,
        spo2: data["SpO2"]?.[0]?.value,
        resp: data["respiratory-rate"]?.[0]?.value,
        pulse: data["heart-rate"]?.[0]?.value,
        temperature: data["body-temperature1"]?.[0]?.value,
        temperature_measured_at: dayjs(data["body-temperature1"]?.[0]?.["date-time"], "YYYY-MM-DD HH:mm:ss").toISOString(),
        bp: {
          systolic: data["blood-pressure"]?.[0]?.systolic?.value,
          diastolic: data["blood-pressure"]?.[0]?.diastolic?.value
        }
      }

      // additional check to see if temperature is within range
      let temperature = getValueFromData(data["body-temperature1"]?.[0])
      let temperature_measured_at = null
      if (
        data["body-temperature1"]?.[0]?.["low-limit"] < temperature
        && temperature < data["body-temperature1"]?.[0]?.["high-limit"]
      ) {
        temperature_measured_at = rawValues.temperature_measured_at
      } else {
        temperature = null
      }

      // populate blood-pressure object if data is valid
      const bp = {}
      if (
        data["blood-pressure"]?.[0]?.status === "final"
        && now - dayjs(data["blood-pressure"]?.[0]?.["date-time"], "YYYY-MM-DD HH:mm:ss") < UPDATE_INTERVAL
      ) {
        bp.systolic = data["blood-pressure"]?.[0]?.systolic?.value ?? null
        bp.diastolic = data["blood-pressure"]?.[0]?.diastolic?.value ?? null
      }

      const payload = {
        spo2: getValueFromData(data["SpO2"]?.[0]),
        resp: getValueFromData(data["respiratory-rate"]?.[0]),
        pulse: getValueFromData(data["heart-rate"]?.[0]),
        temperature,
        temperature_measured_at,
        bp
      }

      console.log(dailyRoundTag() + "Data compiled for " + asset.ipAddress)
      console.table(rawValues)
      console.table(payload)

      //check if there is any data to update
      if (!Object.keys(payload).some((k) => {
        let val = payload[k]
        if (typeof val === "object") {
          return Object.keys(val).length != 0
        } else {
          return val != null
        }
      })) {
        console.error(dailyRoundTag() + "No data to update for assetIp: " + asset.ipAddress)
        continue
      }

      payload.taken_at = observation.last_updated
      payload.rounds_type = "AUTOMATED"

      axios.post(
        `${careApi}/api/v1/consultation/${consultation_id}/daily_rounds/`,
        payload,
        { headers: await generateHeaders(asset.externalId) }
      ).then(res => {
        if (!process.env.SKIP_SAVING_DAILY_ROUND) {
          prisma.dailyRound.create({
            data: {
              assetId: asset.id,
              status: res.statusText,
              data: JSON.stringify(payload),
              response: JSON.stringify(res.data)
            }
          })
        }
        console.log(res.data)
        console.log(dailyRoundTag() + "Updated observation for device: " + asset.ipAddress);
        return res
      }).catch(err => {
        if (!process.env.SKIP_SAVING_DAILY_ROUND) {
          prisma.dailyRound.create({
            data: {
              assetId: asset.id,
              status: err.response.statusText,
              data: JSON.stringify(payload),
              response: JSON.stringify(err.response?.data)
            }
          })
        }
        console.log(err.response?.data || err.response?.statusText)
        console.error(dailyRoundTag() + "Error updating observations to care for assetIp: " + asset.ipAddress)
        return err.response
      })

    } catch (error) {
      console.error(dailyRoundTag() + "Error performing observations for assetIp: " + observation.device_id)
    }
  }
  console.log(dailyRoundTag() + "Daily round finished")
}

export class ObservationController {
  // static variable to hold the latest observations

  static latestObservation = new ObservationsMap()

  static getObservations(req, res) {
    const limit = req.query?.limit || DEFAULT_LISTING_LIMIT;
    const ip = req.query?.ip;

    if (!ip) {
      return res.json(staticObservations);
    }
    // console.log("Filtering");
    const filtered = Object.values(staticObservations).reduce((acc, curr) => {
      // console.log("curr", curr);
      const latestValue = curr[ip];
      return latestValue;
    }, []);
    // Sort the observation by last updated time.
    // .sort(
    //   (a, b) => new Date(a.lastObservationAt) - new Date(b.lastObservationAt)
    // )
    // // Limit the results
    // .slice(0, limit);

    return res.json(filtered ?? []);
  }

  static getLogData(req, res) {
    return res.json(logData);
  }

  static getLastRequestData(req, res) {
    return res.json(lastRequestData);
  }

  static updateObservations = (req, res) => {
    // database logic
    lastRequestData = req.body;
    // console.log("updateObservations", req.body);
    addLogData(req.body);
    const observations = req.body;
    // If req.body.observations is an array, then we need to loop through it and create a new observation for each one
    // If req.body.observations is a single object, then we need to create a new observation for it
    // If req.body.observations is undefined, then we need to return an error
    // If req.body.observations is not an array or object, then we need to return an error
    if (!observations)
      throw new BadRequestException("No observations provided");

    if (typeof observations !== "object")
      throw new BadRequestException("Invalid observations provided");

    const flattenedObservations = flattenObservations(observations);

    this.latestObservation.set(flattenedObservations)

    filterClients(req.wsInstance.getWss(), "/observations").forEach(
      (client) => {
        const filteredObservations = flattenedObservations?.filter(
          (observation) => observation?.device_id === client?.params?.ip
        );
        if (filteredObservations.length) {
          client.send(JSON.stringify(filteredObservations));
        }
      }
    );

    flattenedObservations.forEach((observation) => {
      addObservation(observation);
    });

    updateObservationsToCare()

    return res.send(req.body);
  }

  static getTime = async (req, res) => {
    res.send({
      time: new Date().toISOString(),
    });
  };

  static getLatestVitals = catchAsync(async (req, res) => {
    const { device_id } = req.query
    const data = this.latestObservation.get(device_id)

    if (!data) throw new NotFoundException(`No data found with device id ${device_id}`)

    res.send({
      status: "success",
      data
    })
  })
}

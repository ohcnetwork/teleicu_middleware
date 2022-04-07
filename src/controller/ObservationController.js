var staticObservations = {};
var lastRequestData = {};
var logData = [];

const DEFAULT_LISTING_LIMIT = 10;

const addObservation = (observation) => {
  staticObservations = {
    ...staticObservations,
    [observation.device_id]: {
      ...staticObservations[observation.device_id],
      [observation.observation_id]: {
        firstObservationAt:
          staticObservations[observation.observation_id]?.firstObservationAt ??
          observation["date-time"],
        lastObservationAt: observation["date-time"],
        hits: (staticObservations[observation.observation_id]?.hits ?? 0) + 1,
        latestValue: observation,
      },
    },
  };
};

const addLogData = (newData) => {
  logData = logData.filter((log) => {
    if (log.dateTime - new Date() > 1000) {
      return false;
    }
    return true;
  });
  logData = [
    ...logData,
    {
      dateTime: new Date(),
      data: newData,
    },
  ];
};

export class ObservationController {
  // static variable to hold the latest observations

  static getObservations(req, res) {
    const limit = req.query?.limit || DEFAULT_LISTING_LIMIT;
    const ip = req.query?.ip;

    if (!ip) {
      return res.json(staticObservations);
    }

    const filtered = Object.values(staticObservations)
      .reduce((acc, curr) => {
        const latestValue = curr.latestValue;
        if (latestValue["device_id"] === ip) return [...acc, curr];
        return acc;
      }, [])
      // Sort the observation by last updated time.
      .sort(
        (a, b) => new Date(a.lastObservationAt) - new Date(b.lastObservationAt)
      )
      // Limit the results
      .slice(0, limit);

    return res.json(filtered);
  }

  static getLogData(req, res) {
    return res.json(logData);
  }

  static getLastRequestData(req, res) {
    return res.json(lastRequestData);
  }

  static updateObservations(req, res) {
    // database logic
    lastRequestData = req.body;
    console.log("updateObservations", req.body);
    addLogData(req.body);
    const observations = req.body;
    // If req.body.observations is an array, then we need to loop through it and create a new observation for each one
    // If req.body.observations is a single object, then we need to create a new observation for it
    // If req.body.observations is undefined, then we need to return an error
    // If req.body.observations is not an array or object, then we need to return an error
    if (observations === undefined) {
      res.status(400).send({
        message: "No observations provided",
      });
      return;
    }
    if (Array.isArray(observations)) {
      observations.forEach((observation) => {
        console.log("observation", observation.observation_id);
        addObservation(observation);
      });
      res.send(req.body);
    } else if (typeof observations === "object") {
      console.log("observation", observations.observation_id);
      addObservation(observations);
      res.send(req.body);
    } else {
      res.status(400).send({
        message: "Invalid observations provided",
      });
    }
    console.log("staticObservations", staticObservations);
  }

  static getTime = async (req, res) => {
    res.send({
      time: new Date().toISOString(),
    });
  };
}

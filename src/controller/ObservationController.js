var staticObservations = {};

const addObservation = (observation) => {
  staticObservations = {
    ...staticObservations,
    [observation.observation_id]: {
      firstObservationAt:
        staticObservations[observation.observation_id]?.firstObservationAt ??
        observation["date-time"],
      lastObservationAt: observation["date-time"],
      hits: (staticObservations[observation.observation_id]?.hits ?? 0) + 1,
      latestValue: JSON.stringify(observation),
    },
  };
};

export class ObservationController {
  // static variable to hold the latest observations

  static updateObservations(req, res) {
    // database logic
    console.log("updateObservations", req.body);
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

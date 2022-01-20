import express from "express";
import { ObservationController } from "../controller/ObservationController.js";
import { validate } from "../middleware/validate.js";
import { observationsValidators } from "../Validators/observationValidators.js";

const router = express();

router.post(
  "/update_observations",
  validate(observationsValidators),
  ObservationController.updateObservations
);

router.get("/get_time", ObservationController.getTime);

export { router as observationRouter };

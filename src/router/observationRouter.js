import express from "express";
import { ObservationController } from "../controller/ObservationController.js";
import { ExtractDataController } from "../controller/ExtractDataController.js";
import { validate } from "../middleware/validate.js";
import { observationsValidators, vitalsValidator } from "../Validators/observationValidators.js";
import {
  baseGetCameraParamsValidators,
} from "../Validators/cameraValidators.js";

const router = express.Router();

router.get("/get_observations", ObservationController.getObservations);

router.post(
  "/update_observations",
  validate(observationsValidators),
  ObservationController.updateObservations
);

router.get(
  "/vitals",
  validate(vitalsValidator),
  ObservationController.getLatestVitals
);

router.get("/get_time", ObservationController.getTime);

// Debugging Endpoints

router.get("/get_log_data", ObservationController.getLogData);

router.get("/get_last_request_data", ObservationController.getLastRequestData);

router.get(
  "/update_observation_auto",
  validate(baseGetCameraParamsValidators),
  ExtractDataController.extractData
);

export { router as observationRouter };

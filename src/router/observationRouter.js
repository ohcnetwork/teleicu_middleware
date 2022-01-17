import express from "express";
import { ObservationController } from "../controller/ObservationController.js";
import { validate } from "../middleware/validate.js";
import { observationsValidators } from "../Validators/observationValidators.js";

const router = express();

router.post(
  "/hl7",
  validate(observationsValidators),
  ObservationController.createObservation
);

export { router as observationRouter };

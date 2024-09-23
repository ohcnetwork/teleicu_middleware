import express from "express";

import {
  observationsValidators,
  vitalsValidator,
} from "@/Validators/observationValidators";
import { ObservationController } from "@/controller/ObservationController";
import { careJwtAuth } from "@/middleware/auth";
import { validate } from "@/middleware/validate";

const router = express.Router();

// blocked on nginx
router.post(
  "/update_observations",
  validate(observationsValidators),
  ObservationController.updateObservations,
);

router.get(
  "/vitals",
  careJwtAuth(),
  validate(vitalsValidator),
  ObservationController.getLatestVitals,
);

router.get("/devices/status", careJwtAuth(), ObservationController.status);

router.get("/get_time", ObservationController.getTime);

export { router as observationRouter };

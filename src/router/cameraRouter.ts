import express from "express";

import {
  baseGetCameraParamsValidators,
  camMoveValidator,
  gotoPresetValidator,
  setPresetValidators,
} from "@/Validators/cameraValidators";
import { CameraController } from "@/controller/CameraController";
import { validate } from "@/middleware/validate";
import { careJwtAuth } from "@/middleware/auth";

const router = express.Router();

router.use(careJwtAuth());

router.get(
  "/presets",
  validate(baseGetCameraParamsValidators),
  CameraController.getPresets,
);

router.post(
  "/presets",
  validate(setPresetValidators),
  CameraController.setPreset,
);

router.get(
  "/status",
  validate(baseGetCameraParamsValidators),
  CameraController.getStatus,
);

router.post("/cameras/status", CameraController.getCameraStatuses);

router.post(
  "/gotoPreset",
  validate(gotoPresetValidator),
  CameraController.gotoPreset,
);

router.post(
  "/absoluteMove",
  validate(camMoveValidator),
  CameraController.absoluteMove,
);

router.post(
  "/relativeMove",
  validate(camMoveValidator),
  CameraController.relativeMove,
);

export { router as cameraRouter };

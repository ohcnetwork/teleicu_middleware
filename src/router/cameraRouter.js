import express from "express";

import { CameraController } from "../controller/CameraController.js";
import { validate } from "../middleware/validate.js";
import {
  baseCameraParamsValidators,
  baseGetCameraParamsValidators,
  camMoveValidator,
  gotoPresetValidator,
} from "../Validators/cameraValidators.js";

const router = express.Router();

router.get(
  "/presets",
  validate(baseGetCameraParamsValidators),
  CameraController.getPresets
);

router.get(
  "/status",
  validate(baseGetCameraParamsValidators),
  CameraController.getStatus
);

router.post(
  "/gotoPreset",
  validate(gotoPresetValidator),
  CameraController.gotoPreset
);

router.post(
  "/absoluteMove",
  validate(camMoveValidator),
  CameraController.absoluteMove
);

router.post(
  "/relativeMove",
  validate(camMoveValidator),
  CameraController.relativeMove
);

// BPL Integration

export { router as cameraRouter };

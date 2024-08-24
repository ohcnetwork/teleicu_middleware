import express from "express";

import {
  baseGetCameraParamsValidators,
  camMoveValidator,
  gotoPresetValidator,
  setPresetValidators,
} from "@/Validators/cameraValidators";
import { CameraController } from "@/controller/CameraController";
import { careJwtAuth } from "@/middleware/auth";
import { validate } from "@/middleware/validate";

const router = express.Router();

router.get(
  "/presets",
  careJwtAuth(),
  validate(baseGetCameraParamsValidators),
  CameraController.getPresets,
);

router.post(
  "/presets",
  careJwtAuth(),
  validate(setPresetValidators),
  CameraController.setPreset,
);

router.get(
  "/status",
  careJwtAuth(),
  validate(baseGetCameraParamsValidators),
  CameraController.getStatus,
);

router.post(
  "/cameras/status",
  careJwtAuth(),
  CameraController.getCameraStatuses,
);

router.post(
  "/gotoPreset",
  careJwtAuth(),
  validate(gotoPresetValidator),
  CameraController.gotoPreset,
);

router.post(
  "/absoluteMove",
  careJwtAuth(),
  validate(camMoveValidator),
  CameraController.absoluteMove,
);

router.post(
  "/relativeMove",
  careJwtAuth(),
  validate(camMoveValidator),
  CameraController.relativeMove,
);

export { router as cameraRouter };

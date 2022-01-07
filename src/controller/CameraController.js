import { CameraUtils } from "../utils/CameraUtils.js";
import { catchAsync } from "../utils/catchAsync.js";

export class CameraController {
  static _getCamParams = (body) => {
    const { hostname, username, password, port } = body;

    const camParams = {
      useSecure: port === 443,
      hostname,
      username,
      password,
      port,
    };

    return camParams;
  };

  static gotoPreset = catchAsync(async (req, res) => {
    const camParams = this._getCamParams(req.body);
    const { preset } = req.body;

    await CameraUtils.gotoPreset({ camParams, preset });

    res.send({
      status: "success",
      message: `Camera preset is set to ${preset}.`,
    });
  });

  static getPresets = catchAsync(async (req, res) => {
    const camParams = this._getCamParams(req.query);
    const presets = await CameraUtils.getPreset({ camParams });
    res.send(presets);
  });

  static getStatus = catchAsync(async (req, res) => {
    const camParams = this._getCamParams(req.body);
    const status = await CameraUtils.getStatus({ camParams });

    res.send(status);
  });

  static absoluteMove = catchAsync(async (req, res) => {
    const camParams = this._getCamParams(req.body);
    const { x, y, zoom } = req.body;

    await CameraUtils.absoluteMove({ camParams, x, y, zoom });

    res.send({
      status: "success",
      message: `Camera position updated!`,
    });
  });

  static relativeMove = catchAsync(async (req, res) => {
    const camParams = this._getCamParams(req.body);
    const { x, y, zoom } = req.body;

    await CameraUtils.relativeMove({ camParams, x, y, zoom });

    res.send({
      status: "success",
      message: `Camera position updated!`,
    });
  });
}

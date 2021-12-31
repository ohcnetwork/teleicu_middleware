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

  /**
   * @swagger
   * /gotopreset:
   *   post:
   *     summary: "Move camera to preset"
   *     description: ""
   *     tags:
   *       - preset
   *     requestBody:
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               hostname:
   *                 type: string
   *                 required: true
   *               username:
   *                 type: string
   *                 required: true
   *               password:
   *                 type: string
   *                 required: true
   *               port:
   *                 type: integer
   *                 required: true
   *               preset:
   *                 type: integer
   *                 required: true
   *     responses:
   *       "200":
   *         description: Return success message
   *         schema:
   *           type: object
   *           properties:
   *             message:
   *               type: string
   *               default: 'Camera preset is set to 1.'
   *             status:
   *               type: string
   *               default: 'success'
   */
  static gotoPreset = catchAsync(async (req, res) => {
    const camParams = this._getCamParams(req.body);
    const { preset } = req.body;

    await CameraUtils.gotoPreset({ camParams, preset });

    res.send({
      status: "success",
      message: `Camera preset is set to ${preset}.`,
    });
  });

  /**
   * @swagger
   * /presets:
   *   get:
   *     summary: "List all presets"
   *     description: ""
   *     tags:
   *       - preset
   *     requestBody:
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               hostname:
   *                 type: string
   *                 required: true
   *               username:
   *                 type: string
   *                 required: true
   *               password:
   *                 type: string
   *                 required: true
   *               port:
   *                 type: integer
   *                 required: true
   *     responses:
   *       "200":
   *         description: Return all available presets
   */

  static getPresets = catchAsync(async (req, res) => {
    const camParams = this._getCamParams(req.body);
    const presets = await CameraUtils.getPreset({ camParams });
    res.send(presets);
  });

  static getStatus = catchAsync(async (req, res) => {
    const camParams = this._getCamParams(req.body);
    const status = await CameraUtils.getStatus({ camParams });

    res.send(status);
  });

  /**
   * @swagger
   * /absoluteMove:
   *   post:
   *     summary: "Move camera to absolute position"
   *     description: ""
   *     tags:
   *       - preset
   *     requestBody:
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               hostname:
   *                 type: string
   *                 required: true
   *               username:
   *                 type: string
   *                 required: true
   *               password:
   *                 type: string
   *                 required: true
   *               port:
   *                 type: number
   *                 required: true
   *               x:
   *                 type: number
   *                 required: true
   *               y:
   *                 type: number
   *                 required: true
   *               zoom:
   *                 type: number
   *                 required: true
   *
   *     responses:
   *       "200":
   *         description: Return all available presets
   */

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
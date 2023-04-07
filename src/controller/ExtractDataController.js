
import { CameraUtils } from "../utils/CameraUtils.js";
import { catchAsync } from "../utils/catchAsync.js";
import { downloadImage } from "./helper/downloadImageWithDigestRouter.js";
import axios  from 'axios';
import path from "path";
import fs from 'fs';
import FormData from 'form-data';

import * as dotenv from "dotenv";
dotenv.config({ path: "./.env" });

const MONITOR_PRESET_NAME = "5 Para";

const OCR_URL = process.env.OCR_URL;

export class ExtractDataController {
    // get camera params
    static _getCamParams = (body) => {
        const { hostname, username, password, port } = body;

        const camParams = {
        useSecure: Number(port) === 443,
        hostname,
        username,
        password,
        port: Number(port),
        };

        return camParams;
    };

    /**
   * @swagger
   * /update_observation_auto:
   *   get:
   *     summary: "Extract 5 para monitor readings"
   *     description: ""
   *     tags:
   *       - extract_data
    *     parameters:
   *       - name: hostname
   *         in: query
   *         required: true
   *         schema:
   *           type: string
   *       - name: username
   *         in: query
   *         required: true
   *         schema:
   *           type: string
   *       - name: password
   *         in: query
   *         required: true
   *         schema:
   *           type: string
   *       - name: port
   *         in: query
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       "200":
   *         description: Return all available presets
   */
    static extractData = catchAsync(async (req, res) => {

        // get camera params
        const camParams = this._getCamParams(req.query);

        // get all presets for a camera
        const presets = await CameraUtils.getPreset({ camParams });


        // get 5 para preset value 
        const cameraViewPreset = presets[MONITOR_PRESET_NAME];

        // move camera to 5 para preset
        await CameraUtils.gotoPreset({ camParams, cameraViewPreset })

        // get snapshot url
        const snapshotUrl = await CameraUtils.getSnapshotUri({ camParams });

        // download image from snapshot url
        const fileName = "image-" + new Date().getTime() + ".jpeg"
        const imagePath = path.resolve("images", fileName)
        const testImg = path.resolve("images", "test.png")
        await downloadImage(snapshotUrl.uri, imagePath, camParams.username, camParams.password)

        // POST request with image to ocr
        const bodyFormData = new FormData();
        bodyFormData.append('image', fs.createReadStream(testImg));

        const response = await axios.post(OCR_URL, bodyFormData, {
            headers: {
                ...bodyFormData.getHeaders()
            }
        })

        console.log(response.data)

        // delete image
        // fs.unlink(imagePath, (err) => {
        //     if (err) {
        //         // TODO: Critical logger setup
        //         console.error(err)
        //     }
        // })

        res.send({
        status: "success",
        message: `Done`,
        });


        
    });


}

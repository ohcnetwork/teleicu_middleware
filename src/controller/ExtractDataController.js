
import { CameraUtils } from "../utils/CameraUtils.js";
import { catchAsync } from "../utils/catchAsync.js";
import { downloadImage } from "./helper/downloadImageWithDigestRouter.js";
import axios  from 'axios';
import path from "path";
import fs from 'fs';
import FormData from 'form-data';
import { getPatientId } from "../utils/dailyRoundUtils.js";
import { careApi } from "../utils/configs.js";
import { generateHeaders } from "../utils/assetUtils.js";

import * as dotenv from "dotenv";

dotenv.config({ path: "./.env" });

const MONITOR_PRESET_NAME = "5 Para";

const OCR_URL = process.env.OCR_URL;

const celsiusToFahrenheit = (celsius)=> {
    celsius = parseFloat(celsius)
    const fahrenheit = (celsius * 9/5) + 32;
    return fahrenheit;
}

const validator = (value, parser, minvalue, maxValue)=>{

    if(isNaN(value))
    {
        return null
    }

    value = parser(value)

    return value >=minvalue && value <=maxValue ? value : null
}
const getSanitizedData = (data)=>{

    console.log(data)

    const sanitizedData = {}
    sanitizedData["spo2"] = !isNaN(data?.["SpO2"]) ? parseFloat(data?.["SpO2"]): null

    sanitizedData["ventilator_spo2"] = validator(sanitizedData.spo2, parseInt, 0, 100)
    
    sanitizedData["resp"] = validator(data?.["Respiratory Rate"], parseInt, 10, 70)

    sanitizedData["pulse"] = validator(data?.["Pulse Rate"], parseInt, 0, 100)

    sanitizedData["temperature"] = validator(data?.["Temperature"], celsiusToFahrenheit, 95, 106)
    
    
    sanitizedData["bp"] = !isNaN(data?.["Blood Pressure"]) ? 
    {
        "systolic": parseFloat(data?.["Blood Pressure"]),
        "mean": parseFloat(data?.["Blood Pressure"]),
        "diastolic": parseFloat(data?.["Blood Pressure"])
    } : null

    return Object.entries(sanitizedData).reduce((acc, [key, value]) => {
        if (value !== null) {
            acc[key] = value;
        }
        return acc;
    }, {});


}

const extractData = async (camParams)=>{

    // get all presets for a camera
    const presets = await CameraUtils.getPreset({ camParams });
    // // get 5 para preset value 
    const cameraViewPreset = presets[MONITOR_PRESET_NAME];

    // // move camera to 5 para preset
    await CameraUtils.gotoPreset({ camParams, cameraViewPreset })

    const snapshotUrl = await CameraUtils.getSnapshotUri({ camParams });

    const fileName = "image-" + new Date().getTime() + ".jpeg"
    const imagePath = path.resolve("images", fileName)
    await downloadImage(snapshotUrl.uri, imagePath, camParams.username, camParams.password)
    // const testImg = path.resolve("images", "test.png")

    // POST request with image to ocr
    const bodyFormData = new FormData();
    bodyFormData.append('image', fs.createReadStream(imagePath));

    const response = await axios.post(OCR_URL, bodyFormData, {
        headers: {
            ...bodyFormData.getHeaders()
        }
    })

    // delete image
    fs.unlink(imagePath, (err) => {
        if (err) {
            // TODO: Critical logger setup
            console.error(err)
        }
    })

    return getSanitizedData(response.data.data)

}

export class UpdateObservationAutoController {
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
   *   post:
   *     summary: "Auto update observation"
   *     description: ""
   *     tags:
   *       - Observations
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
   *               assetExternalId:
   *                 type: string
   *                 required: true
   *     responses:
   *       "200":
   *         description: Return success message
   */
    static updateObservation = catchAsync(async (req, res) => {

        const assetExternalId = req.body.assetExternalId

        try{
            const { consultation_id, patient_id } = await getPatientId(assetExternalId);
            if (!patient_id) {
                console.error(
                    "Patient not found for assetExternalId: " +
                    assetExternalId
                );
                res.send({
                status: "error",
                message: "Failed",
                });
            }

            const payload = await extractData(this._getCamParams(req.body))

            console.log(payload)

            await axios
            .post(
            `${careApi}/api/v1/consultation/${consultation_id}/daily_rounds/`,
            payload,
            { headers: await generateHeaders(assetExternalId) }
            )

            res.send({
            status: "success",
            message: `Done`,
            });
        
        }
        catch(error){
            console.error(error)

            res.send({
            status: "error",
            message: "Failed",
            });
        }
    });


}

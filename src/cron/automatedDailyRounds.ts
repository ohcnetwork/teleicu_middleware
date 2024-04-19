import axios, { AxiosError, AxiosResponse } from "axios";
import fs from "fs";
import path from "path";

import { staticObservations } from "@/controller/ObservationController";
import prisma from "@/lib/prisma";
import { AssetBed } from "@/types/asset";
import { CameraParams } from "@/types/camera";
import { CarePaginatedResponse } from "@/types/care";
import {
  DailyRoundObservation,
  Observation,
  ObservationType,
} from "@/types/observation";
import { OCRV2Response } from "@/types/ocr";
import { CameraUtils } from "@/utils/CameraUtils";
import { isValid } from "@/utils/ObservationUtils";
import { generateHeaders } from "@/utils/assetUtils";
import { careApi, openaiApiKey, saveDailyRound } from "@/utils/configs";
import { getPatientId } from "@/utils/dailyRoundUtils";
import { downloadImage } from "@/utils/downloadImageWithDigestRouter";
import { parseVitalsFromImage } from "@/utils/ocr";

const UPDATE_INTERVAL = 60 * 60 * 1000;

export async function getMonitorPreset(bedId: string, assetId: string) {
  const response = await axios
    .get<unknown, AxiosResponse<CarePaginatedResponse<AssetBed>>>(
      `${careApi}/api/v1/assetbed/?bed=${bedId}&preset_name=monitor`,
      {
        headers: await generateHeaders(assetId),
      },
    )
    .catch((error: AxiosError) => error.response);

  if (response?.status !== 200) {
    console.error(
      `Failed to get assetbed from care for the bed ${bedId} and asset ${assetId}`,
    );
    return null;
  }

  const assetBed = response.data?.results?.[0];
  if (!assetBed) {
    console.error(
      `No assetbed found for the bed ${bedId} and asset ${assetId}`,
    );
    return null;
  }

  const [username, password, streamId] =
    assetBed.asset_object.meta.camera_access_key.split(":");

  return {
    position: assetBed.meta.position,
    camera: {
      hostname: assetBed.asset_object.meta.local_ip_address,
      username,
      password,
      port: 80,
    },
  };
}

export async function saveImageLocally(
  snapshotUrl: string,
  camParams: CameraParams,
) {
  const fileName = `image--${new Date().getTime()}.jpeg`;
  const imagePath = path.resolve("images", fileName);
  await downloadImage(
    snapshotUrl,
    imagePath,
    camParams.username,
    camParams.password,
  );

  return imagePath;
}

export async function getVitalsFromImage(imageUrl: string) {
  const image = fs.readFileSync(imageUrl);
  const data = (await parseVitalsFromImage(image)) as OCRV2Response | null;

  if (!data) {
    console.error("Failed to parse vitals from image");
    return null;
  }

  const date = data.time_stamp ? new Date(data.time_stamp) : new Date();
  const isoDate =
    date.toString() !== "Invalid Date"
      ? date.toISOString()
      : new Date().toISOString();
  return {
    taken_at: isoDate,
    spo2: data.spO2?.oxygen_saturation_percentage ?? null,
    ventilator_spo2: data.spO2?.oxygen_saturation_percentage ?? null,
    resp: data.respiration_rate?.breaths_per_minute ?? null,
    pulse: data.ecg?.Heart_Rate_bpm ?? null,
    temperature: data.temperature?.fahrenheit ?? null,
    temperature_measured_at: isoDate,
    bp: {
      systolic: data.nibp?.systolic_mmhg ?? null,
      diastolic: data.nibp?.diastolic_mmhg ?? null,
    },
    rounds_type: "AUTOMATED",
    is_parsed_by_ocr: true,
  } as DailyRoundObservation;
}

export async function fileAutomatedDailyRound(
  consultationId: string,
  assetId: string,
  vitals: DailyRoundObservation,
) {
  const response = await axios
    .post(
      `${careApi}/api/v1/consultation/${consultationId}/daily_rounds/`,
      vitals,
      { headers: await generateHeaders(assetId) },
    )
    .catch((error: AxiosError) => error.response);

  if (saveDailyRound) {
    prisma.dailyRound.create({
      data: {
        assetExternalId: assetId,
        status: response?.statusText ?? "FAILED",
        data: JSON.stringify(vitals),
        response: JSON.stringify(response?.data),
      },
    });
  }

  if (response?.status !== 201) {
    console.error(
      `Failed to file the daily round for the consultation ${consultationId} and asset ${assetId}`,
      response?.statusText,
      JSON.stringify(response?.data),
    );
    return;
  }
}

export async function getVitalsFromObservations(assetHostname: string) {
  const getValueFromData = (
    type: ObservationType,
    data: Record<ObservationType, Observation | Observation[]>,
  ) => {
    if (!data || !data[type]) {
      return null;
    }

    const observation = (
      Array.isArray(data[type])
        ? (data[type] as Observation[])?.[0]
        : data[type]
    ) as Observation;

    const observationTime = new Date(
      observation?.["date-time"]?.replace(" ", "T").concat("+0530"),
    );
    const isStale =
      new Date().getTime() - observationTime.getTime() > UPDATE_INTERVAL;

    if (isStale || !isValid(observation)) {
      return null;
    }

    switch (type) {
      case "body-temperature1":
      case "body-temperature2": {
        if (
          observation["low-limit"]! < observation.value! &&
          observation.value! < observation["high-limit"]!
        ) {
          return {
            temperature: observation.value,
            temperature_measured_at: observationTime.toISOString(),
          };
        }
        return null;
      }
      case "blood-pressure":
        return {
          systolic: observation.systolic?.value,
          diastolic: observation.diastolic?.value,
        };

      default:
        return observation.value ?? null;
    }
  };

  console.log(
    `Getting vitals from observations for the asset ${assetHostname}`,
  );

  const observation = staticObservations.find(
    (observation) => observation.device_id === assetHostname,
  );

  if (
    !observation ||
    new Date().getTime() - new Date(observation.last_updated).getTime() >
      UPDATE_INTERVAL
  ) {
    return null;
  }

  const data = observation.observations;
  return {
    taken_at: observation.last_updated,
    spo2: getValueFromData("SpO2", data),
    ventilator_spo2: getValueFromData("SpO2", data),
    resp: getValueFromData("respiratory-rate", data),
    pulse:
      getValueFromData("heart-rate", data) ??
      getValueFromData("pulse-rate", data),
    ...(((getValueFromData("body-temperature1", data) ??
      getValueFromData("body-temperature2", data)) as {
      temperature: number;
      temperature_mesured_at: string;
    } | null) ?? { temperature: null, temperature_measured_at: null }),
    bp: getValueFromData("blood-pressure", data) ?? { },
    rounds_type: "AUTOMATED",
    is_parsed_by_ocr: false,
  } as DailyRoundObservation;
}

export function payloadHasData(payload: Record<string, any>): boolean {
  return Object.values(payload).some((value) => {
    if (value === null || value === undefined) {
      return false;
    } else if (typeof value === "object") {
      return payloadHasData(value);
    } else if (Array.isArray(value) && value.length === 0) {
      return false;
    }

    return true;
  });
}

export async function automatedDailyRounds() {
  console.log("Automated daily rounds");
  const monitors = await prisma.asset.findMany({
    where: {
      type: "HL7MONITOR",
      deleted: false,
    },
  });

  console.log(`Found ${monitors.length} monitors`);
  monitors.forEach(async (monitor) => {
    const { consultation_id, patient_id, bed_id, asset_beds } =
      await getPatientId(monitor.externalId);

    console.log(`Processing monitor ${monitor.externalId}`);
    console.log(
      `Consultation ID: ${consultation_id}, Patient ID: ${patient_id}, Bed ID: ${bed_id}`,
    );
    if (!consultation_id || !patient_id || !bed_id) {
      console.error(`Patient not found for the asset ${monitor.externalId}`);
      return;
    }

    let vitals: DailyRoundObservation | null = await getVitalsFromObservations(
      monitor.ipAddress,
    );

    console.log(`Vitals from observations: ${JSON.stringify(vitals)}`);

    if (!vitals && openaiApiKey) {
      if (!asset_beds || asset_beds.length === 0) {
        console.error(
          `No asset beds found for the asset ${monitor.externalId}`,
        );
        return;
      }

      console.log(`Asset beds: ${JSON.stringify(asset_beds)}`);

      const [username, password, streamId] =
        asset_beds[0].asset_object.meta.camera_access_key.split(":");
      const position = asset_beds[0].meta.position;
      const camera = {
        useSecure: false,
        hostname: asset_beds[0].asset_object.meta.local_ip_address,
        username,
        password,
        port: 80,
      };

      console.log(`Camera: ${JSON.stringify(camera)}`);

      console.log(`Moving camera to position: ${JSON.stringify(position)}`);

      await CameraUtils.absoluteMove({
        camParams: camera,
        ...position,
      });

      console.log(`Camera moved to position: ${JSON.stringify(position)}`);
      CameraUtils.lockCamera(camera.hostname, 1000 * 60 * 2);

      await new Promise((resolve) => setTimeout(resolve, 60 * 1000));

      const snapshotUrl = await CameraUtils.getSnapshotUri({
        camParams: camera,
      });
      const imageUrl = await saveImageLocally(snapshotUrl.uri, camera);

      CameraUtils.unlockCamera(camera.hostname);

      vitals = await getVitalsFromImage(imageUrl);
      console.log(`Vitals from image: ${JSON.stringify(vitals)}`);
    }

    if (!vitals || !payloadHasData(vitals)) {
      console.error(`No vitals found for the patient ${patient_id}`);
      return;
    }

    console.log(`Filing daily round for the patient ${patient_id}`);
    await fileAutomatedDailyRound(consultation_id, monitor.externalId, vitals);
    console.log(`Daily round filed for the patient ${patient_id}`);
  });
}

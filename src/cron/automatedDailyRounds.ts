import axios, { AxiosResponse } from "axios";
import FormData from "form-data";
import fs from "fs";
import path from "path";



import { staticObservations } from "@/controller/ObservationController";
import prisma from "@/lib/prisma";
import {
  DailyRoundObservation,
  Observation,
  ObservationType,
} from "@/types/observation";
import { CameraUtils } from "@/utils/CameraUtils";
import { isValid } from "@/utils/ObservationUtils";
import { generateHeaders } from "@/utils/assetUtils";
import { careApi, ocrApi, saveDailyRound } from "@/utils/configs";
import { getPatientId } from "@/utils/dailyRoundUtils";
import { downloadImage } from "@/utils/downloadImageWithDigestRouter";


const UPDATE_INTERVAL = 60 * 60 * 1000;

type CarePaginatedResponse<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

type AssetBed = {
  id: string;
  bed_object: {
    id: string;
    name: string;
    bed_type: "ICU" | "WARD";
    location_object: {
      id: string;
      facility: {
        id: string;
        name: string;
      };
      location_type: "OTHER" | "WARD" | "ICU";
      created_date: string;
      modified_date: string;
      name: string;
      description: string;
      middleware_address: string | null;
    };
    is_occupied: boolean;
    created_date: string;
    modified_date: string;
    description: string;
    meta: any;
  };
  asset_object: {
    id: string;
    status: "ACTIVE" | "INACTIVE";
    asset_type: "INTERNAL" | "EXTERNAL";
    location_object: {
      id: string;
      facility: {
        id: string;
        name: string;
      };
      location_type: "OTHER" | "WARD" | "ICU";
      created_date: string;
      modified_date: string;
      name: string;
      description: string;
      middleware_address: string | null;
    };
    last_service: string | null;
    resolved_middleware: {
      hostname: string;
      source: string;
    };
    created_date: string;
    modified_date: string;
    name: string;
    description: string;
    asset_class: "ONVIF" | "HL7MONITOR" | "VENTILATOR";
    is_working: boolean;
    not_working_reason: string;
    serial_number: string;
    warranty_details: string;
    meta: {
      asset_type: "CAMERA" | "MONITOR" | "VENTILATOR";
      local_ip_address: string;
      camera_access_key: string;
    };
    vendor_name: string;
    support_name: string;
    support_phone: string;
    support_email: string;
    qr_code_id: string | null;
    manufacturer: string | null;
    warranty_amc_end_of_validity: string | null;
  };
  created_date: string;
  modified_date: string;
  meta: {
    error: string;
    bed_id: string;
    utcTime: string;
    position: { x: number; y: number; zoom: number };
    moveStatus: { zoom: "IDLE" | "MOVING"; panTilt: "IDLE" | "MOVING" };
    preset_name: string;
  };
};

export async function getMonitorPreset(bedId: string, assetId: string) {
  const response = await axios.get<
    unknown,
    AxiosResponse<CarePaginatedResponse<AssetBed>>
  >(`${careApi}/api/v1/assetbed/?bed=${bedId}&preset_name=monitor`, {
    headers: await generateHeaders(assetId),
  });

  if (response.status !== 200) {
    throw new Error(
      `Failed to get assetbed from care for the bed ${bedId} and asset ${assetId}`,
    );
  }

  const assetBed = response.data?.results?.[0];
  if (!assetBed) {
    throw new Error(
      `No assetbed found for the bed ${bedId} and asset ${assetId}`,
    );
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

type CameraParams = {
  hostname: string;
  username: string;
  password: string;
  port: number;
};

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
  // TODO: wire it and test it

  const bodyFormData = new FormData();
  bodyFormData.append("image", fs.createReadStream(imageUrl));

  if (!ocrApi) {
    throw new Error("OCR_URL is not defined");
  }

  const response = await axios.post(ocrApi, bodyFormData, {
    headers: {
      ...bodyFormData.getHeaders(),
    },
  });

  if (response.status !== 200) {
    throw new Error("OCR analysis failed");
  }

  return {
    taken_at: new Date().toISOString(),
    spo2: 95,
    ventilator_spo2: 95,
    resp: 20,
    pulse: 80,
    temperature: 98.6,
    temperature_measured_at: new Date().toISOString(),
    bp: { systolic: 120, diastolic: 80 },
    rounds_type: "AUTOMATED",
    automated_ocr: true,
  } as DailyRoundObservation;
}

export async function fileAutomatedDailyRound(
  consultationId: string,
  assetId: string,
  vitals: DailyRoundObservation,
) {
  const response = await axios.post(
    `${careApi}/api/v1/consultation/${consultationId}/daily_rounds/`,
    vitals,
    { headers: await generateHeaders(assetId) },
  );

  if (saveDailyRound) {
    prisma.dailyRound.create({
      data: {
        assetExternalId: assetId,
        status: response.statusText,
        data: JSON.stringify(vitals),
        response: JSON.stringify(response.data),
      },
    });
  }

  if (response.status !== 201) {
    throw new Error("Failed to file the daily round");
  }
}

export async function getVitalsFromObservations(assetId: string) {
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

  const observation = staticObservations.find(
    (observation) => observation.device_id === assetId,
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
    ...((getValueFromData("body-temperature1", data) as {
      temperature: number;
      temperature_mesured_at: string;
    } | null) ?? {}),
    bp: getValueFromData("blood-pressure", data),
    rounds_type: "AUTOMATED",
    automated_ocr: false,
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
      throw new Error(`Patient not found for the asset ${monitor.externalId}`);
    }

    let vitals: DailyRoundObservation | null = await getVitalsFromObservations(
      monitor.externalId,
    );

    console.log(`Vitals from observations: ${JSON.stringify(vitals)}`);

    if (!vitals) {
      if (!asset_beds || asset_beds.length === 0) {
        throw new Error(
          `No asset beds found for the asset ${monitor.externalId}`,
        );
      }

      console.log(`Asset beds: ${JSON.stringify(asset_beds)}`);

      const [username, password, streamId] =
        asset_beds[0].asset_object.meta.camera_access_key.split(":");
      const position = asset_beds[0].meta.position;
      const camera = {
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

      const snapshotUrl = await CameraUtils.getSnapshotUri({
        camParams: camera,
      });
      const imageUrl = await saveImageLocally(snapshotUrl.uri, camera);

      CameraUtils.unlockCamera(camera.hostname);

      vitals = await getVitalsFromImage(imageUrl);
      console.log(`Vitals from image: ${JSON.stringify(vitals)}`);
    }

    if (!vitals || !payloadHasData(vitals)) {
      throw new Error(`No vitals found for the patient ${patient_id}`);
    }

    console.log(`Filing daily round for the patient ${patient_id}`);
    await fileAutomatedDailyRound(consultation_id, monitor.externalId, vitals);
    console.log(`Daily round filed for the patient ${patient_id}`);
  });
}
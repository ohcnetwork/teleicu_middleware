import AWS from "aws-sdk";
import * as dotenv from "dotenv";
import {
  s3AccessKeyId,
  s3BucketName,
  s3Endpoint,
  s3Provider,
  s3SecretAccessKey,
} from "@/utils/configs";
import type { DailyRoundObservation } from "@/types/observation";
import type { OCRObservationV1Sanitized } from "@/types/ocr";

dotenv.config({ path: "./.env" });

export const makeDataDumpToJson = async (
  v1Payload: DailyRoundObservation,
  v2Payload: OCRObservationV1Sanitized,
  assetExternalId: string,
  patient_id: string,
  consultation_id: string,
  image: string | null
) => {
  try {
    const s3 = new AWS.S3({
      accessKeyId: s3AccessKeyId,
      secretAccessKey: s3SecretAccessKey,
      endpoint: s3Endpoint,
      s3ForcePathStyle: s3Provider !== "AWS",
    });

    const dataDump = {
      assetExternalId,
      patient_id,
      consultation_id,
      v1Payload,
      v2Payload,
      image,
    };

    if (!s3BucketName) {
      throw new Error("S3 Bucket Name not found");
    }

    const params = {
      Bucket: s3BucketName,
      Key: `${assetExternalId}--${new Date().getTime()}.json`,
      Body: JSON.stringify(dataDump),
      ContentType: "application/json",
    };

    await new Promise((resolve, reject) => {
      s3.upload(
        params,
        function (err: Error, data: AWS.S3.ManagedUpload.SendData) {
          if (err) {
            console.log("Auto OCR Upload error");
            reject(err);
          } else {
            console.log("Auto OCR Upload Success");
            resolve(data);
          }
        }
      );
    });
  } catch (err) {
    console.log(err);
  }
};
import AWS from "aws-sdk";
import * as dotenv from "dotenv";
import {
  s3AccessKeyId,
  s3BucketName,
  s3Endpoint,
  s3Provider,
  s3SecretAccessKey,
} from "../../utils/configs.js";

dotenv.config({ path: "./.env" });

export const makeDataDumpToJson = async (
  v1Payload,
  v2Payload,
  assetExternalId,
  patient_id,
  consultation_id,
  image
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

    const params = {
      Bucket: s3BucketName,
      Key: `${assetExternalId}--${new Date().getTime()}.json`,
      Body: JSON.stringify(dataDump),
      ContentType: "application/json",
    };

    await new Promise((resolve, reject) => {
      s3.upload(params, function (err, data) {
        if (err) {
          console.log("Auto OCR Upload error");
          reject(err);
        } else {
          console.log("Auto OCR Upload Success");
          resolve(data);
        }
      });
    });
  } catch (err) {
    console.log(err);
  }
};

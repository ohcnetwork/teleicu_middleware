import aws from 'aws-sdk'
import * as dotenv from "dotenv";
dotenv.config({ path: "./.env" });

export const makeDataDumpToJson = async (v1Payload, v2Payload, assetExternalId, patient_id, consultation_id)=>{

  try{

    const s3 = new aws.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    });

    const dataDump = {
        "assetExternalId": assetExternalId,
        "patient_id": patient_id,
        "consultation_id": consultation_id,
        "v1Payload": v1Payload,
        "v2Payload": v2Payload
    }

    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: assetExternalId,
      Body: JSON.stringify(dataDump)
    };

    await new Promise((resolve, reject) => {
    s3.upload(params, function(err, data) {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
    });

  }
  catch(err)
  {
    console.log(err)
  }
}
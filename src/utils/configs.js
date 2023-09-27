export const facilityID = process.env.FACILITY_ID;
export const careApi = process.env.CARE_API;

// S3
export const s3Provider = process.env.S3_PROVIDER || "AWS";
export const s3Endpoint = process.env.S3_ENDPOINT || ({
    AWS: "https://s3.amazonaws.com",
    GCP: "https://storage.googleapis.com",
})[s3Provider];
export const s3BucketName = process.env.S3_BUCKET_NAME;
export const s3AccessKeyId = process.env.S3_ACCESS_KEY_ID;
export const s3SecretAccessKey = process.env.S3_SECRET_ACCESS_KEY;

export const saveOCRImages = process.env.SAVE_OCR_IMAGES === "true";
export const waitBeforeOCRCapture =
  parseInt(process.env.WAIT_BEFORE_OCR_CAPTURE) || 0;
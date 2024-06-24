import * as dotenv from "dotenv";

dotenv.config();

export const nodeEnv = process.env.NODE_ENV ?? "development";
export const port = process.env.PORT ?? 8090;
export const hostname = process.env.HOSTNAME ?? "localhost";
export const facilityID =
  process.env.FACILITY_ID ?? "00000000-0000-0000-0000-000000000000";
export const careApi = process.env.CARE_API ?? "http://localhost:9000";

export const adminUsername = process.env.USERNAME ?? "admin";
export const adminPassword = process.env.PASSWORD + facilityID; // good luck brute-forcing this

export const sentryDsn =
  process.env.SENTRY_DSN ?? "https://public@sentry.example.com/1";
export const sentryEnv = process.env.SENTRY_ENV ?? "unknown";
export const sentryTracesSampleRate = parseFloat(
  process.env.SENTRY_SAMPLE_RATE ?? "0.01",
);
export const saveDailyRound =
  (process.env.SAVE_DAILY_ROUND || "true") === "true";
export const saveVitalsStat =
  (process.env.SAVE_VITALS_STAT || "true") === "true";

export const s3Provider = process.env.S3_PROVIDER ?? "AWS";
export const s3Endpoint =
  process.env.S3_ENDPOINT ??
  {
    AWS: "https://s3.amazonaws.com",
    GCP: "https://storage.googleapis.com",
  }[s3Provider];
export const s3BucketName = process.env.S3_BUCKET_NAME;
export const s3AccessKeyId = process.env.S3_ACCESS_KEY_ID;
export const s3SecretAccessKey = process.env.S3_SECRET_ACCESS_KEY;

export const s3DumpVitalsStat =
  (process.env.S3_DUMP_VITALS_STAT || "false") === "true";
export const deleteVitalsStatOnDump =
  (process.env.DELETE_VITALS_STAT_ON_DUMP || "false") === "true";

export const openaiApiKey = process.env.OPENAI_API_KEY ?? "";
export const openaiEndpoint = process.env.OPENAI_ENDPOINT ?? "";
export const openaiApiVersion = process.env.OPENAI_API_VERSION ?? "2024-02-01";
export const openaiVisionModel =
  process.env.OPENAI_VISION_MODEL ?? "vision-preview";
export const openaiUseAzure = openaiEndpoint.includes("azure.com");

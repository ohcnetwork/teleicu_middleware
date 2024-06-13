-- Rename the existing column to a temporary name
ALTER TABLE "VitalsStat" RENAME COLUMN "accuracy" TO "accuracy_temp";
ALTER TABLE "VitalsStat" RENAME COLUMN "cumulativeAccuracy" TO "cumulativeAccuracy_temp";

-- Add the new column with the Json type
ALTER TABLE "VitalsStat" ADD COLUMN "accuracy" Json;
ALTER TABLE "VitalsStat" ADD COLUMN "cumulativeAccuracy" Json;

-- Copy the data from the old column to the new column, converting floats to JSON
UPDATE "VitalsStat" SET "accuracy" = json_build_object('overall', "accuracy_temp", 'metrics', '[]'::json);
UPDATE "VitalsStat" SET "cumulativeAccuracy" = json_build_object('overall', "cumulativeAccuracy_temp", 'metrics', '[]'::json);

-- Drop the temporary column
ALTER TABLE "VitalsStat" DROP COLUMN "accuracy_temp";
ALTER TABLE "VitalsStat" DROP COLUMN "cumulativeAccuracy_temp";


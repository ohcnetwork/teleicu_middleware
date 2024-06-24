import { observationData } from "@/controller/ObservationController";
import { hostname } from "@/utils/configs";
import { makeDataDumpToJson } from "@/utils/makeDataDump";

export async function observationsS3Dump() {
  const data = [...observationData];
  makeDataDumpToJson(data, `${hostname}/${new Date().getTime()}.json`, {
    slug: "s3_observations_dump",
    options: {
      schedule: {
        type: "crontab",
        value: "30 * * * *",
      },
    },
  });

  observationData.splice(0, data.length);
}

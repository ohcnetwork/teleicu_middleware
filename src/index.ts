import { observationsS3Dump } from "./cron/observationsS3Dump";
import { vitalsStatS3Dump } from "./cron/vitalsStatS3Dump";
import * as cron from "node-cron";

import { automatedDailyRounds } from "@/cron/automatedDailyRounds";
import { retrieveAssetConfig } from "@/cron/retrieveAssetConfig";
import { initServer } from "@/server";
import { port, s3DumpVitalsStat } from "@/utils/configs";

process.env.AWS_SDK_JS_SUPPRESS_MAINTENANCE_MODE_MESSAGE = "1";
process.env.CHECKPOINT_DISABLE = "1";

// entrypoint
(async () => {
  const server = initServer();

  // need the server to be up for open-id auth to work
  setTimeout(() => {
    retrieveAssetConfig();

    cron.schedule("0 */6 * * *", retrieveAssetConfig); // every 6 hours

    cron.schedule("0 */1 * * *", automatedDailyRounds); // every hour

    // scheduled to run at 30th minute of every hour so that the automatedDailyRounds can use the data without any issues
    cron.schedule("30 * * * *", observationsS3Dump); // every hour (30th minute)

    if (s3DumpVitalsStat) {
      cron.schedule("0 0 * * *", vitalsStatS3Dump); // every day at midnight
    }
  }, 100);

  server.listen(port, () =>
    console.log(
      `[SERVER] : Middleware App listening at http://localhost:${port}`,
    ),
  );
})();

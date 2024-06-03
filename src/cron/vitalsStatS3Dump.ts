import fs from "fs";
import path from "path";

import prisma from "@/lib/prisma";
import { deleteVitalsStatOnDump, hostname } from "@/utils/configs";
import { makeDataDumpToJson } from "@/utils/makeDataDump";

export async function vitalsStatS3Dump() {
  // TODO: make the date range configurable
  const toDate = new Date();
  const fromDate = new Date(toDate.getTime() - 24 * 60 * 60 * 1000);

  const vitalsStats = await prisma.vitalsStat.findMany({
    where: {
      createdAt: {
        gte: fromDate,
        lte: toDate,
      },
    },
  });

  const dumpData = vitalsStats.map((vitalsStat) => {
    const imageUrl = path.resolve("images", vitalsStat.imageId);
    const image = fs.existsSync(imageUrl)
      ? fs.readFileSync(imageUrl).toString("base64")
      : null;

    return {
      ...vitalsStat,
      image,
    };
  });

  makeDataDumpToJson(
    dumpData,
    `${hostname}/vitals-stats/${fromDate.toISOString()}-${toDate.toISOString()}.json`,
  );

  if (deleteVitalsStatOnDump) {
    await prisma.vitalsStat.deleteMany({
      where: {
        createdAt: {
          gte: fromDate,
          lte: toDate,
        },
      },
    });

    vitalsStats.forEach((vitalsStat) => {
      const imageUrl = path.resolve("images", vitalsStat.imageId);
      if (fs.existsSync(imageUrl)) {
        fs.unlinkSync(imageUrl);
      }
    });
  }
}

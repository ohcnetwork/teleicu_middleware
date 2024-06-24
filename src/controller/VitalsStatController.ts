import { Request, Response } from "express";

import prisma from "@/lib/prisma";

export class VitalsStatController {
  static latestAccuracy = async (req: Request, res: Response) => {
    const vitalsStat = await prisma.vitalsStat.findFirst({
      orderBy: { createdAt: "desc" },
    });

    if (!vitalsStat) {
      return res.status(404).json({ message: "No vitals stat found" });
    }

    return res.status(200).json({
      accuracy: vitalsStat.accuracy,
      cumulativeAccuracy: vitalsStat.cumulativeAccuracy,
      time: vitalsStat.createdAt,
    });
  };
}

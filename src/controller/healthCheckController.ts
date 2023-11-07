import axios, { type AxiosRequestHeaders } from "axios";
import { PrismaClient } from "@prisma/client";
import { generateHeaders } from "@/utils/assetUtils";
import { careApi } from "@/utils/configs";
import type { Request, Response, NextFunction } from "express";

const prisma = new PrismaClient();

export const CareCommunicationCheckController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let asset = null;
  if (req.query.ip || req.query.ext_id) {
    asset = await prisma.asset.findFirst({
      where: {
        OR: [
          { ipAddress: req.query.ip as string },
          { externalId: req.query.ext_id as string },
        ],
        AND: {
          deleted: false,
        },
      },
    });
  } else {
    asset = await prisma.asset.findFirst({
      where: {
        AND: {
          deleted: false,
        },
      },
    });
  }
  if (asset === null) {
    return res.status(404).json({ error: "No active asset found" });
  }

  const value = await axios
    .get(`${careApi}/middleware/verify`, {
      headers: (await generateHeaders(asset.externalId)) as AxiosRequestHeaders,
    })
    .then((res) => {
      return res.data;
    })
    .catch((error) => {
      res.status(500);
      return { error: error?.response?.data };
    });
  return res.send(value);
};

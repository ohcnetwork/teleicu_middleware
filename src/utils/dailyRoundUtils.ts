import { Prisma, PrismaClient } from "@prisma/client";
import axios from "axios";
import { generateHeaders } from "@/utils/assetUtils";
import { careApi } from "@/utils/configs";
import type { AxiosRequestHeaders } from "axios";

const prisma = new PrismaClient();

export const getAsset = async (assetIp: string) => {
  return await prisma.asset.findFirst({
    where: {
      ipAddress: {
        equals: assetIp,
      },
      deleted: {
        equals: false,
      },
    },
  });
};

export const getPatientId = async (assetExternalId: string) => {
  return await axios
    .get(`${careApi}/api/v1/consultation/patient_from_asset/`, {
      headers: (await generateHeaders(assetExternalId)) as AxiosRequestHeaders,
    })
    .then((res) => res.data)
    .catch((err) => {
      console.log(
        "[Daily Round] Failed to fetch patient_id from care",
        err.message
      );
      console.log(err?.response?.status, err?.response?.data);
      return {};
    });
};

// export const getAssetsByBedId = async (bedId) => {
//   return await axios
//   .get(`${careApi}/api/v1/assetbed/?bed=${bedId}`, {
//     headers: await generateHeaders(),
//   })
//   .then((res) => res.data)
//   .catch((err) => {
//     console.log(err?.response?.data);
//     return {};
//   });
// };

export const getBedById = async (
  bedId: string
): Promise<null | Prisma.BedGetPayload<{
  include: { camera: true; monitorPreset: true };
}>> => {
  return prisma.bed.findFirst({
    where: {
      externalId: bedId,
      deleted: false,
    },
    include: {
      camera: true,
      monitorPreset: true,
    },
  });
};

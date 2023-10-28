import { generateJWT } from "@/utils/generateJWT";
import { facilityID } from "@/utils/configs";
import type { AxiosRequestHeaders } from "axios";

export const generateHeaders = async (asset_id: string) => {
  return {
    Accept: "application/json",
    Authorization: "Middleware_Bearer " + (await generateJWT({ asset_id })),
    "X-Facility-Id": facilityID,
  } as AxiosRequestHeaders;
};

import axios from 'axios'
import { PrismaClient } from "@prisma/client"
import { generateHeaders } from "../utils/assetUtils.js";
import { careApi } from '../utils/configs.js';


const prisma = new PrismaClient()

export const CareCommunicationCheckController = async (req, res, next) => {
  let asset = null
  if (req.query.ip || req.query.ext_id) {
    asset = await prisma.asset.findFirst({
      where: {
        OR: [
          { ipAddress: req.query.ip },
          { externalId: req.query.ext_id }
        ],
        AND: {
          deleted: false
        }
      }
    })
  } else {
    asset = await prisma.asset.findFirst({
      where: {
        AND: {
          deleted: false
        }
      }
    })
  }
  if (asset === null) {
    return res.status(404).json({ "error": "No active asset found" })
  }

  const value = await axios.get(
    `${careApi}/middleware/verify`,
    {
      headers: await generateHeaders(asset.externalId)
    }
  ).then(res => {
    return res.data
  }).catch(error => {
    console.log(error)
    res.status(500)
    return { "error": error.response.data }
  })
  return res.send(value)
};

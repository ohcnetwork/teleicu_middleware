import { PrismaClient } from "@prisma/client"
import axios from 'axios'
import { generateHeaders } from "./assetUtils.js"
import { careApi } from "./configs.js"
// import { staticObservations } from "../controller/ObservationController"

//FIXME: This is a temporary solution to get the daily round to work.
let staticObservations = [
  {
    "observation_id": "ST",
    "device_id": "192.168.1.13",
    "date-time": "2022-06-03 08:21:48",
    "patient-id": "3",
    "patient-name": "PATIENT 3",
    "status": "Message-Leads Off",
    "value": null,
    "unit": "mV",
    "interpretation": "NA",
    "low-limit": -0.3,
    "high-limit": 0.3
  },
]


const prisma = new PrismaClient()

export class DailyRound {

  static getAsset = async (assetIp) => {
    return await prisma.asset.findFirst({
      where: {
        ipAddress: {
          equals: assetIp
        },
        deleted: {
          equals: false
        }
      }
    }).catch(
      err => {
        console.log("Asset not found for assetIp: ", assetIp)
        console.log(err)
        return null
      }
    )
  }

  static getPatientId = async (asset_id) => {
    return await axios.get(`${careApi}/api/v1/consultation/patient_from_asset/`,
      { headers: await generateHeaders(asset_id) }
    ).then(res => res.data).catch(err => {
      console.log("No patient connected assetExternalId: ", asset_id)
      console.log(err.response.data || err.response.statusText)
      return {}
    })
  }

  static performDailyRound = async () => {

    for (const observation of staticObservations) {
      console.log(">Performing daily round for assetIp: " + observation.device_id)

      //device_id is the ip address of the asset
      const asset = await this.getAsset(observation.device_id)
      if (asset === null) continue

      const { consultation_id, patient_id } = await this.getPatientId(asset.externalId)
      if (!patient_id) continue

      const payload = {
        taken_at: new Date(observation["date-time"]),
        rounds_type: "NORMAL"
        // TODO: add other fields
      }

      const request = await axios.post(
        `${careApi}/api/v1/consultation/${consultation_id}/daily_rounds/`,
        payload,
        { headers: await generateHeaders(asset.externalId) }
      ).then(res => res).catch(err => {
        console.log(err.response.data || err.response.statusText)
        console.log(`Error performing daily round for assetIp: ${asset.ipAddress}`)
        return err.response
      })

      // save to database
      prisma.dailyRound.create({
        data: {
          asset: {
            connect: {
              id: asset.id
            }
          },
          status: request.statusText,
          data: request.data
        }
      })

      console.log(`Daily round performed for assetIp: ${asset.ipAddress}`)
    }
  }
}

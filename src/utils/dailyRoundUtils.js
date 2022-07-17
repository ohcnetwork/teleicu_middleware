import { PrismaClient } from "@prisma/client"
import { generateJWT } from "./generateJWT"
import { facilityID } from "./configs"

const prisma = new PrismaClient()

export class DailyRound {

  static generateHeaders = async (asset_id) => {
    return {
      Authorization: "Bearer " + await generateJWT({ asset_id }),
      "X-Facility-Id": facilityID
    }
  }

  static performDailyRound = async () => {

    const assets = await prisma.asset.findMany({
      where: {
        deleted: {
          equals: false
        }
      }
    })

    assets.forEach(async asset => {
      const request = await axios.get(
        `http://localhost:8000/middleware/verify`,
        { headers: await DailyRound.generateHeaders(asset.id) }
      )
      prisma.dailyRound.create({
        data: {
          asset: {
            connect: {
              id: asset.id
            }
          },
          status: request.data.status,
          data: request.data.data
        }
      })
    })

  }
}

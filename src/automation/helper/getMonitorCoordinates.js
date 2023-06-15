import { PrismaClient } from "@prisma/client"
import axios from 'axios'
import { generateHeaders } from "./assetUtils.js"
import { careApi } from "./configs.js"


const prisma = new PrismaClient()

export const getMonitorCoordinates = async (patientId) => {

  try{
    const bed =  await prisma.bed.findFirst({
      where: {
        patientExternalId: {
          equals: patientId
        },
        deleted: {
          equals: false
        }
      }
    })

    if(!bed)
    {

      console.log("Bed not found")
      return {
        x: 0,
        y: 0,
        zoom: 0
      }
    }

    return {
      x: bed.x,
      y: bed.y,
      zoom: bed.zoom
    }
  }
  catch(err)
  {
    console.log(err?.response?.data)

    return {
        x: 0,
        y: 0,
        zoom: 0
    }
  }
}
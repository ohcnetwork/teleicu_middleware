import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export const getMonitorCoordinates = async (bedId) => {
  try {
    const preset = await prisma.preset.findFirst({
      where: {
        bed: { externalId: bedId },
        deleted: false,
      },
    });

    if (!preset) {
      console.log(`Preset for bed ${bedId} not found`);

      return {
        x: 0,
        y: 0,
        zoom: 0,
      };
    }

    return {
      x: preset.x,
      y: preset.y,
      zoom: preset.zoom,
    };
  } catch (err) {
    console.log(err?.response?.data);

    return {
      x: 0,
      y: 0,
      zoom: 0,
    };
  }
};
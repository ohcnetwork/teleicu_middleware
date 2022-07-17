import { PrismaClient } from '@prisma/client'
import dayjs from 'dayjs'

const prisma = new PrismaClient()



export class AssetConfigController {

  static listAssets = async (req, res) => {
    prisma.asset.findMany({
      where: {
        deleted: {
          equals: false
        }
      },
      orderBy: [
        {
          updatedAt: 'desc'
        }
      ]
    }).then(assets => {
      res.render("pages/assetList", { dayjs, assets });
    }).catch(err => {
      //TODO: show error message
      res.render("pages/assetList", { dayjs, assets: [] });
    })
  }

  static createAsset = async (req, res) => {
    const { name, description, ipAddress, externalId } = req.body;
    prisma.asset.create({
      data: {
        name,
        description,
        ipAddress,
        externalId
      }
    }).then(asset => {
      res.redirect("/assets");
    }).catch(err => {
      console.log(err);
      //TODO: show error message
      res.redirect("/assets");
    });
  }

  static updateAssetForm = async (req, res) => {

    const asset = await prisma.asset.findUnique({
      where: {
        id: Number(req.params.id)
      }
    });
    res.render("pages/assetForm", { dayjs, asset });
  }

  static updateAsset = async (req, res) => {
    const { name, description, externalId, ipAddress } = req.body;
    prisma.asset.update({
      where: {
        id: Number(req.params.id)
      },
      data: {
        name,
        description,
        externalId,
        ipAddress,
        updatedAt: new Date()
      }
    }).then(asset => {
      res.redirect("/assets");
    }).catch(err => {
      console.log(err);
      //TODO: show error message
      res.redirect("/assets");
    })
  }

  static confirmDeleteAsset = async (req, res) => {
    const asset = await prisma.asset.findUnique({
      where: {
        id: Number(req.params.id)
      }
    });
    res.render("pages/assetDelete", { dayjs, asset });
  }

  static deleteAsset = async (req, res) => {
    prisma.asset.update({
      where: {
        id: Number(req.params.id)
      },
      data:{
        deleted: true,
      }
    }).then(asset => {
      res.redirect("/assets");
    }).catch(err => {
      console.log(err);
      //TODO: show error message
      res.redirect("/assets");
    })
  }

}

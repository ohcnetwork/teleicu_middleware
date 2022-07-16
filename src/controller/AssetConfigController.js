import { PrismaClient } from '@prisma/client'
import dayjs from 'dayjs'

const prisma = new PrismaClient()



export class AssetConfigController {

  static listAssets = async (req, res) => {
    prisma.asset.findMany({
      orderBy: [
        {
          updatedAt: 'desc'
        }
      ]
    }).then(assets => {
      res.render("pages/assetList", { dayjs, assets });
    }).catch(err => {
      console.log(err);
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
      // res.error(err);
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
      // res.error(err);
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
    prisma.asset.delete({
      where: {
        id: Number(req.params.id)
      }
    }).then(asset => {
      res.redirect("/assets");
    }).catch(err => {
      console.log(err);
      // res.error(err);
      res.redirect("/assets");
    })
  }

}

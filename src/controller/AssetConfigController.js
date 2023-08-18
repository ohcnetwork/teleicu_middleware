import { PrismaClient } from "@prisma/client"
import dayjs from "dayjs"

const prisma = new PrismaClient()


export class AssetConfigController {

  static listAssets = async (req, res) => {
    try {
      const assets = await prisma.asset.findMany({
        where: {
          deleted: false,
        },
        orderBy: [{ updatedAt: "desc" }],
      });

      const beds = await prisma.bed.findMany({
        where: {
          deleted: false,
        },
        orderBy: [{ updatedAt: "desc" }],
      });

      res.render("pages/assetList", {
        dayjs,
        assets,
        beds,
        errors: req.flash("error"),
      });
    } catch (err) {
      res.render("pages/assetList", {
        dayjs,
        assets: [],
        beds: [],
        errors: [err.message],
      });
    }
  }

  static createAsset = async (req, res) => {
    const {
      name,
      type,
      description,
      ipAddress,
      externalId,
      username,
      password,
      port,
    } = req.body;
    prisma.asset
      .create({
        data: {
          name,
          type,
          description,
          ipAddress,
          externalId,
          username,
          password,
          port: Number(port),
        },
      })
      .then((_) => {
        res.redirect("/assets");
      })
      .catch((err) => {
        req.flash("error", err.message);
        res.redirect("/assets");
      });
  }

  static updateAssetForm = async (req, res) => {
    try {
      const asset = await prisma.asset.findUniqueOrThrow({
        where: {
          id: Number(req.params.id),
        },
      });

      const beds = await prisma.bed.findMany({
        where: {
          deleted: false,
        },
        orderBy: [{ updatedAt: "desc" }],
      });

      res.render("pages/assetForm", {
        dayjs,
        asset,
        beds,
        errors: req.flash("error"),
      });
    } catch (err) {
      req.flash("error", err.message);
      res.redirect("/assets");
    }
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
    }).then(_ => {
      res.redirect("/assets");
    }).catch(err => {
      req.flash("error", err.message);
      res.redirect(`/assets/${req.params.id}`);
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
      data: {
        deleted: true,
      }
    }).then(_ => {
      res.redirect("/assets");
    }).catch(err => {
      req.flash("error", err.message);
      res.redirect("/assets");
    })
  }
}

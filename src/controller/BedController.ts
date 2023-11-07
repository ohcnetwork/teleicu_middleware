import { PrismaClient } from "@prisma/client";
import dayjs from "dayjs";
import type { Request, Response } from "express";

const prisma = new PrismaClient();

export class BedController {
  static list = async (req: Request, res: Response) => {
    try {
      const beds = await prisma.bed.findMany({
        where: {
          deleted: false,
        },
        include: {
          monitorPreset: true,
          camera: true,
        },
        orderBy: [{ updatedAt: "desc" }],
      });

      const cameras = await prisma.asset.findMany({
        where: {
          deleted: false,
          type: "CAMERA",
        },
        orderBy: [{ updatedAt: "desc" }],
      });

      res.render("pages/beds/list", {
        dayjs,
        beds,
        cameras,
        errors: req.flash("error"),
      });
    } catch (err: any) {
      res.render("pages/beds/list", {
        dayjs,
        beds: [],
        cameras: [],
        errors: [err.message],
      });
    }
  };

  static create = async (req: Request, res: Response) => {
    const { name, externalId, cameraId, preset_x, preset_y, preset_zoom } =
      req.body;

    try {
      await prisma.bed.create({
        data: {
          name: name as string,
          externalId: externalId as string,
          cameraId: Number(cameraId),
          monitorPreset: {
            create: {
              x: Number(preset_x),
              y: Number(preset_y),
              zoom: Number(preset_zoom),
            },
          },
        },
      });

      res.redirect("/beds");
    } catch (err: any) {
      req.flash("error", err.message);
      res.redirect("/beds");
    }
  };

  static show = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
      const bed = await prisma.bed.findUnique({
        where: {
          id: Number(id),
        },
        include: {
          monitorPreset: true,
          camera: true,
        },
      });

      const cameras = await prisma.asset.findMany({
        where: {
          deleted: false,
          type: "CAMERA",
        },
        orderBy: [{ updatedAt: "desc" }],
      });

      res.render("pages/beds/edit", {
        dayjs,
        bed,
        cameras,
        errors: req.flash("error"),
      });
    } catch (err: any) {
      req.flash("error", err.message);
      res.redirect("/beds");
    }
  };

  static edit = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, externalId, cameraId, preset_x, preset_y, preset_zoom } =
      req.body;

    try {
      await prisma.bed.update({
        where: {
          id: Number(id),
        },
        data: {
          name,
          externalId,
          cameraId: Number(cameraId) || undefined,
          monitorPreset: {
            update: {
              x: Number(preset_x) || undefined,
              y: Number(preset_y) || undefined,
              zoom: Number(preset_zoom) || undefined,
            },
          },
        },
      });

      res.redirect("/beds");
    } catch (err: any) {
      req.flash("error", err.message);
      res.redirect("/beds");
    }
  };

  static confirmDelete = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
      const bed = await prisma.bed.findUnique({
        where: {
          id: Number(id),
        },
      });

      res.render("pages/beds/delete", { dayjs, bed });
    } catch (err: any) {
      req.flash("error", err.message);
      res.redirect("/beds");
    }
  };

  static delete = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
      await prisma.bed.update({
        where: {
          id: Number(id),
        },
        data: {
          deleted: true,
        },
      });

      res.redirect("/beds");
    } catch (err: any) {
      req.flash("error", err.message);
      res.redirect("/beds");
    }
  };
}

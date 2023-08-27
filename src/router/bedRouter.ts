import express from "express";
import { BedController } from "../controller/BedController.js";

const router = express.Router();

router.get("/", BedController.list);
router.post("/", BedController.create);
router.get("/:id", BedController.show);
router.post("/:id", BedController.edit);
router.get("/:id/delete", BedController.confirmDelete);
router.post("/:id/delete", BedController.delete);

export { router as bedRouter };
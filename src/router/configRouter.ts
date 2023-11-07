import express from "express";
import { ConfigController } from "@/controller/ConfigController";

const router = express.Router();

router.get("/config", ConfigController.renderUpdateConfig);
router.post("/config", ConfigController.updateConfig);

export { router as configRouter };

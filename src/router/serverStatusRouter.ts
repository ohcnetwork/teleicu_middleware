import express from "express";
import { ServerStatusController } from "@/controller/ServerStatusController";

const router = express.Router();

router.get("/server-status", ServerStatusController.render);

export { router as serverStatusRouter };

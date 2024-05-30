import express from "express";

import { ServerStatusController } from "@/controller/ServerStatusController";

const router = express.Router();

router.get("", ServerStatusController.render);

export { router as serverStatusRouter };

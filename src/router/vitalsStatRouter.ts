import express from "express";

import { VitalsStatController } from "@/controller/VitalsStatController";

const router = express.Router();

router.get("/accuracy", VitalsStatController.latestAccuracy);

export { router as vitalsStatRouter };

import express from "express";
import { CareCommunicationCheckController } from "../controller/healthCheckController.js";

const router = express.Router();

router.get("/health/care/communication", CareCommunicationCheckController);

export { router as healthRouter };


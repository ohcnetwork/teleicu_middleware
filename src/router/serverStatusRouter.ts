import express from "express";
import { ServerStatusController } from "../controller/ServerStatusController.js";

const router:express.Router = express.Router();

router.get("/server-status", ServerStatusController.render);

export { router as serverStatusRouter };

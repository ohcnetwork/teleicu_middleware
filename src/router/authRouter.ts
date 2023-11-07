import express from "express";
import { AuthController } from "@/controller/AuthController";

const router = express.Router();

router.post("/verify", AuthController.verifyToken);

export { router as authRouter };

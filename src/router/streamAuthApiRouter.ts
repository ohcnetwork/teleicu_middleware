import express from "express";

import { StreamAuthApiController } from "@/controller/StreamAuthApiController";
import { careJwtAuth } from "@/middleware/auth";

// const protectedRouter = express.Router();
// protectedRouter.use(careJwtAuth());
// protectedRouter.post(
//   "/videoFeed",
//   StreamAuthApiController.getVideoFeedStreamToken,
// );
// protectedRouter.post("/vitals", StreamAuthApiController.getVitalStreamToken);

const router = express.Router();
router.post("/verifyToken", StreamAuthApiController.validateStreamToken);
// router.use("/getToken", protectedRouter)
router.post("/getToken/videoFeed", careJwtAuth(), StreamAuthApiController.getVideoFeedStreamToken);
router.post("/getToken/vitals", careJwtAuth(), StreamAuthApiController.getVitalStreamToken);

export { router as streamAuthApiRouter };

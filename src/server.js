import * as dotenv from "dotenv";
dotenv.config({ path: "./.env" });

import express from "express";
import helmet from "helmet";
import cors from "cors";
import swaggerUi from "swagger-ui-express";

import { cameraRouter } from "./router/cameraRouter.js";
import { configRouter } from "./router/configRouter.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { notFoundController } from "./controller/NotFoundController.js";
import { swaggerSpec } from "./swagger/swagger.js";
import path from "path";

const PORT = process.env.PORT || 8090;

const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(path.resolve(), "src/views"));

const requestLogger = (req, res, next) => {
  console.log(
    `${new Date().toISOString()}: ${req.ip} ${req.method} ${req.url}`
  );
  // Log Headers
  console.log(req.headers);
  // Log Body
  console.log(req.body);
  console.log("\n");
  next();
};
app.use(express.static(path.join(path.resolve(), "src/public")));
app.use(cors({ origin: [] }));
app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use(requestLogger);

app.get("/", (req, res) => {
  res.render("pages/index");
});
// Swagger definition
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Camera routes
app.use(cameraRouter);
app.use(configRouter);

// Error handler
app.use(errorHandler);
app.all("*", notFoundController);

app.listen(PORT, () =>
  console.log(`[SERVER] : Middleware App listening at http://localhost:${PORT}`)
);

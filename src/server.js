import * as dotenv from "dotenv";
dotenv.config({ path: "./.env" });

import express from "express";
import helmet from "helmet";
import cors from "cors";
import swaggerUi from "swagger-ui-express";

import { swaggerSpec } from "./swagger/swagger.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { cameraRouter } from "./router/cameraRouter.js";
import { observationRouter } from "./router/observationRouter.js";
import { notFoundController } from "./controller/NotFoundController.js";

const PORT = process.env.PORT || 8090;

const app = express();

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

function logResponseBody(req, res, next) {
  var oldWrite = res.write,
    oldEnd = res.end;

  var chunks = [];

  res.write = function (chunk) {
    chunks.push(chunk);

    return oldWrite.apply(res, arguments);
  };

  res.end = function (chunk) {
    if (chunk) chunks.push(chunk);

    var body = Buffer.concat(chunks).toString("utf8");
    console.log(req.path, body);

    oldEnd.apply(res, arguments);
  };

  next();
}

// app.use(logResponseBody);

app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use(requestLogger);

// Swagger definition
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Camera routes
app.use(cameraRouter);
// observation routes
app.use(observationRouter);

// Error handler
app.use(errorHandler);
app.all("*", notFoundController);

app.listen(PORT, () =>
  console.log(`[SERVER] : Middleware App listening at http://localhost:${PORT}`)
);

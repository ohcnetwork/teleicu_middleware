import * as Sentry from "@sentry/node";
import flash from "connect-flash";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import session from "express-session";
import enableWs from "express-ws";
import helmet from "helmet";
import path from "path";
import swaggerUi from "swagger-ui-express";



import { OpenidConfigController } from "@/controller/OpenidConfigController";
import { randomString } from "@/lib/crypto";
import { errorHandler } from "@/middleware/errorHandler";
import { getWs } from "@/middleware/getWs";
import { requestLogger } from "@/middleware/logger";
import { morganWithWs } from "@/middleware/morganWithWs";
import { assetConfigApiRouter } from "@/router/assetConfigApiRouter";
import { assetConfigRouter } from "@/router/assetConfigRouter";
import { authRouter } from "@/router/authRouter";
import { bedRouter } from "@/router/bedRouter";
import { cameraRouter } from "@/router/cameraRouter";
import { configRouter } from "@/router/configRouter";
import { defaultRouter } from "@/router/defaultRouter";
import { healthRouter } from "@/router/healthRouter";
import { observationRouter } from "@/router/observationRouter";
import { serverStatusRouter } from "@/router/serverStatusRouter";
import { streamAuthApiRouter } from "@/router/streamAuthApiRouter";
import { vitalsStatRouter } from "@/router/vitalsStatRouter";
import { swaggerSpec } from "@/swagger/swagger";
import type { WebSocket } from "@/types/ws";
import {
  nodeEnv,
  sentryDsn,
  sentryEnv,
  sentryTracesSampleRate,
} from "@/utils/configs";
import { sendStatus } from "@/utils/serverStatusUtil";

export function initServer() {
  const appBase = express();
  const ws = enableWs(appBase);
  const { app } = ws;

  // Sentry
  Sentry.init({
    dsn: sentryDsn,
    environment: sentryEnv,
    tracesSampleRate: sentryTracesSampleRate,
  });
  app.use(Sentry.Handlers.requestHandler());
  app.use(Sentry.Handlers.tracingHandler());

  app.set("view engine", "ejs");
  app.set("views", path.resolve(__dirname, "views"));
  app.use(express.static(path.resolve(__dirname, "public")));

  app.use(cookieParser());

  // flash messages
  app.use(
    session({
      secret: randomString(32),
      resave: false,
      saveUninitialized: false,
      name: "session",
      cookie: {
        maxAge: 1000 * 60 * 30,
        sameSite: "strict",
        httpOnly: nodeEnv === "production",
        secure: nodeEnv !== "production",
      },
    }),
  );
  app.use(flash());

  app.use(getWs(ws));
  app.use(morganWithWs);

  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginResourcePolicy: false,
    }),
  );
  app.use(cors());
  app.options("*", cors());

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true }));

  if (nodeEnv === "debug") {
    app.use(requestLogger);
  }

  // Routes
  app.use("/favicon.ico", (req, res) => res.status(204).end());
  app.use("", defaultRouter);
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  app.use(cameraRouter);
  app.use(observationRouter);

  app.use("/auth", authRouter);
  app.use("/health", healthRouter);
  app.use("/server-status", serverStatusRouter);
  app.use("/config", configRouter);
  app.use("/beds", bedRouter);
  app.use("/assets", assetConfigRouter);
  app.use("/api/assets", assetConfigApiRouter);
  app.use("/api/stream", streamAuthApiRouter);
  app.use("/api/vitals-stats", vitalsStatRouter);

  app.get("/.well-known/jwks.json", OpenidConfigController.publicJWKs);
  app.get(
    "/.well-known/openid-configuration", //deprecated
    OpenidConfigController.publicJWKs,
  );

  app.ws("/logger", (ws: WebSocket, req) => {
    ws.user = req.user;
    ws.route = "/logger";
    const timeout = sendStatus(ws);
    ws.on("close", () => {
      clearInterval(timeout);
    });
  });
  app.ws("/observations/:ip", (ws: WebSocket, req) => {
    ws.route = "/observations";
    ws.params = req.params;
  });

  app.all("*", (req, res) => res.redirect("/not-found"));

  // Error handler
  app.use(Sentry.Handlers.errorHandler());
  app.use(errorHandler);

  return app;
}
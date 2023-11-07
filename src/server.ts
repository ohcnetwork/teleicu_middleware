import "module-alias/register";
import * as dotenv from "dotenv";
dotenv.config();

import cors from "cors";
import path from "path";
import helmet from "helmet";
import express from "express";
import enableWs from "express-ws";
import session from "express-session";
import flash from "connect-flash";
import swaggerUi from "swagger-ui-express";
import * as Sentry from "@sentry/node";
import * as Tracing from "@sentry/tracing";

import { cameraRouter } from "@/router/cameraRouter";
import { configRouter } from "@/router/configRouter";
import { assetConfigRouter } from "@/router/assetConfigRouter";
import { authRouter } from "@/router/authRouter";

import { errorHandler } from "@/middleware/errorHandler";
import { observationRouter } from "@/router/observationRouter";
import { notFoundController } from "@/controller/NotFoundController";

import { swaggerSpec } from "@/swagger/swagger";
import { morganWithWs } from "@/middleware/morganWithWs";
import { serverStatusRouter } from "@/router/serverStatusRouter";
import { healthRouter } from "@/router/healthRouter";
import { bedRouter } from "@/router/bedRouter";

import { ServerStatusController } from "@/controller/ServerStatusController";
import { getWs } from "@/middleware/getWs";

import { openidConfigController } from "@/controller/OpenidConfig";

import type { WebSocket } from "@/types/ws";

const PORT = process.env.PORT || 8090;

const appBase = express();
const ws = enableWs(appBase);
const { app } = ws;

app.set("view engine", "ejs");
app.set("views", path.resolve(__dirname, "views"));

// flash messages
app.use(
  session({
    name: "session",
    secret: "ufhq7s-o1%^bn7j6wasec04-mjb*zv^&0@$lb3%9%w3t5pq3^3",
    cookie: {
      httpOnly: true,
      maxAge: 1000 * 60 * 30,
    },
    resave: true,
    saveUninitialized: true,
  })
);
app.use(flash());

app.use(getWs(ws));
app.use(express.static(path.join(path.resolve(), "src/public")));
app.use(cors());
app.options("*", cors());
app.use(helmet({ contentSecurityPolicy: false }));

app.use(express.json({ limit: "50mb" }));

// Sentry
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  integrations: [
    new Sentry.Integrations.Http({ tracing: true }),
    new Tracing.Integrations.Express({ app }),
  ],
  environment: process.env.SENTRY_ENV,
  tracesSampleRate: parseFloat(process.env.SENTRY_SAMPLE_RATE || "0.01"),
});

app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.tracingHandler());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// ws.getWss().clients.forEach(i => i.url)
// logger
app.use(morganWithWs);

// Request Logger
// app.use((req, res, next)=> {
//   console.log('<--Request Logger-->');
//   console.log(req.body)
//   console.log('<!--Request Logger--!>');
//   next();
// })

app.get("/", (req, res) => res.render("pages/index"));
// Swagger definition
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Auth
app.use(authRouter);

// Camera routes
app.use(cameraRouter);
app.use(observationRouter);
app.use(configRouter);
app.use(assetConfigRouter);
app.use(serverStatusRouter);
app.use(healthRouter);
app.use("/beds", bedRouter);

app.get("/.well-known/openid-configuration", openidConfigController);

app.ws("/logger", (ws: WebSocket, req) => {
  ws.route = "/logger";
});
app.ws("/observations/:ip", (ws: WebSocket, req) => {
  ws.route = "/observations";
  ws.params = req.params;
});

// Error handler

app.use(Sentry.Handlers.errorHandler());
app.use(errorHandler);
app.all("*", notFoundController);

// Server status monitor
ServerStatusController.init(ws);

app.listen(PORT, () =>
  console.log(`[SERVER] : Middleware App listening at http://localhost:${PORT}`)
);

import morgan from "morgan";
import { eventType } from "../utils/eventTypeConstant.js";

export const morganWithWs = (ws) =>
  morgan(function (tokens, req, res) {
    const data = {
      time: new Date().toISOString(),
      method: tokens.method(req, res),
      url: tokens.url(req, res),
      status: tokens.status(req, res) || 500,
      responseTime: (tokens["response-time"](req, res) || "---") + " ms",
    };

    const server = ws.getWss("/logger");
    server.clients.forEach((c) =>
      c.send(JSON.stringify({ type: eventType.Request, ...data }))
    );

    return Object.values(data).join(" ");
  });

import morgan from "morgan";
import { eventType } from "../utils/eventTypeConstant.js";
import { filterClients } from "../utils/wsUtils.js";

export const morganWithWs = morgan(function (tokens, req, res) {
  const data = {
    time: new Date().toISOString(),
    method: tokens.method(req, res),
    url: tokens.url(req, res),
    status: tokens.status(req, res) || 500,
    responseTime: (tokens["response-time"](req, res) || "---") + " ms",
  };

  const server = req.wsInstance.getWss("/logger");
  filterClients(server, "/logger").forEach((client) =>
    client.send(JSON.stringify({ type: eventType.Request, ...data }))
  );

  return Object.values(data).join(" ");
});

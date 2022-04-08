import pidusage from "pidusage";
import { loadavg } from "os";

import { eventType } from "../utils/eventTypeConstant.js";
import { filterClients } from "../utils/wsUtils.js";

export class ServerStatusController {
  static init(ws) {
    const server = ws.getWss("/logger");
    let intervalId;
    server.on("connection", () => {
      console.log("[SERVER] : Client connected");
      if (!intervalId && server.clients?.size) {
        intervalId = setInterval(() => {
          pidusage(process.pid, (err, stat) => {
            if (err) {
              console.log(err);
              return null;
            }

            if (!server.clients?.size) {
              clearInterval(intervalId);
              intervalId = null;
            }

            const data = {
              type: eventType.Resource,
              cpu: Number(stat.cpu).toFixed(2),
              memory: Number(stat.memory / 1024 / 1024).toFixed(2),
              uptime: stat.elapsed,
              load: loadavg()[0] || 0,
            };

            filterClients(server, "/logger").forEach((client) => {
              client.send(JSON.stringify(data));
            });

          });
        }, 1000);
      }
    });
  }

  static render(req, res) {
    res.render("pages/serverStatus");
  }
}

import pidusage from "pidusage";
import { loadavg } from "os";

import { eventType } from "../utils/eventTypeConstant.js";
import { filterClients } from "../utils/wsUtils.js";

export class ServerStatusController {
  static init(ws) {
    const server = ws.getWss("/logger");
    let intervalId;
    let clients;
    server.on("connection", () => {
      clients = filterClients(server, "/logger")
      if (!intervalId && clients.length !== 0) {
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

            clients.forEach((client) => {
              client.send(JSON.stringify(data));
            });

          });
        }, 1000);
      }

      clients?.forEach(client => {
        client.on("close", () => { clients = filterClients(server, "/logger") })
      })

    });
  }

  static render(req, res) {
    res.render("pages/serverStatus");
  }
}

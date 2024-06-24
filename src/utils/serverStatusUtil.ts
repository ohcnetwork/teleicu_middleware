import { cpus, loadavg } from "os";
import pidusage from "pidusage";

import { WebSocket } from "@/types/ws";
import { eventType } from "@/utils/eventTypeConstant";

const State = {
  type: eventType.Resource,
  cpu: "0.00",
  memory: "0.00",
  uptime: 0,
  load: "0.00",
};

setInterval(() => {
  pidusage(process.pid, (err, stat) => {
    if (err) {
      console.log(err);
      return null;
    }

    State["cpu"] = Number(stat.cpu).toFixed(2);
    State["memory"] = Number(stat.memory / 1024 / 1024).toFixed(2);
    State["uptime"] = stat.elapsed;
    State["load"] = (loadavg()?.[1] / cpus()?.length)?.toFixed(2) ?? "0.00"; // 5 minutes load average
  });
}, 1000);

function sendStatus(client: WebSocket) {
  return setInterval(() => {
    client.send(JSON.stringify(State));
  }, 1000);
}

export { State, sendStatus };

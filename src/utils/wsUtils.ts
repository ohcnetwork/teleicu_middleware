import type { Server } from "ws";

import type { WebSocket } from "@/types/ws";

export const filterClients = (
  ws: Server,
  path: string,
  isAuthenticated: boolean | undefined,
) => {
  return Array.from(ws?.clients || []).filter((client: WebSocket) => {
    if (isAuthenticated === undefined) {
      return client.route === path;
    }
    return (
      client.route === path && Boolean(client?.user?.id) === isAuthenticated
    );
  });
};

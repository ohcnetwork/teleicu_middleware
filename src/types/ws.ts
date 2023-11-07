import type { WebSocket as InitialWebSocket } from "ws";

export interface WebSocket extends InitialWebSocket {
  route?: string;
  params?: Record<string, string>;
}

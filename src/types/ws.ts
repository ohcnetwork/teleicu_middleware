import type { WebSocket as InitialWebSocket } from "ws";
import { User } from "./user";

export interface WebSocket extends InitialWebSocket {
  params?: Record<string, string>;
  route?: string;
  user?: User;
}

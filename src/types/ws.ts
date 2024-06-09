import { User } from "./user";
import type { WebSocket as InitialWebSocket } from "ws";

export interface WebSocket extends InitialWebSocket {
  params?: Record<string, string>;
  route?: string;
  user?: User;
}

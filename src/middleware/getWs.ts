import expressWs from "express-ws";
import type { Request, Response, NextFunction } from "express";

declare module "express-serve-static-core" {
  export interface Request {
    wsInstance: any;
  }
}

export const getWs =
  (ws: expressWs.Instance) =>
  (req: Request, res: Response, next: NextFunction) => {
    req.wsInstance = ws;
    next();
  };

import type { Request, Response } from "express";

export class ServerStatusController {
  static render(req: Request, res: Response) {
    res.render("pages/serverStatus", { req });
  }
}

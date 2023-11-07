import type { Request, Response } from "express";

export class ConfigController {
  static updateConfig = (req: Request, res: Response) => {
    res.redirect("/config");
  };
  static renderUpdateConfig = (req: Request, res: Response) => {
    res.render("pages/config", { hostname: "dev_middleware.coronasafe.live" });
  };
}

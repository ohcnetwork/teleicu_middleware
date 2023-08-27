import { Response, Request } from "express";

export class ConfigController {
  static updateConfig = (req : Request, res: Response):void => {
    res.redirect("/config");
  };
  static renderUpdateConfig = (req: Request, res: Response):void => {
    res.render("pages/config", { hostname: "dev_middleware.coronasafe.live" });
  };
}

export class ConfigController {
  static updateConfig = (req, res) => {
    res.redirect("/config");
  };
  static renderUpdateConfig = (req, res) => {
    res.render("pages/config", { hostname: "dev_middleware.coronasafe.live" });
  };
}

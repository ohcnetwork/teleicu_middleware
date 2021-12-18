var http = require("http");
const dotenv = require("dotenv");

Cam = require("onvif").Cam;

dotenv.config({ path: "./.env" });

const express = require("express");
const cors = require("cors");
const port = 8090;

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let cameraInstances = [];

app.post("/gotoPreset", (req, res) => {
  const camParams = {
    useSecure: req.body.port === 443,
    hostname: req.body.hostname,
    username: req.body.username,
    password: req.body.password,
    port: req.body.port,
  };
  console.log("Camera Params", camParams);
  new Cam(camParams, function (err) {
    this.gotoPreset(
      {
        preset: req.body.preset,
      },
      () => {
        console.log("Callback");
      }
    );
  });
  res.send("Hello World!");
});

app.get("/presets", (req, res) => {
  const port = req.query.port;
  const camParams = {
    useSecure: port && port === 443 ? true : false,
    hostname: req.query.hostname,
    username: req.query.username,
    password: req.query.password,
    port: port,
  };
  console.log("Camera Params", camParams);
  try {
    new Cam(camParams, function (err) {
      this.getPresets({}, (err, presets) => {
        err ? res.send(err) : res.send(presets);
      });
    });
  } catch (error) {
    console.log(error);
  }
});

app.get("/status", (req, res) => {
  const port = req.query.port;
  const camParams = {
    useSecure: port && port === 443 ? true : false,
    hostname: req.query.hostname,
    username: req.query.username,
    password: req.query.password,
    port: port,
  };
  console.log("Camera Params", camParams);
  try {
    new Cam(camParams, function (err) {
      this.getStatus({}, (err, status) => {
        err ? res.send(err) : res.send(status);
      });
    });
  } catch (error) {
    console.log(error);
  }
});

app.post("/absoluteMove", (req, res) => {
  const camParams = {
    useSecure: req.body.port && req.body.port === 443 ? true : false,
    hostname: req.body.hostname,
    username: req.body.username,
    password: req.body.password,
    port: req.body.port,
  };
  new Cam(camParams, function (err) {
    this.absoluteMove({
      x: req.body.x,
      y: req.body.y,
      zoom: req.body.zoom,
    });
  });
  res.send("Requested!");
});

app.post("/relativeMove", (req, res) => {
  const camParams = {
    useSecure: req.body.port && req.body.port === 443 ? true : false,
    hostname: req.body.hostname,
    username: req.body.username,
    password: req.body.password,
    port: req.body.port,
  };
  new Cam(camParams, function (err) {
    this.relativeMove({
      x: req.body.x,
      y: req.body.y,
      zoom: req.body.zoom,
    });
  });
  res.send("Requested!");
});

app.listen(port, () => {
  console.log(`Middleware App listening at http://localhost:${port}`);
});

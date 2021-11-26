Cam = require("onvif").Cam;
new Cam(
  {
    useSecure: true,
    hostname: "dev_camera.coronasafe.live",
    username: "onvif_user",
    password: "qwerty123",
    port: 443,
  },
  function (err) {
    this.gotoPreset(
      {
        preset: 1,
      },
      () => {
        console.log("Callback");
      }
    );
  }
);

// var onvif = require('onvif');
// onvif.Discovery.on('device', function(cam){
// // function would be called as soon as NVT responses
//     cam.username = "onvif_user";
//     cam.password = "qwerty123";
//     cam.connect(console.log);
// })
// onvif.Discovery.probe();

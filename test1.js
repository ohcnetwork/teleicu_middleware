Cam = require("onvif").Cam;
new Cam(
  {
    hostname: "192.168.1.64",
    username: "onvif_user",
    password: "qwerty123",
    port: 80,
  },
  function (err) {
    this.gotoPreset(
      {
        preset: 2,
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

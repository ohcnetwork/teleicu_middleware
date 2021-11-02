var
  http = require('http'),
  Cam = require('onvif').Cam;
// var onvif = require('onvif');
// onvif.Discovery.on('device', function(cam){
// // function would be called as soon as NVT responses
//     cam.username = "onvif_user";
//     cam.password = "qwerty123";
//     cam.connect(console.log);
// })
// onvif.Discovery.probe();

var arg = Number(process.argv.slice(2));


const express = require('express')
const app = express()
const port = 3010

app.get('/', (req, res) => {
new Cam({
  hostname: "192.168.1.64",
  username: "onvif_user",
  password: "qwerty123"
}, function(err) {
  this.gotoPreset({
    preset:1
  },()=>{
    console.log("Callback")
  })
});
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})

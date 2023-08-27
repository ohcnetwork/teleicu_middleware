import * as onvif from "onvif";

const Cam = onvif.Cam;

type camparams= {
  useSecure: boolean;
  hostname: string;
  username: string;
  password: string;
  port: number;
}

export class CameraUtils {
  constructor() {}

  static gotoPreset = async ({ camParams , preset }:{camParams:camparams,preset:number}) =>
    new Promise((resolve, reject) => {
      new Cam(camParams, function (err:any) {
        if (err) return reject(err);

        this.gotoPreset({ preset }, (data) => resolve(data));
      });
    });

  static getPreset = async ({ camParams }:{camParams:camparams}) =>
    new Promise(
      (resolve, reject) =>
        new Cam(camParams, function (err:any) {
          if (err) return reject(err);

          this.getPresets({}, (error, presets:number) => {
            if (error) return reject(error);
            if (presets) return resolve(presets);
          });
        })
    );

  static getStatus = async ({ camParams }:{camParams:camparams}) =>
    new Promise(
      (resolve, reject) =>
        new Cam(camParams, function (err:any) {
          if (err) return reject(err);
          this.getStatus({}, (error, status) => {
            if (error) return reject(error);
            if (status) return resolve(status);
          });
        })
    );

  static absoluteMove = async ({ camParams, x, y, zoom }:{camParams:{hostname:string,username?:string,password?:string,port?:number},x:number,y:number,zoom:number}) =>
    new Promise((resolve, reject) => {
      new Cam(camParams, function (err:any) {
        if (err) return reject(err);
        try {
          const result = this.absoluteMove({ x, y, zoom });
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
    });

  static relativeMove = async ({ camParams, x, y, zoom }) =>
    new Promise((resolve, reject) => {
      new Cam(camParams, function (err) {
        if (err) return reject(err);
        try {
          const result = this.relativeMove({ x, y, zoom });
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
    });

  static setPreset = async ({ camParams, presetName }) =>
    new Promise((resolve, reject) => {
      new Cam(camParams, function (err) {
        if (err) return reject(err);
        try {
          const result = this.setPreset({ presetName }, () => {});
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
    });

  static getSnapshotUri = async ({ camParams }) => 
    new Promise((resolve, reject) => {
      new Cam(camParams, function (err) {
        if (err) return reject(err);
        try {
          const result = this.getSnapshotUri({}, (error, snapshotUri) => {
            if (error) return reject(error);
            if (snapshotUri) return resolve(snapshotUri);
          });
        } catch (error) {
          reject(error);
        }
      });
    });



  
}

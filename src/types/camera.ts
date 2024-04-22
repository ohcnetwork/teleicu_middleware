export interface CameraParams {
  useSecure: boolean;
  hostname: string;
  username: string;
  password: string;
  port: number;
}

export interface CameraPreset {
  x: number;
  y: number;
  zoom: number;
}

export interface CameraStatus {
  time: string;
  status: {
    [device_id: string]: "up" | "down";
  };
}

export type CameraAsset = Omit<CameraParams, "useSecure">;

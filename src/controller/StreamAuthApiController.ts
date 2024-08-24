import { Request, Response } from "express";

import { generateJWTWithKey, verifyJWTWithKey } from "@/lib/jose";

export class StreamAuthApiController {
  static getVideoFeedStreamToken = async (req: Request, res: Response) => {
    const { stream_id } = req.body;
    if (!stream_id) {
      return res.status(400).json({ message: "stream_id is required" });
    }

    try {
      const token = await generateJWTWithKey({ stream:stream_id }, "60s");

      return res.status(200).json({ token });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  };

  static getVitalStreamToken = async (req: Request, res: Response) => {
    const { asset_id, ip } = req.body;
    if (!asset_id || !ip) {
      return res.status(400).json({ message: "asset_id and ip are required" });
    }

    try {
      const token = await generateJWTWithKey({ asset_id, ip }, "60s");

      return res.status(200).json({ token });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  };

  static validateStreamToken = async (req: Request, res: Response) => {
    const { token, ip, stream } = req.body;
    if (!token || !stream) {
      return res.status(400).json({ message: "token and stream are required" });
    }

    try {
      const decoded = await verifyJWTWithKey(token);
      if (decoded.stream === stream) {
        return res.status(200).json({ status: "1" });
      }

      return res.status(401).json({ status: "0" });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  };
}

import type { Request, Response } from "express";

export class AuthController {
  static verifyToken = (req: Request, res: Response) => {
    const token = "";

    if (this._validateJwt(token)) {
      return res.send({ status: "1" });
    }

    res.send({ status: "0" });
  };

  static _validateJwt = (token: string) => {
    return true;
  };
}

import fs from "fs"
import jose from "node-jose"
import {Request,Response, NextFunction} from 'express'


export const openidConfigController = async (req: Request, res: Response, next: NextFunction) => {
    /*
    This endpoint reads the `keys.json` and serves the public key 
    */

    const ks = fs.readFileSync("keys.json");
  
    const keyStore = await jose.JWK.asKeyStore(ks.toString());

    res.statusCode = 200
    res.send(keyStore.toJSON()); // toJson converts the keystore into a Public Key JWK
}
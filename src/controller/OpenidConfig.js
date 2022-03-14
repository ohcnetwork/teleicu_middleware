import fs from "fs"
import jose from "node-jose"

export const openidConfigController = async (req, res, next) => {
    const ks = fs.readFileSync("keys.json");
  
    const keyStore = await jose.JWK.asKeyStore(ks.toString());

    res.statusCode = 200
    
    res.send(keyStore.toJSON());
}

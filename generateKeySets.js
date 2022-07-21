/*
This script generates a `keys.json` JWKS file, this file contains a private and public key in the JWKS format,
Always ensure that there is only one unique keys.json file in a deployment swarm.
Do NOT interact with the `keys.json` file outside the defined wrapper methods.
*/

import fs from "fs"
import jose from "node-jose"

const keyStore = jose.JWK.createKeyStore();

keyStore.generate("RSA", 2048, { alg: "RS256", use: "sig" }).then((result) => { // Security can be tightened if required
  fs.writeFileSync(
    "keys.json",
    JSON.stringify(keyStore.toJSON(true), null, "  ")
  );
});
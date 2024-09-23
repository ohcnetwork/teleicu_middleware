import fs from "fs";
import * as jose from "jose";
import { v4 as uuidv4 } from "uuid";

import { randomString } from "@/lib/crypto";
import { careApi, jwtSecret } from "@/utils/configs";

/**
 * Default JSON Web Key (JWK) configuration.
 */
const JWK_DEFAULTS = {
  kty: "RSA",
  alg: "RS256",
  use: "sig",
};

/**
 * Private key used to sign JSON Web Tokens from this server (JWTs).
 */
let privateKey: jose.KeyLike | null = null;

/**
 * JSON Web Key Set (JWKs) used to verify JWTs from this server.
 */
let JWKs: jose.JSONWebKeySet | null = null;

/**
 * JSON Web Key Set (JWKs) used to verify JWTs from the Care backend.
 */
let careJWKs: jose.JSONWebKeySet | null = null;

/**
 * JWT secret used to sign JWTs.
 */
let jwtSecretKey: Uint8Array | null = null;

/**
 * Retrieves the private key used for encryption.
 * If the private key is not already loaded, it attempts to load it from the "keys.json" file.
 * If the file does not exist, it logs an error message and exits the process.
 * @returns {Promise<jose.KeyLike>} The private key used for encryption.
 */
export async function getPrivateKey() {
  if (!privateKey) {
    try {
      const file = fs.readFileSync("keys.json").toString();
      const keyStore: jose.JSONWebKeySet = JSON.parse(file);
      privateKey = (await jose.importJWK(keyStore.keys[0])) as jose.KeyLike;
    } catch (error: any) {
      console.error("Error while loading keys", error);
      if (
        error.code === "ENOENT" &&
        error.syscall === "open" &&
        error.path === "keys.json"
      ) {
        console.error("keys.json does not exist");
        console.error("Did you forget to run `npm run generate-keys`?");
      }
      process.exit(1);
    }
  }
  return privateKey;
}

/**
 * Retrieves the JSON Web Key Set (JWKs).
 * If the JWKs are not already cached, it generates a new private key,
 * exports it as a JWK, and caches it for future use.
 * @returns {Promise<jose.JWKSet>} The JWK Set containing the private key.
 */
export async function getJWKs() {
  if (!JWKs) {
    const privateKey = await getPrivateKey();
    const privateJWK = await jose.exportJWK(privateKey);
    JWKs = {
      keys: [
        {
          ...JWK_DEFAULTS,
          kid: privateJWK.kid,
          e: privateJWK.e,
          n: privateJWK.n,
        },
      ],
    };
  }
  return JWKs;
}

/**
 * Retrieves the JSON Web Key Set (JWKs) used to verify JWTs from the Care backend.
 * If the JWKs are not already cached, it fetches them from the Care API and caches them for future use.
 * @returns {Promise<jose.JWKSet>} The JWK Set containing the Care JWKs.
 */
export async function getCareJWKs() {
  if (!careJWKs) {
    const controller = new AbortController();
    setTimeout(() => controller.abort(), 5000);
    const res = await fetch(`${careApi}/.well-known/openid-configuration`, {
      signal: controller.signal,
    }).then((res) => {
      if (!res.ok) {
        throw new Error(`Failed to fetch Care JWKs: ${res.statusText}`);
      }
      return res.json() as Promise<jose.JSONWebKeySet>;
    });
    if (!res) {
      throw new Error("Care JWKs not found");
    }
    careJWKs = res;
  }
  return careJWKs;
}

/**
 * Retrieves the JWT secret used to sign JWTs.
 * If the JWT secret is not already loaded, it uses the value from the environment
 * variable "
 * @returns {Promise<Uint8Array>} The JWT secret used to sign JWTs.
 */
export async function getJWTSecret() {
  if (!jwtSecretKey) {
    jwtSecretKey = jwtSecret;
  }
  return jwtSecretKey;
}

/**
 * Generates a new JSON Web Key (JWK) pair.
 * @returns {Promise<jose.JWK>} The generated JWK pair.
 */
export async function generateKeyPair(): Promise<jose.JWK> {
  const keyPair = await jose.generateKeyPair("RS256");
  const privateJWK = await jose.exportJWK(keyPair.privateKey);

  return {
    kid: uuidv4(),
    ...JWK_DEFAULTS,
    ...privateJWK,
  };
}

/**
 * Generates a JSON Web Token (JWT) with the provided claims and expiration time.
 * @param claims The payload of the JWT.
 * @param expiresIn The expiration time of the JWT. Defaults to "2m" (2 minutes).
 * @returns {Promise<string>} The generated JWT.
 */
export async function generateJWT(
  claims: jose.JWTPayload,
  expiresIn: string = "2m",
) {
  const privateKey = await getPrivateKey();
  const JWKs = await getJWKs();
  const claimsWithDefaults: jose.JWTPayload = {
    // iss: "teleicu-middleware",
    // aud: "care",
    jti: randomString(20),
    ...claims,
  };

  return new jose.SignJWT(claimsWithDefaults)
    .setProtectedHeader({
      alg: JWK_DEFAULTS.alg,
      kid: JWKs.keys[0].kid,
      typ: "jwt",
    })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(privateKey);
}

/**
 * Generates a JSON Web Token (JWT) with the provided claims and expiration time using the provided key.
 * @param claims The payload of the JWT.
 * @param expiresIn The expiration time of the JWT. Defaults to "2m" (2 minutes).
 * @returns {Promise<string>} The generated JWT.
 */
export async function generateJWTWithKey(
  claims: jose.JWTPayload,
  expiresIn: string = "2m",
) {
  const claimsWithDefaults: jose.JWTPayload = {
    // iss: "teleicu-middleware",
    // aud: "care",
    jti: randomString(20),
    ...claims,
  };

  return new jose.SignJWT(claimsWithDefaults)
    .setProtectedHeader({
      alg: "HS256",
      typ: "jwt",
    })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(await getJWTSecret());
}

/**
 * Represents a function that validates a JSON Web Token (JWT).
 * @param jwt The JWT to be validated.
 * @param options Optional verification options for the JWT.
 * @returns {Promise<jose.JWTPayload>} The payload of the JWT.
 */
export type JWTValidator = (
  jwt: string,
  options?: jose.JWTVerifyOptions,
) => Promise<jose.JWTPayload>;

/**
 * Verifies a JSON Web Token (JWT) generated by this server using the provided options.
 * @param jwt The JWT to verify.
 * @param options The options for JWT verification.
 * @returns {Promise<jose.JWTPayload>} The payload of the JWT.
 */
export async function verifyJWT(
  jwt: string,
  options: jose.JWTVerifyOptions = {},
) {
  const JWKs = await getJWKs();
  const { payload } = await jose.jwtVerify(jwt, jose.createLocalJWKSet(JWKs), {
    // issuer: "teleicu-middleware",
    // audience: "care",
    ...options,
  });

  return payload;
}

/**
 * Verifies a JSON Web Token (JWT) generated by this server using the provided options.
 * @param jwt The JWT to verify.
 * @param options The options for JWT verification.
 * @returns {Promise<jose.JWTPayload>} The payload of the JWT.
 */
export async function verifyJWTWithKey(
  jwt: string,
  options: jose.JWTVerifyOptions = {},
) {
  const { payload } = await jose.jwtVerify(jwt, await getJWTSecret(), {
    // issuer: "teleicu-middleware",
    // audience: "care",
    ...options,
  });

  return payload;
}

/**
 * Verifies a JSON Web Token (JWT) generated by care backend using the provided options.
 * @param jwt The JWT to verify.
 * @param options The options for JWT verification.
 * @returns {Promise<jose.JWTPayload>} The payload of the JWT.
 */
export async function verifyCareJWT(
  jwt: string,
  options: jose.JWTVerifyOptions = {},
) {
  const careJWKs = await getCareJWKs();
  const { payload } = await jose.jwtVerify(
    jwt,
    jose.createLocalJWKSet(careJWKs),
    {
      // issuer: "urn:example:issuer",
      // audience: "urn:example:audience",
      ...options,
    },
  );

  return payload;
}

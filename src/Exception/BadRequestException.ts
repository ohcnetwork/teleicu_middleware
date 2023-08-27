import { BaseHTTPException } from "./BaseHTTPException.js";

export class BadRequestException extends BaseHTTPException {
  constructor(message ?:string) {
    super(message || "Bad Request", 400);
  }
}

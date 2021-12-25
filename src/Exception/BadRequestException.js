import { BaseHTTPException } from "./BaseHTTPException.js";

export class BadRequestException extends BaseHTTPException {
  constructor(message) {
    super(message || "Bad Request", 400);
  }
}

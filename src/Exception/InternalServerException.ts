import { BaseHTTPException } from "./BaseHTTPException.js";

export class InternalServerError extends BaseHTTPException {
  constructor(message?: string) {
    super(message || "Internal Server Error", 500);
  }
}

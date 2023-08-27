import { BaseHTTPException } from "./BaseHTTPException.js";

export class NotFoundException extends BaseHTTPException {
  constructor(message?: string) {
    super(message || "Not Found", 404);
  }
}

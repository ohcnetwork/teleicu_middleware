import { BaseHTTPException } from "@/Exception/BaseHTTPException";

export class InternalServerError extends BaseHTTPException {
  constructor(message: string) {
    super(message || "Internal Server Error", 500);
  }
}

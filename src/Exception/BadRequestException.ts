import { BaseHTTPException } from "@/Exception/BaseHTTPException";

export class BadRequestException extends BaseHTTPException {
  constructor(message: string) {
    super(message || "Bad Request", 400);
  }
}

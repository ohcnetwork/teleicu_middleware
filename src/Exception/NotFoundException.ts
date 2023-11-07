import { BaseHTTPException } from "@/Exception/BaseHTTPException";

export class NotFoundException extends BaseHTTPException {
  constructor(message: string) {
    super(message || "Not Found", 404);
  }
}

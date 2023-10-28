import type { NextFunction, Request, Response } from "express";

export const catchAsync =
  (fn: Function) =>
  (request: Request, response: Response, next: NextFunction) =>
    Promise.resolve(fn(request, response, next)).catch(next);

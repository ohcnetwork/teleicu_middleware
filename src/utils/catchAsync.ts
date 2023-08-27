import {Response,Request,NextFunction} from "express"

export const catchAsync = (fn) => (req:Request, res:Response, next:NextFunction) =>
  fn(req, res, next).catch((err:any) => next(err));

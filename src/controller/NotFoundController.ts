import {Request,Response, NextFunction} from 'express'

export const notFoundController = (req: Request, res:Response , next: NextFunction):void => {
  res.status(404).render("pages/notFound");
};

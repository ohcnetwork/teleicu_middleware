import { Response,Request,NextFunction } from "express";
import enableWs from "express-ws";


export const getWs = (ws:enableWs.Instance) => (req:Request, res:Response, next:NextFunction) => {
    req.wsInstance = ws
    next()
}
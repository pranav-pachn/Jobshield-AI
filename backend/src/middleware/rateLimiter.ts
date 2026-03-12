import { NextFunction, Request, Response } from "express";

export function rateLimiter(_req: Request, _res: Response, next: NextFunction) {
  next();
}

import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

type JwtPayloadWithUserId = {
  id?: string;
  userId?: string;
  [key: string]: unknown;
};

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    return res.status(500).json({
      message: "JWT secret is not configured",
    });
  }

  try {
    const decoded = jwt.verify(token, jwtSecret) as JwtPayloadWithUserId;
    const userId = decoded.id ?? decoded.userId;

    if (!userId) {
      return res.status(401).json({
        message: "Invalid token",
      });
    }

    (req as Request & { user?: { id: string } }).user = { id: userId };
    next();
  } catch {
    return res.status(401).json({
      message: "Invalid token",
    });
  }
}

import { NextFunction, Request, Response } from "express";

const jwt = require("jsonwebtoken");

type AuthenticatedRequest = Request & {
  user?: {
    id: string;
  };
};

export function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const headerValue = req.headers.authorization;

  if (!headerValue) {
    res.status(401).json({ message: "No token provided" });
    return;
  }

  const token = headerValue.startsWith("Bearer ") ? headerValue.slice(7).trim() : headerValue.trim();
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    res.status(500).json({ message: "JWT secret is not configured" });
    return;
  }

  try {
    const decoded = jwt.verify(token, jwtSecret) as { id?: string };

    if (!decoded?.id) {
      res.status(401).json({ message: "Invalid token payload" });
      return;
    }

    req.user = { id: decoded.id };
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
}

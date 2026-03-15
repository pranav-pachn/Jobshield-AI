import { RequestHandler } from "express";

const jwt = require("jsonwebtoken");

type AuthenticatedRequest = {
  user?: {
    id: string;
  };
};

export const authMiddleware: RequestHandler = (req, res, next) => {
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
    const decoded = jwt.verify(token, jwtSecret) as { id?: string; userId?: string };
    const userId = decoded?.id ?? decoded?.userId;

    if (!userId) {
      res.status(401).json({ message: "Invalid token payload" });
      return;
    }

    (req as typeof req & AuthenticatedRequest).user = { id: userId };
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
};

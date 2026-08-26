import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/User";

type JwtPayloadWithUserId = {
  id?: string;
  userId?: string;
  role?: string;
  [key: string]: unknown;
};

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
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
    
    // DB-authoritative lookup to ensure revoked/changed roles are immediately active
    const user = await User.findById(userId).select("role").exec();
    if (!user) {
      return res.status(401).json({
        message: "User not found",
      });
    }

    (req as Request & { user?: { id: string, role?: string } }).user = { 
      id: userId,
      role: user.role
    };
    next();
  } catch {
    return res.status(401).json({
      message: "Invalid token",
    });
  }
}

export function requireRole(allowedRoles: string[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Ensure authMiddleware has run and attached role
    const userRole = (req as any).user?.role;
    
    if (!userRole) {
      // Fallback: If for some reason authMiddleware didn't run properly
      return res.status(401).json({ message: "Unauthorized: Role missing" });
    }

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ message: "Forbidden: insufficient privileges" });
    }

    next();
  };
}


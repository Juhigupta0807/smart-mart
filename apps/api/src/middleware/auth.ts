import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { unauthorized, forbidden } from "../utils/httpError.js";

export interface AuthPayload {
  adminId: number;
  email: string;
}

declare global {
  namespace Express {
    interface Request {
      admin?: AuthPayload;
    }
  }
}

export function requireAdmin(req: Request, _res: Response, next: NextFunction) {
  const token =
    req.cookies?.admin_token ||
    req.headers.authorization?.replace("Bearer ", "");

  if (!token) return next(unauthorized());

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as AuthPayload;
    req.admin = payload;
    next();
  } catch {
    next(unauthorized("Invalid or expired token"));
  }
}

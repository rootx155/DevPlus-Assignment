import type { Request, Response, NextFunction } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { sendError } from "../utils/response.js";
import { config } from "../config/index.js";
import { pool } from "../db/index.js";

export interface AuthRequest extends Request {
  user?: {
    id: number;
    name: string;
    role: "contributor" | "maintainer";
  };
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  // console.log(req.user);

  const authHeader = req.headers.authorization;
  if (!authHeader) {
    sendError(res, 401, "Unauthorized", "No token provided");
    return;
  }

  try {
    const decoded = jwt.verify(authHeader, config.jwtSecretKey) as JwtPayload;
    // console.log("Decoded JWT Payload:", decoded);

    const userData = await pool.query("SELECT * FROM users WHERE email = $1", [
      decoded.email,
    ]);

    req.user = userData.rows[0];
    // console.log("Authenticated User:", req.user);
    next();
  } catch (error) {
    sendError(res, 401, "Unauthorized", "Invalid or expired token");
  }
};

export const authorize = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      sendError(res, 403, "Forbidden", "Insufficient permissions");
      return;
    }
    next();
  };
};

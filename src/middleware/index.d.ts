import type { JwtPayload } from "jsonwebtoken";
import type { AuthRequest } from "./auth";

declare global {
  namespace Express {
    interface Request {
      user?: AuthRequest["user"];
    }
  }
}

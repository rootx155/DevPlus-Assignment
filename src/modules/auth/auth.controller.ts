import type { Request, Response } from "express";
import { authService } from "./auth.service.js";
import { sendSuccess, sendError } from "../../utils/response.js";

const registerUser = async (req: Request, res: Response) => {
  console.log("[POST /api/auth/signup] Body:", req.body);
  try {
    const result = await authService.createUserIntoDB(req.body);
    return sendSuccess(res, 201, "User registered successfully", result);
  } catch (error: any) {
    console.error("Signup validation/database failure:", error);
    if (error.code === "23505") {
      return sendError(res, 400, "Bad Request", "Email already exists");
    }
    return sendError(res, 400, "Bad Request", error.message);
  }
};

const loginUser = async (req: Request, res: Response) => {
  console.log("[POST /api/auth/login] Body:", req.body);
  try {
    const result = await authService.loginUserFromDB(req.body);
    return sendSuccess(res, 200, "Login successful", result);
  } catch (error: any) {
    console.error("Login authorization failure:", error);
    return sendError(res, 401, "Unauthorized", error.message);
  }
};

export const authController = {
  registerUser,
  loginUser,
};

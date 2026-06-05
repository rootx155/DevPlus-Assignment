import type { Response } from "express";

export const sendSuccess = (res: Response, statusCode: number, message: string, data?: any) => {
  console.log(`[Success Response] Status: ${statusCode} | Message: ${message}`);
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

export const sendError = (res: Response, statusCode: number, message: string, errors?: any) => {
  console.error(`[Error Response] Status: ${statusCode} | Message: ${message} | Details:`, errors);
  return res.status(statusCode).json({
    success: false,
    message,
    errors: errors || null,
  });
};
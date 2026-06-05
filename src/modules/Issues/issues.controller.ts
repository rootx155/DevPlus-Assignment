import type { Response } from "express";
import type { AuthRequest } from "../../middleware/auth.js";
import { issuesService } from "./issues.service.js";
import { sendSuccess, sendError } from "../../utils/response.js";

const createIssue = async (req: AuthRequest, res: Response) => {
  // console.log("[POST /api/issues] Triggered. Body:", req.body);
  try {
    const reporterId = req.user!.id; // Derived safely via decode validation middleware
    // console.log("Request id", req.user?.id);

    const result = await issuesService.createIssueInDB(req.body, reporterId);
    return sendSuccess(res, 201, "Issue created successfully", result);
  } catch (error: any) {
    return sendError(res, 400, "Bad Request", error.message);
  }
};

const getAllIssues = async (req: AuthRequest, res: Response) => {
  // console.log("[GET /api/issues] Triggered. Query Filter Strings:", req.query);
  try {
    const result = await issuesService.getAllIssuesFromDB(req.query);
    return sendSuccess(res, 200, "Issues retrieved successfully", result);
  } catch (error: any) {
    return sendError(res, 500, "Internal Server Error", error.message);
  }
};

const getSingleIssue = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  // console.log(`[GET /api/issues/${id}] Triggered.`);
  try {
    const result = await issuesService.getSingleIssueFromDB(Number(id));
    if (!result) {
      return sendError(
        res,
        404,
        "Not Found",
        `Issue with ID ${id} does not exist`,
      );
    }
    return sendSuccess(res, 200, "Issue retrieved successfully", result);
  } catch (error: any) {
    return sendError(res, 500, "Internal Server Error", error.message);
  }
};

const updateIssue = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  // console.log(`[PATCH /api/issues/${id}] Triggered. Body:`, req.body);
  try {
    const userId = req.user!.id;
    const userRole = req.user!.role;

    const { status, message, data } = await issuesService.updateIssueInDB(
      Number(id),
      req.body,
      userId,
      userRole,
    );

    if (status !== 200) {
      return sendError(res, status, message || "Error updating issue");
    }

    return sendSuccess(res, 200, "Issue updated successfully", data);
  } catch (error: any) {
    return sendError(res, 400, "Bad Request", error.message);
  }
};

const deleteIssue = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  // console.log(`[DELETE /api/issues/${id}] Triggered.`);
  try {
    const holdsDeletionSuccess = await issuesService.deleteIssueFromDB(
      Number(id),
    );
    if (!holdsDeletionSuccess) {
      return sendError(
        res,
        404,
        "Not Found",
        `Issue with ID ${id} does not exist`,
      );
    }
    return sendSuccess(res, 200, "Issue deleted successfully");
  } catch (error: any) {
    return sendError(res, 500, "Internal Server Error", error.message);
  }
};

export const issuesController = {
  createIssue,
  getAllIssues,
  getSingleIssue,
  updateIssue,
  deleteIssue,
};

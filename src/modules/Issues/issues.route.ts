import { Router } from "express";
import { issuesController } from "./issues.controller.js";
import { authenticate, authorize } from "../../middleware/auth.js";

const router = Router();

// Publicly readable endpoints
router.get("/", issuesController.getAllIssues);
router.get("/:id", issuesController.getSingleIssue);

// Authenticated actions (both roles can access creation or patch updates)
router.post("/", authenticate, issuesController.createIssue);
router.patch("/:id", authenticate, issuesController.updateIssue);

// Deletions strictly locked to Maintainers
router.delete(
  "/:id",
  authenticate,
  authorize(["maintainer"]),
  issuesController.deleteIssue,
);

export const issuesRouter = router;

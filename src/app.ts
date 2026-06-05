import express from "express";
import cors from "cors";
import { authRouter } from "./modules/auth/auth.route.js";
import { issuesRouter } from "./modules/Issues/issues.route.js";

const app = express();

app.use(cors());
app.use(express.json());

// Main App Routes Mapping
app.use("/api/auth", authRouter);
app.use("/api/issues", issuesRouter);

// Centralized Catch-All Error Handler
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    console.error("Centralized exception caught:", err);
    res.status(500).json({
      success: false,
      message: "An unexpected error occurred on the server.",
      errors: err.message,
    });
  },
);

export default app;

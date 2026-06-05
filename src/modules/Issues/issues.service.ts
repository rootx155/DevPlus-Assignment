import { pool } from "../../db/index.js";
import type { ICreateIssue, IIssueFilter } from "./issues.interface.js";

const createIssueInDB = async (payload: ICreateIssue, reporterId: number) => {
  console.log(
    `Inserting issue into DB for reporter ID: ${reporterId}`,
    payload,
  );
  const { title, description, type, status } = payload;

  if (!description || description.length < 20) {
    throw new Error("Description must be at least 20 characters long");
  }

  const result = await pool.query(
    `INSERT INTO issues (title, description, type, status, reporter_id) 
     VALUES ($1, $2, $3, COALESCE($4, 'open'), $5) 
     RETURNING *`,
    [title, description, type, status, reporterId],
  );

  console.log("Issue generated successfully:", result.rows[0]);
  return result.rows[0];
};

const getAllIssuesFromDB = async (filters: IIssueFilter) => {
  console.log("Fetching issues with filter payload:", filters);
  const { sort = "newest", type, status } = filters;

  let queryText = "SELECT * FROM issues";
  const queryParams: any[] = [];
  const whereClauses: string[] = [];

  if (type) {
    queryParams.push(type);
    whereClauses.push(`type = $${queryParams.length}`);
  }

  if (status) {
    queryParams.push(status);
    whereClauses.push(`status = $${queryParams.length}`);
  }

  if (whereClauses.length > 0) {
    queryText += " WHERE " + whereClauses.join(" AND ");
  }

  // Apply sorting syntax
  queryText +=
    sort === "oldest"
      ? " ORDER BY created_at ASC"
      : " ORDER BY created_at DESC";

  const issuesResult = await pool.query(queryText, queryParams);
  const issues = issuesResult.rows;

  if (issues.length === 0) return [];

  // EXPLICIT REQUIREMENT HINT: Match reporter data manually WITHOUT using JOINs
  const userIds = Array.from(new Set(issues.map((issue) => issue.reporter_id)));
  console.log("Staging lookups sequentially for associated User IDs:", userIds);

  const usersResult = await pool.query(
    `SELECT id, name, role FROM users WHERE id = ANY($1)`,
    [userIds],
  );

  const userMap = usersResult.rows.reduce((acc: any, user: any) => {
    acc[user.id] = user;
    return acc;
  }, {});

  // Map user data back to the payload
  return issues.map((issue) => {
    const { reporter_id, ...issueData } = issue;
    return {
      ...issueData,
      reporter: userMap[reporter_id] || null,
    };
  });
};

const getSingleIssueFromDB = async (id: number) => {
  console.log(`Locating singular issue profile matching ID: ${id}`);
  const issueResult = await pool.query("SELECT * FROM issues WHERE id = $1", [
    id,
  ]);

  if (issueResult.rows.length === 0) {
    return null;
  }
  const issue = issueResult.rows[0];

  // Fetch reporter metadata discretely without an SQL JOIN
  const userResult = await pool.query(
    "SELECT id, name, role FROM users WHERE id = $1",
    [issue.reporter_id],
  );
  const { reporter_id, ...issueData } = issue;

  return {
    ...issueData,
    reporter: userResult.rows[0] || null,
  };
};

const updateIssueInDB = async (
  id: number,
  payload: Partial<ICreateIssue>,
  userId: number,
  userRole: string,
) => {
  console.log(
    `Update execution triggered on Issue ID: ${id} by User ID: ${userId} [${userRole}]`,
  );

  const currentIssueResult = await pool.query(
    "SELECT * FROM issues WHERE id = $1",
    [id],
  );
  if (currentIssueResult.rows.length === 0) {
    return { status: 404, message: "Issue not found" };
  }

  const issue = currentIssueResult.rows[0];

  // Rule: Maintainer (any issue) OR Contributor (own issue, only if status is open)
  if (userRole !== "maintainer") {
    if (issue.reporter_id !== userId) {
      return {
        status: 403,
        message: "Insufficient permissions to modify this issue",
      };
    }
    if (issue.status !== "open") {
      return {
        status: 409,
        message: "Contributors can only update issues when they are open",
      };
    }
  }

  const title = payload.title || issue.title;
  const description = payload.description || issue.description;
  const type = payload.type || issue.type;

  const updateResult = await pool.query(
    `UPDATE issues 
     SET title = $1, description = $2, type = $3, updated_at = CURRENT_TIMESTAMP 
     WHERE id = $4 
     RETURNING *`,
    [title, description, type, id],
  );

  return { status: 200, data: updateResult.rows[0] };
};

const deleteIssueFromDB = async (id: number) => {
  console.log(`Delete operation executed on Issue ID: ${id}`);
  const checkResult = await pool.query("SELECT * FROM issues WHERE id = $1", [
    id,
  ]);
  if (checkResult.rows.length === 0) {
    return false;
  }

  await pool.query("DELETE FROM issues WHERE id = $1", [id]);
  return true;
};

export const issuesService = {
  createIssueInDB,
  getAllIssuesFromDB,
  getSingleIssueFromDB,
  updateIssueInDB,
  deleteIssueFromDB,
};

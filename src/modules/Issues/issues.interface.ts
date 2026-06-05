export interface ICreateIssue {
  title: string;
  description: string;
  type: "bug" | "feature_request";
  status?: "open" | "in_progress" | "resolved";
}

export interface IIssueFilter {
  sort?: "newest" | "oldest";
  type?: "bug" | "feature_request";
  status?: "open" | "in_progress" | "resolved";
}

import { z } from "zod";
import type { User } from "./types";

const name = z.string().trim().min(1, "Enter a name.").max(160);
const description = z.string().trim().max(5000).default("");
export const AiDraft = z.object({
  projects: z.array(z.object({
    name, clientName: name, description,
    managerId: z.string().min(1, "Choose a project manager."),
    deadline: z.iso.date("Choose a valid project deadline."),
    tasks: z.array(z.object({
      title: name, description,
      assigneeId: z.string().min(1, "Choose a member."),
      deadline: z.iso.date("Choose a valid task deadline."),
      estimatedHours: z.number().positive("Hours must be greater than zero.").max(10000),
    })).min(1, "Add at least one task.").max(200),
  })).min(1, "Add at least one project.").max(30),
});
export type AiDraft = z.infer<typeof AiDraft>;
export type ValidationIssue = { path: string; message: string };

export function validateDraft(input: unknown, directory: Pick<User, "id" | "name" | "role">[]): { draft: AiDraft | null; issues: ValidationIssue[] } {
  const parsed = AiDraft.safeParse(input);
  if (!parsed.success) return { draft: null, issues: parsed.error.issues.map(issue => ({ path: issue.path.join("."), message: issue.message })) };
  const draft = parsed.data;
  const byId = new Map(directory.map(user => [user.id, user]));
  const issues: ValidationIssue[] = [];
  draft.projects.forEach((project, pi) => {
    if (byId.get(project.managerId)?.role !== "MANAGER") issues.push({ path: `projects.${pi}.managerId`, message: "Choose a project manager from the directory." });
    project.tasks.forEach((task, ti) => {
      const path = `projects.${pi}.tasks.${ti}`;
      if (byId.get(task.assigneeId)?.role !== "AGENT") issues.push({ path: `${path}.assigneeId`, message: "Choose a member from the directory." });
      if (task.deadline > project.deadline) issues.push({ path: `${path}.deadline`, message: `Task deadline must be on or before ${project.deadline}.` });
    });
  });
  return { draft, issues };
}

export function describeIssue(issue: ValidationIssue) {
  const parts = issue.path.split(".");
  const project = parts[0] === "projects" && parts[1] !== undefined ? `Project ${Number(parts[1]) + 1}` : "Draft";
  const task = parts[2] === "tasks" && parts[3] !== undefined ? `, task ${Number(parts[3]) + 1}` : "";
  const field = parts.at(-1);
  const labels: Record<string, string> = { name: "name", clientName: "client", title: "title", description: "description", deadline: "deadline", estimatedHours: "hours", managerId: "manager", assigneeId: "member" };
  return `${project}${task}${field && labels[field] ? ` · ${labels[field]}` : ""}: ${issue.message}`;
}

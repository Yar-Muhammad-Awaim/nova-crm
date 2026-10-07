import "server-only";
import { db } from "./supabase";
import { getSession } from "./session";
import type { Project, Task, User, Session } from "./types";

/** Throws unless somebody is logged in. Every page/route starts with this. */
export async function requireSession(): Promise<Session> {
  const s = await getSession();
  if (!s) throw new Error("UNAUTHENTICATED");
  return s;
}

export async function requireAdmin(): Promise<Session> {
  const s = await requireSession();
  if (s.role !== "ADMIN") throw new Error("FORBIDDEN");
  return s;
}

/** The team directory. Read-only, visible to any logged-in user. */
export async function listUsers(): Promise<User[]> {
  const { data, error } = await db
    .from("users")
    .select("id,name,email,role,specialization,skills")
    .order("role")
    .order("id");
  if (error) throw error;
  return data as User[];
}

/**
 * THE core access rule. Everything else is built on it.
 *
 *   ADMIN   -> every project
 *   MANAGER -> projects where they are the manager
 *   AGENT   -> only projects that contain at least one task assigned to them
 *
 * This is a database query, not a filter applied after fetching everything,
 * so rows the caller may not see never leave Postgres.
 */
export async function getProjects(s: Session): Promise<Project[]> {
  const base = () =>
    db.from("projects").select("*, manager:users!projects_manager_id_fkey(id,name), tasks(id)");

  if (s.role === "ADMIN") {
    const { data, error } = await base().order("created_at");
    if (error) throw error;
    return data as unknown as Project[];
  }

  if (s.role === "MANAGER") {
    const { data, error } = await base().eq("manager_id", s.userId).order("created_at");
    if (error) throw error;
    return data as unknown as Project[];
  }

  // AGENT: find the distinct projects their tasks live in, then fetch those.
  const { data: mine, error: e1 } = await db
    .from("tasks").select("project_id").eq("assignee_id", s.userId);
  if (e1) throw e1;
  const ids = [...new Set((mine ?? []).map((t) => t.project_id))];
  if (ids.length === 0) return [];
  const { data, error } = await base().in("id", ids).order("created_at");
  if (error) throw error;
  return data as unknown as Project[];
}

/**
 * Tasks inside one project, again scoped by role.
 * An AGENT sees ONLY their own tasks — never a teammate's.
 */
export async function getTasks(s: Session, projectId: string): Promise<Task[]> {
  let q = db
    .from("tasks")
    .select("*, assignee:users!tasks_assignee_id_fkey(id,name,specialization)")
    .eq("project_id", projectId);

  if (s.role === "AGENT") q = q.eq("assignee_id", s.userId);

  const { data, error } = await q.order("deadline");
  if (error) throw error;
  return data as unknown as Task[];
}

/**
 * Open one project by id.
 *
 * This is the function that defeats URL-guessing. It does not trust the id —
 * it re-derives the caller's permitted project list and refuses anything
 * outside it. Hiding the link in the UI is not the protection; this is.
 */
export async function getProjectById(s: Session, projectId: string) {
  const allowed = await getProjects(s);
  const project = allowed.find((p) => p.id === projectId);
  if (!project) throw new Error("FORBIDDEN");
  return { ...project, tasks: await getTasks(s, projectId) };
}

/** An agent's cross-project to-do list. */
export async function getMyTasks(s: Session): Promise<Task[]> {
  const { data, error } = await db
    .from("tasks")
    .select("*, project:projects!tasks_project_id_fkey(id,name,client_name), assignee:users!tasks_assignee_id_fkey(id,name,specialization)")
    .eq("assignee_id", s.userId)
    .order("deadline");
  if (error) throw error;
  return data as unknown as Task[];
}

"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { db } from "./supabase";
import { createSession, destroySession } from "./session";
import { requireAdmin, requireSession, listUsers, getProjectById } from "./data";
import { draftFromTranscript, type ValidationIssue } from "./ai";
import type { AiDraft } from "./ai";

/* ------------------------------------------------------------------ */
/* Login                                                               */
/* ------------------------------------------------------------------ */

export type LoginState = { error?: string };

export async function login(_prev: LoginState, form: FormData): Promise<LoginState> {
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const password = String(form.get("password") ?? "");
  if (!email || !password) return { error: "Enter your email and password." };

  const { data: user } = await db
    .from("users")
    .select("id,name,role,password_hash")
    .eq("email", email)
    .maybeSingle();

  // Same message for "no such user" and "wrong password" so the form can't be
  // used to discover which emails exist.
  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    return { error: "Invalid email or password." };
  }

  await createSession({ userId: user.id, role: user.role, name: user.name });
  redirect("/dashboard");
}

export async function logout() {
  await destroySession();
  redirect("/login");
}

/* ------------------------------------------------------------------ */
/* Transcript -> draft -> save                                         */
/* ------------------------------------------------------------------ */

export type AnalyzeState =
  | { status: "idle" }
  | { status: "error"; message: string; issues?: ValidationIssue[] }
  | { status: "ready"; draft: AiDraft; directory: { id: string; name: string }[] };

/**
 * STEP 1 of the AI flow: read the transcript, produce a draft, validate it.
 * Deliberately writes nothing. The admin reviews the result first.
 */
export async function analyzeTranscript(_prev: AnalyzeState, form: FormData): Promise<AnalyzeState> {
  try {
    await requireAdmin();
  } catch {
    return { status: "error", message: "Only the administrator can create projects from a transcript." };
  }

  const transcript = String(form.get("transcript") ?? "").trim();
  if (transcript.length < 40) {
    return { status: "error", message: "Paste the meeting transcript first." };
  }

  const directory = await listUsers();

  let result;
  try {
    result = await draftFromTranscript(transcript, directory);
  } catch (e) {
    return {
      status: "error",
      message: e instanceof Error ? `The AI service failed: ${e.message}` : "The AI service failed.",
    };
  }

  if (!result.draft) {
    return { status: "error", message: "The AI could not produce a usable result.", issues: result.issues };
  }
  if (result.issues.length) {
    return {
      status: "error",
      message: "The AI returned a result, but some details could not be resolved. Nothing was saved.",
      issues: result.issues,
    };
  }

  return {
    status: "ready",
    draft: result.draft,
    directory: directory.map((u) => ({ id: u.id, name: u.name })),
  };
}

/**
 * STEP 2: persist an approved draft.
 *
 * Everything is inserted inside one Postgres function call, so a failure
 * halfway through leaves zero half-created projects — the brief's
 * all-or-nothing requirement.
 */
export async function saveDraft(draftJson: string) {
  await requireAdmin();
  const draft = JSON.parse(draftJson) as AiDraft;

  const { data, error } = await db.rpc("save_ai_draft", { payload: draft });
  if (error) throw new Error(error.message);

  revalidatePath("/dashboard");
  revalidatePath("/projects");
  return data as { projects: number; tasks: number };
}

/* ------------------------------------------------------------------ */
/* Editing                                                             */
/* ------------------------------------------------------------------ */

export async function updateTask(taskId: string, patch: {
  title?: string; description?: string; assignee_id?: string;
  deadline?: string; estimated_hours?: number;
}) {
  const s = await requireSession();
  if (s.role === "AGENT") throw new Error("FORBIDDEN");

  // A manager may only edit tasks inside a project they manage. We prove the
  // task's project is reachable for this session before touching the row.
  const { data: task } = await db.from("tasks").select("project_id").eq("id", taskId).maybeSingle();
  if (!task) throw new Error("NOT_FOUND");
  await getProjectById(s, task.project_id); // throws FORBIDDEN if out of scope

  const { error } = await db.from("tasks").update(patch).eq("id", taskId);
  if (error) throw new Error(error.message);
  revalidatePath(`/projects/${task.project_id}`);
}

export async function updateProject(projectId: string, patch: {
  name?: string; client_name?: string; description?: string; deadline?: string;
}) {
  const s = await requireSession();
  if (s.role === "AGENT") throw new Error("FORBIDDEN");
  await getProjectById(s, projectId);

  const { error } = await db.from("projects").update(patch).eq("id", projectId);
  if (error) throw new Error(error.message);
  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/projects");
}

/** Clears generated work without touching the ten seeded accounts. */
export async function resetGeneratedData() {
  await requireAdmin();
  await db.from("projects").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  revalidatePath("/dashboard");
  revalidatePath("/projects");
}

"use server";

import { randomUUID } from "node:crypto";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { db } from "./supabase";
import { getProjectById, requireAdmin, requireSession } from "./data";
import { memberSchema, projectSchema, taskSchema, teamSchema, validated } from "./management-schema";

export async function createMember(input: unknown) {
  await requireAdmin();
  const member = validated(memberSchema, input);
  const id = `${member.role === "MANAGER" ? "PM" : "DEV"}-${randomUUID()}`;
  const { error } = await db.from("users").insert({
    id, name: member.name, email: member.email, role: member.role,
    password_hash: await bcrypt.hash(member.password, 12),
    specialization: member.specialization || null, skills: [...new Set(member.skills)],
  });
  if (error?.code === "23505") throw new Error("A member with this email already exists.");
  if (error) throw new Error("Could not create the member. Please try again.");
  revalidatePath("/team");
  revalidatePath("/dashboard");
  revalidatePath("/transcript");
  return { id };
}

export async function saveTeam(input: unknown) {
  await requireAdmin();
  const team = validated(teamSchema, input);
  const { data, error } = await db.rpc("save_team", {
    team_id: team.id ?? null, team_name: team.name, team_description: team.description,
    team_manager: team.managerId, members: [...new Set(team.memberIds)],
  });
  if (error?.code === "23505") throw new Error("A team with this name already exists.");
  if (error) throw new Error("Could not save the team. Check its manager and members, then try again.");
  revalidatePath("/team");
  revalidatePath("/projects");
  return { id: data as string };
}

export async function createProject(input: unknown) {
  const session = await requireSession();
  if (session.role === "AGENT") throw new Error("FORBIDDEN");
  const project = validated(projectSchema, input);
  if (session.role === "MANAGER" && project.managerId !== session.userId) throw new Error("FORBIDDEN");
  const { data: manager, error: managerError } = await db.from("users").select("role").eq("id", project.managerId).single();
  if (managerError || manager?.role !== "MANAGER") throw new Error("Select a valid project manager.");
  if (project.teamId) {
    const { data: team, error } = await db.from("teams").select("manager_id").eq("id", project.teamId).single();
    if (error || team?.manager_id !== project.managerId) throw new Error("Select a team managed by this project manager.");
  }
  const { data, error } = await db.from("projects").insert({
    name: project.name, client_name: project.clientName, description: project.description || null,
    manager_id: project.managerId, deadline: project.deadline, team_id: project.teamId,
  }).select("id").single();
  if (error) throw new Error("Could not create the project. Please try again.");
  revalidatePath("/projects"); revalidatePath("/dashboard");
  return { id: data.id as string };
}

export async function createTask(input: unknown) {
  const session = await requireSession();
  if (session.role === "AGENT") throw new Error("FORBIDDEN");
  const task = validated(taskSchema, input);
  const project = await getProjectById(session, task.projectId);
  if (task.deadline > project.deadline) throw new Error("The task deadline must be on or before the project deadline.");
  const { data: assignee, error: assigneeError } = await db.from("users").select("role").eq("id", task.assigneeId).single();
  if (assigneeError || assignee?.role !== "AGENT") throw new Error("Select a valid team member.");
  const { data, error } = await db.from("tasks").insert({
    project_id: project.id, title: task.title, description: task.description || null,
    assignee_id: task.assigneeId, deadline: task.deadline,
    estimated_hours: task.estimatedHours, status: task.status,
    board_position: Math.max(0, ...(project.tasks ?? []).filter((item) => item.status === task.status).map((item) => item.board_position ?? 0)) + 1024,
  }).select("id").single();
  if (error) throw new Error("Could not create the task. Please try again.");
  revalidatePath(`/projects/${project.id}`); revalidatePath("/projects");
  revalidatePath("/dashboard"); revalidatePath("/my-tasks"); revalidatePath("/workload");
  return { id: data.id as string };
}

import test from "node:test";
import assert from "node:assert/strict";
import { memberSchema, projectSchema, taskSchema, teamSchema, validated } from "../lib/management-schema.ts";

const member = {
  name: " New member ",
  email: " MEMBER@example.com ",
  password: "Example123!",
  role: "AGENT",
  specialization: " Frontend Developer ",
  skills: [" React ", " Next.js ", "TypeScript"],
};

test("accounts normalize names, email, and trims skills without allowing admin creation", () => {
  const parsed = memberSchema.parse(member);
  assert.equal(parsed.email, "member@example.com");
  assert.equal(parsed.name, "New member");
  assert.equal(parsed.specialization, "Frontend Developer");
  assert.equal(memberSchema.safeParse({ ...member, role: "ADMIN" }).success, false);
  assert.equal(memberSchema.safeParse({ ...member, email: "invalid-email" }).success, false);
  assert.equal(memberSchema.safeParse({ ...member, name: "   " }).success, false);
});

test("password limits respect bcrypt UTF-8 bytes and minimum length", () => {
  assert.equal(memberSchema.safeParse({ ...member, password: "short" }).success, false);
  assert.equal(memberSchema.safeParse({ ...member, password: "é".repeat(36) }).success, true); // 72 bytes
  assert.equal(memberSchema.safeParse({ ...member, password: "é".repeat(37) }).success, false); // 74 bytes
});

test("team schema enforces valid manager, members, and optional UUID", () => {
  const validTeam = {
    name: "Core Web Team",
    description: "Responsible for client web apps",
    managerId: "PM01",
    memberIds: ["DEV01", "DEV02"],
  };
  assert.equal(teamSchema.safeParse(validTeam).success, true);

  const teamWithUuid = {
    ...validTeam,
    id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
  };
  assert.equal(teamSchema.safeParse(teamWithUuid).success, true);

  // Missing manager or empty name rejected
  assert.equal(teamSchema.safeParse({ ...validTeam, managerId: "" }).success, false);
  assert.equal(teamSchema.safeParse({ ...validTeam, name: "  " }).success, false);
  assert.equal(teamSchema.safeParse({ ...validTeam, id: "invalid-uuid" }).success, false);
});

test("manual projects reject impossible dates and missing owners", () => {
  const project = {
    name: "Project",
    clientName: "Client",
    managerId: "PM-1",
    deadline: "2026-02-28",
    teamId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
  };
  assert.equal(projectSchema.safeParse(project).success, true);
  assert.equal(projectSchema.safeParse({ ...project, teamId: null }).success, true);
  assert.equal(projectSchema.safeParse({ ...project, teamId: "not-a-uuid" }).success, false);
  assert.equal(projectSchema.safeParse({ ...project, deadline: "2026-02-30" }).success, false);
  assert.equal(projectSchema.safeParse({ ...project, managerId: "" }).success, false);
});

test("tasks require UUID project, positive effort and supported board statuses", () => {
  const task = {
    projectId: "e27d7dce-030b-48d5-8761-bd34728e9067",
    title: "Task",
    assigneeId: "DEV-1",
    deadline: "2026-10-20",
    estimatedHours: 2,
  };
  const parsed = taskSchema.parse(task);
  assert.equal(parsed.status, "todo");
  assert.equal(taskSchema.safeParse({ ...task, status: "in_progress" }).success, true);
  assert.equal(taskSchema.safeParse({ ...task, status: "done" }).success, true);
  assert.equal(taskSchema.safeParse({ ...task, status: "archived" }).success, false);

  for (const estimatedHours of [0, -1, Infinity, NaN]) {
    assert.equal(taskSchema.safeParse({ ...task, estimatedHours }).success, false);
  }

  // Project ID must be a UUID
  assert.equal(taskSchema.safeParse({ ...task, projectId: "non-uuid" }).success, false);
});

test("validated helper returns data on success and throws descriptive error on failure", () => {
  const validTask = {
    projectId: "e27d7dce-030b-48d5-8761-bd34728e9067",
    title: "Validated Task",
    assigneeId: "DEV01",
    deadline: "2026-10-20",
    estimatedHours: 4,
  };

  const parsed = validated(taskSchema, validTask);
  assert.equal(parsed.title, "Validated Task");
  assert.equal(parsed.status, "todo");

  assert.throws(
    () => validated(taskSchema, { ...validTask, estimatedHours: -2 }),
    /Estimated hours must be greater than zero/
  );
});

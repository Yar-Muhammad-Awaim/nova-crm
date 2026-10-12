import test from "node:test";
import assert from "node:assert/strict";
import { validateDraft, describeIssue } from "../lib/draft-schema.ts";

const directory = [
  { id: "PM01", name: "Manager One", role: "MANAGER" },
  { id: "PM02", name: "Manager Two", role: "MANAGER" },
  { id: "DEV01", name: "Member One", role: "AGENT" },
  { id: "DEV02", name: "Member Two", role: "AGENT" },
  { id: "ADMIN", name: "System Admin", role: "ADMIN" },
];

const validDraft = {
  projects: [
    {
      name: "  Alpha Project  ",
      clientName: "  Acme Corp  ",
      managerId: "PM01",
      deadline: "2026-10-20",
      tasks: [
        {
          title: "  Setup Core  ",
          assigneeId: "DEV01",
          deadline: "2026-10-19",
          estimatedHours: 4,
        },
      ],
    },
  ],
};

test("valid drafts normalize optional descriptions and trim strings", () => {
  const result = validateDraft(validDraft, directory);
  assert.deepEqual(result.issues, []);
  assert.ok(result.draft);
  assert.equal(result.draft.projects[0].name, "Alpha Project");
  assert.equal(result.draft.projects[0].clientName, "Acme Corp");
  assert.equal(result.draft.projects[0].description, "");
  assert.equal(result.draft.projects[0].tasks[0].title, "Setup Core");
  assert.equal(result.draft.projects[0].tasks[0].description, "");
});

test("task deadline equal to project deadline is valid", () => {
  const draft = structuredClone(validDraft);
  draft.projects[0].tasks[0].deadline = "2026-10-20"; // Exact same day as project deadline
  const result = validateDraft(draft, directory);
  assert.equal(result.issues.length, 0);
  assert.ok(result.draft);
});

test("approval rejects unknown people, swapped roles and tasks after project deadline", () => {
  const invalid = structuredClone(validDraft);
  invalid.projects[0].managerId = "DEV01"; // Swapped role (AGENT as manager)
  invalid.projects[0].tasks[0].assigneeId = "unknown-id"; // Non-existent user
  invalid.projects[0].tasks[0].deadline = "2026-10-21"; // After project deadline (2026-10-20)

  const result = validateDraft(invalid, directory);
  assert.equal(result.issues.length, 3);
  assert.match(describeIssue(result.issues[0]), /Project 1 · manager: Choose a project manager from the directory/);
  assert.match(describeIssue(result.issues[1]), /Project 1, task 1 · member: Choose a member from the directory/);
  assert.match(describeIssue(result.issues[2]), /Project 1, task 1 · deadline: Task deadline must be on or before 2026-10-20/);
});

test("ADMIN cannot be assigned as project manager or task assignee in draft", () => {
  const adminAsManager = structuredClone(validDraft);
  adminAsManager.projects[0].managerId = "ADMIN";
  assert.equal(validateDraft(adminAsManager, directory).issues.length, 1);

  const adminAsAssignee = structuredClone(validDraft);
  adminAsAssignee.projects[0].tasks[0].assigneeId = "ADMIN";
  assert.equal(validateDraft(adminAsAssignee, directory).issues.length, 1);
});

test("manual edits cannot approve empty scope, impossible dates or nonpositive hours", () => {
  for (const patch of [{ title: " " }, { deadline: "2026-02-30" }, { estimatedHours: 0 }, { estimatedHours: -1 }]) {
    const invalid = structuredClone(validDraft);
    Object.assign(invalid.projects[0].tasks[0], patch);
    assert.equal(validateDraft(invalid, directory).draft, null);
  }

  const emptyTasks = structuredClone(validDraft);
  emptyTasks.projects[0].tasks = [];
  assert.equal(validateDraft(emptyTasks, directory).draft, null);

  const emptyProjects = { projects: [] };
  assert.equal(validateDraft(emptyProjects, directory).draft, null);
});

test("describeIssue formats all schema error paths into human readable messages", () => {
  assert.equal(
    describeIssue({ path: "projects.0.name", message: "Enter a name." }),
    "Project 1 · name: Enter a name."
  );
  assert.equal(
    describeIssue({ path: "projects.1.clientName", message: "Enter a client name." }),
    "Project 2 · client: Enter a client name."
  );
  assert.equal(
    describeIssue({ path: "projects.0.tasks.2.estimatedHours", message: "Hours must be greater than zero." }),
    "Project 1, task 3 · hours: Hours must be greater than zero."
  );
  assert.equal(
    describeIssue({ path: "global", message: "Invalid payload." }),
    "Draft: Invalid payload."
  );
});

test("rejects malformed and non-object inputs safely", () => {
  for (const badInput of [null, undefined, 42, "string", true, []]) {
    const result = validateDraft(badInput, directory);
    assert.equal(result.draft, null);
    assert.ok(result.issues.length > 0);
  }
});

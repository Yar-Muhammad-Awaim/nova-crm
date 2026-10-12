import test from "node:test";
import assert from "node:assert/strict";
import { validateDraft, describeIssue } from "../lib/draft-schema.ts";

// Canonical team directory seeded in PostgreSQL
const seededDirectory = [
  { id: "ADMIN", name: "Admin", role: "ADMIN" },
  { id: "PM01", name: "Ayesha Khan", role: "MANAGER" },
  { id: "PM02", name: "Bilal Ahmed", role: "MANAGER" },
  { id: "PM03", name: "Hina Malik", role: "MANAGER" },
  { id: "DEV01", name: "Ali Raza", role: "AGENT" },
  { id: "DEV02", name: "Hamza Shah", role: "AGENT" },
  { id: "DEV03", name: "Sara Noor", role: "AGENT" },
  { id: "DEV04", name: "Usman Tariq", role: "AGENT" },
  { id: "DEV05", name: "Zain Abbas", role: "AGENT" },
  { id: "DEV06", name: "Maryam Asif", role: "AGENT" },
];

// Ground truth draft reflecting accurate extraction of SAMPLE_TRANSCRIPT
const canonicalBenchmarkDraft = {
  projects: [
    {
      name: "UrbanCart Website",
      clientName: "UrbanCart Clothing",
      description: "Responsive website with product catalog and demo cart. Real payments and stock integration are excluded.",
      managerId: "PM01",
      deadline: "2026-10-20", // Revised from 18 Oct during meeting
      tasks: [
        {
          title: "Product catalog UI",
          description: "Product listing, detail screen, responsive layout.",
          assigneeId: "DEV01",
          deadline: "2026-10-12",
          estimatedHours: 12,
        },
        {
          title: "Demo cart UI",
          description: "Cart items, quantities, and visible total. Demo only.",
          assigneeId: "DEV01",
          deadline: "2026-10-15",
          estimatedHours: 8,
        },
        {
          title: "Product and cart APIs",
          description: "Endpoints for product data and demo cart.",
          assigneeId: "DEV02",
          deadline: "2026-10-14",
          estimatedHours: 14,
        },
        {
          title: "Website integration and testing",
          description: "Connect screens and verify demo shopping flow.",
          assigneeId: "DEV01",
          deadline: "2026-10-19", // Revised from 17 Oct
          estimatedHours: 6,
        },
      ],
    },
    {
      name: "QuickServe Mobile App",
      clientName: "QuickServe Services",
      description: "Customer mobile app for service booking and status. Excludes live maps, tracking, and payments.",
      managerId: "PM02",
      deadline: "2026-10-24",
      tasks: [
        {
          title: "Login and profile screens",
          description: "Customer authentication and profile interface.",
          assigneeId: "DEV03",
          deadline: "2026-10-12",
          estimatedHours: 8,
        },
        {
          title: "Service booking screens",
          description: "Select service, enter details, view confirmation.",
          assigneeId: "DEV03",
          deadline: "2026-10-17",
          estimatedHours: 12,
        },
        {
          title: "Booking and account APIs",
          description: "Endpoints for account handling, booking, and status.",
          assigneeId: "DEV02",
          deadline: "2026-10-16",
          estimatedHours: 16,
        },
        {
          title: "Mobile integration and testing",
          description: "Status screen, error states, and end-to-end booking flow.",
          assigneeId: "DEV04",
          deadline: "2026-10-22",
          estimatedHours: 10, // Revised from 8 hours
        },
      ],
    },
    {
      name: "HelpDeskPro AI Support Assistant",
      clientName: "HelpDeskPro Systems",
      description: "AI-driven customer support assistant for automated ticket classification and responses.",
      managerId: "PM03",
      deadline: "2026-10-28",
      tasks: [
        {
          title: "Knowledge base retrieval pipeline",
          description: "Document ingestion, embeddings, and vector lookup.",
          assigneeId: "DEV06",
          deadline: "2026-10-21",
          estimatedHours: 18,
        },
        {
          title: "Prompt engineering and classification",
          description: "Intent classification and structured response formatting.",
          assigneeId: "DEV05",
          deadline: "2026-10-24",
          estimatedHours: 14,
        },
      ],
    },
  ],
};

test("Canonical meeting transcript draft passes enterprise validation cleanly", () => {
  const result = validateDraft(canonicalBenchmarkDraft, seededDirectory);
  assert.equal(result.issues.length, 0);
  assert.ok(result.draft);
  assert.equal(result.draft.projects.length, 3);
  assert.equal(result.draft.projects[0].tasks.length, 4);
  assert.equal(result.draft.projects[1].tasks.length, 4);
  assert.equal(result.draft.projects[2].tasks.length, 2);
});

test("Edge Case: Unrevised superseded project deadline triggers validation failure", () => {
  // If the extraction retained the superseded 18 Oct deadline instead of 20 Oct,
  // the integration task (due 19 Oct) would violate the project deadline constraint.
  const staleDraft = structuredClone(canonicalBenchmarkDraft);
  staleDraft.projects[0].deadline = "2026-10-18"; // Superseded initial date
  // Task 4 deadline is 2026-10-19 > 2026-10-18

  const result = validateDraft(staleDraft, seededDirectory);
  assert.equal(result.issues.length, 1);
  assert.match(describeIssue(result.issues[0]), /Task deadline must be on or before 2026-10-18/);
});

test("Edge Case: Role inversion (manager assigned as task worker or developer as manager) is rejected", () => {
  const invertedDraft = structuredClone(canonicalBenchmarkDraft);
  // Assign developer Ali Raza (DEV01) as project manager
  invertedDraft.projects[0].managerId = "DEV01";
  // Assign project manager Ayesha Khan (PM01) as task assignee
  invertedDraft.projects[0].tasks[0].assigneeId = "PM01";

  const result = validateDraft(invertedDraft, seededDirectory);
  assert.equal(result.issues.length, 2);
  assert.ok(result.issues.some(i => i.path === "projects.0.managerId" && i.message.includes("project manager")));
  assert.ok(result.issues.some(i => i.path === "projects.0.tasks.0.assigneeId" && i.message.includes("member")));
});

test("Edge Case: Outsider mentioned in transcript not in directory is rejected", () => {
  const hallucinatedDraft = structuredClone(canonicalBenchmarkDraft);
  // "David" is a client contact mentioned in conversation, not in seeded directory
  hallucinatedDraft.projects[0].tasks[1].assigneeId = "DAVID_CLIENT";

  const result = validateDraft(hallucinatedDraft, seededDirectory);
  assert.equal(result.issues.length, 1);
  assert.equal(result.issues[0].path, "projects.0.tasks.1.assigneeId");
  assert.match(describeIssue(result.issues[0]), /Choose a member from the directory/);
});

test("Edge Case: Impossible leap years or invalid ISO date formats are caught by Zod", () => {
  const invalidDateDraft = structuredClone(canonicalBenchmarkDraft);
  invalidDateDraft.projects[0].deadline = "2026-02-29"; // 2026 is not a leap year

  const result = validateDraft(invalidDateDraft, seededDirectory);
  assert.equal(result.draft, null);
  assert.ok(result.issues.length > 0);
  assert.match(result.issues[0].message, /valid project deadline/i);
});

test("Edge Case: Zero or negative task estimates are rejected", () => {
  for (const invalidHours of [0, -5, -0.5]) {
    const badHoursDraft = structuredClone(canonicalBenchmarkDraft);
    badHoursDraft.projects[0].tasks[0].estimatedHours = invalidHours;

    const result = validateDraft(badHoursDraft, seededDirectory);
    assert.equal(result.draft, null);
    assert.ok(result.issues.length > 0);
    assert.match(result.issues[0].message, /greater than zero/i);
  }
});

test("Edge Case: Empty projects or empty tasks list rejected", () => {
  const noProjects = { projects: [] };
  assert.equal(validateDraft(noProjects, seededDirectory).draft, null);

  const noTasks = structuredClone(canonicalBenchmarkDraft);
  noTasks.projects[0].tasks = [];
  assert.equal(validateDraft(noTasks, seededDirectory).draft, null);
});

import test from "node:test";
import assert from "node:assert/strict";

/**
 * Pure authorization and RBAC query scoping simulator.
 * Mirrors the exact logic executed by lib/data.ts, lib/actions.ts, and lib/management-actions.ts.
 */
class AccessControlEngine {
  constructor(users, projects, tasks) {
    this.users = users;
    this.projects = projects;
    this.tasks = tasks;
  }

  requireSession(session) {
    if (!session || !session.userId || !session.role) {
      throw new Error("UNAUTHENTICATED");
    }
    return session;
  }

  requireAdmin(session) {
    this.requireSession(session);
    if (session.role !== "ADMIN") {
      throw new Error("FORBIDDEN");
    }
    return session;
  }

  /**
   * Scopes projects query by role:
   * - ADMIN: returns all projects
   * - MANAGER: returns projects where manager_id === userId
   * - AGENT: returns distinct projects where at least one task is assigned to userId
   */
  getProjects(session) {
    this.requireSession(session);
    if (session.role === "ADMIN") {
      return this.projects;
    }
    if (session.role === "MANAGER") {
      return this.projects.filter(p => p.manager_id === session.userId);
    }
    if (session.role === "AGENT") {
      const myProjectIds = new Set(
        this.tasks.filter(t => t.assignee_id === session.userId).map(t => t.project_id)
      );
      return this.projects.filter(p => myProjectIds.has(p.id));
    }
    return [];
  }

  /**
   * Scopes tasks within a project:
   * - ADMIN & MANAGER: see all tasks in the project
   * - AGENT: sees ONLY their own assigned tasks
   */
  getTasks(session, projectId) {
    this.requireSession(session);
    const project = this.getProjectById(session, projectId);
    let tasks = this.tasks.filter(t => t.project_id === project.id);
    if (session.role === "AGENT") {
      tasks = tasks.filter(t => t.assignee_id === session.userId);
    }
    return tasks;
  }

  /**
   * Re-derives permitted project list to defeat URL-guessing / IDOR attacks.
   */
  getProjectById(session, projectId) {
    const allowed = this.getProjects(session);
    const found = allowed.find(p => p.id === projectId);
    if (!found) {
      throw new Error("FORBIDDEN");
    }
    return found;
  }

  /**
   * AGENT cannot move tasks on the board.
   */
  moveTask(session, { taskId, projectId }) {
    this.requireSession(session);
    if (session.role === "AGENT") throw new Error("FORBIDDEN");
    const project = this.getProjectById(session, projectId);
    const task = this.tasks.find(t => t.id === taskId && t.project_id === project.id);
    if (!task) throw new Error("NOT_FOUND");
    return true;
  }

  /**
   * Managers can only create projects if managerId equals their own userId.
   * Agents are forbidden from creating projects.
   */
  createProject(session, projectInput) {
    this.requireSession(session);
    if (session.role === "AGENT") throw new Error("FORBIDDEN");
    if (session.role === "MANAGER" && projectInput.managerId !== session.userId) {
      throw new Error("FORBIDDEN");
    }
    return { id: "new-proj-uuid", ...projectInput };
  }

  /**
   * Agents are forbidden from creating tasks.
   */
  createTask(session, taskInput) {
    this.requireSession(session);
    if (session.role === "AGENT") throw new Error("FORBIDDEN");
    const project = this.getProjectById(session, taskInput.projectId);
    return { id: "new-task-uuid", projectId: project.id, ...taskInput };
  }
}

// Sample test dataset
const mockUsers = [
  { id: "ADMIN", name: "Admin", role: "ADMIN" },
  { id: "PM01", name: "Ayesha Khan", role: "MANAGER" },
  { id: "PM02", name: "Bilal Ahmed", role: "MANAGER" },
  { id: "DEV01", name: "Ali Raza", role: "AGENT" },
  { id: "DEV02", name: "Hamza Shah", role: "AGENT" },
  { id: "DEV03", name: "Sara Noor", role: "AGENT" },
];

const mockProjects = [
  { id: "proj-web", name: "UrbanCart Website", manager_id: "PM01" },
  { id: "proj-mobile", name: "QuickServe App", manager_id: "PM02" },
];

const mockTasks = [
  { id: "task-1", project_id: "proj-web", title: "Product Catalog UI", assignee_id: "DEV01" },
  { id: "task-2", project_id: "proj-web", title: "Demo Cart UI", assignee_id: "DEV01" },
  { id: "task-3", project_id: "proj-web", title: "API Endpoints", assignee_id: "DEV02" },
  { id: "task-4", project_id: "proj-mobile", title: "Mobile UI", assignee_id: "DEV03" },
];

const engine = new AccessControlEngine(mockUsers, mockProjects, mockTasks);

test("Unauthenticated requests are strictly rejected", () => {
  assert.throws(() => engine.requireSession(null), /UNAUTHENTICATED/);
  assert.throws(() => engine.requireSession({}), /UNAUTHENTICATED/);
  assert.throws(() => engine.getProjects(null), /UNAUTHENTICATED/);
});

test("ADMIN role has unrestricted global project visibility", () => {
  const adminSession = { userId: "ADMIN", role: "ADMIN", name: "Admin" };
  const projects = engine.getProjects(adminSession);
  assert.equal(projects.length, 2);
  assert.ok(projects.some(p => p.id === "proj-web"));
  assert.ok(projects.some(p => p.id === "proj-mobile"));
});

test("MANAGER role only sees projects where they are the designated manager", () => {
  const pm1Session = { userId: "PM01", role: "MANAGER", name: "Ayesha Khan" };
  const pm2Session = { userId: "PM02", role: "MANAGER", name: "Bilal Ahmed" };

  const pm1Projects = engine.getProjects(pm1Session);
  assert.equal(pm1Projects.length, 1);
  assert.equal(pm1Projects[0].id, "proj-web");

  const pm2Projects = engine.getProjects(pm2Session);
  assert.equal(pm2Projects.length, 1);
  assert.equal(pm2Projects[0].id, "proj-mobile");

  // Attempting to access other manager's project throws FORBIDDEN
  assert.throws(() => engine.getProjectById(pm1Session, "proj-mobile"), /FORBIDDEN/);
  assert.throws(() => engine.getProjectById(pm2Session, "proj-web"), /FORBIDDEN/);
});

test("AGENT role only sees projects containing tasks assigned to them", () => {
  const dev1Session = { userId: "DEV01", role: "AGENT", name: "Ali Raza" }; // Assigned in proj-web
  const dev3Session = { userId: "DEV03", role: "AGENT", name: "Sara Noor" }; // Assigned in proj-mobile
  const unassignedDevSession = { userId: "DEV99", role: "AGENT", name: "Unassigned Dev" };

  const dev1Projects = engine.getProjects(dev1Session);
  assert.equal(dev1Projects.length, 1);
  assert.equal(dev1Projects[0].id, "proj-web");

  const dev3Projects = engine.getProjects(dev3Session);
  assert.equal(dev3Projects.length, 1);
  assert.equal(dev3Projects[0].id, "proj-mobile");

  // DEV01 cannot access proj-mobile via direct ID lookup
  assert.throws(() => engine.getProjectById(dev1Session, "proj-mobile"), /FORBIDDEN/);

  // Unassigned developer sees 0 projects
  assert.equal(engine.getProjects(unassignedDevSession).length, 0);
  assert.throws(() => engine.getProjectById(unassignedDevSession, "proj-web"), /FORBIDDEN/);
});

test("AGENT role sees ONLY their own tasks in a project, never teammates' tasks", () => {
  const dev1Session = { userId: "DEV01", role: "AGENT", name: "Ali Raza" };
  const dev2Session = { userId: "DEV02", role: "AGENT", name: "Hamza Shah" };
  const pm1Session = { userId: "PM01", role: "MANAGER", name: "Ayesha Khan" };

  // Manager sees all 3 tasks in proj-web
  const managerTasks = engine.getTasks(pm1Session, "proj-web");
  assert.equal(managerTasks.length, 3);

  // DEV01 sees only their 2 tasks (task-1, task-2), NOT task-3 owned by DEV02
  const dev1Tasks = engine.getTasks(dev1Session, "proj-web");
  assert.equal(dev1Tasks.length, 2);
  assert.ok(dev1Tasks.every(t => t.assignee_id === "DEV01"));
  assert.equal(dev1Tasks.some(t => t.id === "task-3"), false);

  // DEV02 sees only task-3
  const dev2Tasks = engine.getTasks(dev2Session, "proj-web");
  assert.equal(dev2Tasks.length, 1);
  assert.equal(dev2Tasks[0].id, "task-3");
});

test("AGENT role is forbidden from mutative actions (create project, task, board move)", () => {
  const devSession = { userId: "DEV01", role: "AGENT", name: "Ali Raza" };

  assert.throws(
    () => engine.createProject(devSession, { name: "Rogue", managerId: "PM01" }),
    /FORBIDDEN/
  );
  assert.throws(
    () => engine.createTask(devSession, { projectId: "proj-web", title: "Rogue Task" }),
    /FORBIDDEN/
  );
  assert.throws(
    () => engine.moveTask(devSession, { taskId: "task-1", projectId: "proj-web" }),
    /FORBIDDEN/
  );
});

test("MANAGER cannot create projects for other managers", () => {
  const pm1Session = { userId: "PM01", role: "MANAGER", name: "Ayesha Khan" };

  // Allowed: creating project for self
  const okProject = engine.createProject(pm1Session, { name: "Valid", managerId: "PM01" });
  assert.equal(okProject.managerId, "PM01");

  // Forbidden: trying to create project assigned to PM02
  assert.throws(
    () => engine.createProject(pm1Session, { name: "Spoofed", managerId: "PM02" }),
    /FORBIDDEN/
  );
});

test("Admin-only operations strictly reject non-admin roles", () => {
  const pmSession = { userId: "PM01", role: "MANAGER", name: "Ayesha Khan" };
  const devSession = { userId: "DEV01", role: "AGENT", name: "Ali Raza" };
  const adminSession = { userId: "ADMIN", role: "ADMIN", name: "Admin" };

  assert.doesNotThrow(() => engine.requireAdmin(adminSession));
  assert.throws(() => engine.requireAdmin(pmSession), /FORBIDDEN/);
  assert.throws(() => engine.requireAdmin(devSession), /FORBIDDEN/);
});

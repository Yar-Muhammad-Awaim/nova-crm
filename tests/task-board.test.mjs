import assert from "node:assert/strict";
import test from "node:test";
import { TASK_COLUMNS, columnTasks, positionBefore, taskStatus } from "../lib/task-board.ts";

const task = (id, status = "todo", board_position = 0, deadline = "2026-10-12") => ({
  id,
  project_id: "project-1",
  title: `Task ${id}`,
  description: null,
  assignee_id: "DEV01",
  deadline,
  estimated_hours: 1,
  status,
  board_position,
});

test("TASK_COLUMNS declares three canonical workflow stages", () => {
  assert.equal(TASK_COLUMNS.length, 3);
  assert.deepEqual(
    TASK_COLUMNS.map((col) => col.id),
    ["todo", "in_progress", "done"]
  );
  assert.equal(TASK_COLUMNS[0].label, "To do");
  assert.equal(TASK_COLUMNS[1].label, "In progress");
  assert.equal(TASK_COLUMNS[2].label, "Done");
});

test("existing tasks without board fields start in To do", () => {
  assert.equal(taskStatus({ ...task("a"), status: undefined }), "todo");
});

test("column order is stable for existing equal positions and tie-breaks by deadline then id", () => {
  const tasks = [
    task("b", "todo", 0, "2026-10-12"),
    task("done", "done", 0, "2026-10-12"),
    task("a", "todo", 0, "2026-10-12"),
    task("early", "todo", 0, "2026-10-10"),
  ];

  // "early" has earliest deadline; "a" and "b" tie on deadline so sorted alphabetically by id
  assert.deepEqual(columnTasks(tasks, "todo").map(t => t.id), ["early", "a", "b"]);
  // Original array remains unmutated
  assert.deepEqual(tasks.map(t => t.id), ["b", "done", "a", "early"]);
});

test("moving between columns and inserting before a card preserves requested order", () => {
  const tasks = [task("a", "todo", 1024), task("b", "todo", 2048), task("moved", "done", 1024)];
  const position = positionBefore(tasks, "todo", "moved", "b");
  const after = tasks.map(t => t.id === "moved" ? { ...t, status: "todo", board_position: position } : t);
  assert.deepEqual(columnTasks(after, "todo").map(t => t.id), ["a", "moved", "b"]);
  assert.equal(columnTasks(after, "done").length, 0);
});

test("reordering an existing card excludes its previous position", () => {
  const tasks = [task("a", "todo", 1024), task("b", "todo", 2048)];
  assert.ok(positionBefore(tasks, "todo", "b", "a") < 1024);
  assert.ok(positionBefore(tasks, "todo", "a", null) > 2048);
  assert.equal(positionBefore(tasks, "done", "a", null), 1024);
});

test("inserting between two cards calculates exact fractional midpoint", () => {
  const tasks = [task("first", "todo", 1000), task("last", "todo", 2000)];
  const midPos = positionBefore(tasks, "todo", "new-card", "last");
  assert.equal(midPos, 1500);
});

test("stale or cross-column drop targets are rejected", () => {
  assert.throws(() => positionBefore([task("other", "done")], "todo", "a", "other"), /no longer on this board/);
  assert.throws(() => positionBefore([], "todo", "a", "missing-task"), /no longer on this board/);
});

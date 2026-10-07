import type { Task, TaskStatus } from "./types";

export const TASK_COLUMNS = [
  { id: "todo", label: "To do", color: "text-muted-foreground", background: "bg-muted" },
  { id: "in_progress", label: "In progress", color: "text-primary", background: "bg-primary/10" },
  { id: "done", label: "Done", color: "text-success", background: "bg-success/10" },
] as const;

export function taskStatus(task: Task): TaskStatus {
  return task.status ?? "todo";
}

export function columnTasks(tasks: Task[], status: TaskStatus) {
  return tasks.filter((task) => taskStatus(task) === status).sort((a, b) =>
    (a.board_position ?? 0) - (b.board_position ?? 0)
    || a.deadline.localeCompare(b.deadline)
    || a.id.localeCompare(b.id)
  );
}

/** Only the moved card needs an update; existing cards keep their positions. */
export function positionBefore(tasks: Task[], status: TaskStatus, taskId: string, beforeId: string | null) {
  const column = columnTasks(tasks, status).filter((task) => task.id !== taskId);
  const index = beforeId ? column.findIndex((task) => task.id === beforeId) : column.length;
  if (index < 0) throw new Error("The destination task is no longer on this board.");
  const previous = column[index - 1]?.board_position;
  const next = column[index]?.board_position;
  if (previous == null && next == null) return 1024;
  if (previous == null) return next! - 1024;
  if (next == null) return previous + 1024;
  return previous + (next - previous) / 2;
}

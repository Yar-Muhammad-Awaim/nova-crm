"use client";

import { useEffect, useOptimistic, useRef, useState, useTransition } from "react";
import { Check, ChevronDown, Circle, CircleCheck, Clock3, GripVertical, LayoutGrid, List, Loader2, Search, X } from "lucide-react";
import { toast } from "sonner";
import { moveTask } from "@/lib/actions";
import { columnTasks, positionBefore, TASK_COLUMNS, taskStatus } from "@/lib/task-board";
import type { Task, TaskStatus, User } from "@/lib/types";
import { formatDate, initials } from "@/lib/ui";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EditTaskDialog, TaskList } from "@/components/task-list";
import { TaskDialog } from "@/components/create-dialogs";

type Move = { taskId: string; status: TaskStatus; beforeId: string | null };
const statusIcons = { todo: Circle, in_progress: Clock3, done: CircleCheck };

export function ProjectBoard({ projectId, deadline, tasks, editable, agents }: {
  projectId: string; deadline: string; tasks: Task[]; editable: boolean;
  agents: Pick<User, "id" | "name" | "specialization">[];
}) {
  const [view, setView] = useState<"board" | "list">("board");
  const [query, setQuery] = useState("");
  const [assignee, setAssignee] = useState("all");
  const [editing, setEditing] = useState<Task | null>(null);
  const [dragging, setDragging] = useState<string | null>(null);
  const activeDrag = useRef<string | null>(null);
  const suppressDragClick = useRef(false);
  const [destination, setDestination] = useState<{ status: TaskStatus; beforeId: string | null } | null>(null);
  const [pending, startTransition] = useTransition();
  const [announcement, setAnnouncement] = useState("");
  const [optimisticTasks, applyMove] = useOptimistic(tasks, (current, move: Move) => {
    const target = columnTasks(current, move.status).filter((task) => task.id !== move.taskId);
    const positions = new Map(target.map((task, i) => [task.id, (i + 1) * 1024]));
    const spaced = current.map((task) => positions.has(task.id)
      ? { ...task, board_position: positions.get(task.id)! } : task);
    const position = positionBefore(spaced, move.status, move.taskId, move.beforeId);
    return spaced.map((task) => task.id === move.taskId
      ? { ...task, status: move.status, board_position: position } : task);
  });
  const ready = tasks.every((task) => task.status !== undefined && task.board_position !== undefined);
  const canMove = editable && ready && !pending;
  const visible = (task: Task) => (assignee === "all" || task.assignee_id === assignee)
    && `${task.title} ${task.description ?? ""} ${task.assignee?.name ?? ""}`.toLowerCase().includes(query.trim().toLowerCase());
  const shown = optimisticTasks.filter(visible);
  const owners = agents.filter((agent) => tasks.some((task) => task.assignee_id === agent.id));
  const completed = optimisticTasks.filter((task) => taskStatus(task) === "done").length;

  function move(taskId: string, status: TaskStatus, beforeId: string | null = null) {
    activeDrag.current = null;
    setDragging(null);
    setDestination(null);
    if (!canMove || taskId === beforeId) return;
    const task = optimisticTasks.find((item) => item.id === taskId);
    if (!task) return;
    startTransition(async () => {
      applyMove({ taskId, status, beforeId });
      try {
        await moveTask({ projectId, taskId, status, beforeId });
        const message = `${task.title} moved to ${TASK_COLUMNS.find((column) => column.id === status)!.label}`;
        setAnnouncement(message);
        toast.success(message);
      } catch {
        setAnnouncement("The task could not be moved. Its previous position has been restored.");
        toast.error("Could not move the task. Your previous position has been restored.");
      }
    });
  }

  return (
    <section aria-label="Project tasks" className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-2">
        <div className="flex items-center gap-1" role="group" aria-label="Task view">
          <Button variant={view === "board" ? "secondary" : "ghost"} size="sm" aria-pressed={view === "board"} onClick={() => setView("board")}><LayoutGrid className="size-4" /> Board</Button>
          <Button variant={view === "list" ? "secondary" : "ghost"} size="sm" aria-pressed={view === "list"} onClick={() => setView("list")}><List className="size-4" /> List</Button>
          <span className="ml-3 text-xs text-muted-foreground tabular-nums">{tasks.length} tasks</span>
        </div>
        <div className="flex items-center gap-3"><span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          {pending ? <><Loader2 className="size-3.5 animate-spin" /> Saving move…</> : <><Check className="size-3.5" /> {completed} of {tasks.length} complete</>}
        </span>{editable && <TaskDialog projectId={projectId} deadline={deadline} agents={agents} />}</div>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-full sm:max-w-72">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input aria-label="Search tasks" placeholder="Search tasks…" value={query} onChange={(event) => setQuery(event.target.value)} className="pl-8" />
        </div>
        {owners.length > 1 && <select aria-label="Filter by assignee" value={assignee} onChange={(event) => setAssignee(event.target.value)} className="h-8 rounded-lg border border-input bg-background px-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <option value="all">All assignees</option>
          {owners.map((owner) => <option key={owner.id} value={owner.id}>{owner.name}</option>)}
        </select>}
        {(query || assignee !== "all") && <Button variant="ghost" size="sm" onClick={() => { setQuery(""); setAssignee("all"); }}><X className="size-3.5" /> Clear</Button>}
        <p className="ml-auto text-xs text-muted-foreground">{editable ? "Drag cards to move them, or choose a status." : "Your assigned tasks, organized by status."}</p>
      </div>
      {!ready && editable && <p role="status" className="rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-xs text-muted-foreground">Your board is being set up. You can still open and edit tasks.</p>}
      <p className="sr-only" role="status" aria-live="polite">{announcement}</p>
      {view === "list" ? (
        shown.length ? <TaskList tasks={shown} editable={editable} agents={agents} /> : <p className="py-12 text-center text-sm text-muted-foreground">No tasks match your filters.</p>
      ) : (
        <div className="grid items-stretch gap-5 md:grid-cols-3">
          {TASK_COLUMNS.map((column) => {
            const all = columnTasks(optimisticTasks, column.id);
            const cards = all.filter(visible);
            const StatusIcon = statusIcons[column.id];
            const overColumn = destination?.status === column.id;
            return (
              <section key={column.id} aria-label={`${column.label} column`} data-board-column={column.id}
                onDragOver={(event) => {
                  if (!activeDrag.current || !canMove) return;
                  event.preventDefault(); event.dataTransfer.dropEffect = "move";
                  setDestination({ status: column.id, beforeId: null });
                }}
                onDrop={(event) => {
                  event.preventDefault();
                  const taskId = activeDrag.current;
                  if (!taskId || !canMove) return;
                  // Resolve the actual release point instead of a queued dragover state.
                  const card = (event.target as Element).closest<HTMLElement>("[data-task-id]");
                  let beforeId: string | null = null;
                  if (card) {
                    const rect = card.getBoundingClientRect();
                    const index = all.findIndex((task) => task.id === card.dataset.taskId);
                    beforeId = event.clientY > rect.top + rect.height / 2
                      ? all[index + 1]?.id ?? null : card.dataset.taskId ?? null;
                  }
                  move(taskId, column.id, beforeId);
                }}
                className={cn("flex min-w-0 flex-col rounded-xl border border-transparent bg-muted/35 p-3 transition-colors", overColumn && "border-primary/30 bg-primary/5")}>
                <div className="mb-4 flex items-center justify-between gap-2 px-1">
                  <div className="flex items-center gap-2">
                    <span className={cn("inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium", column.background, column.color)}><StatusIcon className="size-3.5" /> {column.label}</span>
                    <span className="text-xs text-muted-foreground tabular-nums">{cards.length}</span>
                  </div>
                  <span className="text-xs text-muted-foreground tabular-nums">{cards.reduce((total, task) => total + Number(task.estimated_hours), 0)}h</span>
                </div>
                <div className="min-h-40 flex-1 space-y-2.5 md:min-h-72">
                  {cards.map((task) => (
                    <article key={task.id} data-task-id={task.id} draggable={canMove}
                      onPointerDownCapture={() => { suppressDragClick.current = false; }}
                      onClickCapture={(event) => {
                        if (suppressDragClick.current && event.detail !== 0) {
                          event.preventDefault(); event.stopPropagation();
                          suppressDragClick.current = false;
                        }
                      }}
                      onDragStart={(event) => {
                        if (!canMove) { event.preventDefault(); return; }
                        activeDrag.current = task.id;
                        suppressDragClick.current = true;
                        event.dataTransfer.effectAllowed = "move";
                        event.dataTransfer.setData("text/plain", task.id);
                        const rect = event.currentTarget.getBoundingClientRect();
                        event.dataTransfer.setDragImage(event.currentTarget, event.clientX - rect.left, event.clientY - rect.top);
                        event.currentTarget.querySelectorAll("details[open]").forEach((menu) => menu.removeAttribute("open"));
                        setDragging(task.id);
                      }}
                      onDragEnd={() => { activeDrag.current = null; setDragging(null); setDestination(null); }}
                      onDragOver={(event) => {
                        if (!activeDrag.current || !canMove) return;
                        event.preventDefault(); event.stopPropagation();
                        const rect = event.currentTarget.getBoundingClientRect();
                        const below = event.clientY > rect.top + rect.height / 2;
                        const index = all.findIndex((item) => item.id === task.id);
                        setDestination({ status: column.id, beforeId: below ? all[index + 1]?.id ?? null : task.id });
                      }}
                      className={cn("group relative rounded-lg border border-border/75 bg-card p-3.5 shadow-xs transition-[border-color,box-shadow,opacity] hover:border-border hover:shadow-sm", canMove && "cursor-grab select-none active:cursor-grabbing", dragging === task.id && "opacity-40", overColumn && destination.beforeId === task.id && "border-t-primary ring-1 ring-primary/30")}>
                      <div className="flex items-start gap-2">
                        <GripVertical aria-hidden="true" className={cn("mt-0.5 size-3.5 shrink-0 text-muted-foreground/40", !editable && "hidden")} />
                        {editable ? <button type="button" onClick={() => setEditing(task)} className="min-w-0 flex-1 rounded-sm text-left text-sm font-medium leading-relaxed outline-none hover:text-primary focus-visible:ring-2 focus-visible:ring-ring" aria-label={`Edit ${task.title}`}>{task.title}</button> : <h3 className="text-sm font-medium leading-relaxed">{task.title}</h3>}
                      </div>
                      {task.description && <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{task.description}</p>}
                      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1.5" title={task.assignee?.name}><span className="grid size-5 place-items-center rounded-full bg-secondary text-xs font-medium text-foreground">{initials(task.assignee?.name ?? "?")}</span>{task.assignee?.name?.split(" ")[0] ?? "Unassigned"}</span>
                        <span className="ml-auto tabular-nums">{formatDate(task.deadline)}</span>
                        <span className="rounded border px-1.5 py-0.5 tabular-nums">{Number(task.estimated_hours)}h</span>
                      </div>
                      {editable && <div className="mt-3 border-t border-border/60 pt-2.5">
                        <TaskStatusMenu task={task} disabled={!canMove} onChange={(status) => move(task.id, status)} />
                      </div>}
                    </article>
                  ))}
                  {cards.length === 0 && <div className={cn("flex min-h-32 items-center justify-center rounded-lg border border-dashed p-5 text-center text-xs text-muted-foreground", overColumn && "border-primary/50 text-primary")}>{query || assignee !== "all" ? "No matching tasks" : editable ? "Drop a task here" : "No tasks yet"}</div>}
                  {overColumn && destination.beforeId === null && cards.length > 0 && <div className="h-1 rounded-full bg-primary/50" />}
                </div>
              </section>
            );
          })}
        </div>
      )}
      {editing && <EditTaskDialog key={editing.id} task={editing} agents={agents} onClose={() => setEditing(null)} />}
    </section>
  );
}

/** A click opens choices; dragging the closed summary still drags its card. */
function TaskStatusMenu({ task, disabled, onChange }: {
  task: Task; disabled: boolean; onChange: (status: TaskStatus) => void;
}) {
  const menu = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    function dismiss(event: PointerEvent) {
      if (menu.current?.open && !menu.current.contains(event.target as Node)) menu.current.open = false;
    }
    function escape(event: KeyboardEvent) {
      if (event.key === "Escape" && menu.current?.open) {
        menu.current.open = false;
        menu.current.querySelector("summary")?.focus();
      }
    }
    document.addEventListener("pointerdown", dismiss);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", dismiss);
      document.removeEventListener("keydown", escape);
    };
  }, []);

  return (
    <details ref={menu} className="relative">
      <summary aria-label={`Status for ${task.title}`} aria-disabled={disabled}
        onClick={(event) => { if (disabled) event.preventDefault(); }}
        className={cn("flex cursor-pointer list-none items-center justify-between rounded-md py-1 text-xs text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-details-marker]:hidden", disabled && "cursor-wait opacity-60")}>
        {TASK_COLUMNS.find((column) => column.id === taskStatus(task))?.label}
        <ChevronDown className="size-3.5" aria-hidden="true" />
      </summary>
      <div role="group" aria-label={`Move ${task.title} to`} className="absolute inset-x-0 top-full z-20 mt-1 rounded-lg border bg-popover p-1 text-popover-foreground shadow-md">
        {TASK_COLUMNS.map((column) => (
          <button key={column.id} type="button" disabled={disabled} aria-pressed={taskStatus(task) === column.id}
            className="flex w-full items-center justify-between rounded-md px-2 py-2 text-left text-xs outline-none hover:bg-accent focus-visible:bg-accent"
            onClick={() => {
              if (menu.current) { menu.current.open = false; menu.current.querySelector("summary")?.focus(); }
              if (taskStatus(task) !== column.id) onChange(column.id);
            }}>
            {column.label}
            {taskStatus(task) === column.id && <Check className="size-3.5" aria-hidden="true" />}
          </button>
        ))}
      </div>
    </details>
  );
}

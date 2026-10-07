import { requireSession, getProjects, getTasks, listUsers } from "@/lib/data";
import { taskStatus } from "@/lib/task-board";
import type { Task, TaskStatus } from "@/lib/types";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { WorkloadDeadlineChart } from "@/components/workload-deadline-chart";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { initials } from "@/lib/ui";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

const stages = [
  { id: "todo", label: "To do", color: "bg-muted-foreground/60" },
  { id: "in_progress", label: "In progress", color: "bg-primary" },
  { id: "done", label: "Done", color: "bg-success" },
] as const;

type HoursByStage = Record<TaskStatus, number>;

function sumHours(tasks: Task[]): HoursByStage {
  return tasks.reduce<HoursByStage>((hours, task) => {
    hours[taskStatus(task)] += Number(task.estimated_hours);
    return hours;
  }, { todo: 0, in_progress: 0, done: 0 });
}

function hoursLabel(hours: number) {
  return `${hours.toLocaleString("en-US", { maximumFractionDigits: 2 })}h`;
}

/** Summarise visible task estimates by developer and board status. */
export default async function WorkloadPage() {
  const session = await requireSession();
  if (session.role === "AGENT") redirect("/my-tasks");

  const projects = await getProjects(session);
  const [perProject, users] = await Promise.all([
    Promise.all(projects.map((project) => getTasks(session, project.id))),
    listUsers(),
  ]);
  const tasks = perProject.flat();
  const developers = users.filter((user) => user.role === "AGENT");
  const rows = developers.map((user) => {
    const assigned = tasks.filter((task) => task.assignee_id === user.id);
    const byStage = sumHours(assigned);
    return {
      user,
      byStage,
      hours: byStage.todo + byStage.in_progress + byStage.done,
      count: assigned.length,
      projects: new Set(assigned.map((task) => task.project_id)).size,
    };
  }).sort((a, b) => b.hours - a.hours || a.user.name.localeCompare(b.user.name));

  const byStage = sumHours(tasks);
  const total = byStage.todo + byStage.in_progress + byStage.done;
  const max = Math.max(1, ...rows.map((row) => row.hours));
  const todoEnd = total ? (byStage.todo / total) * 100 : 0;
  const progressEnd = total ? ((byStage.todo + byStage.in_progress) / total) * 100 : 0;
  const ring = total
    ? `conic-gradient(var(--muted-foreground) 0% ${todoEnd}%, var(--primary) ${todoEnd}% ${progressEnd}%, var(--success) ${progressEnd}% 100%)`
    : "var(--muted)";

  return (
    <>
      <PageHeader
        eyebrow="Capacity"
        title="Team Workload"
        description="See how estimated effort is shared across developers and where tasks stand."
      />

      <div className="space-y-6 px-6 py-7 lg:px-9">
        {tasks.length === 0 ? (
          <EmptyState
            title="No work to summarise yet"
            body="Create projects from a transcript and the workload picture builds itself."
          />
        ) : (
          <>
            <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1.7fr)_minmax(19rem,1fr)]">
              <Card className="gap-0 p-0">
                <div className="flex flex-wrap items-start justify-between gap-3 border-b px-5 py-5 sm:px-6">
                  <div>
                    <h2 className="text-base font-semibold tracking-tight">Effort by developer</h2>
                    <p className="mt-1 text-xs text-muted-foreground">Bar length compares total estimated hours.</p>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted-foreground" aria-label="Task status colors">
                    {stages.map((stage) => (
                      <span key={stage.id} className="inline-flex items-center gap-1.5">
                        <span className={`size-2 rounded-full ${stage.color}`} aria-hidden="true" />{stage.label}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="divide-y divide-border/60">
                  {rows.map((row) => (
                    <div key={row.user.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2 px-5 py-3 sm:grid-cols-[minmax(10rem,13rem)_minmax(0,1fr)_auto] sm:px-6">
                      <div className="flex min-w-0 items-center gap-2.5">
                        <Avatar className="size-8 shrink-0">
                          <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                            {initials(row.user.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{row.user.name}</p>
                          <p className="truncate text-xs text-muted-foreground">{row.user.specialization || "Developer"}</p>
                        </div>
                      </div>

                      <div
                        className="order-3 col-span-2 h-2 overflow-hidden rounded-full bg-muted sm:order-none sm:col-span-1"
                        role="img"
                        aria-label={`${row.user.name}: ${hoursLabel(row.byStage.todo)} to do, ${hoursLabel(row.byStage.in_progress)} in progress, ${hoursLabel(row.byStage.done)} done`}
                      >
                        <div className="flex h-full overflow-hidden rounded-full" style={{ width: `${(row.hours / max) * 100}%` }}>
                          {stages.map((stage) => (
                            <div
                              key={stage.id}
                              className={`h-full ${stage.color}`}
                              style={{ width: row.hours ? `${(row.byStage[stage.id] / row.hours) * 100}%` : "0%" }}
                            />
                          ))}
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-sm font-semibold tabular-nums">{hoursLabel(row.hours)}</p>
                        <p className="whitespace-nowrap text-[11px] text-muted-foreground">
                          {row.count} {row.count === 1 ? "task" : "tasks"} <span aria-hidden="true">·</span> {row.projects} {row.projects === 1 ? "project" : "projects"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="gap-0 p-0">
                <div className="border-b px-5 py-5 sm:px-6">
                  <h2 className="text-base font-semibold tracking-tight">Effort by status</h2>
                  <p className="mt-1 text-xs text-muted-foreground">Share of estimated hours across your projects.</p>
                </div>
                <div className="flex flex-col items-center px-5 py-7 sm:px-6">
                  <div className="relative grid size-44 place-items-center rounded-full" style={{ background: ring }} aria-hidden="true">
                    <div className="grid size-32 place-content-center rounded-full bg-card text-center">
                      <span className="text-3xl font-semibold tracking-tight tabular-nums">{hoursLabel(total)}</span>
                      <span className="mt-0.5 text-xs text-muted-foreground">total effort</span>
                    </div>
                  </div>
                  <div className="mt-7 w-full space-y-4">
                    {stages.map((stage) => {
                      const hours = byStage[stage.id];
                      return (
                        <div key={stage.id} className="flex items-center gap-3 text-sm">
                          <span className={`size-2.5 shrink-0 rounded-full ${stage.color}`} aria-hidden="true" />
                          <span className="flex-1 text-muted-foreground">{stage.label}</span>
                          <span className="font-medium tabular-nums">{hoursLabel(hours)}</span>
                          <span className="w-10 text-right text-xs text-muted-foreground tabular-nums">{total ? Math.round((hours / total) * 100) : 0}%</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </Card>
            </div>
            <WorkloadDeadlineChart tasks={tasks} />
          </>
        )}
      </div>
    </>
  );
}

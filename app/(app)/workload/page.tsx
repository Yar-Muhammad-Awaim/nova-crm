import { requireSession, getProjects, getTasks, listUsers } from "@/lib/data";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { initials } from "@/lib/ui";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

/**
 * Team Workload — the one view the meeting itself could not produce.
 *
 * The transcript gives every task an effort estimate, but nobody in the room
 * ever adds them up per person. Once the data is structured, "who is
 * overloaded?" becomes a sum. This is the argument for digitising the meeting
 * at all, so it is worth a screen.
 */
export default async function WorkloadPage() {
  const s = await requireSession();
  if (s.role === "AGENT") redirect("/my-tasks");

  const projects = await getProjects(s);
  const perProject = await Promise.all(projects.map((p) => getTasks(s, p.id)));
  const tasks = perProject.flat();

  const users = (await listUsers()).filter((u) => u.role === "AGENT");

  const rows = users
    .map((u) => {
      const mine = tasks.filter((t) => t.assignee_id === u.id);
      return {
        user: u,
        hours: mine.reduce((n, t) => n + Number(t.estimated_hours), 0),
        count: mine.length,
        projects: new Set(mine.map((t) => t.project_id)).size,
      };
    })
    .sort((a, b) => b.hours - a.hours);

  const max = Math.max(1, ...rows.map((r) => r.hours));
  const total = rows.reduce((n, r) => n + r.hours, 0);

  return (
    <>
      <PageHeader
        eyebrow="Capacity"
        title="Team Workload"
        description="Effort estimates from the meeting, summed per developer. Nobody computed this in the room — the structured data did."
      />

      <div className="space-y-7 px-6 py-7 lg:px-9">
        {tasks.length === 0 ? (
          <EmptyState
            title="No work to summarise yet"
            body="Create projects from a transcript and the workload picture builds itself."
          />
        ) : (
          <>
            <div className="flex flex-wrap gap-6 rounded-xl border bg-card/50 px-6 py-5">
              <Figure label="Total estimated effort" value={`${total}h`} />
              <Figure label="Tasks" value={String(tasks.length)} />
              <Figure label="Developers with work" value={String(rows.filter((r) => r.count).length)} />
              <Figure label="Busiest" value={rows[0]?.count ? rows[0].user.name.split(" ")[0] : "—"} />
            </div>

            <Card className="gap-0 divide-y p-0">
              {rows.map((r) => (
                <div key={r.user.id} className="flex items-center gap-4 px-5 py-4">
                  <Avatar className="size-9 shrink-0">
                    <AvatarFallback className="bg-emerald-500/15 text-xs font-semibold text-emerald-400">
                      {initials(r.user.name)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="w-40 shrink-0">
                    <p className="truncate text-sm font-medium tracking-tight">{r.user.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{r.user.specialization}</p>
                  </div>

                  <div className="min-w-24 flex-1">
                    <div className="h-2 overflow-hidden rounded-full bg-secondary">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-primary/70 to-primary transition-[width] duration-700"
                        style={{ width: `${(r.hours / max) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <Badge variant="outline" className="tabular-nums">{r.hours}h</Badge>
                    <span className="hidden w-28 text-right text-xs text-muted-foreground sm:block">
                      {r.count} {r.count === 1 ? "task" : "tasks"} · {r.projects} proj
                    </span>
                  </div>
                </div>
              ))}
            </Card>
          </>
        )}
      </div>
    </>
  );
}

function Figure({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{label}</p>
      <p className="mt-1 text-2xl font-semibold tracking-tight tabular-nums">{value}</p>
    </div>
  );
}

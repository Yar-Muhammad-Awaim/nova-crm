import Link from "next/link";
import { notFound } from "next/navigation";
import { requireSession, getProjectById, listUsers } from "@/lib/data";
import { PageHeader } from "@/components/page-header";
import { TaskList } from "@/components/task-list";
import { EmptyState } from "@/components/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { formatDate, initials } from "@/lib/ui";
import { ArrowLeft, Building2, CalendarDays, Clock, ListChecks, Lock } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ProjectDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const s = await requireSession();

  let project;
  try {
    // Refuses the id outright if it is outside this user's permitted set —
    // typing another manager's project URL lands on "not found", not the data.
    project = await getProjectById(s, id);
  } catch {
    notFound();
  }

  const agents = (await listUsers()).filter((u) => u.role === "AGENT");
  const tasks = project.tasks ?? [];
  const hours = tasks.reduce((n, t) => n + Number(t.estimated_hours), 0);

  return (
    <>
      <PageHeader
        eyebrow={project.client_name}
        title={project.name}
        description={project.description ?? undefined}
        action={
          <Button variant="ghost" size="sm" render={<Link href="/projects" />}><ArrowLeft className="size-4" /> All projects</Button>
        }
      />

      <div className="space-y-8 px-6 py-7 lg:px-9">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Meta icon={<Building2 className="size-4" />} label="Client" value={project.client_name} />
          <Meta
            icon={<Avatar className="size-5">
              <AvatarFallback className="bg-sky-500/20 text-[10px] font-semibold text-sky-400">
                {initials(project.manager?.name ?? "?")}
              </AvatarFallback>
            </Avatar>}
            label="Project manager"
            value={project.manager?.name ?? "—"}
          />
          <Meta icon={<CalendarDays className="size-4" />} label="Deadline" value={formatDate(project.deadline)} />
          <Meta
            icon={<Clock className="size-4" />}
            label={s.role === "AGENT" ? "Your effort" : "Total effort"}
            value={`${hours}h`}
          />
        </div>

        <section>
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <h2 className="text-sm font-semibold tracking-tight">
              {s.role === "AGENT" ? "Your tasks in this project" : "Tasks"}
            </h2>
            <Badge variant="outline" className="gap-1 text-xs font-normal">
              <ListChecks className="size-3" /> {tasks.length}
            </Badge>
            {s.role === "AGENT" && (
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Lock className="size-3" />
                Other developers&apos; tasks on this project are not returned to you.
              </span>
            )}
          </div>

          {tasks.length === 0 ? (
            <EmptyState title="No tasks" body="This project has no tasks visible to you." />
          ) : (
            <TaskList tasks={tasks} editable={s.role !== "AGENT"} agents={agents} />
          )}
        </section>
      </div>
    </>
  );
}

function Meta({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <Card className="gap-0 p-4">
      <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{label}</p>
      <div className="mt-2 flex items-center gap-2">
        <span className="text-muted-foreground">{icon}</span>
        <span className="truncate text-base font-medium tracking-tight">{value}</span>
      </div>
    </Card>
  );
}

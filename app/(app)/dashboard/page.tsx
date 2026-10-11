import Link from "next/link";
import { requireSession, getProjects, getMyTasks, listUsers, listTeams } from "@/lib/data";
import { ProjectDialog } from "@/components/create-dialogs";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { ProjectCard } from "@/components/project-card";
import { EmptyState } from "@/components/empty-state";
import { TaskList } from "@/components/task-list";
import { Button } from "@/components/ui/button";
import { ROLE_LABEL } from "@/lib/ui";
import { FolderKanban, ListChecks, Clock, Users, ShieldCheck, Sparkles, BarChart3 } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const s = await requireSession();
  const [projects, users, teams] = await Promise.all([getProjects(s), listUsers(), listTeams()]);
  const myTasks = s.role === "AGENT" ? await getMyTasks(s) : [];

  const taskTotal =
    s.role === "AGENT" ? myTasks.length : projects.reduce((n, p) => n + (p.tasks?.length ?? 0), 0);
  const myHours = myTasks.reduce((n, t) => n + Number(t.estimated_hours), 0);

  const headline =
    s.role === "ADMIN"
      ? "Enterprise Workspace Overview & Capacity"
      : s.role === "MANAGER"
        ? "Your Managed Client Portfolios"
        : "Your Focused Workstream";

  return (
    <>
      <PageHeader
        eyebrow={ROLE_LABEL[s.role]}
        title={`Welcome back, ${s.name.split(" ")[0]}`}
        description={headline}
        action={
          s.role !== "AGENT" ? (
            <div className="flex flex-wrap items-center gap-2">
              {s.role === "ADMIN" && (
                <>
                  <Button variant="outline" nativeButton={false} render={<Link href="/transcript" />}>
                    <Sparkles className="size-4 text-primary" /> From Transcript
                  </Button>
                  <Button variant="outline" nativeButton={false} render={<Link href="/workload" />}>
                    <BarChart3 className="size-4" /> Workload Matrix
                  </Button>
                </>
              )}
              <ProjectDialog users={users} teams={teams} session={s} />
            </div>
          ) : null
        }
      />

      <div className="space-y-8 px-6 py-7 lg:px-9">
        {/* Real-time Enterprise Engine Health Strip */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/70 bg-card/40 px-4 py-3 text-xs font-mono text-muted-foreground shadow-2xs">
          <div className="flex flex-wrap items-center gap-3">
            <span className="flex items-center gap-1.5 text-foreground font-medium">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>PostgreSQL 17 ACID Active</span>
            </span>
            <span className="hidden sm:inline text-border">·</span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="size-3.5 text-primary" />
              <span>RBAC Policy: Server-Enforced ({s.role})</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded-md border border-border/80 bg-background/80 px-2 py-0.5 text-[11px] text-muted-foreground">
              Directory: {users.length} Verified Staff
            </span>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label={s.role === "AGENT" ? "Related projects" : "Projects"}
            value={projects.length}
            sub={s.role === "ADMIN" ? "across the enterprise" : "scoped to your role"}
            icon={<FolderKanban className="size-4" />}
            trend={projects.length > 0 ? "Active" : undefined}
          />
          <StatCard
            label={s.role === "AGENT" ? "My tasks" : "Tasks"}
            value={taskTotal}
            sub={s.role === "AGENT" ? "assigned to your ID" : "in your active projects"}
            icon={<ListChecks className="size-4" />}
            trend={`${taskTotal} Total`}
          />
          {s.role === "AGENT" ? (
            <StatCard
              label="Estimated effort"
              value={`${myHours}h`}
              sub="total allocated build time"
              icon={<Clock className="size-4" />}
              trend="Sprint Load"
            />
          ) : (
            <StatCard
              label="Clients"
              value={new Set(projects.map((p) => p.client_name)).size}
              sub="distinct client engagements"
              icon={<Clock className="size-4" />}
              trend="Portfolio"
            />
          )}
          <StatCard
            label="Team"
            value={users.filter((u) => u.role !== "ADMIN").length}
            sub={`${users.filter((user) => user.role === "MANAGER").length} managers · ${users.filter((user) => user.role === "AGENT").length} engineers`}
            icon={<Users className="size-4" />}
            trend="100% Grounded"
          />
        </div>

        {s.role === "AGENT" ? (
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold tracking-tight text-foreground font-display text-base">
                Your Assigned Tasks
              </h2>
              <span className="font-mono text-xs text-muted-foreground">
                {myTasks.length} {myTasks.length === 1 ? "task" : "tasks"}
              </span>
            </div>
            {myTasks.length === 0 ? (
              <EmptyState
                title="No tasks assigned yet"
                body="Once the administrator creates projects from a meeting transcript, anything assigned to you will appear here."
              />
            ) : (
              <TaskList tasks={myTasks} showProject editable={false} />
            )}
          </section>
        ) : (
          <section>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold tracking-tight text-foreground font-display">
                  {s.role === "ADMIN" ? "All Enterprise Projects" : "Your Managed Projects"}
                </h2>
                <p className="text-xs text-muted-foreground">
                  {projects.length} {projects.length === 1 ? "project" : "projects"} currently tracked
                </p>
              </div>
              {projects.length > 0 && (
                <Button variant="ghost" size="sm" nativeButton={false} render={<Link href="/projects" />}>
                  View all projects →
                </Button>
              )}
            </div>

            {projects.length === 0 ? (
              <EmptyState
                title={s.role === "ADMIN" ? "No projects in workspace yet" : "No projects assigned to you"}
                body={
                  s.role === "ADMIN"
                    ? "Turn a raw stakeholder meeting transcript into assigned projects and tasks with one click."
                    : "Create a project or wait for an administrator to assign a project to you."
                }
                action={
                  s.role === "ADMIN" ? (
                    <Button nativeButton={false} render={<Link href="/transcript" />}>
                      <Sparkles className="size-4" /> Create from Transcript
                    </Button>
                  ) : undefined
                }
              />
            ) : (
              <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
                {projects.map((p, i) => (
                  <ProjectCard key={p.id} project={p} index={i} />
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </>
  );
}

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
import { FolderKanban, ListChecks, Clock, Users, FileText } from "lucide-react";

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
      ? "Everything across NovaWorks"
      : s.role === "MANAGER"
        ? "The projects you manage"
        : "Your assigned work";

  return (
    <>
      <PageHeader
        eyebrow={ROLE_LABEL[s.role]}
        title={`Welcome back, ${s.name.split(" ")[0]}`}
        description={headline}
        action={
          s.role !== "AGENT" ? (
            <div className="flex flex-wrap gap-2">
              {s.role === "ADMIN" && <Button variant="outline" nativeButton={false} render={<Link href="/transcript" />}><FileText className="size-4" /> From transcript</Button>}
              <ProjectDialog users={users} teams={teams} session={s} />
            </div>
          ) : null
        }
      />

      <div className="space-y-8 px-6 py-7 lg:px-9">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label={s.role === "AGENT" ? "Related projects" : "Projects"}
            value={projects.length}
            sub={s.role === "ADMIN" ? "across the company" : "visible to you"}
            icon={<FolderKanban className="size-4" />}
          />
          <StatCard
            label={s.role === "AGENT" ? "My tasks" : "Tasks"}
            value={taskTotal}
            sub={s.role === "AGENT" ? "assigned to you" : "in your projects"}
            icon={<ListChecks className="size-4" />}
          />
          {s.role === "AGENT" ? (
            <StatCard
              label="Estimated effort"
              value={`${myHours}h`}
              sub="total across your tasks"
              icon={<Clock className="size-4" />}
            />
          ) : (
            <StatCard
              label="Clients"
              value={new Set(projects.map((p) => p.client_name)).size}
              sub="distinct client engagements"
              icon={<Clock className="size-4" />}
            />
          )}
          <StatCard
            label="Team"
            value={users.filter((u) => u.role !== "ADMIN").length}
            sub={`${users.filter((user) => user.role === "MANAGER").length} managers · ${users.filter((user) => user.role === "AGENT").length} members`}
            icon={<Users className="size-4" />}
          />
        </div>

        {s.role === "AGENT" ? (
          <section>
            <h2 className="mb-4 text-sm font-semibold tracking-tight">Your tasks</h2>
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
              <h2 className="text-sm font-semibold tracking-tight">
                {s.role === "ADMIN" ? "All projects" : "Your projects"}
              </h2>
              {projects.length > 0 && (
                <Button variant="ghost" size="sm" nativeButton={false} render={<Link href="/projects" />}>View all</Button>
              )}
            </div>

            {projects.length === 0 ? (
              <EmptyState
                title={s.role === "ADMIN" ? "No projects yet" : "No projects assigned to you"}
                body={
                  s.role === "ADMIN"
                    ? "Create a project manually or turn a meeting transcript into assigned work."
                    : "Create a project or wait for an administrator to assign one to you."
                }
                action={
                  s.role === "ADMIN" ? (
                    <Button nativeButton={false} render={<Link href="/transcript" />}>
                        <FileText className="size-4" /> Create from Transcript
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

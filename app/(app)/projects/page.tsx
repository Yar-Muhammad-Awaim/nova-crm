import { requireSession, getProjects, listUsers, listTeams } from "@/lib/data";
import { ProjectDialog } from "@/components/create-dialogs";
import { PageHeader } from "@/components/page-header";
import { ProjectsExplorer } from "@/components/projects-explorer";
import { EmptyState } from "@/components/empty-state";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const s = await requireSession();
  const [projects, users, teams] = await Promise.all([getProjects(s), listUsers(), listTeams()]);

  const description =
    s.role === "ADMIN"
      ? "Every project at NovaWorks."
      : s.role === "MANAGER"
        ? "Only the projects you are the manager of."
        : "Only the projects that contain a task assigned to you.";

  return (
    <>
      <PageHeader eyebrow="Projects" title="Projects" description={description}
        action={s.role !== "AGENT" ? <ProjectDialog users={users} teams={teams} session={s} /> : undefined} />
      <div className="px-6 py-7 lg:px-9">
        {projects.length === 0 ? (
          <EmptyState
            title="No projects visible to you"
            body={s.role === "AGENT" ? "Projects appear here when a task is assigned to you." : "Create a project to start organizing your team's work."}
          />
        ) : (
          <ProjectsExplorer projects={projects} />
        )}
      </div>
    </>
  );
}

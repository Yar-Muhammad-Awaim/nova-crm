import { requireSession, getProjects } from "@/lib/data";
import { PageHeader } from "@/components/page-header";
import { ProjectsExplorer } from "@/components/projects-explorer";
import { EmptyState } from "@/components/empty-state";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const s = await requireSession();
  const projects = await getProjects(s);

  const description =
    s.role === "ADMIN"
      ? "Every project at NovaWorks."
      : s.role === "MANAGER"
        ? "Only the projects you are the manager of."
        : "Only the projects that contain a task assigned to you.";

  return (
    <>
      <PageHeader eyebrow="Projects" title="Projects" description={description} />
      <div className="px-6 py-7 lg:px-9">
        {projects.length === 0 ? (
          <EmptyState
            title="No projects visible to you"
            body="Projects appear here once the administrator creates them from a meeting transcript."
          />
        ) : (
          <ProjectsExplorer projects={projects} />
        )}
      </div>
    </>
  );
}

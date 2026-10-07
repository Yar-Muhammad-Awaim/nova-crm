import Link from "next/link";
import { notFound } from "next/navigation";
import { requireSession, getProjectById, listUsers } from "@/lib/data";
import { ProjectBoard } from "@/components/project-board";
import { formatDate, initials } from "@/lib/ui";
import { Building2, CalendarDays, ChevronRight, Clock, FolderKanban, Lock, UserRound, Users } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ProjectDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const s = await requireSession();
  let project;
  try {
    project = await getProjectById(s, id);
  } catch (error) {
    if (error instanceof Error && error.message === "FORBIDDEN") notFound();
    throw error;
  }
  const agents = (await listUsers()).filter((user) => user.role === "AGENT");
  const tasks = project.tasks ?? [];
  const hours = tasks.reduce((total, task) => total + Number(task.estimated_hours), 0);

  return (
    <div className="mx-auto max-w-7xl px-5 pb-8 pt-20 sm:px-8 lg:px-10 lg:pt-5">
      <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-2 text-xs text-muted-foreground">
        <Link href="/projects" className="flex items-center gap-1.5 rounded-sm hover:text-foreground"><FolderKanban className="size-3.5" /> Projects</Link>
        <ChevronRight className="size-3" />
        <span className="truncate text-foreground">{project.name}</span>
      </nav>
      <header className="mb-5">
        <div className="flex items-center gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border bg-muted/40 text-muted-foreground"><FolderKanban className="size-5" aria-hidden="true" /></span>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{project.name}</h1>
        </div>
        {project.description && <p className="mt-2 text-sm leading-6 text-muted-foreground">{project.description}</p>}
        <dl className="mt-4 grid grid-cols-2 gap-x-5 gap-y-3 rounded-lg border border-border/60 bg-muted/20 px-3 py-2.5 text-sm xl:flex xl:flex-wrap xl:items-center xl:gap-x-6">
          <div className="flex min-w-0 flex-col gap-1 xl:flex-row xl:items-center xl:gap-2">
            <dt className="flex items-center gap-1.5 text-xs text-muted-foreground"><Building2 className="size-3.5" aria-hidden="true" /> Client</dt>
            <dd className="break-words">{project.client_name}</dd>
          </div>
          <div className="flex min-w-0 flex-col gap-1 xl:flex-row xl:items-center xl:gap-2">
            <dt className="flex items-center gap-1.5 text-xs text-muted-foreground"><UserRound className="size-3.5" aria-hidden="true" /> Manager</dt>
            <dd className="flex items-center gap-1.5"><span className="grid size-5 shrink-0 place-items-center rounded-full bg-manager/15 text-xs font-medium text-manager" aria-hidden="true">{initials(project.manager?.name ?? "?")}</span>{project.manager?.name ?? "Unassigned"}</dd>
          </div>
          <div className="flex min-w-0 flex-col gap-1 xl:flex-row xl:items-center xl:gap-2">
            <dt className="flex items-center gap-1.5 text-xs text-muted-foreground"><CalendarDays className="size-3.5" aria-hidden="true" /> Deadline</dt>
            <dd>{formatDate(project.deadline)}</dd>
          </div>
          {project.team && <div className="flex min-w-0 flex-col gap-1 xl:flex-row xl:items-center xl:gap-2">
            <dt className="flex items-center gap-1.5 text-xs text-muted-foreground"><Users className="size-3.5" aria-hidden="true" /> Team</dt>
            <dd className="break-words">{project.team.name}</dd>
          </div>}
          <div className="flex min-w-0 flex-col gap-1 xl:flex-row xl:items-center xl:gap-2">
            <dt className="flex items-center gap-1.5 text-xs text-muted-foreground"><Clock className="size-3.5" aria-hidden="true" /> {s.role === "AGENT" ? "Your effort" : "Effort"}</dt>
            <dd>{hours} hours</dd>
          </div>
        </dl>
      </header>
      {s.role === "AGENT" && <p className="mb-3 flex items-center gap-2 text-xs text-muted-foreground"><Lock className="size-3.5" /> Only tasks assigned to you are shown.</p>}
      <ProjectBoard projectId={id} deadline={project.deadline} tasks={tasks} editable={s.role !== "AGENT"} agents={agents} />
    </div>
  );
}

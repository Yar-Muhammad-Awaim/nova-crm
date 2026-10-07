import { requireSession, getMyTasks } from "@/lib/data";
import { PageHeader } from "@/components/page-header";
import { TaskList } from "@/components/task-list";
import { EmptyState } from "@/components/empty-state";
import { StatCard } from "@/components/stat-card";
import { ListChecks, Clock, FolderKanban } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function MyTasksPage() {
  const s = await requireSession();
  const tasks = await getMyTasks(s);

  const hours = tasks.reduce((n, t) => n + Number(t.estimated_hours), 0);
  const projectCount = new Set(tasks.map((t) => t.project_id)).size;

  return (
    <>
      <PageHeader
        eyebrow="My work"
        title="My Tasks"
        description="Every task assigned to you, across all projects, nearest deadline first."
      />
      <div className="space-y-7 px-6 py-7 lg:px-9">
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard label="Tasks" value={tasks.length} icon={<ListChecks className="size-4" />} />
          <StatCard label="Estimated effort" value={`${hours}h`} icon={<Clock className="size-4" />} />
          <StatCard label="Projects" value={projectCount} icon={<FolderKanban className="size-4" />} />
        </div>

        {tasks.length === 0 ? (
          <EmptyState title="Nothing assigned yet" body="Tasks assigned to you will appear here." />
        ) : (
          <TaskList tasks={tasks} showProject editable={false} />
        )}
      </div>
    </>
  );
}

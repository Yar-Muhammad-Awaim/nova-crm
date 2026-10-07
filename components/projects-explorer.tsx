"use client";

import { useMemo, useState } from "react";
import { ProjectCard } from "@/components/project-card";
import { EmptyState } from "@/components/empty-state";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import type { Project } from "@/lib/types";

/** Client-side search over the rows the server already decided you may see. */
export function ProjectsExplorer({ projects }: { projects: Project[] }) {
  const [q, setQ] = useState("");
  const [manager, setManager] = useState<string>("all");

  const managers = useMemo(() => {
    const m = new Map<string, string>();
    projects.forEach((p) => p.manager && m.set(p.manager.id, p.manager.name));
    return [...m.entries()];
  }, [projects]);

  const shown = projects.filter((p) => {
    if (manager !== "all" && p.manager_id !== manager) return false;
    if (!q.trim()) return true;
    const hay = `${p.name} ${p.client_name} ${p.description ?? ""} ${p.manager?.name ?? ""}`.toLowerCase();
    return hay.includes(q.trim().toLowerCase());
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-56 flex-1">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search projects, clients, managers…"
            className="pl-9"
          />
        </div>

        {managers.length > 1 && (
          <div className="flex flex-wrap items-center gap-1.5">
            <Button
              size="sm"
              variant={manager === "all" ? "secondary" : "ghost"}
              onClick={() => setManager("all")}
            >
              All
            </Button>
            {managers.map(([id, name]) => (
              <Button
                key={id}
                size="sm"
                variant={manager === id ? "secondary" : "ghost"}
                onClick={() => setManager(id)}
              >
                {name.split(" ")[0]}
              </Button>
            ))}
          </div>
        )}
      </div>

      {shown.length === 0 ? (
        <EmptyState
          title="Nothing matches that search"
          body="Try a different project name, client or manager."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {shown.map((p, i) => (
            <ProjectCard key={p.id} project={p} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}

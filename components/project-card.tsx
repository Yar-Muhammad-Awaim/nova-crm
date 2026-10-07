"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CalendarDays, ListChecks, ArrowUpRight } from "lucide-react";
import { formatDate, initials, urgency } from "@/lib/ui";
import type { Project } from "@/lib/types";

export function ProjectCard({ project, index = 0 }: { project: Project; index?: number }) {
  const taskCount = project.tasks?.length ?? 0;
  const u = urgency(project.deadline);

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, delay: Math.min(index * 0.06, 0.4), ease: [0.22, 1, 0.36, 1] }}
    >
      <Link href={`/projects/${project.id}`} className="group block h-full">
        <Card className="h-full gap-0 overflow-hidden p-0 transition-colors hover:border-primary/40">
          <div className="h-0.5 w-full bg-gradient-to-r from-primary/70 via-primary/25 to-transparent opacity-60 transition-opacity group-hover:opacity-100" />
          <div className="flex h-full flex-col p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="truncate text-base font-semibold tracking-tight">{project.name}</h3>
                <p className="mt-0.5 truncate text-sm text-muted-foreground">{project.client_name}</p>
              </div>
              <ArrowUpRight className="size-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
            </div>

            {project.description && (
              <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                {project.description}
              </p>
            )}

            <div className="mt-auto flex flex-wrap items-center gap-2 pt-5">
              <div className="flex items-center gap-1.5 rounded-md border bg-secondary/40 px-2 py-1">
                <Avatar className="size-4">
                  <AvatarFallback className="bg-sky-500/20 text-[10px] font-semibold text-sky-400">
                    {initials(project.manager?.name ?? "?")}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs text-muted-foreground">{project.manager?.name}</span>
              </div>

              <Badge variant="outline" className="gap-1 text-xs font-normal">
                <ListChecks className="size-3" /> {taskCount} {taskCount === 1 ? "task" : "tasks"}
              </Badge>

              <Badge
                variant="outline"
                className={`gap-1 text-xs font-normal ${
                  u === "past" ? "border-destructive/35 bg-destructive/10 text-destructive"
                  : u === "soon" ? "border-primary/35 bg-primary/10 text-primary"
                  : ""
                }`}
              >
                <CalendarDays className="size-3" /> {formatDate(project.deadline)}
              </Badge>
            </div>
          </div>
        </Card>
      </Link>
    </motion.div>
  );
}

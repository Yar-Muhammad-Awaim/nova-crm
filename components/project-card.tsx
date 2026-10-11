"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CalendarDays, ArrowUpRight, Clock, CheckCircle2 } from "lucide-react";
import { formatDate, initials, urgency } from "@/lib/ui";
import type { Project } from "@/lib/types";

export function ProjectCard({ project, index = 0 }: { project: Project; index?: number }) {
  const tasks = project.tasks ?? [];
  const taskCount = tasks.length;
  const doneCount = tasks.filter((t) => t.status === "done").length;
  const totalHours = tasks.reduce((sum, t) => sum + (Number(t.estimated_hours) || 0), 0);
  const percentComplete = taskCount > 0 ? Math.round((doneCount / taskCount) * 100) : 0;
  const u = urgency(project.deadline);

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, delay: Math.min(index * 0.06, 0.4), ease: [0.22, 1, 0.36, 1] }}
    >
      <Link href={`/projects/${project.id}`} className="group block h-full">
        <Card className="h-full gap-0 overflow-hidden p-0 transition-all hover:border-primary/50 hover:shadow-md hover:shadow-primary/5 shadow-2xs">
          <div className="h-0.5 w-full bg-gradient-to-r from-primary/80 via-chart-2/40 to-transparent opacity-60 transition-opacity group-hover:opacity-100" />
          <div className="flex h-full flex-col p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="truncate text-base font-semibold tracking-tight text-foreground group-hover:text-primary transition-colors">
                  {project.name}
                </h3>
                <p className="mt-0.5 truncate text-xs text-muted-foreground font-mono">
                  Client: {project.client_name}
                </p>
              </div>
              <ArrowUpRight className="size-4 shrink-0 text-muted-foreground opacity-40 transition-all group-hover:opacity-100 group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </div>

            {project.description && (
              <p className="mt-2.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                {project.description}
              </p>
            )}

            {/* Task Progress Track */}
            {taskCount > 0 && (
              <div className="mt-4 space-y-1.5 border-t border-border/50 pt-3">
                <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="size-3 text-emerald-400" />
                    <span>{doneCount}/{taskCount} tasks done</span>
                  </span>
                  <span className="font-semibold text-foreground tabular-nums">
                    {percentComplete}%
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-emerald-400 transition-all duration-500 rounded-full"
                    style={{ width: `${percentComplete}%` }}
                  />
                </div>
              </div>
            )}

            <div className="mt-auto flex flex-wrap items-center gap-2 pt-4">
              <div className="flex items-center gap-1.5 rounded-md border border-border/70 bg-secondary/40 px-2 py-0.5">
                <Avatar className="size-4">
                  <AvatarFallback className="bg-manager/20 text-[10px] font-semibold text-manager">
                    {initials(project.manager?.name ?? "?")}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs text-muted-foreground truncate max-w-28 font-medium">
                  {project.manager?.name}
                </span>
              </div>

              {totalHours > 0 && (
                <Badge variant="outline" className="gap-1 text-[11px] font-mono">
                  <Clock className="size-3 text-muted-foreground" /> {totalHours}h
                </Badge>
              )}

              <Badge
                variant="outline"
                className={`gap-1 text-[11px] font-mono ${
                  u === "past"
                    ? "border-destructive/35 bg-destructive/10 text-destructive"
                    : u === "soon"
                    ? "border-primary/35 bg-primary/10 text-primary"
                    : "text-muted-foreground"
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

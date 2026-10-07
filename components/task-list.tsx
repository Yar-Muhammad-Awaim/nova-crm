"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { toast } from "sonner";
import { updateTask } from "@/lib/actions";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarDays, Clock, Pencil, Loader2 } from "lucide-react";
import { formatDate, initials, urgency } from "@/lib/ui";
import type { Task, User } from "@/lib/types";

export function TaskList({
  tasks, showProject = false, editable = false, agents = [],
}: {
  tasks: Task[];
  showProject?: boolean;
  /** Only managers and the admin get edit affordances. The server re-checks. */
  editable?: boolean;
  agents?: Pick<User, "id" | "name" | "specialization">[];
}) {
  const [editing, setEditing] = useState<Task | null>(null);

  return (
    <>
      <div className="space-y-2.5">
        {tasks.map((t, i) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, delay: Math.min(i * 0.045, 0.35), ease: [0.22, 1, 0.36, 1] }}
          >
            <Card className="group gap-0 p-4 transition-colors hover:border-border/90">
              <div className="flex items-start gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="text-sm font-medium tracking-tight">{t.title}</h4>
                    {showProject && t.project && (
                      <Link
                        href={`/projects/${t.project.id}`}
                        className="rounded-md border bg-secondary/50 px-2 py-0.5 text-xs text-muted-foreground hover:text-foreground"
                      >
                        {t.project.name}
                      </Link>
                    )}
                  </div>

                  {t.description && (
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                      {t.description}
                    </p>
                  )}

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-1.5 rounded-md border bg-secondary/40 px-2 py-1">
                      <Avatar className="size-4">
                        <AvatarFallback className="bg-emerald-500/20 text-[10px] font-semibold text-emerald-400">
                          {initials(t.assignee?.name ?? "?")}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs text-muted-foreground">{t.assignee?.name}</span>
                    </div>

                    <DeadlineChip iso={t.deadline} />

                    <Badge variant="outline" className="gap-1 text-xs font-normal">
                      <Clock className="size-3" /> {Number(t.estimated_hours)}h
                    </Badge>
                  </div>
                </div>

                {editable && (
                  <Button
                    size="icon"
                    variant="ghost"
                    className="size-8 shrink-0 opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
                    onClick={() => setEditing(t)}
                    aria-label={`Edit ${t.title}`}
                  >
                    <Pencil className="size-3.5" aria-hidden="true" />
                  </Button>
                )}
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <EditTaskDialog task={editing} agents={agents} onClose={() => setEditing(null)} />
    </>
  );
}

function DeadlineChip({ iso }: { iso: string }) {
  const u = urgency(iso);
  return (
    <Badge
      variant="outline"
      className={`gap-1 text-xs font-normal ${
        u === "past" ? "border-destructive/35 bg-destructive/10 text-destructive"
        : u === "soon" ? "border-primary/35 bg-primary/10 text-primary"
        : ""
      }`}
    >
      <CalendarDays className="size-3" /> {formatDate(iso)}
    </Badge>
  );
}

function EditTaskDialog({
  task, agents, onClose,
}: {
  task: Task | null;
  agents: Pick<User, "id" | "name" | "specialization">[];
  onClose: () => void;
}) {
  const [pending, start] = useTransition();
  const [assignee, setAssignee] = useState<string>("");

  if (!task) return null;

  function submit(form: FormData) {
    const t = task!;
    start(async () => {
      try {
        await updateTask(t.id, {
          title: String(form.get("title")),
          description: String(form.get("description")),
          assignee_id: assignee || t.assignee_id,
          deadline: String(form.get("deadline")),
          estimated_hours: Number(form.get("estimated_hours")),
        });
        toast.success("Task updated");
        onClose();
      } catch (e) {
        toast.error(e instanceof Error && e.message === "FORBIDDEN"
          ? "You are not allowed to edit this task."
          : "Could not save the change.");
      }
    });
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit task</DialogTitle>
          <DialogDescription>
            The AI&apos;s output is a starting point — you stay in control of the record.
          </DialogDescription>
        </DialogHeader>

        <form action={submit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" defaultValue={task.title} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" rows={3} defaultValue={task.description ?? ""} />
          </div>

          <div className="space-y-2">
            <Label>Assigned developer</Label>
            <Select defaultValue={task.assignee_id} onValueChange={(v) => setAssignee(v ?? "")}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                {agents.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.name} · {a.specialization}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="deadline">Deadline</Label>
              <Input id="deadline" name="deadline" type="date" defaultValue={task.deadline} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="estimated_hours">Estimated hours</Label>
              <Input
                id="estimated_hours" name="estimated_hours" type="number"
                min="0.5" step="0.5" defaultValue={Number(task.estimated_hours)} required
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={pending}>
              {pending && <Loader2 className="size-4 animate-spin" />} Save changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

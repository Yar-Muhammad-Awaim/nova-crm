"use client";

import { useId, useState, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { FolderPlus, Loader2, Pencil, Plus, UserPlus, Users } from "lucide-react";
import { toast } from "sonner";
import { createMember, createProject, createTask, saveTeam } from "@/lib/management-actions";
import type { Session, TaskStatus, Team, User } from "@/lib/types";
import { TASK_COLUMNS } from "@/lib/task-board";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const selectClass = "h-9 w-full rounded-lg border border-input bg-background px-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";
const text = (form: FormData, name: string) => String(form.get(name) ?? "");

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className="flex min-w-0 flex-col gap-1.5 text-sm font-medium">{label}{children}</label>;
}

function EditorDialog({ title, description, onClose, onSave, children, submitLabel }: {
  title: string; description: string; onClose: () => void;
  onSave: (form: FormData) => Promise<void>; children: ReactNode; submitLabel: string;
}) {
  const [pending, start] = useTransition();
  const [error, setError] = useState("");
  const formId = useId();
  const router = useRouter();
  return (
    <Dialog open onOpenChange={(open) => { if (!open && !pending) onClose(); }}>
      <DialogContent className="flex max-h-[90dvh] flex-col sm:max-w-xl" showCloseButton={!pending}>
        <DialogHeader><DialogTitle>{title}</DialogTitle><DialogDescription>{description}</DialogDescription></DialogHeader>
        <form id={formId} className="min-h-0 space-y-4 overflow-y-auto px-0.5" onSubmit={(event) => {
          event.preventDefault();
          const form = new FormData(event.currentTarget);
          setError("");
          start(async () => {
            try { await onSave(form); onClose(); router.refresh(); }
            catch (e) { setError(e instanceof Error ? e.message : "Could not save. Please try again."); }
          });
        }}>
          <fieldset disabled={pending} className="space-y-4">{children}</fieldset>
          {error && <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">{error}</p>}
        </form>
        <DialogFooter className="border-t pt-3">
          <Button type="button" variant="ghost" disabled={pending} onClick={onClose}>Cancel</Button>
          <Button type="submit" form={formId} disabled={pending}>{pending && <Loader2 className="size-4 animate-spin" />}{pending ? "Saving…" : submitLabel}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function MemberDialog({ initialRole = "AGENT" }: { initialRole?: "AGENT" | "MANAGER" }) {
  const [open, setOpen] = useState(false);
  const label = initialRole === "MANAGER" ? "Add project manager" : "Add member";
  return <>
    <Button variant={initialRole === "MANAGER" ? "outline" : "default"} onClick={() => setOpen(true)}><UserPlus className="size-4" />{label}</Button>
    {open && <EditorDialog title={label} description="Create a sign-in account and add this person to your directory." submitLabel="Create account" onClose={() => setOpen(false)} onSave={async (form) => {
      await createMember({ name: text(form, "name"), email: text(form, "email"), password: text(form, "password"), role: text(form, "role"), specialization: text(form, "specialization"), skills: text(form, "skills").split(",").map(s => s.trim()).filter(Boolean) });
      toast.success("Account created. Share the sign-in details with your new colleague.");
    }}>
      <Field label="Full name"><Input name="name" autoComplete="off" maxLength={160} required placeholder="e.g. Ayesha Khan" /></Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Email"><Input name="email" type="email" autoComplete="off" required placeholder="name@company.com" /></Field>
        <Field label="Role"><select name="role" defaultValue={initialRole} className={selectClass}><option value="AGENT">Member</option><option value="MANAGER">Project manager</option></select></Field>
      </div>
      <Field label="Initial password"><Input name="password" type="password" autoComplete="new-password" minLength={8} required placeholder="At least 8 characters" /></Field>
      <p className="text-xs text-muted-foreground">Share the email and password directly with this person. No invitation email is sent.</p>
      <Field label="Specialization (optional)"><Input name="specialization" maxLength={160} placeholder="e.g. Frontend development" /></Field>
      <Field label="Skills (optional)"><Input name="skills" placeholder="React, TypeScript, Design" /></Field>
    </EditorDialog>}
  </>;
}

export function TeamDialog({ users, team }: { users: User[]; team?: Team }) {
  const [open, setOpen] = useState(false);
  const managers = users.filter(user => user.role === "MANAGER");
  const members = users.filter(user => user.role === "AGENT");
  return <>
    <Button variant="outline" size={team ? "sm" : "default"} onClick={() => setOpen(true)}>{team ? <Pencil className="size-3.5" /> : <Users className="size-4" />}{team ? "Edit team" : "New team"}</Button>
    {open && <EditorDialog title={team ? "Edit team" : "New team"} description="Choose a project manager and the members who work together." submitLabel={team ? "Save team" : "Create team"} onClose={() => setOpen(false)} onSave={async (form) => {
      await saveTeam({ id: team?.id, name: text(form, "name"), description: text(form, "description"), managerId: team?.manager_id ?? text(form, "managerId"), memberIds: form.getAll("memberIds") });
      toast.success(team ? "Team updated" : "Team created");
    }}>
      <Field label="Team name"><Input name="name" defaultValue={team?.name} maxLength={160} required placeholder="e.g. Product engineering" /></Field>
      <Field label="Description (optional)"><Textarea name="description" defaultValue={team?.description ?? ""} rows={2} maxLength={5000} className="field-sizing-fixed" /></Field>
      <Field label="Project manager"><select name="managerId" defaultValue={team?.manager_id ?? ""} disabled={!!team} required className={selectClass}><option value="" disabled>Select a project manager</option>{managers.map(manager => <option key={manager.id} value={manager.id}>{manager.name}</option>)}</select></Field>
      {!managers.length && <p className="text-xs text-muted-foreground">Add a project manager before creating a team.</p>}
      <fieldset className="space-y-2"><legend className="mb-2 text-sm font-medium">Members</legend>
        <div className="max-h-48 space-y-1 overflow-y-auto rounded-lg border p-2">
          {members.map(member => <label key={member.id} className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-2 hover:bg-muted/50">
            <input name="memberIds" type="checkbox" value={member.id} defaultChecked={team?.members.some(item => item.user_id === member.id)} className="size-4 accent-primary" />
            <span className="min-w-0"><span className="block text-sm">{member.name}</span><span className="block truncate text-xs text-muted-foreground">{member.specialization || member.email}</span></span>
          </label>)}
          {!members.length && <p className="p-2 text-sm text-muted-foreground">No members yet. You can add them to this team later.</p>}
        </div>
      </fieldset>
    </EditorDialog>}
  </>;
}

export function ProjectDialog({ users, teams, session }: { users: User[]; teams: Team[]; session: Session }) {
  const [open, setOpen] = useState(false);
  const [managerId, setManagerId] = useState(session.role === "MANAGER" ? session.userId : "");
  const router = useRouter();
  const managers = users.filter(user => user.role === "MANAGER" && (session.role === "ADMIN" || user.id === session.userId));
  return <>
    <Button onClick={() => { setManagerId(session.role === "MANAGER" ? session.userId : ""); setOpen(true); }}><FolderPlus className="size-4" />New project</Button>
    {open && <EditorDialog title="New project" description="Start with the essentials. Add tasks to your board after creating the project." submitLabel="Create project" onClose={() => setOpen(false)} onSave={async (form) => {
      const result = await createProject({ name: text(form, "name"), clientName: text(form, "clientName"), description: text(form, "description"), deadline: text(form, "deadline"), managerId, teamId: text(form, "teamId") || null });
      toast.success("Project created"); router.push(`/projects/${result.id}`);
    }}>
      <Field label="Project name"><Input name="name" maxLength={160} required placeholder="e.g. Website redesign" /></Field>
      <Field label="Client"><Input name="clientName" maxLength={160} required placeholder="Client or organization name" /></Field>
      <Field label="Description (optional)"><Textarea name="description" rows={3} maxLength={5000} className="field-sizing-fixed" placeholder="What are we building?" /></Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Project manager"><select name="managerId" value={managerId} onChange={event => setManagerId(event.target.value)} required className={selectClass}><option value="" disabled>Select a manager</option>{managers.map(manager => <option key={manager.id} value={manager.id}>{manager.name}</option>)}</select></Field>
        <Field label="Deadline"><Input name="deadline" type="date" required /></Field>
      </div>
      <Field label="Team (optional)"><select key={managerId} name="teamId" defaultValue="" className={selectClass}><option value="">No team</option>{teams.filter(team => team.manager_id === managerId).map(team => <option key={team.id} value={team.id}>{team.name}</option>)}</select></Field>
    </EditorDialog>}
  </>;
}

export function TaskDialog({ projectId, deadline, agents, status = "todo" }: {
  projectId: string; deadline: string; agents: Pick<User, "id" | "name" | "specialization">[]; status?: TaskStatus;
}) {
  const [open, setOpen] = useState(false);
  return <>
    <Button size="sm" onClick={() => setOpen(true)}><Plus className="size-4" />New task</Button>
    {open && <EditorDialog title="New task" description="Assign a member, set a deadline, and add the task to your board." submitLabel="Create task" onClose={() => setOpen(false)} onSave={async (form) => {
      await createTask({ projectId, title: text(form, "title"), description: text(form, "description"), assigneeId: text(form, "assigneeId"), deadline: text(form, "deadline"), estimatedHours: Number(form.get("estimatedHours")), status: text(form, "status") });
      toast.success("Task created");
    }}>
      <Field label="Task name"><Input name="title" required maxLength={160} placeholder="What needs to be done?" /></Field>
      <Field label="Description (optional)"><Textarea name="description" rows={3} maxLength={5000} className="field-sizing-fixed" /></Field>
      <Field label="Assigned member"><select name="assigneeId" required defaultValue="" className={selectClass}><option value="" disabled>Select a member</option>{agents.map(agent => <option key={agent.id} value={agent.id}>{agent.name}</option>)}</select></Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Deadline"><Input name="deadline" type="date" defaultValue={deadline} max={deadline} required /></Field>
        <Field label="Estimated hours"><Input name="estimatedHours" type="number" min="0.5" max="10000" step="0.5" defaultValue="1" required /></Field>
      </div>
      <Field label="Status"><select name="status" defaultValue={status} className={selectClass}>{TASK_COLUMNS.map(column => <option key={column.id} value={column.id}>{column.label}</option>)}</select></Field>
    </EditorDialog>}
  </>;
}

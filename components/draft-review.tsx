"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AlertCircle, ArrowUpRight, Check, CheckCircle2, Circle, Clock3, Columns3, FolderKanban, List, Loader2, Plus, Sparkles, Trash2, Undo2, X } from "lucide-react";
import { reviseDraft, saveDraft } from "@/lib/actions";
import { describeIssue, validateDraft, type AiDraft } from "@/lib/draft-schema";
import type { User } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

type DraftProject = AiDraft["projects"][number];
type DraftTask = DraftProject["tasks"][number];
const editable = "min-w-0 rounded-md border border-transparent bg-transparent px-2 py-1.5 outline-none hover:bg-muted/60 focus:border-ring focus:bg-background focus:ring-2 focus:ring-ring/20 disabled:opacity-60";
const select = `${editable} w-full border-border bg-background text-sm`;

export function DraftReview({ initialDraft, directory }: { initialDraft: AiDraft; directory: User[] }) {
  const [draft, setDraft] = useState(initialDraft);
  const [history, setHistory] = useState<AiDraft[]>([]);
  const [open, setOpen] = useState(true);
  const [view, setView] = useState<"board" | "list">("board");
  const [aiOpen, setAiOpen] = useState(false);
  const [instructions, setInstructions] = useState("");
  const [revision, setRevision] = useState("");
  const [error, setError] = useState("");
  const [saving, startSave] = useTransition();
  const [revising, startRevision] = useTransition();
  const [saved, setSaved] = useState(false);
  const router = useRouter();
  const busy = saving || revising || saved;
  const managers = directory.filter(user => user.role === "MANAGER");
  const members = directory.filter(user => user.role === "AGENT");
  const validation = validateDraft(draft, directory);
  const taskCount = draft.projects.reduce((sum, project) => sum + project.tasks.length, 0);
  const hours = draft.projects.reduce((sum, project) => sum + project.tasks.reduce((total, task) => total + (Number(task.estimatedHours) || 0), 0), 0);

  function change(next: AiDraft) {
    setHistory(previous => [...previous.slice(-19), draft]);
    setDraft(next); setError(""); setRevision("");
  }
  function updateProject(index: number, patch: Partial<DraftProject>) {
    change({ projects: draft.projects.map((project, pi) => pi === index ? { ...project, ...patch } : project) });
  }
  function updateTask(pi: number, ti: number, patch: Partial<DraftTask>) {
    updateProject(pi, { tasks: draft.projects[pi].tasks.map((task, index) => index === ti ? { ...task, ...patch } : task) });
  }
  function undo() {
    const previous = history.at(-1);
    if (previous) { setDraft(previous); setHistory(history.slice(0, -1)); setRevision(""); setError(""); }
  }
  function askDeepSeek() {
    if (busy || instructions.trim().length < 3) return;
    setError("");
    startRevision(async () => {
      try {
        const next = await reviseDraft(JSON.stringify(draft), instructions);
        change(next);
        setRevision("DeepSeek updated the draft. Review the changes before approving. Use Undo to restore the previous version.");
        setInstructions("");
      } catch (e) { setError(e instanceof Error ? e.message : "DeepSeek could not revise the draft. Please try again."); }
    });
  }
  function approve() {
    if (busy || validation.issues.length) return;
    setError("");
    startSave(async () => {
      try {
        const result = await saveDraft(JSON.stringify(draft));
        setSaved(true);
        toast.success(`Created ${result.projects} projects and ${result.tasks} tasks`);
        router.push("/projects"); router.refresh();
      } catch (e) { setError(e instanceof Error ? e.message : "Could not save. Your draft is still here."); }
    });
  }

  return <>
    <Card className="gap-4 p-5">
      <div className="flex items-center gap-2 text-success"><CheckCircle2 className="size-4" /><h3 className="font-semibold">Your draft is ready to review</h3></div>
      <p className="text-sm text-muted-foreground">{draft.projects.length} projects · {taskCount} tasks · {hours}h estimated effort</p>
      <div className="divide-y rounded-lg border">
        {draft.projects.map((project, index) => <button type="button" key={index} className="flex w-full items-center gap-3 p-3 text-left hover:bg-muted/50" onClick={() => setOpen(true)}>
          <FolderKanban className="size-4 shrink-0 text-muted-foreground" /><span className="min-w-0 flex-1 truncate font-medium">{project.name || "Untitled project"}</span><span className="text-xs text-muted-foreground">{project.tasks.length} tasks</span>
        </button>)}
      </div>
      <Button onClick={() => setOpen(true)}><ArrowUpRight className="size-4" />Open full review</Button>
      <p className="text-xs text-muted-foreground">Edit the draft yourself or ask DeepSeek for changes, then approve it.</p>
    </Card>
    <Dialog open={open} onOpenChange={next => { if (!busy) setOpen(next); }}>
      <DialogContent showCloseButton={false} className="flex h-[94dvh] w-[96vw] max-w-[96vw] flex-col gap-0 overflow-hidden p-0 sm:max-w-[1440px]">
        <header className="flex shrink-0 items-start justify-between gap-3 border-b px-4 py-4 sm:px-6">
          <div className="min-w-0"><DialogTitle className="flex items-center gap-2 text-lg"><FolderKanban className="size-5 text-muted-foreground" />Review your draft</DialogTitle>
            <DialogDescription className="mt-1.5 text-xs sm:text-sm">Edit any field below. Projects and tasks are created only when you approve.</DialogDescription></div>
          <Button size="icon-sm" variant="ghost" aria-label="Close review" disabled={busy} onClick={() => setOpen(false)}><X className="size-4" /></Button>
        </header>
        <div className="flex shrink-0 flex-wrap items-center gap-2 border-b px-4 py-2.5 sm:px-6">
          <div className="flex items-center rounded-lg bg-muted/60 p-0.5">
            <Button size="sm" variant={view === "board" ? "secondary" : "ghost"} aria-pressed={view === "board"} onClick={() => setView("board")}><Columns3 className="size-3.5" />Board</Button>
            <Button size="sm" variant={view === "list" ? "secondary" : "ghost"} aria-pressed={view === "list"} onClick={() => setView("list")}><List className="size-3.5" />List</Button>
          </div>
          <span className="hidden text-xs text-muted-foreground lg:block">{draft.projects.length} projects · {taskCount} tasks · {hours}h</span>
          <div className="ml-auto flex gap-1.5">
            <Button size="sm" variant="ghost" disabled={busy || !history.length} onClick={undo}><Undo2 className="size-3.5" />Undo</Button>
            <Button size="sm" variant={aiOpen ? "secondary" : "outline"} aria-expanded={aiOpen} onClick={() => setAiOpen(!aiOpen)}><Sparkles className="size-3.5" />Ask DeepSeek</Button>
          </div>
        </div>
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto lg:flex-row lg:overflow-hidden">
          <main className="min-w-0 flex-1 space-y-7 px-4 py-5 sm:px-6 lg:overflow-y-auto" aria-label="Draft projects">
            {revision && <p role="status" className="rounded-lg border border-success/30 bg-success/5 p-3 text-sm text-success">{revision}</p>}
            <fieldset disabled={busy} className="min-w-0 space-y-8">
              {draft.projects.map((project, pi) => <section key={pi} data-draft-project={pi} className="min-w-0 border-b pb-7 last:border-0">
                <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground"><FolderKanban className="size-3.5" />Project {pi + 1}<span className="rounded bg-muted px-1.5 py-0.5">Draft</span>
                  <Button variant="ghost" size="icon-sm" className="ml-auto" aria-label={`Remove project ${pi + 1}`} onClick={() => change({ projects: draft.projects.filter((_, index) => index !== pi) })}><Trash2 className="size-3.5" /></Button>
                </div>
                <textarea rows={1} aria-label={`Project ${pi + 1} name`} value={project.name} maxLength={160} placeholder="Untitled project" className={`${editable} field-sizing-content block w-full resize-none text-xl font-semibold tracking-tight sm:text-2xl`} onChange={event => updateProject(pi, { name: event.target.value })} />
                <textarea aria-label={`Project ${pi + 1} description`} value={project.description} maxLength={5000} rows={1} placeholder="Add a project description…" className={`${editable} field-sizing-content mt-1 block w-full resize-y text-sm leading-relaxed text-muted-foreground`} onChange={event => updateProject(pi, { description: event.target.value })} />
                <div className="mt-3 grid gap-3 rounded-lg bg-muted/30 p-3 sm:grid-cols-3">
                  <Property label="Client"><input aria-label={`Project ${pi + 1} client`} className={`${editable} w-full text-sm`} value={project.clientName} maxLength={160} placeholder="Client name" onChange={event => updateProject(pi, { clientName: event.target.value })} /></Property>
                  <Property label="Project manager"><select aria-label={`Project ${pi + 1} manager`} className={select} value={project.managerId} onChange={event => updateProject(pi, { managerId: event.target.value })}><option value="">Choose a manager</option>{managers.map(user => <option key={user.id} value={user.id}>{user.name}</option>)}</select></Property>
                  <Property label="Deadline"><input aria-label={`Project ${pi + 1} deadline`} type="date" value={project.deadline} className={`${editable} w-full text-sm`} onChange={event => updateProject(pi, { deadline: event.target.value })} /></Property>
                </div>
                <div className="mt-5 mb-3 flex items-center gap-2"><h3 className="text-sm font-medium">Tasks</h3><span className="text-xs text-muted-foreground">{project.tasks.length}</span><span className="ml-auto text-xs text-muted-foreground">Start in To do</span></div>
                <div className={view === "board" ? "grid min-w-0 gap-3 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_minmax(0,1fr)]" : "min-w-0"}>
                  <div className={view === "board" ? "min-w-0 space-y-3 rounded-xl bg-muted/35 p-3" : "min-w-0 space-y-3"}>
                    {view === "board" && <ColumnLabel icon={<Circle className="size-3.5" />} label="To do" count={project.tasks.length} />}
                    {project.tasks.map((task, ti) => <article key={ti} data-draft-task={`${pi}-${ti}`} className="min-w-0 rounded-lg border bg-card p-3 shadow-xs">
                      <div className="flex items-start gap-1"><textarea rows={2} aria-label={`Project ${pi + 1} task ${ti + 1} title`} value={task.title} maxLength={160} placeholder="Task name" className={`${editable} w-full flex-1 resize-y text-sm font-medium`} onChange={event => updateTask(pi, ti, { title: event.target.value })} /><Button variant="ghost" size="icon-sm" aria-label={`Remove project ${pi + 1} task ${ti + 1}`} onClick={() => updateProject(pi, { tasks: project.tasks.filter((_, index) => index !== ti) })}><Trash2 className="size-3.5 text-muted-foreground" /></Button></div>
                      <textarea rows={2} aria-label={`Project ${pi + 1} task ${ti + 1} description`} value={task.description} maxLength={5000} placeholder="Add a description…" className={`${editable} w-full resize-y text-xs leading-relaxed text-muted-foreground`} onChange={event => updateTask(pi, ti, { description: event.target.value })} />
                      <div className={`mt-2 grid gap-2 ${view === "list" ? "sm:grid-cols-3" : ""}`}>
                        <Property label="Member"><select aria-label={`Project ${pi + 1} task ${ti + 1} member`} value={task.assigneeId} className={select} onChange={event => updateTask(pi, ti, { assigneeId: event.target.value })}><option value="">Choose a member</option>{members.map(user => <option key={user.id} value={user.id}>{user.name}</option>)}</select></Property>
                        <Property label="Deadline"><input aria-label={`Project ${pi + 1} task ${ti + 1} deadline`} type="date" max={project.deadline} value={task.deadline} className={`${editable} w-full border-border text-sm`} onChange={event => updateTask(pi, ti, { deadline: event.target.value })} /></Property>
                        <Property label="Hours"><input aria-label={`Project ${pi + 1} task ${ti + 1} hours`} type="number" min="0.5" step="0.5" max="10000" value={task.estimatedHours || ""} className={`${editable} w-full border-border text-sm`} onChange={event => updateTask(pi, ti, { estimatedHours: Number(event.target.value) })} /></Property>
                      </div>
                    </article>)}
                    <Button size="sm" variant="ghost" className="w-full justify-start text-muted-foreground" onClick={() => updateProject(pi, { tasks: [...project.tasks, { title: "", description: "", assigneeId: members[0]?.id ?? "", deadline: project.deadline, estimatedHours: 1 }] })}><Plus className="size-3.5" />Add task</Button>
                  </div>
                  {view === "board" && <>
                    <div className="hidden rounded-xl bg-muted/20 p-3 xl:block"><ColumnLabel icon={<Clock3 className="size-3.5" />} label="In progress" count={0} /><p className="mt-4 rounded-lg border border-dashed p-4 text-xs leading-relaxed text-muted-foreground">Move tasks here when work starts.</p></div>
                    <div className="hidden rounded-xl bg-muted/20 p-3 xl:block"><ColumnLabel icon={<CheckCircle2 className="size-3.5 text-success" />} label="Done" count={0} /><p className="mt-4 rounded-lg border border-dashed p-4 text-xs leading-relaxed text-muted-foreground">Completed tasks will appear here.</p></div>
                  </>}
                </div>
              </section>)}
              <Button variant="outline" onClick={() => change({ projects: [...draft.projects, { name: "", clientName: "", description: "", managerId: managers[0]?.id ?? "", deadline: "", tasks: [] }] })}><Plus className="size-4" />Add project</Button>
            </fieldset>
          </main>
          {aiOpen && <aside className="order-first shrink-0 space-y-4 border-b bg-muted/20 p-4 lg:order-last lg:w-80 lg:overflow-y-auto lg:border-b-0 lg:border-l" aria-label="Revise with DeepSeek">
            <h3 className="flex items-center gap-2 font-medium"><Sparkles className="size-4" />Revise with DeepSeek</h3>
            <p className="text-xs leading-relaxed text-muted-foreground">Describe what to change. DeepSeek works from the draft you see here, including your manual edits.</p>
            <label className="block space-y-2 text-xs font-medium">Your instructions<Textarea value={instructions} onChange={event => setInstructions(event.target.value)} disabled={busy} maxLength={4000} placeholder="e.g. Split the checkout task into UI and API tasks, and move the project deadline to 30 October." className="mt-2 field-sizing-fixed min-h-36 text-sm" /></label>
            <Button className="w-full" disabled={busy || instructions.trim().length < 3 || !validation.draft} onClick={askDeepSeek}>{revising ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}{revising ? "Revising draft…" : "Update draft"}</Button>
            {!validation.draft && <p className="text-xs text-muted-foreground">Complete the missing draft fields before asking DeepSeek for changes.</p>}
            <p className="text-xs text-muted-foreground">Revisions stay in this review until you approve. Undo restores the previous draft.</p>
          </aside>}
        </div>
        <footer className="shrink-0 space-y-2 border-t bg-background px-4 py-3 sm:px-6">
          {error && <p role="alert" className="max-h-24 overflow-y-auto whitespace-pre-line text-sm text-destructive">{error}</p>}
          {validation.issues.length > 0 && <details className="max-h-28 overflow-y-auto text-xs text-destructive"><summary className="cursor-pointer font-medium"><AlertCircle className="mr-1 inline size-3.5" />{validation.issues.length} {validation.issues.length === 1 ? "detail needs" : "details need"} attention before approval</summary><ul className="mt-2 list-disc space-y-1 pl-5">{validation.issues.map((issue, index) => <li key={index}>{describeIssue(issue)}</li>)}</ul></details>}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs text-muted-foreground">{draft.projects.length} projects · {taskCount} tasks<span className="hidden sm:inline"> · {hours}h</span></span>
            <div className="flex gap-2"><Button variant="ghost" disabled={busy} onClick={() => setOpen(false)}>Review later</Button><Button onClick={approve} disabled={busy || validation.issues.length > 0}>{saving ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}{saved ? "Created" : saving ? "Creating…" : "Approve & create"}</Button></div>
          </div>
        </footer>
      </DialogContent>
    </Dialog>
  </>;
}

function Property({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="min-w-0"><div className="mb-1 px-2 text-[11px] text-muted-foreground">{label}</div>{children}</div>;
}

function ColumnLabel({ icon, label, count }: { icon: React.ReactNode; label: string; count: number }) {
  return <div className="mb-2 flex items-center gap-2 text-xs font-medium">{icon}{label}<span className="ml-1 text-muted-foreground">{count}</span></div>;
}

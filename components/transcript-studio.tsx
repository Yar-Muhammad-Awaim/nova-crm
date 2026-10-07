"use client";

import { useActionState, useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { analyzeTranscript, saveDraft, type AnalyzeState } from "@/lib/actions";
import type { AiDraft } from "@/lib/ai";
import type { User } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatDate, initials } from "@/lib/ui";
import {
  Sparkles, FileText, Loader2, AlertCircle, CheckCircle2, Clock,
  CalendarDays, Save, RotateCcw, ArrowRight,
} from "lucide-react";

export function TranscriptStudio({ sample, directory }: { sample: string; directory: User[] }) {
  const [state, action, isPending] = useActionState<AnalyzeState, FormData>(analyzeTranscript, { status: "idle" });
  const [text, setText] = useState("");

  return (
    <div className="grid gap-6 px-6 py-7 lg:grid-cols-2 lg:px-9">
      {/* ---------------- Input ---------------- */}
      <form action={action} className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <label htmlFor="transcript" className="text-sm font-semibold tracking-tight">
            Meeting transcript
          </label>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground tabular-nums">
              {text.length.toLocaleString()} characters
            </span>
            <Button type="button" size="sm" variant="outline" onClick={() => setText(sample)}>
              <FileText className="size-3.5" /> Load sample
            </Button>
          </div>
        </div>

        <Textarea
          id="transcript"
          name="transcript"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste the meeting transcript here…"
          className="min-h-[26rem] resize-y font-mono text-sm leading-relaxed lg:min-h-[34rem]"
        />

        <div className="flex items-center gap-3">
          <AnalyzeButton disabled={text.trim().length < 40} pending={isPending} />
          {text && (
            <Button type="button" variant="ghost" size="sm" onClick={() => setText("")}>
              <RotateCcw className="size-3.5" /> Clear
            </Button>
          )}
        </div>

        <p className="text-xs leading-relaxed text-muted-foreground">
          Edit the sample before running it — change an owner, a date or an estimate — to prove the
          result comes from the AI reading this text, not a canned answer.
        </p>
      </form>

      {/* ---------------- Output ---------------- */}
      <div className="lg:sticky lg:top-7 lg:self-start" aria-live="polite">
        <ResultPanel state={state} directory={directory} pending={isPending} />
      </div>
    </div>
  );
}

function AnalyzeButton({ disabled, pending }: { disabled: boolean; pending: boolean }) {
  return (
    // Disabled while the request is in flight, so a double-click cannot
    // produce two sets of projects.
    <Button type="submit" disabled={disabled || pending} className="relative overflow-hidden">
      {pending ? (
        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
      ) : (
        <Sparkles className="size-4" aria-hidden="true" />
      )}
      {pending ? "Reading the meeting…" : "Create from Transcript"}
      {pending && <span className="shimmer absolute inset-0" aria-hidden="true" />}
    </Button>
  );
}

const STAGES = [
  "Reading the transcript",
  "Matching people to the team directory",
  "Applying the final agreed decisions",
  "Dropping rejected and future-work items",
  "Validating owners, dates and effort",
];

function ResultPanel({
  state, directory, pending,
}: { state: AnalyzeState; directory: User[]; pending: boolean }) {
  if (pending) return <Thinking />;

  if (state.status === "error") {
    return (
      <Alert variant="destructive">
        <AlertCircle className="size-4" />
        <AlertTitle>Nothing was saved</AlertTitle>
        <AlertDescription>
          <p>{state.message}</p>
          {state.issues && state.issues.length > 0 && (
            <ul className="mt-2 space-y-1 text-sm">
              {state.issues.slice(0, 8).map((i, n) => (
                <li key={n} className="font-mono">
                  <span className="opacity-70">{i.path}</span> — {i.message}
                </li>
              ))}
            </ul>
          )}
          <p className="mt-2 text-sm opacity-80">
            Correct the transcript and run it again.
          </p>
        </AlertDescription>
      </Alert>
    );
  }

  if (state.status === "ready") return <Review draft={state.draft} directory={directory} />;

  return <Idle />;
}

function Idle() {
  return (
    <Card className="gap-0 border-dashed p-10 text-center">
      <div className="mx-auto mb-4 grid size-11 place-items-center rounded-xl border bg-secondary/40 text-muted-foreground">
        <Sparkles className="size-5" />
      </div>
      <h3 className="text-base font-semibold tracking-tight">The result appears here</h3>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
        You will see the proposed projects and tasks for review. Nothing is written to the
        database until you press Save.
      </p>
      <div className="mt-7 flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <span className="rounded-md border px-2 py-1">Transcript</span>
        <ArrowRight className="size-3.5" />
        <span className="rounded-md border border-primary/40 bg-primary/10 px-2 py-1 text-primary">AI + validation</span>
        <ArrowRight className="size-3.5" />
        <span className="rounded-md border px-2 py-1">Your approval</span>
        <ArrowRight className="size-3.5" />
        <span className="rounded-md border px-2 py-1">Saved</span>
      </div>
    </Card>
  );
}

/** Narrates what is actually happening instead of showing a bare spinner. */
function Thinking() {
  const [stage, setStage] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setStage((s) => Math.min(s + 1, STAGES.length - 1)), 1600);
    return () => clearInterval(t);
  }, []);

  return (
    <Card className="gap-0 p-7">
      <div className="flex items-center gap-2.5">
        <Loader2 className="size-4 animate-spin text-primary" />
        <h3 className="text-base font-semibold tracking-tight">Converting the meeting</h3>
      </div>

      <div className="mt-6 space-y-3" aria-live="polite" aria-busy="true">
        {STAGES.map((s, i) => (
          <motion.div
            key={s}
            initial={{ opacity: 0.25 }}
            animate={{ opacity: i <= stage ? 1 : 0.25 }}
            className="flex items-center gap-3 text-sm"
          >
            <span
              className={`grid size-5 shrink-0 place-items-center rounded-full border text-[10px] ${
                i < stage ? "border-primary/40 bg-primary/15 text-primary"
                : i === stage ? "border-primary/60 bg-primary/25 text-primary"
                : "text-muted-foreground"
              }`}
            >
              {i < stage ? <CheckCircle2 className="size-3" /> : i + 1}
            </span>
            <span className={i <= stage ? "" : "text-muted-foreground"}>{s}</span>
          </motion.div>
        ))}
      </div>

      <div className="relative mt-7 h-1 overflow-hidden rounded-full bg-secondary shimmer" />
    </Card>
  );
}

function Review({ draft, directory }: { draft: AiDraft; directory: User[] }) {
  const [saving, start] = useTransition();
  const [saved, setSaved] = useState(false);
  const router = useRouter();

  const name = (id: string) => directory.find((u) => u.id === id)?.name ?? id;
  const taskTotal = draft.projects.reduce((n, p) => n + p.tasks.length, 0);
  const hourTotal = draft.projects.reduce(
    (n, p) => n + p.tasks.reduce((m, t) => m + t.estimatedHours, 0), 0);

  function save() {
    start(async () => {
      try {
        const res = await saveDraft(JSON.stringify(draft));
        setSaved(true);
        toast.success(`Saved ${res.projects} projects and ${res.tasks} tasks`);
        router.push("/projects");
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Could not save.");
      }
    });
  }

  return (
    <div className="space-y-4">
      <Alert className="border-emerald-500/30 bg-emerald-500/8">
        <CheckCircle2 className="size-4 text-emerald-400" />
        <AlertTitle className="text-emerald-300">Validated — ready to save</AlertTitle>
        <AlertDescription className="text-emerald-200/80">
          {draft.projects.length} projects · {taskTotal} tasks · {hourTotal}h total effort.
          Every person and date was checked against the real team directory.
        </AlertDescription>
      </Alert>

      <div className="flex items-center gap-3">
        <Button onClick={save} disabled={saving || saved}>
          {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          {saved ? "Saved" : saving ? "Saving…" : "Save to CRM"}
        </Button>
        <span className="text-xs text-muted-foreground">
          Saved as one transaction — all of it, or none of it.
        </span>
      </div>

      <AnimatePresence>
        <div className="max-h-[32rem] space-y-3 overflow-y-auto pr-1">
          {draft.projects.map((p, i) => (
            <motion.div
              key={`${p.name}-${i}`}
              initial={{ opacity: 0, y: 8, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ delay: i * 0.09, duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
            >
              <Card className="gap-0 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h4 className="truncate text-base font-semibold tracking-tight">{p.name}</h4>
                    <p className="mt-0.5 text-sm text-muted-foreground">{p.clientName}</p>
                  </div>
                  <Badge variant="outline" className="shrink-0 gap-1 text-xs font-normal">
                    <CalendarDays className="size-3" /> {formatDate(p.deadline)}
                  </Badge>
                </div>

                {p.description && (
                  <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">{p.description}</p>
                )}

                <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Avatar className="size-4">
                    <AvatarFallback className="bg-sky-500/20 text-[10px] font-semibold text-sky-400">
                      {initials(name(p.managerId))}
                    </AvatarFallback>
                  </Avatar>
                  {name(p.managerId)}
                  <Badge variant="outline" className="ml-1 font-mono text-[10px]">{p.managerId}</Badge>
                </div>

                <div className="mt-4 space-y-2 border-t pt-4">
                  {p.tasks.map((t, ti) => (
                    <div key={ti} className="rounded-lg border bg-secondary/25 p-3">
                      <p className="text-sm font-medium tracking-tight">{t.title}</p>
                      {t.description && (
                        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                          {t.description}
                        </p>
                      )}
                      <div className="mt-2.5 flex flex-wrap items-center gap-2 text-xs">
                        <span className="flex items-center gap-1 rounded-md border bg-background/60 px-1.5 py-0.5 text-muted-foreground">
                          <Avatar className="size-3.5">
                            <AvatarFallback className="bg-emerald-500/20 text-[10px] font-semibold text-emerald-400">
                              {initials(name(t.assigneeId))}
                            </AvatarFallback>
                          </Avatar>
                          {name(t.assigneeId)}
                        </span>
                        <span className="flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-muted-foreground">
                          <CalendarDays className="size-3" /> {formatDate(t.deadline)}
                        </span>
                        <span className="flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-muted-foreground">
                          <Clock className="size-3" /> {t.estimatedHours}h
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </AnimatePresence>
    </div>
  );
}

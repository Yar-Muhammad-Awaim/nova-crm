"use client";

import { useActionState, useState, useEffect } from "react";
import { motion } from "motion/react";
import { analyzeTranscript, type AnalyzeState } from "@/lib/actions";
import { DraftReview } from "@/components/draft-review";
import type { User } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Sparkles, FileText, Loader2, AlertCircle, CheckCircle2,
  RotateCcw, ArrowRight,
} from "lucide-react";

export function TranscriptStudio({ sample, directory }: { sample: string; directory: User[] }) {
  const [state, action, isPending] = useActionState<AnalyzeState, FormData>(analyzeTranscript, { status: "idle" });
  const [text, setText] = useState("");

  return (
    <div>
      <div className="sticky top-14 z-20 flex flex-wrap items-center gap-2 border-b bg-background/95 px-5 py-3 backdrop-blur sm:px-8 lg:top-0 lg:px-9">
        <AnalyzeButton form="transcript-form" disabled={text.trim().length < 40} pending={isPending} />
        <Button type="button" size="sm" variant="outline" disabled={isPending} onClick={() => setText(sample)}>
          <FileText className="size-3.5" /> Load sample
        </Button>
        {text && <Button type="button" variant="ghost" size="sm" disabled={isPending} onClick={() => setText("")}>
          <RotateCcw className="size-3.5" /> Clear
        </Button>}
        <span className="ml-auto hidden text-xs text-muted-foreground sm:inline">Ctrl / ⌘ + Enter to create a draft</span>
      </div>
      <div className="grid items-start gap-5 px-5 py-4 sm:px-8 lg:grid-cols-2 lg:px-9">
      {/* ---------------- Input ---------------- */}
      <form id="transcript-form" action={action} className="flex min-w-0 flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <label htmlFor="transcript" className="text-sm font-semibold tracking-tight">
            Meeting transcript
          </label>
          <span className="text-xs text-muted-foreground tabular-nums">{text.length.toLocaleString()} characters</span>
        </div>

        <Textarea
          id="transcript"
          name="transcript"
          value={text}
          readOnly={isPending}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(event) => {
            if ((event.ctrlKey || event.metaKey) && event.key === "Enter" && !event.nativeEvent.isComposing) {
              event.preventDefault();
              if (!isPending && text.trim().length >= 40) event.currentTarget.form?.requestSubmit();
            }
          }}
          placeholder="Paste the meeting transcript here…"
          className="field-sizing-fixed h-[clamp(16rem,calc(100dvh-20rem),34rem)] min-h-48 resize-y overflow-y-auto font-mono text-sm leading-relaxed"
        />

        <p className="text-xs leading-relaxed text-muted-foreground">
          Paste your meeting notes or load the sample. You can edit projects, owners, dates and estimates in the review.
        </p>
      </form>

      {/* ---------------- Output ---------------- */}
      <div className="min-w-0 space-y-2.5 lg:sticky lg:top-20" aria-live="polite">
        <h2 className="text-sm font-semibold tracking-tight">Draft preview</h2>
        <ResultPanel state={state} directory={directory} pending={isPending} />
      </div>
      </div>
    </div>
  );
}
function AnalyzeButton({ disabled, pending, form }: { disabled: boolean; pending: boolean; form?: string }) {
  return (
    // Disabled while the request is in flight, so a double-click cannot
    // produce two sets of projects.
    <Button type="submit" form={form} disabled={disabled || pending} className="relative overflow-hidden">
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

  if (state.status === "ready") return <DraftReview initialDraft={state.draft} directory={directory} />;

  return <Idle />;
}

function Idle() {
  return (
    <Card className="gap-0 border-dashed px-5 py-8 text-center">
      <div className="mx-auto mb-4 grid size-11 place-items-center rounded-xl border bg-secondary/40 text-muted-foreground">
        <Sparkles className="size-5" />
      </div>
      <h3 className="text-base font-semibold tracking-tight">The result appears here</h3>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
        You will see the proposed projects and tasks for review. Nothing is written to the
        database until you approve the draft.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground">
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

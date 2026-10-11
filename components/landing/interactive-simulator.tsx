"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  CheckCircle2,
  Clock,
  CalendarDays,
  ShieldCheck,
  UserCheck,
  Layers,
  ArrowRight,
  Database,
  Terminal,
  Cpu,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SIMULATOR_SCENARIOS } from "@/lib/content/landing";
import { SectionHeading, EASE } from "./primitives";

export function InteractiveSimulator() {
  const [selectedId, setSelectedId] = useState<string>("urbancart");
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [stageIndex, setStageIndex] = useState<number>(3); // Default to completed state for instant exploration

  const scenario = SIMULATOR_SCENARIOS.find((s) => s.id === selectedId) ?? SIMULATOR_SCENARIOS[0];

  function runSimulation(targetId?: string) {
    if (targetId) setSelectedId(targetId);
    setIsSynthesizing(true);
    setStageIndex(0);

    const stepInterval = 450;
    const interval = setInterval(() => {
      setStageIndex((prev) => {
        if (prev >= scenario.stages.length - 1) {
          clearInterval(interval);
          setIsSynthesizing(false);
          return scenario.stages.length - 1;
        }
        return prev + 1;
      });
    }, stepInterval);
  }

  return (
    <section id="simulator" className="scroll-mt-24 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionHeading
          eyebrow="Interactive Engine Sandbox"
          title={
            <>
              Experience the <em className="italic text-primary">Autonomous Engine</em> Live.
            </>
          }
          sub="Test how NovaWorks compiles unstructured, messy stakeholder speech into verified relational project graphs with zero hallucinated scope."
        />

        {/* Scenario Selector Pills */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          {SIMULATOR_SCENARIOS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => runSimulation(s.id)}
              className={`group relative flex items-center gap-2.5 rounded-xl border px-4 py-2.5 text-xs font-medium transition-all sm:text-sm ${
                selectedId === s.id
                  ? "border-primary/60 bg-primary/10 text-foreground shadow-sm shadow-primary/10"
                  : "border-border/60 bg-card/40 text-muted-foreground hover:border-primary/30 hover:text-foreground"
              }`}
            >
              <Cpu className={`size-3.5 ${selectedId === s.id ? "text-primary" : "text-muted-foreground"}`} />
              <span className="font-medium">{s.title}</span>
              <span className="hidden rounded-full border border-border/80 bg-background/80 px-2 py-0.5 text-[10px] text-muted-foreground sm:inline">
                {s.tag}
              </span>
            </button>
          ))}
        </div>

        {/* Live Simulator Workspace */}
        <div className="mt-8 grid gap-5 lg:grid-cols-12">
          {/* Left Panel: Raw Audio Transcript */}
          <div className="hairline flex flex-col overflow-hidden rounded-2xl border bg-card/60 backdrop-blur-sm lg:col-span-5">
            <div className="flex items-center justify-between border-b border-border/60 bg-muted/20 px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-mono text-xs font-medium tracking-wider text-muted-foreground uppercase">
                  Raw Stakeholder Stream
                </span>
              </div>
              <Badge variant="outline" className="font-mono text-[10px] text-muted-foreground">
                {scenario.client}
              </Badge>
            </div>

            <div className="flex-1 p-4 font-mono text-xs leading-relaxed text-muted-foreground sm:p-5">
              <pre className="whitespace-pre-wrap font-mono text-xs leading-6 text-foreground/90 selection:bg-primary/20">
                {scenario.transcriptSample}
              </pre>
            </div>

            <div className="border-t border-border/60 bg-muted/10 p-4">
              <Button
                type="button"
                className="w-full relative overflow-hidden"
                disabled={isSynthesizing}
                onClick={() => runSimulation()}
              >
                {isSynthesizing ? (
                  <>
                    <RefreshCw className="size-4 animate-spin" />
                    <span>Synthesizing Relational Graph…</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="size-4" />
                    <span>Re-Run Synthesis Pipeline</span>
                  </>
                )}
                {isSynthesizing && <span className="shimmer absolute inset-0" aria-hidden="true" />}
              </Button>
            </div>
          </div>

          {/* Right Panel: Synthesis Engine & Resulting Graph */}
          <div className="hairline flex flex-col overflow-hidden rounded-2xl border bg-card/70 backdrop-blur-sm lg:col-span-7">
            {/* Telemetry Stage Progress */}
            <div className="border-b border-border/60 bg-muted/30 px-5 py-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Terminal className="size-3.5 text-primary" />
                  <span className="font-mono text-xs font-semibold text-foreground">
                    Deterministic Synthesis Pipeline
                  </span>
                </div>
                <span className="font-mono text-[11px] text-primary tabular-nums">
                  Stage {stageIndex + 1}/{scenario.stages.length}
                </span>
              </div>

              {/* Progress bar */}
              <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                <motion.div
                  className="h-full bg-gradient-to-r from-primary to-chart-2"
                  initial={false}
                  animate={{ width: `${((stageIndex + 1) / scenario.stages.length) * 100}%` }}
                  transition={{ duration: 0.35, ease: EASE }}
                />
              </div>

              <p className="mt-2 font-mono text-[11px] text-muted-foreground truncate">
                {scenario.stages[stageIndex]}
              </p>
            </div>

            {/* Compiled Execution Graph Output */}
            <div className="flex-1 p-5 sm:p-6 space-y-5">
              <AnimatePresence mode="wait">
                <motion.div
                  key={scenario.id + (isSynthesizing ? "-loading" : "-ready")}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3, ease: EASE }}
                  className="space-y-4"
                >
                  {/* Project Header Card */}
                  <div className="rounded-xl border border-border/80 bg-background/60 p-4 sm:p-5 shadow-xs">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <Layers className="size-4 text-primary" />
                          <h3 className="font-display text-lg tracking-tight font-semibold sm:text-xl">
                            {scenario.extractedProject.name}
                          </h3>
                        </div>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          Client: <span className="text-foreground font-medium">{scenario.extractedProject.client}</span>
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline" className="gap-1 border-primary/30 bg-primary/10 text-primary text-xs">
                          <CalendarDays className="size-3" />
                          Due: {scenario.extractedProject.deadline}
                        </Badge>
                        <Badge variant="outline" className="gap-1 text-xs">
                          <Clock className="size-3" />
                          {scenario.extractedProject.totalHours} hrs Total
                        </Badge>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center gap-2 border-t border-border/60 pt-3 text-xs text-muted-foreground">
                      <span className="font-mono text-[11px] uppercase tracking-wider text-manager">Manager:</span>
                      <span className="font-medium text-foreground">{scenario.extractedProject.manager}</span>
                      <span className="ml-auto font-mono text-[11px] text-emerald-500 flex items-center gap-1">
                        <CheckCircle2 className="size-3" /> Staff ID Verified
                      </span>
                    </div>
                  </div>

                  {/* Discrete Tasks List */}
                  <div>
                    <div className="mb-2.5 flex items-center justify-between text-xs font-mono text-muted-foreground">
                      <span>Compiled Workstream Tasks ({scenario.extractedProject.tasks.length})</span>
                      <span>Verified Effort & Assignee</span>
                    </div>

                    <div className="space-y-2">
                      {scenario.extractedProject.tasks.map((task, i) => (
                        <motion.div
                          key={task.title}
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.25, delay: i * 0.06, ease: EASE }}
                          className="hairline flex flex-wrap items-center justify-between gap-2.5 rounded-lg border bg-background/40 px-3.5 py-2.5 hover:border-primary/40 transition-colors"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-foreground sm:text-sm truncate">
                              {task.title}
                            </p>
                            <p className="font-mono text-[11px] text-muted-foreground">
                              {task.assignee} · <span className="text-primary/90">{task.role}</span>
                            </p>
                          </div>

                          <div className="flex items-center gap-2 font-mono text-xs">
                            <span className="rounded-md border border-border/70 bg-muted/40 px-2 py-0.5 text-[11px] tabular-nums">
                              {task.hours}h
                            </span>
                            <span className="hidden text-[11px] text-muted-foreground sm:inline">
                              {task.deadline}
                            </span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Defensibility Verification Pills */}
                  <div className="grid grid-cols-2 gap-2 pt-1 sm:grid-cols-4">
                    <div className="flex items-center gap-1.5 rounded-lg border border-border/70 bg-card/40 p-2 text-[11px]">
                      <UserCheck className="size-3.5 text-emerald-400 shrink-0" />
                      <span className="text-muted-foreground truncate">100% Staff Grounded</span>
                    </div>
                    <div className="flex items-center gap-1.5 rounded-lg border border-border/70 bg-card/40 p-2 text-[11px]">
                      <Database className="size-3.5 text-primary shrink-0" />
                      <span className="text-muted-foreground truncate">Postgres ACID Ready</span>
                    </div>
                    <div className="flex items-center gap-1.5 rounded-lg border border-border/70 bg-card/40 p-2 text-[11px]">
                      <ShieldCheck className="size-3.5 text-chart-2 shrink-0" />
                      <span className="text-muted-foreground truncate">Cryptographic RBAC</span>
                    </div>
                    <div className="flex items-center gap-1.5 rounded-lg border border-border/70 bg-card/40 p-2 text-[11px]">
                      <CheckCircle2 className="size-3.5 text-emerald-400 shrink-0" />
                      <span className="text-muted-foreground truncate">Zero Scope Leakage</span>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Bottom Direct CTA */}
            <div className="border-t border-border/60 bg-muted/15 p-4 flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs text-muted-foreground">
                Ready to explore the full interactive project board?
              </span>
              <Button size="sm" nativeButton={false} render={<Link href="/login" />}>
                <span>Enter Live Workspace</span>
                <ArrowRight className="size-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

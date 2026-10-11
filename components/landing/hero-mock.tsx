"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useInView, useReducedMotion } from "motion/react";
import {
  CalendarDays,
  Clock,
  ListChecks,
  Sparkles,
  Terminal,
  Layers,
  CheckCircle2,
} from "lucide-react";
import { MOCK_LINES, MOCK_CARDS } from "@/lib/content/landing";
import { EASE } from "./primitives";

const STEP_MS = 1600;

export function HeroMock() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "0px 0px -20% 0px" });
  const reduce = useReducedMotion();
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!inView || reduce) return;
    const id = setInterval(
      () => setStep((s) => (s + 1) % (MOCK_LINES.length + 2)),
      STEP_MS
    );
    return () => clearInterval(id);
  }, [inView, reduce]);

  const active = reduce ? MOCK_LINES.length : step;
  const cardsShown = reduce
    ? MOCK_CARDS.length
    : MOCK_LINES.slice(0, active + 1).filter((l) => l.emits !== undefined).length;

  return (
    <div
      ref={ref}
      className="hairline rounded-3xl border border-border/80 bg-card/60 p-2 sm:p-3 shadow-2xl shadow-primary/5 backdrop-blur-xl"
    >
      {/* Top Application Bar */}
      <div className="flex items-center justify-between border-b border-border/60 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="size-2.5 rounded-full bg-destructive/60" />
            <span className="size-2.5 rounded-full bg-chart-5/60" />
            <span className="size-2.5 rounded-full bg-success/60" />
          </div>
          <span className="ml-3 font-mono text-[11px] text-muted-foreground flex items-center gap-1.5">
            <Terminal className="size-3 text-primary" />
            <span>novaworks.engine · live extraction telemetry</span>
          </span>
        </div>

        <div className="flex items-center gap-3 font-mono text-[11px] text-muted-foreground">
          <span className="hidden sm:inline-flex items-center gap-1 text-emerald-400">
            <CheckCircle2 className="size-3" />
            PostgreSQL 17 ACID
          </span>
          <span className="tabular">100% Deterministic</span>
        </div>
      </div>

      <div className="grid gap-4 p-3 lg:grid-cols-[1.1fr_1fr]">
        {/* ---------------- Transcript Stream ---------------- */}
        <div className="hairline overflow-hidden rounded-2xl border bg-card/80 backdrop-blur-sm">
          <div className="hairline flex items-center justify-between border-b bg-muted/20 px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-primary animate-pulse" />
              <span className="font-mono text-[11px] tracking-wider text-muted-foreground uppercase font-semibold">
                Incoming Transcript Stream
              </span>
            </div>
            <span className="font-mono text-[11px] text-muted-foreground tabular">
              09:00–10:00 AM (60 min)
            </span>
          </div>

          <ul className="space-y-1.5 p-3.5">
            {MOCK_LINES.map((l, i) => {
              const on = i <= active;
              const current = i === active;
              return (
                <li
                  key={i}
                  className={`rounded-lg px-3 py-2 transition-all duration-400 ${
                    current
                      ? "border border-primary/40 bg-primary/10 shadow-xs"
                      : on
                        ? "bg-transparent"
                        : "opacity-40"
                  }`}
                >
                  <p className="text-[12.5px] leading-relaxed">
                    <span
                      className={`font-mono text-[11px] font-semibold ${
                        current ? "text-primary" : "text-muted-foreground"
                      }`}
                    >
                      {l.speaker}:
                    </span>{" "}
                    <span
                      className={`transition-colors duration-400 ${
                        on ? "text-foreground" : "text-muted-foreground"
                      }`}
                    >
                      {l.text}
                    </span>
                  </p>
                </li>
              );
            })}
          </ul>
        </div>

        {/* ---------------- Emitted CRM Projects ---------------- */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-1.5">
              <Sparkles className="size-3.5 text-primary" aria-hidden="true" />
              <span className="font-mono text-[11px] tracking-wider text-foreground uppercase font-semibold">
                Compiled Projects in CRM
              </span>
            </div>
            <span className="font-mono text-[10px] text-muted-foreground">
              {cardsShown} of {MOCK_CARDS.length} resolved
            </span>
          </div>

          <AnimatePresence mode="popLayout">
            {MOCK_CARDS.slice(0, cardsShown).map((c) => (
              <motion.article
                key={c.project}
                layout
                initial={{ opacity: 0, x: 18, filter: "blur(5px)" }}
                animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, x: 18 }}
                transition={{ duration: 0.45, ease: EASE }}
                className="hairline rounded-xl border border-border/80 bg-background/80 p-4 shadow-sm hover:border-primary/40 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <Layers className="size-3.5 text-primary shrink-0" />
                      <h3 className="truncate text-sm font-semibold tracking-tight text-foreground">
                        {c.project}
                      </h3>
                    </div>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      Client: {c.client}
                    </p>
                  </div>
                  <span className="hairline shrink-0 rounded-md border border-manager/30 bg-manager/10 px-2 py-0.5 font-mono text-[10px] text-manager">
                    PM: {c.manager.split(" ")[0]}
                  </span>
                </div>

                <div className="mt-3.5 flex flex-wrap items-center gap-1.5">
                  <Chip icon={<ListChecks className="size-3 text-primary" />}>
                    {c.tasks} tasks
                  </Chip>
                  <Chip icon={<Clock className="size-3 text-chart-2" />}>
                    <span className="tabular font-medium">{c.hours}</span>h effort
                  </Chip>
                  <Chip icon={<CalendarDays className="size-3 text-emerald-400" />}>
                    Due {c.deadline}
                  </Chip>
                </div>
              </motion.article>
            ))}
          </AnimatePresence>

          {cardsShown === 0 && (
            <div className="hairline grid flex-1 place-items-center rounded-xl border border-dashed border-border/70 p-8 text-center bg-card/30">
              <div className="space-y-1.5">
                <span className="size-2 rounded-full bg-primary mx-auto animate-ping block" />
                <p className="text-xs font-mono text-muted-foreground">
                  Analyzing speaker boundaries…
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Chip({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <span className="hairline inline-flex items-center gap-1.5 rounded-md border border-border/60 bg-secondary/50 px-2 py-0.5 font-mono text-[11px] text-muted-foreground">
      {icon}
      {children}
    </span>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useInView, useReducedMotion } from "motion/react";
import { CalendarDays, Clock, ListChecks, Sparkles } from "lucide-react";
import { MOCK_LINES, MOCK_CARDS } from "@/lib/content/landing";
import { EASE } from "./primitives";

const STEP_MS = 1500;

/**
 * The hero's proof-of-concept: transcript lines highlight one at a time on the
 * left, and when a line that names a project lands, its card flies in on the
 * right. Pure front-end, looped.
 *
 * It pauses when scrolled out of view and is replaced by a static end-state
 * under prefers-reduced-motion.
 */
export function HeroMock() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "0px 0px -20% 0px" });
  const reduce = useReducedMotion();
  const [step, setStep] = useState(0);

  useEffect(() => {
    // Don't burn frames on an off-screen animation.
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
    <div ref={ref} className="grid gap-4 lg:grid-cols-[1.05fr_1fr]">
      {/* ---------------- Transcript ---------------- */}
      <div className="hairline overflow-hidden rounded-2xl border bg-card/70 backdrop-blur-sm">
        <div className="hairline flex items-center gap-2 border-b px-4 py-3">
          <span className="size-2 rounded-full bg-primary/70" />
          <span className="font-mono text-[11px] tracking-wider text-muted-foreground uppercase">
            Meeting transcript
          </span>
          <span className="ml-auto font-mono text-[11px] text-muted-foreground tabular">
            09:00–10:00
          </span>
        </div>

        <ul className="space-y-1 p-3">
          {MOCK_LINES.map((l, i) => {
            const on = i <= active;
            const current = i === active;
            return (
              <li
                key={i}
                className={`rounded-lg px-3 py-2.5 transition-colors duration-500 ${
                  current ? "bg-primary/12" : on ? "bg-transparent" : "bg-transparent"
                }`}
              >
                <p
                  className={`text-[13px] leading-relaxed transition-colors duration-500 ${
                    on ? "text-foreground" : "text-muted-foreground/35"
                  }`}
                >
                  <span className="font-mono text-[11px] text-primary">{l.speaker}:</span>{" "}
                  {l.text}
                </p>
              </li>
            );
          })}
        </ul>
      </div>

      {/* ---------------- Emitted project cards ---------------- */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2 px-1">
          <Sparkles className="size-3.5 text-primary" aria-hidden="true" />
          <span className="font-mono text-[11px] tracking-wider text-muted-foreground uppercase">
            Created in your CRM
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
              className="hairline rounded-xl border bg-card/80 p-4 backdrop-blur-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="truncate text-sm font-medium tracking-tight">{c.project}</h3>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">{c.client}</p>
                </div>
                <span className="hairline shrink-0 rounded-md border px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                  {c.manager.split(" ")[0]}
                </span>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                <Chip icon={<ListChecks className="size-3" />}>{c.tasks} tasks</Chip>
                <Chip icon={<Clock className="size-3" />}>
                  <span className="tabular">{c.hours}</span>h
                </Chip>
                <Chip icon={<CalendarDays className="size-3" />}>{c.deadline}</Chip>
              </div>
            </motion.article>
          ))}
        </AnimatePresence>

        {cardsShown === 0 && (
          <div className="hairline grid flex-1 place-items-center rounded-xl border border-dashed px-4 py-10 text-center">
            <p className="text-xs text-muted-foreground">Reading the meeting…</p>
          </div>
        )}
      </div>
    </div>
  );
}

function Chip({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <span className="hairline inline-flex items-center gap-1 rounded-md border bg-secondary/40 px-1.5 py-0.5 text-[11px] text-muted-foreground">
      <span aria-hidden="true">{icon}</span>
      {children}
    </span>
  );
}

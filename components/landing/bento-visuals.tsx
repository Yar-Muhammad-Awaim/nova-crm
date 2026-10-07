"use client";

import { motion } from "motion/react";
import type { Feature } from "@/lib/content/landing";

/**
 * Small looping diagrams, one per bento card. Each animates transform/opacity
 * only, and each actually depicts the thing the card claims.
 */
export function BentoVisual({ kind }: { kind: Feature["visual"] }) {
  switch (kind) {
    case "transcript":   return <TranscriptVisual />;
    case "revision":     return <RevisionVisual />;
    case "roles":        return <RolesVisual />;
    case "schedule":     return <ScheduleVisual />;
    case "atomic":       return <AtomicVisual />;
    case "persist":      return <PersistVisual />;
  }
}

const loop = { repeat: Infinity, repeatDelay: 1.6, duration: 1.1 } as const;

/** Lines on the left collapsing into cards on the right. */
function TranscriptVisual() {
  return (
    <div className="flex items-center gap-4" aria-hidden="true">
      <div className="flex-1 space-y-1.5">
        {[88, 70, 94, 62].map((w, i) => (
          <motion.div
            key={i}
            className="h-1.5 rounded-full bg-muted-foreground/25"
            style={{ width: `${w}%` }}
            animate={{ opacity: [0.25, 1, 0.25] }}
            transition={{ ...loop, delay: i * 0.18 }}
          />
        ))}
      </div>
      <svg width="22" height="12" viewBox="0 0 22 12" className="shrink-0 text-primary">
        <path d="M0 6h18m0 0-4-4m4 4-4 4" stroke="currentColor" strokeWidth="1.3" fill="none" />
      </svg>
      <div className="flex-1 space-y-1.5">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="hairline h-5 rounded border bg-primary/10"
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: [0, 1, 1, 0], x: [8, 0, 0, 8] }}
            transition={{ ...loop, duration: 2.4, delay: i * 0.22 }}
          />
        ))}
      </div>
    </div>
  );
}

/** 8h struck through, 10h taking its place. */
function RevisionVisual() {
  return (
    <div className="flex items-center gap-3 font-mono text-sm" aria-hidden="true">
      <span className="relative text-muted-foreground">
        8h
        <motion.span
          className="absolute inset-x-0 top-1/2 h-px bg-destructive"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: [0, 1, 1, 0] }}
          transition={{ ...loop, duration: 2.6 }}
          style={{ originX: 0 }}
        />
      </span>
      <svg width="18" height="10" viewBox="0 0 18 10" className="text-muted-foreground/60">
        <path d="M0 5h14m0 0-3-3m3 3-3 3" stroke="currentColor" strokeWidth="1.2" fill="none" />
      </svg>
      <motion.span
        className="rounded-md bg-primary/15 px-2 py-0.5 text-primary tabular"
        animate={{ opacity: [0.3, 1, 1, 0.3], scale: [0.96, 1, 1, 0.96] }}
        transition={{ ...loop, duration: 2.6, delay: 0.3 }}
      >
        10h
      </motion.span>
    </div>
  );
}

/** Three rows, each revealing a different amount. */
function RolesVisual() {
  const rows = [
    { label: "Admin", fill: "100%" },
    { label: "Manager", fill: "52%" },
    { label: "Developer", fill: "26%" },
  ];
  return (
    <div className="space-y-2.5" aria-hidden="true">
      {rows.map((r, i) => (
        <div key={r.label} className="flex items-center gap-3">
          <span className="w-16 shrink-0 font-mono text-[10px] text-muted-foreground">{r.label}</span>
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary">
            <motion.div
              className="h-full rounded-full bg-primary/70"
              initial={{ width: 0 }}
              whileInView={{ width: r.fill }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function ScheduleVisual() {
  return (
    <div className="flex items-end gap-1.5" aria-hidden="true">
      {[12, 8, 14, 6, 16, 10].map((h, i) => (
        <motion.div
          key={i}
          className="w-3 rounded-sm bg-primary/55"
          initial={{ scaleY: 0 }}
          whileInView={{ scaleY: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: i * 0.07, ease: [0.16, 1, 0.3, 1] }}
          style={{ height: `${h * 2.1}px`, originY: 1 }}
        />
      ))}
    </div>
  );
}

/** Twelve dots committing in one beat. */
function AtomicVisual() {
  return (
    <div className="grid w-fit grid-cols-6 gap-1.5" aria-hidden="true">
      {Array.from({ length: 12 }).map((_, i) => (
        <motion.span
          key={i}
          className="size-2 rounded-full bg-primary/65"
          animate={{ opacity: [0.2, 1, 1, 0.2], scale: [0.8, 1, 1, 0.8] }}
          transition={{ ...loop, duration: 2.2 }}
        />
      ))}
    </div>
  );
}

function PersistVisual() {
  return (
    <div className="space-y-1.5" aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="hairline h-1.5 rounded-full border bg-secondary"
          style={{ width: `${100 - i * 16}%` }}
        />
      ))}
      <motion.div
        className="mt-2 h-px bg-primary/60"
        animate={{ scaleX: [0, 1] }}
        transition={{ ...loop, duration: 1.6 }}
        style={{ originX: 0 }}
      />
    </div>
  );
}

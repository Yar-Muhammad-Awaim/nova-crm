"use client";

import { useCallback, useRef, useState } from "react";
import { CalendarDays, Clock, GripVertical } from "lucide-react";
import { BEFORE_AFTER as BA } from "@/lib/content/landing";
import { SectionHeading } from "./primitives";

/**
 * Draggable comparison. The two panes are stacked and the top one is clipped,
 * so both render in full and only `clip-path` changes — no layout work.
 * Fully keyboard operable: the handle is a slider with arrow-key support.
 */
export function BeforeAfter() {
  const ref = useRef<HTMLDivElement>(null);
  const [pct, setPct] = useState(52);
  const dragging = useRef(false);

  const setFromClientX = useCallback((clientX: number) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setPct(Math.min(96, Math.max(4, ((clientX - r.left) / r.width) * 100)));
  }, []);

  return (
    <section className="py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionHeading eyebrow={BA.eyebrow} title={BA.title} />

        <div
          ref={ref}
          className="hairline relative mt-12 min-h-[26rem] touch-none overflow-hidden rounded-2xl border bg-card/50 select-none sm:min-h-[24rem]"
          onPointerMove={(e) => dragging.current && setFromClientX(e.clientX)}
          onPointerUp={() => (dragging.current = false)}
          onPointerLeave={() => (dragging.current = false)}
        >
          {/* AFTER — full width underneath */}
          <div className="absolute inset-0 p-6 sm:p-8">
            <Label tone="primary">{BA.afterLabel}</Label>
            <div className="mt-5">
              <h3 className="font-display text-xl">{BA.after.project}</h3>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {BA.after.client} · {BA.after.manager} · due {BA.after.deadline}
              </p>
              <ul className="mt-4 space-y-2">
                {BA.after.tasks.map((t) => (
                  <li
                    key={t.title}
                    className="hairline flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg border bg-background/60 px-3.5 py-2.5"
                  >
                    <span className="text-sm font-medium">{t.title}</span>
                    <span className="font-mono text-[11px] text-muted-foreground">{t.owner}</span>
                    <span className="ml-auto flex items-center gap-2.5 font-mono text-[11px] text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="size-3" aria-hidden="true" />
                        <span className="tabular">{t.hours}</span>h
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <CalendarDays className="size-3" aria-hidden="true" />
                        {t.due}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* BEFORE — clipped on top */}
          <div
            className="absolute inset-0 bg-background p-6 sm:p-8"
            style={{ clipPath: `inset(0 ${100 - pct}% 0 0)` }}
          >
            <Label tone="muted">{BA.beforeLabel}</Label>
            <div className="mt-5 space-y-2.5">
              {BA.before.map((line, i) => (
                <p key={i} className="max-w-xl text-[13px] leading-relaxed text-muted-foreground">
                  {line}
                </p>
              ))}
            </div>
          </div>

          {/* Handle */}
          <div
            className="absolute inset-y-0 z-10 w-px bg-primary/70"
            style={{ left: `${pct}%` }}
          >
            <button
              type="button"
              role="slider"
              aria-label="Compare raw transcript with the structured result"
              aria-valuemin={4}
              aria-valuemax={96}
              aria-valuenow={Math.round(pct)}
              aria-valuetext={`${Math.round(pct)}% transcript`}
              onPointerDown={() => (dragging.current = true)}
              onKeyDown={(e) => {
                if (e.key === "ArrowLeft") setPct((p) => Math.max(4, p - 4));
                if (e.key === "ArrowRight") setPct((p) => Math.min(96, p + 4));
              }}
              className="absolute top-1/2 left-1/2 grid size-9 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize place-items-center rounded-full border border-primary/50 bg-background shadow-lg focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
            >
              <GripVertical className="size-4 text-primary" aria-hidden="true" />
            </button>
          </div>
        </div>

        <p className="mt-4 text-center font-mono text-[11px] text-muted-foreground">
          Drag the handle, or focus it and use the arrow keys
        </p>
      </div>
    </section>
  );
}

function Label({ children, tone }: { children: React.ReactNode; tone: "primary" | "muted" }) {
  return (
    <span
      className={`hairline inline-block rounded-md border px-2.5 py-1 font-mono text-[10px] tracking-[0.14em] uppercase ${
        tone === "primary" ? "bg-primary/12 text-primary" : "bg-secondary/50 text-muted-foreground"
      }`}
    >
      {children}
    </span>
  );
}

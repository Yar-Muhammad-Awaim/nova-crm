"use client";

import { TRUST_FIGURES, TRUST_LINE } from "@/lib/content/landing";
import { Counter, Reveal } from "./primitives";
import { Clock, ShieldCheck, Database, TrendingUp } from "lucide-react";

const ICONS = [Clock, ShieldCheck, Database, TrendingUp];

export function TrustStrip() {
  return (
    <section className="hairline border-y bg-secondary/20">
      <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
        <Reveal>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="measure text-pretty text-sm sm:text-base text-foreground font-medium">
              {TRUST_LINE}
            </p>
            <span className="font-mono text-xs text-primary tracking-wider uppercase">
              Deterministic Architecture
            </span>
          </div>
        </Reveal>

        <dl className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-4">
          {TRUST_FIGURES.map((f, i) => {
            const Icon = ICONS[i % ICONS.length];
            return (
              <Reveal key={f.label} delay={i * 0.08}>
                <div className="rounded-xl border border-border/70 bg-card/40 p-4 sm:p-5">
                  <div className="flex items-center justify-between text-muted-foreground mb-3">
                    <Icon className="size-4 text-primary" />
                    <span className="font-mono text-[10px] text-muted-foreground uppercase">
                      Metric 0{i + 1}
                    </span>
                  </div>
                  <dt className="sr-only">{f.label}</dt>
                  <dd className="font-display text-3xl sm:text-4xl font-semibold tracking-tight text-foreground">
                    <Counter to={f.value} />
                    {f.suffix}
                  </dd>
                  <p className="mt-1 font-mono text-xs text-foreground font-medium">
                    {f.label}
                  </p>
                  {f.sub && (
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                      {f.sub}
                    </p>
                  )}
                </div>
              </Reveal>
            );
          })}
        </dl>
      </div>
    </section>
  );
}

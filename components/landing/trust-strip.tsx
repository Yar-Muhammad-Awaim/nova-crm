"use client";

import { TRUST_FIGURES, TRUST_LINE } from "@/lib/content/landing";
import { Counter, Reveal } from "./primitives";

/** Text only. No logos, because there are no customers to name. */
export function TrustStrip() {
  return (
    <section className="hairline border-y bg-secondary/18">
      <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-14">
        <Reveal>
          <p className="measure-tight text-pretty text-sm text-muted-foreground">{TRUST_LINE}</p>
        </Reveal>

        <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-4">
          {TRUST_FIGURES.map((f, i) => (
            <Reveal key={f.label} delay={i * 0.07}>
              <div>
                <dt className="sr-only">{f.label}</dt>
                <dd className="font-display text-4xl sm:text-5xl">
                  <Counter to={f.value} />
                  {f.suffix}
                </dd>
                <p className="mt-1.5 font-mono text-[11px] tracking-[0.14em] text-muted-foreground uppercase">
                  {f.label}
                </p>
              </div>
            </Reveal>
          ))}
        </dl>
      </div>
    </section>
  );
}

"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FINAL_CTA, FOOTER } from "@/lib/content/landing";
import { Magnetic, Reveal } from "./primitives";

export function FinalCta() {
  return (
    <section className="relative isolate overflow-hidden py-28 sm:py-36">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="bg-grid absolute inset-0 opacity-45" />
        <div
          className="absolute bottom-[-18rem] left-1/2 size-[44rem] -translate-x-1/2 rounded-full blur-[130px]"
          style={{
            background:
              "radial-gradient(circle, color-mix(in oklch, var(--primary) 20%, transparent), transparent 68%)",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-3xl px-5 text-center sm:px-8">
        <Reveal>
          <h2 className="font-display text-display text-balance">{FINAL_CTA.title}</h2>
        </Reveal>
        <Reveal delay={0.08}>
          <p className="measure-tight mx-auto mt-6 text-lead text-pretty text-muted-foreground">
            {FINAL_CTA.sub}
          </p>
        </Reveal>
        <Reveal delay={0.16}>
          <div className="mt-10">
            <Magnetic strength={0.4}>
              <Button size="lg" className="group relative overflow-hidden" render={<Link href={FINAL_CTA.cta.href} />}>
                {FINAL_CTA.cta.label}
                <ArrowRight
                  className="size-4 transition-transform duration-300 group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/22 to-transparent transition-transform duration-700 group-hover:translate-x-full"
                />
              </Button>
            </Magnetic>
          </div>
        </Reveal>
        <Reveal delay={0.22}>
          <p className="mt-6 font-mono text-[11px] text-muted-foreground">
            Ten demo accounts · password Demo123! · no signup
          </p>
        </Reveal>
      </div>
    </section>
  );
}

export function LandingFooter() {
  return (
    <footer className="hairline border-t">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-5 py-10 sm:flex-row sm:items-center sm:px-8">
        <div>
          <p className="font-display text-base">{FOOTER.company}</p>
          <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">{FOOTER.city}</p>
        </div>
        <p className="text-xs text-muted-foreground sm:ml-auto">{FOOTER.note}</p>
      </div>
    </footer>
  );
}

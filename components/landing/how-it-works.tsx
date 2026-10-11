"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "motion/react";
import { STEPS } from "@/lib/content/landing";
import { Reveal, SectionHeading } from "./primitives";
import { Badge } from "@/components/ui/badge";

export function HowItWorks() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  // The connecting beam fills as the section passes through the viewport.
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 72%", "end 55%"],
  });
  const scaleY = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <section id="how" className="scroll-mt-24 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionHeading
          eyebrow="Workflow Pipeline"
          title={
            <>
              Three Stages. <em className="italic text-primary">Zero Manual Data Entry</em>.
            </>
          }
          sub="Eliminate hours of transcription overhead and miscommunicated Jira tickets."
        />

        <div ref={ref} className="relative mt-16 sm:mt-20">
          {/* Rail + beam, left of the steps on desktop. */}
          <div
            aria-hidden="true"
            className="absolute top-4 bottom-4 left-[1.4rem] hidden w-px bg-border sm:block"
          >
            <motion.div
              style={{ scaleY: reduce ? 1 : scaleY }}
              className="h-full w-full origin-top bg-gradient-to-b from-primary via-chart-2 to-transparent"
            />
          </div>

          <ol className="space-y-12 sm:space-y-16">
            {STEPS.map((s, i) => (
              <Reveal as="li" key={s.n} delay={i * 0.09}>
                <div className="relative sm:pl-16">
                  <span className="hairline absolute top-0 left-0 hidden size-11 place-items-center rounded-full border bg-background font-mono text-xs font-bold text-primary sm:grid shadow-sm">
                    {s.n}
                  </span>
                  <div className="flex flex-wrap items-center gap-2 mb-2 sm:mb-1">
                    <span className="font-mono text-xs font-bold text-primary sm:hidden">{s.n}</span>
                    <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary font-mono text-[10px]">
                      {s.badge}
                    </Badge>
                  </div>
                  <h3 className="font-display mt-1 text-title font-semibold tracking-tight sm:mt-0">
                    {s.title}
                  </h3>
                  <p className="measure mt-2.5 text-pretty text-muted-foreground leading-relaxed">
                    {s.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

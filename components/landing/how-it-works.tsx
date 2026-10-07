"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "motion/react";
import { STEPS } from "@/lib/content/landing";
import { Reveal, SectionHeading } from "./primitives";

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
          eyebrow="How it works"
          title={<>Three steps, and <em className="italic text-primary">none of them</em> are typing.</>}
          sub="The only thing you do by hand is paste and approve."
        />

        <div ref={ref} className="relative mt-16">
          {/* Rail + beam, left of the steps on desktop. */}
          <div
            aria-hidden="true"
            className="absolute top-2 bottom-2 left-[1.4rem] hidden w-px bg-border sm:block"
          >
            <motion.div
              style={{ scaleY: reduce ? 1 : scaleY }}
              className="h-full w-full origin-top bg-gradient-to-b from-primary via-primary/70 to-transparent"
            />
          </div>

          <ol className="space-y-12 sm:space-y-14">
            {STEPS.map((s, i) => (
              <Reveal as="li" key={s.n} delay={i * 0.08}>
                <div className="relative sm:pl-16">
                  <span className="hairline absolute top-0 left-0 hidden size-11 place-items-center rounded-full border bg-background font-mono text-xs text-primary sm:grid">
                    {s.n}
                  </span>
                  <span className="font-mono text-xs text-primary sm:hidden">{s.n}</span>
                  <h3 className="font-display mt-2 text-title sm:mt-0">{s.title}</h3>
                  <p className="measure mt-3 text-pretty text-muted-foreground">{s.body}</p>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

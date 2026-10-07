"use client";

import { motion } from "motion/react";
import { FEATURES } from "@/lib/content/landing";
import { BentoVisual } from "./bento-visuals";
import { SectionHeading, SpotlightCard, Stagger, staggerChild } from "./primitives";

/** Mixed spans so the grid reads as composed rather than tiled. */
const SPAN: Record<string, string> = {
  lg: "md:col-span-4 md:row-span-2",
  md: "md:col-span-2",
  sm: "md:col-span-2",
};

export function Bento() {
  return (
    <section id="features" className="scroll-mt-24 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionHeading
          eyebrow="What it handles"
          title={<>The parts of a meeting that are <em className="italic text-primary">easy to get wrong</em>.</>}
          sub="Extraction is the simple half. Everything below is the half that decides whether you can trust the result."
        />

        <Stagger className="mt-14 grid gap-4 md:auto-rows-[minmax(10rem,auto)] md:grid-cols-6">
          {FEATURES.map((f) => (
            <motion.div key={f.title} variants={staggerChild} className={SPAN[f.span]}>
              <SpotlightCard
                tilt={f.span === "lg" ? 0 : 3.5}
                className="hairline flex h-full flex-col rounded-2xl border bg-card/60 p-6 transition-colors duration-300 hover:border-primary/35"
              >
                <h3 className="font-display text-xl tracking-tight">{f.title}</h3>
                <p className="measure mt-2.5 text-pretty text-sm leading-relaxed text-muted-foreground">
                  {f.body}
                </p>
                <div
                  className={
                    f.span === "lg"
                      ? "mt-8 flex flex-1 items-center justify-center"
                      : "mt-auto pt-7"
                  }
                >
                  <div className={f.span === "lg" ? "w-full max-w-md" : "w-full"}>
                    <BentoVisual kind={f.visual} />
                  </div>
                </div>
              </SpotlightCard>
            </motion.div>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

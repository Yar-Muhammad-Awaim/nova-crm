"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HERO } from "@/lib/content/landing";
import { HeroBackground } from "./hero-background";
import { HeroMock } from "./hero-mock";
import { WordReveal, Magnetic, EASE } from "./primitives";

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden pt-32 pb-20 sm:pt-40 sm:pb-28">
      <HeroBackground />

      <div className="relative mx-auto max-w-6xl px-5 sm:px-8">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, ease: EASE }}
          className="font-mono text-[11px] tracking-[0.2em] text-primary uppercase"
        >
          {HERO.eyebrow}
        </motion.p>

        <h1 className="font-display mt-6 text-hero text-balance">
          <WordReveal words={HERO.headline} delay={0.1} />
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.55, ease: EASE }}
          className="measure mt-7 text-lead text-pretty text-muted-foreground"
        >
          {HERO.sub}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.68, ease: EASE }}
          className="mt-9 flex flex-wrap items-center gap-3"
        >
          <Magnetic>
            <Button
              size="lg"
              nativeButton={false}
              className="group relative overflow-hidden"
              render={<Link href={HERO.primary.href} />}
            >
              {HERO.primary.label}
              <ArrowRight
                className="size-4 transition-transform duration-300 group-hover:translate-x-0.5"
                aria-hidden="true"
              />
              {/* Shine sweep on hover. */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/22 to-transparent transition-transform duration-700 group-hover:translate-x-full"
              />
            </Button>
          </Magnetic>

          <Button size="lg" variant="ghost" className="group" nativeButton={false} render={<a href={HERO.secondary.href} />}>
            {HERO.secondary.label}
            <ArrowDown
              className="size-4 transition-transform duration-300 group-hover:translate-y-0.5"
              aria-hidden="true"
            />
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.82, ease: EASE }}
          className="mt-16 sm:mt-20"
        >
          <HeroMock />
        </motion.div>
      </div>
    </section>
  );
}

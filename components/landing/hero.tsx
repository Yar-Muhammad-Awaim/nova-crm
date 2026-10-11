"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight, Sparkles, ShieldCheck, Database, Cpu } from "lucide-react";
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
        {/* Venture Eyebrow Pill */}
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE }}
          className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1 text-xs font-medium text-primary shadow-xs backdrop-blur-md"
        >
          <span className="size-1.5 rounded-full bg-primary animate-pulse" />
          <span className="font-mono text-[11px] tracking-wide uppercase">
            {HERO.eyebrow}
          </span>
        </motion.div>

        {/* Display Headline */}
        <h1 className="font-display mt-6 text-hero text-balance font-normal">
          <WordReveal words={HERO.headline} delay={0.1} />
        </h1>

        {/* Crisp Sub-headline */}
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.55, ease: EASE }}
          className="measure mt-7 text-lead text-pretty text-muted-foreground"
        >
          {HERO.sub}
        </motion.p>

        {/* Action CTAs */}
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
              className="group relative overflow-hidden shadow-lg shadow-primary/20"
              render={<Link href={HERO.primary.href} />}
            >
              {HERO.primary.label}
              <ArrowRight
                className="size-4 transition-transform duration-300 group-hover:translate-x-0.5"
                aria-hidden="true"
              />
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full"
              />
            </Button>
          </Magnetic>

          <Button
            size="lg"
            variant="outline"
            className="group hairline border-border/80 bg-background/50 hover:bg-accent/60"
            nativeButton={false}
            render={<a href={HERO.secondary.href} />}
          >
            <Cpu className="size-4 text-primary transition-transform duration-300 group-hover:rotate-45" />
            {HERO.secondary.label}
          </Button>
        </motion.div>

        {/* Live System Trust Signals */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.78, ease: EASE }}
          className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-mono text-muted-foreground"
        >
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="size-3.5 text-emerald-400" />
            <span>Zero Hallucinations (Directory-Enforced)</span>
          </span>
          <span className="hidden sm:inline text-border">·</span>
          <span className="flex items-center gap-1.5">
            <Database className="size-3.5 text-primary" />
            <span>Postgres ACID Atomicity</span>
          </span>
          <span className="hidden sm:inline text-border">·</span>
          <span className="flex items-center gap-1.5">
            <Sparkles className="size-3.5 text-chart-2" />
            <span>Instant One-Click Demo Personas</span>
          </span>
        </motion.div>

        {/* High-Fidelity Hero Mockup */}
        <motion.div
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.82, ease: EASE }}
          className="mt-14 sm:mt-18"
        >
          <HeroMock />
        </motion.div>
      </div>
    </section>
  );
}

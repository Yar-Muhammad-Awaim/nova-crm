"use client";

import { MotionConfig, motion } from "motion/react";

const EASE_OUT = [0.23, 1, 0.32, 1] as const;

/** Honour the OS "reduce motion" setting for everything below it. */
export function LandingMotion({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}

/** Fades a section in once, the first time it scrolls into view. */
export function Reveal({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.5, ease: EASE_OUT, delay }}
    >
      {children}
    </motion.div>
  );
}

/** A trackless bar that grows to `ratio` (0-1). Scales, never animates width. */
export function GrowBar({ ratio, className }: { ratio: number; className?: string }) {
  return (
    <motion.div
      aria-hidden="true"
      className={className}
      initial={{ scaleX: 0 }}
      whileInView={{ scaleX: ratio }}
      viewport={{ once: true, amount: 0.6 }}
      transition={{ duration: 0.6, ease: EASE_OUT }}
    />
  );
}

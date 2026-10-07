"use client";

import {
  useRef, useState, useEffect, type ReactNode, type CSSProperties,
} from "react";
import {
  motion, useReducedMotion, useInView, useMotionValue, useSpring,
  animate, type Variants,
} from "motion/react";

/** Shared easing. Decelerating, slightly overshooting — feels hand-made. */
export const EASE = [0.16, 1, 0.3, 1] as const;

/* ------------------------------------------------------------------ */
/* Reveal on scroll — once only, transform + opacity only.             */
/* ------------------------------------------------------------------ */

export function Reveal({
  children, delay = 0, y = 18, className, as = "div",
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  as?: "div" | "section" | "li" | "span";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -12% 0px" });
  const reduce = useReducedMotion();
  const MotionTag = motion[as] as typeof motion.div;

  return (
    <MotionTag
      ref={ref}
      initial={{ opacity: 0, y: reduce ? 0 : y }}
      animate={inView ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.6, delay, ease: EASE }}
      className={className}
    >
      {children}
    </MotionTag>
  );
}

/** Staggers its direct children. 70ms apart, per the brief. */
export function Stagger({
  children, className, step = 0.07,
}: { children: ReactNode; className?: string; step?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });
  const reduce = useReducedMotion();

  const parent: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: reduce ? 0 : step } },
  };

  return (
    <motion.div
      ref={ref}
      variants={parent}
      initial="hidden"
      animate={inView ? "show" : "hidden"}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export const staggerChild: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } },
};

/* ------------------------------------------------------------------ */
/* Headline: per-word masked slide-up                                  */
/* ------------------------------------------------------------------ */

export function WordReveal({
  words, className, delay = 0,
}: {
  words: readonly { text: string; em?: boolean }[];
  className?: string;
  delay?: number;
}) {
  const reduce = useReducedMotion();

  return (
    <span className={className}>
      {words.map((w, i) => (
        <span key={i} className="reveal-mask">
          <motion.span
            initial={{ y: reduce ? 0 : "105%" }}
            animate={{ y: 0 }}
            transition={{ duration: 0.75, delay: delay + i * 0.075, ease: EASE }}
            className={w.em ? "pr-[0.08em] italic text-primary" : "pr-[0.08em]"}
          >
            {w.text}
          </motion.span>
        </span>
      ))}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Magnetic button wrapper                                             */
/* ------------------------------------------------------------------ */

export function Magnetic({
  children, strength = 0.32, className,
}: { children: ReactNode; strength?: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduce = useReducedMotion();
  const x = useSpring(useMotionValue(0), { stiffness: 220, damping: 18, mass: 0.4 });
  const y = useSpring(useMotionValue(0), { stiffness: 220, damping: 18, mass: 0.4 });

  if (reduce) return <span className={className}>{children}</span>;

  return (
    <motion.span
      ref={ref}
      style={{ x, y, display: "inline-block" }}
      className={className}
      onPointerMove={(e) => {
        const el = ref.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        x.set((e.clientX - (r.left + r.width / 2)) * strength);
        y.set((e.clientY - (r.top + r.height / 2)) * strength);
      }}
      onPointerLeave={() => { x.set(0); y.set(0); }}
    >
      {children}
    </motion.span>
  );
}

/* ------------------------------------------------------------------ */
/* Spotlight / tilt card                                               */
/* ------------------------------------------------------------------ */

export function SpotlightCard({
  children, className, tilt = 0,
}: { children: ReactNode; className?: string; tilt?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const [spot, setSpot] = useState({ x: -400, y: -400, on: false });
  const rx = useSpring(useMotionValue(0), { stiffness: 180, damping: 20 });
  const ry = useSpring(useMotionValue(0), { stiffness: 180, damping: 20 });

  function move(e: React.PointerEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el || reduce) return;
    const r = el.getBoundingClientRect();
    const px = e.clientX - r.left;
    const py = e.clientY - r.top;
    setSpot({ x: px, y: py, on: true });
    if (tilt) {
      ry.set(((px / r.width) - 0.5) * 2 * tilt);
      rx.set(-((py / r.height) - 0.5) * 2 * tilt);
    }
  }

  return (
    <motion.div
      ref={ref}
      onPointerMove={move}
      onPointerLeave={() => { setSpot((s) => ({ ...s, on: false })); rx.set(0); ry.set(0); }}
      style={tilt && !reduce ? { rotateX: rx, rotateY: ry, transformPerspective: 900 } : undefined}
      className={`group/spot relative overflow-hidden ${className ?? ""}`}
    >
      {/* Cursor-following glow. Opacity-only transition, no layout work. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover/spot:opacity-100"
        style={{
          background: spot.on
            ? `radial-gradient(420px circle at ${spot.x}px ${spot.y}px, color-mix(in oklch, var(--primary) 13%, transparent), transparent 62%)`
            : undefined,
        } as CSSProperties}
      />
      {children}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Count-up                                                            */
/* ------------------------------------------------------------------ */

export function Counter({ to, className }: { to: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const reduce = useReducedMotion();
  const [n, setN] = useState(reduce ? to : 0);

  useEffect(() => {
    if (!inView || reduce) return;
    const controls = animate(0, to, {
      duration: 1.1,
      ease: "easeOut",
      onUpdate: (v) => setN(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, to, reduce]);

  return <span ref={ref} className={`tabular ${className ?? ""}`}>{n}</span>;
}

/* ------------------------------------------------------------------ */
/* Section scaffolding                                                 */
/* ------------------------------------------------------------------ */

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="font-mono text-[11px] tracking-[0.2em] text-primary uppercase">{children}</p>
  );
}

export function SectionHeading({
  eyebrow, title, sub, align = "left",
}: { eyebrow: string; title: ReactNode; sub?: string; align?: "left" | "center" }) {
  return (
    <div className={align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-3xl"}>
      <Reveal><Eyebrow>{eyebrow}</Eyebrow></Reveal>
      <Reveal delay={0.06}>
        <h2 className="font-display mt-4 text-display text-balance">{title}</h2>
      </Reveal>
      {sub && (
        <Reveal delay={0.12}>
          <p className={`measure mt-5 text-lead text-pretty text-muted-foreground ${align === "center" ? "mx-auto" : ""}`}>
            {sub}
          </p>
        </Reveal>
      )}
    </div>
  );
}

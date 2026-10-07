"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";

/**
 * Hero backdrop: fine grid + two aurora blooms that drift very slightly
 * toward the cursor. Throttled to one rAF frame, and it writes CSS custom
 * properties rather than React state so no re-render happens on pointer move.
 */
export function HeroBackground() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce) return;
    const el = ref.current;
    if (!el) return;

    let frame = 0;
    let tx = 0, ty = 0;

    function onMove(e: PointerEvent) {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        // -1 .. 1 across the viewport, damped hard so it reads as a drift.
        tx = (e.clientX / window.innerWidth - 0.5) * 2;
        ty = (e.clientY / window.innerHeight - 0.5) * 2;
        el!.style.setProperty("--mx", `${tx * 22}px`);
        el!.style.setProperty("--my", `${ty * 18}px`);
      });
    }

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [reduce]);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="grain pointer-events-none absolute inset-0 overflow-hidden"
      style={{ ["--mx" as string]: "0px", ["--my" as string]: "0px" }}
    >
      <div className="bg-grid mask-fade-b absolute inset-0 opacity-70" />

      <div
        className="absolute -top-48 left-[12%] size-[46rem] rounded-full blur-[110px]"
        style={{
          transform: "translate3d(var(--mx), var(--my), 0)",
          transition: "transform 1.1s cubic-bezier(0.16,1,0.3,1)",
          background:
            "radial-gradient(circle, color-mix(in oklch, var(--primary) 24%, transparent), transparent 68%)",
        }}
      />
      <div
        className="absolute -right-32 top-24 size-[34rem] rounded-full blur-[120px]"
        style={{
          transform: "translate3d(calc(var(--mx) * -0.6), calc(var(--my) * -0.6), 0)",
          transition: "transform 1.3s cubic-bezier(0.16,1,0.3,1)",
          background:
            "radial-gradient(circle, color-mix(in oklch, var(--chart-2) 18%, transparent), transparent 70%)",
        }}
      />

      {/* Horizon line: grounds the aurora so it reads as light, not a blob. */}
      <div className="absolute inset-x-0 top-[62%] h-px bg-gradient-to-r from-transparent via-border to-transparent" />
    </div>
  );
}

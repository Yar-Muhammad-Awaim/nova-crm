"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Check, EyeOff } from "lucide-react";
import { ROLE_VIEWS, type RoleKey } from "@/lib/content/landing";
import { SectionHeading, EASE } from "./primitives";

export function RoleViews() {
  const [active, setActive] = useState<RoleKey>("ADMIN");
  const view = ROLE_VIEWS.find((r) => r.key === active)!;

  return (
    <section id="roles" className="scroll-mt-24 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionHeading
          eyebrow="Role-based access"
          title={<>Everyone opens the same app and sees a <em className="italic text-primary">different company</em>.</>}
          sub="Not a filtered list. Rows outside your scope are never returned by the server at all."
        />

        {/* Roving-free tablist: simple buttons with proper ARIA wiring. */}
        <div
          role="tablist"
          aria-label="Choose a role"
          className="hairline mt-12 inline-flex rounded-xl border bg-secondary/35 p-1"
        >
          {ROLE_VIEWS.map((r) => (
            <button
              key={r.key}
              role="tab"
              id={`tab-${r.key}`}
              aria-selected={active === r.key}
              aria-controls={`panel-${r.key}`}
              onClick={() => setActive(r.key)}
              className={`relative rounded-lg px-4 py-2 text-sm font-medium transition-colors sm:px-6 ${
                active === r.key ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {active === r.key && (
                <motion.span
                  layoutId="role-pill"
                  className="hairline absolute inset-0 rounded-lg border bg-card"
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                />
              )}
              <span className="relative">{r.label}</span>
            </button>
          ))}
        </div>

        <div
          role="tabpanel"
          id={`panel-${active}`}
          aria-labelledby={`tab-${active}`}
          className="hairline mt-6 overflow-hidden rounded-2xl border bg-card/60"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.32, ease: EASE }}
              className="grid gap-8 p-7 sm:p-9 lg:grid-cols-[1fr_1.1fr]"
            >
              <div>
                <p className="font-mono text-[11px] tracking-[0.16em] text-primary uppercase">
                  {view.person}
                </p>
                <p className="font-display mt-3 text-title text-balance">{view.summary}</p>
                <p className="mt-5 flex items-start gap-2 text-sm text-muted-foreground">
                  <EyeOff className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
                  <span className="text-pretty">{view.hidden}</span>
                </p>
              </div>

              <ul className="space-y-2">
                {view.sees.map((s, i) => (
                  <motion.li
                    key={s}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.35, delay: 0.06 + i * 0.07, ease: EASE }}
                    className="hairline flex items-center gap-3 rounded-lg border bg-background/50 px-4 py-3"
                  >
                    <Check className="size-3.5 shrink-0 text-primary" aria-hidden="true" />
                    <span className="text-sm">{s}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

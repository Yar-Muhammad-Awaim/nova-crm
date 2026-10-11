"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { Check, EyeOff, ShieldCheck, ArrowRight } from "lucide-react";
import { ROLE_VIEWS, type RoleKey } from "@/lib/content/landing";
import { SectionHeading, EASE } from "./primitives";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function RoleViews() {
  const [active, setActive] = useState<RoleKey>("ADMIN");
  const view = ROLE_VIEWS.find((r) => r.key === active)!;

  return (
    <section id="roles" className="scroll-mt-24 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionHeading
          eyebrow="Cryptographic RBAC Governance"
          title={
            <>
              Three Role Tiers. <em className="italic text-primary">Strict Server-Side Isolation</em>.
            </>
          }
          sub="Not cosmetic CSS hiding. Data outside a user's managerial or assigned scope is filtered directly at the PostgreSQL query layer."
        />

        {/* Tab selector */}
        <div className="mt-12 flex justify-center">
          <div
            role="tablist"
            aria-label="Choose a role"
            className="hairline inline-flex rounded-xl border bg-secondary/40 p-1.5"
          >
            {ROLE_VIEWS.map((r) => (
              <button
                key={r.key}
                role="tab"
                id={`tab-${r.key}`}
                aria-selected={active === r.key}
                aria-controls={`panel-${r.key}`}
                onClick={() => setActive(r.key)}
                className={`relative rounded-lg px-4 py-2 text-xs sm:text-sm font-medium transition-colors sm:px-6 ${
                  active === r.key ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {active === r.key && (
                  <motion.span
                    layoutId="role-pill"
                    className="hairline absolute inset-0 rounded-lg border bg-card shadow-xs"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                )}
                <span className="relative font-medium">{r.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div
          role="tabpanel"
          id={`panel-${active}`}
          aria-labelledby={`tab-${active}`}
          className="hairline mt-8 overflow-hidden rounded-3xl border bg-card/70 backdrop-blur-sm"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.32, ease: EASE }}
              className="grid gap-8 p-7 sm:p-10 lg:grid-cols-[1fr_1.1fr]"
            >
              <div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="border-primary/40 bg-primary/10 text-primary font-mono text-xs">
                    {view.badge}
                  </Badge>
                  <span className="font-mono text-xs text-muted-foreground">
                    {view.person}
                  </span>
                </div>

                <p className="font-display mt-4 text-2xl font-semibold tracking-tight text-foreground text-balance">
                  {view.summary}
                </p>

                <div className="mt-6 flex items-start gap-2.5 rounded-xl border border-border/70 bg-secondary/30 p-4 text-xs text-muted-foreground">
                  <EyeOff className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                  <span className="text-pretty leading-relaxed">
                    <strong className="text-foreground">Server boundary:</strong> {view.hidden}
                  </span>
                </div>

                <div className="mt-8">
                  <Button size="sm" variant="outline" nativeButton={false} render={<Link href="/login" />}>
                    <span>Sign in as {view.label}</span>
                    <ArrowRight className="size-3.5" />
                  </Button>
                </div>
              </div>

              <div>
                <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
                  <ShieldCheck className="size-3.5 text-primary" />
                  Permitted Scope ({view.sees.length} items visible)
                </p>
                <ul className="space-y-2.5">
                  {view.sees.map((s, i) => (
                    <motion.li
                      key={s}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.35, delay: 0.06 + i * 0.07, ease: EASE }}
                      className="hairline flex items-center gap-3 rounded-xl border bg-background/60 px-4 py-3.5 hover:border-primary/40 transition-colors shadow-2xs"
                    >
                      <Check className="size-4 shrink-0 text-primary" aria-hidden="true" />
                      <span className="text-sm font-medium text-foreground">{s}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

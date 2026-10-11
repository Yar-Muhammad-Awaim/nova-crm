"use client";

import { useState } from "react";
import Link from "next/link";
import {
  TrendingUp,
  Clock,
  Sparkles,
  ArrowRight,
  Calculator,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SectionHeading, SpotlightCard } from "./primitives";

export function RoiCalculator() {
  const [teamSize, setTeamSize] = useState<number>(14);
  const [hourlyRate, setHourlyRate] = useState<number>(120);
  const [weeklyCalls, setWeeklyCalls] = useState<number>(5);

  // Economic Modeling Formula:
  // Each Delivery Manager / Senior Lead loses ~4.5 hours weekly to manual transcription,
  // ticket synthesis, assignee pinging, and chasing missed estimate changes.
  // In addition, ~12-18% of scope discussed in calls goes unbilled or disputed without verifiable audit trail.
  const managersCount = Math.max(1, Math.round(teamSize / 5));
  const pmHoursSavedWeekly = managersCount * 4.5;
  const pmHoursSavedMonthly = pmHoursSavedWeekly * 4.2;
  const directPmLaborSavingsAnnual = Math.round(pmHoursSavedMonthly * 12 * (hourlyRate * 0.65));

  // Billable scope recovery: ~6 hours of unbilled scope recovered per client project call per month
  const unbilledScopeRecoveredAnnual = Math.round(weeklyCalls * 4.2 * 12 * (hourlyRate * 0.8) * 1.5);
  const totalAnnualValue = directPmLaborSavingsAnnual + unbilledScopeRecoveredAnnual;
  const monthlyImpact = Math.round(totalAnnualValue / 12);

  return (
    <section id="roi" className="scroll-mt-24 py-24 sm:py-32 bg-secondary/15 border-y hairline">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionHeading
          eyebrow="Financial Impact & Unit Economics"
          title={
            <>
              Quantify Your Agency&apos;s <em className="italic text-primary">Billable Leakage</em>.
            </>
          }
          sub="Software agencies lose tens of thousands of dollars when client decisions in calls don't convert to billed tickets. See how fast NovaWorks pays for itself."
        />

        <div className="mt-14 grid gap-8 lg:grid-cols-12 lg:items-center">
          {/* Sliders Input Column */}
          <div className="space-y-6 lg:col-span-6">
            {/* Slider 1: Team Size */}
            <div className="hairline rounded-2xl border bg-card/60 p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label htmlFor="team-size-slider" className="text-sm font-semibold text-foreground">
                    Engineering & Delivery Team Size
                  </label>
                  <p className="text-xs text-muted-foreground">Engineers, designers & delivery managers</p>
                </div>
                <span className="font-mono text-base font-bold text-primary tabular-nums">
                  {teamSize} people
                </span>
              </div>
              <input
                id="team-size-slider"
                type="range"
                min={5}
                max={60}
                step={1}
                value={teamSize}
                onChange={(e) => setTeamSize(Number(e.target.value))}
                className="h-2 w-full cursor-pointer accent-primary rounded-lg bg-secondary"
              />
              <div className="flex justify-between text-[11px] font-mono text-muted-foreground">
                <span>5 people</span>
                <span>30 people</span>
                <span>60+ people</span>
              </div>
            </div>

            {/* Slider 2: Hourly Rate */}
            <div className="hairline rounded-2xl border bg-card/60 p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label htmlFor="hourly-rate-slider" className="text-sm font-semibold text-foreground">
                    Blended Agency Billing Rate ($/hr)
                  </label>
                  <p className="text-xs text-muted-foreground">Average client billable rate</p>
                </div>
                <span className="font-mono text-base font-bold text-primary tabular-nums">
                  ${hourlyRate}/hr
                </span>
              </div>
              <input
                id="hourly-rate-slider"
                type="range"
                min={60}
                max={250}
                step={5}
                value={hourlyRate}
                onChange={(e) => setHourlyRate(Number(e.target.value))}
                className="h-2 w-full cursor-pointer accent-primary rounded-lg bg-secondary"
              />
              <div className="flex justify-between text-[11px] font-mono text-muted-foreground">
                <span>$60/hr</span>
                <span>$150/hr</span>
                <span>$250/hr</span>
              </div>
            </div>

            {/* Slider 3: Weekly Calls */}
            <div className="hairline rounded-2xl border bg-card/60 p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label htmlFor="weekly-calls-slider" className="text-sm font-semibold text-foreground">
                    Weekly Stakeholder Syncs & Scoping Calls
                  </label>
                  <p className="text-xs text-muted-foreground">Client calls with roadmap or task changes</p>
                </div>
                <span className="font-mono text-base font-bold text-primary tabular-nums">
                  {weeklyCalls} calls/wk
                </span>
              </div>
              <input
                id="weekly-calls-slider"
                type="range"
                min={2}
                max={15}
                step={1}
                value={weeklyCalls}
                onChange={(e) => setWeeklyCalls(Number(e.target.value))}
                className="h-2 w-full cursor-pointer accent-primary rounded-lg bg-secondary"
              />
              <div className="flex justify-between text-[11px] font-mono text-muted-foreground">
                <span>2 calls</span>
                <span>8 calls</span>
                <span>15+ calls</span>
              </div>
            </div>
          </div>

          {/* Impact Output Column */}
          <div className="lg:col-span-6">
            <SpotlightCard
              tilt={1.5}
              className="hairline rounded-3xl border border-primary/30 bg-card/90 p-7 sm:p-9 shadow-xl shadow-primary/5 relative overflow-hidden"
            >
              <div className="flex items-center justify-between gap-3 border-b border-border/70 pb-5">
                <div className="flex items-center gap-2.5">
                  <span className="grid size-9 place-items-center rounded-lg bg-primary/15 text-primary">
                    <Calculator className="size-5" />
                  </span>
                  <div>
                    <h3 className="font-display text-lg font-semibold tracking-tight">
                      Projected Value Created
                    </h3>
                    <p className="font-mono text-[11px] text-muted-foreground uppercase tracking-wider">
                      Annual Economics
                    </p>
                  </div>
                </div>

                <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-400 font-mono text-xs">
                  Payback: &lt; 12 Days
                </Badge>
              </div>

              {/* Big Metric Display */}
              <div className="mt-6">
                <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                  Annual Net Recoverable Value
                </p>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="font-display text-5xl sm:text-6xl font-bold tracking-tight text-foreground tabular-nums">
                    ${totalAnnualValue.toLocaleString()}
                  </span>
                  <span className="font-mono text-xs text-muted-foreground">/ year</span>
                </div>
                <p className="mt-1 text-xs text-primary font-mono">
                  +${monthlyImpact.toLocaleString()} monthly cashflow improvement
                </p>
              </div>

              {/* Breakdown Grid */}
              <div className="mt-7 grid grid-cols-2 gap-3 border-t border-border/60 pt-5 text-left">
                <div className="rounded-xl border border-border/60 bg-muted/20 p-3.5">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="size-3.5 text-primary" />
                    <span>PM Labor Reclaimed</span>
                  </div>
                  <p className="mt-1.5 font-display text-2xl font-semibold tabular-nums text-foreground">
                    {Math.round(pmHoursSavedMonthly)}h
                  </p>
                  <p className="text-[11px] text-muted-foreground font-mono">hours saved / month</p>
                </div>

                <div className="rounded-xl border border-border/60 bg-muted/20 p-3.5">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <TrendingUp className="size-3.5 text-emerald-400" />
                    <span>Scope Leakage Plugged</span>
                  </div>
                  <p className="mt-1.5 font-display text-2xl font-semibold tabular-nums text-foreground">
                    ${directPmLaborSavingsAnnual.toLocaleString()}
                  </p>
                  <p className="text-[11px] text-muted-foreground font-mono">unbilled hours saved</p>
                </div>
              </div>

              {/* Venture Angle Note */}
              <div className="mt-6 flex items-start gap-2.5 rounded-xl border border-primary/20 bg-primary/5 p-3.5 text-xs text-muted-foreground leading-relaxed">
                <Sparkles className="size-4 text-primary shrink-0 mt-0.5" />
                <span>
                  <strong className="text-foreground">Venture Opportunity:</strong> Agency clients don&apos;t churn because of code; they churn because of missed verbal promises from meetings. NovaWorks creates a tamper-proof digital paper trail from audio to database.
                </span>
              </div>

              <div className="mt-7">
                <Button size="lg" className="w-full relative overflow-hidden" nativeButton={false} render={<Link href="/login" />}>
                  <span>Experience NovaWorks With Demo Data</span>
                  <ArrowRight className="size-4" />
                </Button>
              </div>
            </SpotlightCard>
          </div>
        </div>
      </div>
    </section>
  );
}

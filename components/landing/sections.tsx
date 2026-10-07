import Link from "next/link";
import { Lock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HeroDemo } from "./hero-demo";
import { RoleViews } from "./role-views";
import { GrowBar, Reveal } from "./motion";
import { EXCLUDED, PROJECTS, SPECIALIZATION, TASKS, TOTAL_HOURS, WORKLOAD, type ProjectKey } from "./data";

/** One label for the one action this page asks for. */
const CTA = "Open the demo";

const DOT: Record<ProjectKey, string> = {
  urbancart: "bg-primary",
  quickserve: "bg-chart-2",
  helpdesk: "bg-chart-3",
};

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5 rounded-md">
      <span className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground">
        <Sparkles className="size-4" aria-hidden="true" />
      </span>
      <span className="font-semibold tracking-tight">NovaWorks</span>
    </Link>
  );
}

export function Nav() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-6 px-4 sm:px-6" aria-label="Main">
        <Logo />
        <div className="flex items-center gap-1">
          <Button variant="ghost" className="hidden sm:inline-flex" nativeButton={false} render={<Link href="#product" />}>
            Product
          </Button>
          <Button variant="ghost" className="hidden sm:inline-flex" nativeButton={false} render={<Link href="#safeguards" />}>
            Safeguards
          </Button>
          <Button className="ml-2" nativeButton={false} render={<Link href="/login" />}>
            {CTA}
          </Button>
        </div>
      </nav>
    </header>
  );
}

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div aria-hidden="true" className="bg-grid mask-fade-b pointer-events-none absolute inset-0" />
      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 pt-16 pb-20 sm:px-6 lg:grid-cols-2 lg:pt-24">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            Your meeting already made the plan.
          </h1>
          <p className="mt-6 max-w-md text-lg text-pretty text-muted-foreground">
            Paste the transcript. NovaWorks files every project, owner, deadline and estimate, keeping only what the
            room finally agreed.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button size="lg" nativeButton={false} render={<Link href="/login" />}>
              {CTA}
            </Button>
            <Button size="lg" variant="outline" nativeButton={false} render={<Link href="#product" />}>
              See what it extracts
            </Button>
          </div>
        </div>
        <HeroDemo />
      </div>
    </section>
  );
}

export function Stats() {
  const stats = [
    { value: "1", label: "meeting transcript" },
    { value: "3", label: "client projects" },
    { value: "12", label: "assigned tasks" },
    { value: String(TOTAL_HOURS), label: "hours of estimated work" },
  ];
  return (
    <section aria-label="What one transcript produces" className="border-y bg-sidebar">
      <dl className="mx-auto grid max-w-6xl grid-cols-2 px-4 sm:px-6 md:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="flex flex-col-reverse gap-1 border-border py-8 not-first:md:border-l md:px-8 md:first:pl-0">
            <dt className="text-sm text-muted-foreground">{s.label}</dt>
            <dd className="text-3xl font-semibold tracking-tight tabular-nums">{s.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function Tile({ title, body, className, children }: { title: string; body: string; className?: string; children: React.ReactNode }) {
  return (
    <Reveal className={className}>
      <article className="flex h-full flex-col gap-5 rounded-2xl border bg-card p-6">
        <div>
          <h3 className="font-semibold tracking-tight text-balance">{title}</h3>
          <p className="mt-1 text-sm text-pretty text-muted-foreground">{body}</p>
        </div>
        <div className="flex-1">{children}</div>
      </article>
    </Reveal>
  );
}

function Workload() {
  const max = Math.max(...WORKLOAD.map((w) => w.hours));
  return (
    <ul className="grid gap-4">
      {WORKLOAD.map((w) => (
        <li key={w.name} className="grid gap-1.5">
          <div className="flex items-baseline justify-between gap-3 text-sm">
            <span>
              {w.name} <span className="text-muted-foreground">{SPECIALIZATION[w.name]}</span>
            </span>
            <span className="tabular-nums">{w.hours}&nbsp;h</span>
          </div>
          <GrowBar ratio={w.hours / max} className="h-1.5 origin-left rounded-full bg-primary" />
        </li>
      ))}
      <li className="mt-2 border-t pt-4 text-sm text-pretty text-muted-foreground">
        Hamza carries the most: two API tasks, in two different projects. The manager of each sees only their half.
      </li>
    </ul>
  );
}

function Timeline() {
  const days = Array.from({ length: 13 }, (_, i) => 12 + i);
  const projectDeadlines = new Set([20, 22, 24]);
  return (
    <div className="grid gap-4">
      <div aria-hidden="true" className="grid grid-cols-13 gap-1">
        {days.map((d) => (
          <div key={d} className="flex flex-col items-center gap-1.5">
            <div className="flex h-16 flex-col-reverse items-center gap-1">
              {TASKS.filter((t) => t.due === d).map((t) => (
                <span key={t.title} className={`size-2.5 rounded-full ${DOT[t.project]}`} />
              ))}
            </div>
            <span
              className={
                projectDeadlines.has(d)
                  ? "text-xs font-medium text-foreground underline underline-offset-4 tabular-nums"
                  : "text-xs text-muted-foreground tabular-nums"
              }
            >
              {d}
            </span>
          </div>
        ))}
      </div>
      <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
        {(Object.keys(PROJECTS) as ProjectKey[]).map((key) => (
          <li key={key} className="flex items-center gap-1.5">
            <span aria-hidden="true" className={`size-2 rounded-full ${DOT[key]}`} />
            {PROJECTS[key].name}, due {PROJECTS[key].deadline}
          </li>
        ))}
      </ul>
      <p className="sr-only">
        Task deadlines run from 12 to 22 October. Project deadlines are 20, 22 and 24 October.
      </p>
    </div>
  );
}

function Excluded() {
  return (
    <ul className="flex flex-wrap gap-2">
      {EXCLUDED.map((item) => (
        <li key={item} className="rounded-md border px-2.5 py-1 text-sm text-muted-foreground">
          <s className="decoration-destructive/70">{item}</s>
        </li>
      ))}
    </ul>
  );
}

function Access() {
  return (
    <div className="grid gap-3 text-sm">
      <div className="flex items-center gap-2 rounded-lg border bg-background px-3 py-2 text-muted-foreground">
        <Lock className="size-3.5 shrink-0" aria-hidden="true" />
        <span className="truncate">/projects/helpdeskpro</span>
      </div>
      <p className="text-muted-foreground">
        Signed in as <span className="text-foreground">Sara</span>, who has no task there.
      </p>
      <p className="font-medium">404. Not found.</p>
    </div>
  );
}

export function Bento() {
  return (
    <section id="product" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-24 sm:px-6">
      <Reveal>
        <h2 className="max-w-2xl text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
          Everyone gets the plan. Nobody sees more than their part.
        </h2>
      </Reveal>

      <div className="mt-12 grid gap-4 lg:grid-cols-12">
        <Tile
          className="lg:col-span-8 lg:row-span-2"
          title="Three logins, three views of one plan"
          body="Visibility is decided in the database query, not by hiding buttons."
        >
          <RoleViews />
        </Tile>
        <Tile
          className="lg:col-span-4 lg:row-span-2"
          title="Who carries what"
          body="Hours per developer, summed from the estimates the meeting agreed."
        >
          <Workload />
        </Tile>
        <Tile className="lg:col-span-5" title="Twelve deadlines, one fortnight" body="Every task lands before its project is due.">
          <Timeline />
        </Tile>
        <Tile className="lg:col-span-4" title="Rejected in the room, never created" body="Out-of-scope features stay out of the task list.">
          <Excluded />
        </Tile>
        <Tile className="lg:col-span-3" title="Guess a URL, get nothing" body="The server checks every request.">
          <Access />
        </Tile>
      </div>
    </section>
  );
}

export function Safeguards() {
  const steps = [
    { title: "DeepSeek drafts", body: "The model reads the transcript with the team directory and returns one JSON draft." },
    { title: "Zod checks the shape", body: "A missing field, malformed date or impossible estimate stops the draft. Nothing is saved." },
    { title: "Every person is matched", body: "Each owner must exist in the directory with the right role. Nobody new gets invented." },
    { title: "One transaction", body: "All three projects and twelve tasks save together, or none of them do." },
  ];
  return (
    <section id="safeguards" className="scroll-mt-20 border-t bg-sidebar">
      <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
        <Reveal>
          <h2 className="max-w-2xl text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            The AI drafts. Code decides what gets saved.
          </h2>
        </Reveal>
        <ol className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-0">
          {steps.map((s, i) => (
            <li key={s.title} className="lg:border-l lg:px-6 lg:first:border-l-0 lg:first:pl-0">
              <Reveal delay={i * 0.08} className="grid gap-2">
                <span className="text-sm text-primary tabular-nums">{i + 1}</span>
                <h3 className="font-semibold tracking-tight">{s.title}</h3>
                <p className="text-sm text-pretty text-muted-foreground">{s.body}</p>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function FinalCta() {
  return (
    <section className="relative overflow-hidden border-t">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 -bottom-1/2 h-full bg-radial from-primary/15 to-transparent to-70%" />
      <div className="relative mx-auto flex max-w-6xl flex-col items-start gap-6 px-4 py-24 sm:px-6">
        <h2 className="max-w-xl text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
          Bring the transcript. Leave with the plan.
        </h2>
        <Button size="lg" nativeButton={false} render={<Link href="/login" />}>
          {CTA}
        </Button>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="border-t">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-8 text-sm text-muted-foreground sm:px-6">
        <Logo />
        <p>NovaWorks Technologies. Built for The Infinity Hack 26.</p>
      </div>
    </footer>
  );
}

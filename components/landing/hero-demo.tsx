"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowDown } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CORRECTIONS, PROJECTS, type ProjectKey } from "./data";

const EASE_OUT = [0.23, 1, 0.32, 1] as const;
const ADVANCE_MS = 7000;

const SHORT: Record<ProjectKey, string> = {
  urbancart: "UrbanCart",
  quickserve: "QuickServe",
  helpdesk: "HelpDeskPro",
};

/** Renders transcript text, colouring the [[kind:value]] spans the AI acts on. */
function Marked({ text }: { text: string }) {
  const parts = text.split(/(\[\[(?:who|old|new):[^\]]+\]\])/g);
  return parts.map((part, i) => {
    const m = part.match(/^\[\[(who|old|new):(.+)\]\]$/);
    if (!m) return <span key={i}>{part}</span>;
    const [, kind, value] = m;
    if (kind === "old") {
      return (
        <s key={i} className="text-muted-foreground decoration-destructive/70">
          {value}
        </s>
      );
    }
    if (kind === "new") {
      return (
        <mark key={i} className="rounded-sm bg-primary/15 px-0.5 text-primary">
          {value}
        </mark>
      );
    }
    return (
      <span key={i} className="font-medium text-chart-2">
        {value}
      </span>
    );
  });
}

/**
 * The product's one move, shown on a loop: a meeting changes its mind,
 * and only the final decision becomes a task.
 */
export function HeroDemo() {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [pinned, setPinned] = useState(false);

  useEffect(() => {
    if (reduce || pinned) return;
    const id = setInterval(() => {
      if (!document.hidden) setIndex((i) => (i + 1) % CORRECTIONS.length);
    }, ADVANCE_MS);
    return () => clearInterval(id);
  }, [reduce, pinned]);

  const c = CORRECTIONS[index];
  const project = PROJECTS[c.project];

  return (
    <div className="relative rounded-2xl border bg-card shadow-2xl shadow-background">
      <div className="border-b p-3">
        <Tabs
          value={String(index)}
          onValueChange={(v) => {
            setPinned(true);
            setIndex(Number(v));
          }}
        >
          <TabsList aria-label="Project">
            {CORRECTIONS.map((x, i) => (
              <TabsTrigger key={x.project} value={String(i)}>
                {SHORT[x.project]}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Announce only changes the visitor asked for, not the auto-advance. */}
      <div className="grid min-h-80 content-start gap-4 p-5" aria-live={pinned ? "polite" : "off"}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={index}
            initial="hidden"
            animate="shown"
            exit={{ opacity: 0, transition: { duration: 0.12 } }}
            variants={{ hidden: {}, shown: { transition: { staggerChildren: 0.08 } } }}
            className="grid gap-4"
          >
            <ol className="grid gap-3 text-sm leading-relaxed" aria-label="Transcript excerpt">
              {c.lines.map((line, i) => (
                <motion.li
                  key={i}
                  variants={{
                    hidden: { opacity: 0, y: 6, filter: "blur(4px)" },
                    shown: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.3, ease: EASE_OUT } },
                  }}
                  className="flex gap-3"
                >
                  <span className="w-18 shrink-0 text-muted-foreground">{line.speaker}</span>
                  <p className="text-pretty text-foreground">
                    <Marked text={line.text} />
                  </p>
                </motion.li>
              ))}
            </ol>

            <motion.div
              variants={{
                hidden: { opacity: 0 },
                shown: { opacity: 1, transition: { duration: 0.2 } },
              }}
              className="flex items-center gap-2 text-xs text-muted-foreground"
            >
              <ArrowDown className="size-3.5" aria-hidden="true" />
              {c.rule}
            </motion.div>

            <motion.div
              variants={{
                hidden: { opacity: 0, scale: 0.97, y: 4 },
                shown: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.3, ease: EASE_OUT, delay: 0.15 } },
              }}
              className="rounded-xl border border-primary/30 bg-primary/5 p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="truncate font-medium">{c.task.title}</p>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {project.name} for {project.client}
                  </p>
                </div>
                <Avatar size="sm">
                  <AvatarFallback>{c.task.owner[0]}</AvatarFallback>
                </Avatar>
              </div>
              <dl className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm tabular-nums">
                <div className="flex gap-1.5">
                  <dt className="sr-only">Owner</dt>
                  <dd>{c.task.owner}</dd>
                </div>
                <div className="flex gap-1.5">
                  <dt className="sr-only">Estimate</dt>
                  <dd>{c.task.hours}&nbsp;h</dd>
                </div>
                <div className="flex gap-1.5">
                  <dt className="sr-only">Due</dt>
                  <dd>{c.task.due}&nbsp;Oct</dd>
                </div>
                <div className="ml-auto flex gap-1.5 text-xs text-muted-foreground">
                  <dt>Ignored:</dt>
                  <dd>
                    <s className="decoration-destructive/70">{c.superseded}</s>
                  </dd>
                </div>
              </dl>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

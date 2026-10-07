"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PROJECTS, TASKS, type LandingTask } from "./data";

const EASE_OUT = [0.23, 1, 0.32, 1] as const;

const VIEWS = {
  admin: { label: "Admin", who: "Administrator", filter: () => true },
  manager: { label: "Bilal", who: "Project manager", filter: (t: LandingTask) => t.project === "quickserve" },
  developer: { label: "Hamza", who: "Backend developer", filter: (t: LandingTask) => t.owner === "Hamza" },
} as const;

type View = keyof typeof VIEWS;

/** Same twelve tasks, three logins. The filter mirrors lib/data.ts getProjects. */
export function RoleViews() {
  const [view, setView] = useState<View>("admin");
  const v = VIEWS[view];
  const visible = TASKS.filter(v.filter);

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Tabs value={view} onValueChange={(next) => setView(next as View)}>
          <TabsList aria-label="Signed in as">
            {(Object.keys(VIEWS) as View[]).map((key) => (
              <TabsTrigger key={key} value={key}>
                {VIEWS[key].label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <p className="text-sm text-muted-foreground" aria-live="polite">
          {v.who} sees <span className="text-foreground tabular-nums">{visible.length}</span> of 12 tasks
        </p>
      </div>

      <ul className="grid gap-1" aria-label={`Tasks visible to ${v.label}`}>
        <AnimatePresence initial={false} mode="popLayout">
          {visible.map((t) => (
            <motion.li
              key={t.title}
              layout
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.12 } }}
              transition={{ duration: 0.25, ease: EASE_OUT }}
              className="flex items-center justify-between gap-4 rounded-lg px-3 py-2 hover:bg-muted"
            >
              <div className="min-w-0">
                <p className="truncate text-sm">{t.title}</p>
                <p className="truncate text-xs text-muted-foreground">{PROJECTS[t.project].name}</p>
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground tabular-nums">
                <span className="hidden sm:inline">{t.owner}</span>
                <span>{t.hours}&nbsp;h</span>
                <span>{t.due}&nbsp;Oct</span>
              </div>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, Copy, Check } from "lucide-react";
import { ROLE_STYLE } from "@/lib/ui";
import type { Role } from "@/lib/types";

const ACCOUNTS: { email: string; name: string; role: Role; note: string }[] = [
  { email: "admin@novaworks.example",  name: "Admin",       role: "ADMIN",   "note": "sees everything + transcript" },
  { email: "ayesha@novaworks.example", name: "Ayesha Khan", role: "MANAGER", note: "UrbanCart only" },
  { email: "bilal@novaworks.example",  name: "Bilal Ahmed", role: "MANAGER", note: "QuickServe only" },
  { email: "hina@novaworks.example",   name: "Hina Malik",  role: "MANAGER", note: "HelpDeskPro only" },
  { email: "ali@novaworks.example",    name: "Ali Raza",    role: "AGENT",   note: "3 tasks" },
  { email: "hamza@novaworks.example",  name: "Hamza Shah",  role: "AGENT",   note: "2 tasks, 2 projects" },
  { email: "sara@novaworks.example",   name: "Sara Noor",   role: "AGENT",   note: "2 tasks" },
  { email: "usman@novaworks.example",  name: "Usman Tariq", role: "AGENT",   note: "1 task" },
  { email: "zain@novaworks.example",   name: "Zain Abbas",  role: "AGENT",   note: "2 tasks" },
  { email: "maryam@novaworks.example", name: "Maryam Asif", role: "AGENT",   note: "2 tasks" },
];

/**
 * Judges will be logging in and out constantly. This makes switching
 * accounts a single click instead of retyping an email every time.
 */
export function DemoAccounts() {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  async function copy(email: string) {
    await navigator.clipboard.writeText(email);
    setCopied(email);
    setTimeout(() => setCopied(null), 1400);
  }

  return (
    <div className="rounded-xl border bg-card/50">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium"
      >
        <span>
          Demo accounts
          <span className="ml-2 font-normal text-muted-foreground">password: Demo123!</span>
        </span>
        <ChevronDown
          aria-hidden="true"
          className={`size-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="max-h-80 overflow-y-auto border-t p-1.5">
          {ACCOUNTS.map((a) => (
            <div
              key={a.email}
              className="flex items-center gap-3 rounded-lg px-2.5 py-2 hover:bg-accent/60"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={`${ROLE_STYLE[a.role]} shrink-0 text-[10px]`}>
                    {a.role}
                  </Badge>
                  <span className="truncate text-sm font-medium">{a.name}</span>
                  <span className="ml-auto shrink-0 text-xs text-muted-foreground">{a.note}</span>
                </div>
                {/* Full width on its own line: judges need to read and copy this. */}
                <p className="mt-0.5 font-mono text-xs text-muted-foreground">{a.email}</p>
              </div>
              <Button
                size="icon"
                variant="ghost"
                className="size-7 shrink-0"
                onClick={() => copy(a.email)}
                aria-label={`Copy ${a.name}\u2019s email address`}
              >
                {copied === a.email
                  ? <Check className="size-3.5 text-emerald-400" aria-hidden="true" />
                  : <Copy className="size-3.5" aria-hidden="true" />}
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, Copy, Check, Sparkles, Briefcase, Code, Loader2 } from "lucide-react";
import { ROLE_STYLE } from "@/lib/ui";
import { quickLogin } from "@/lib/actions";
import type { Role } from "@/lib/types";

const ACCOUNTS: { email: string; name: string; role: Role; note: string }[] = [
  { email: "admin@novaworks.example",  name: "Admin",       role: "ADMIN",   note: "sees everything + transcript studio" },
  { email: "ayesha@novaworks.example", name: "Ayesha Khan", role: "MANAGER", note: "UrbanCart engagement only" },
  { email: "bilal@novaworks.example",  name: "Bilal Ahmed", role: "MANAGER", note: "QuickServe engagement only" },
  { email: "hina@novaworks.example",   name: "Hina Malik",  role: "MANAGER", note: "HelpDeskPro engagement only" },
  { email: "ali@novaworks.example",    name: "Ali Raza",    role: "AGENT",   note: "3 tasks · UrbanCart" },
  { email: "hamza@novaworks.example",  name: "Hamza Shah",  role: "AGENT",   note: "2 tasks · UrbanCart & QuickServe" },
  { email: "sara@novaworks.example",   name: "Sara Noor",   role: "AGENT",   note: "2 tasks · QuickServe" },
  { email: "usman@novaworks.example",  name: "Usman Tariq", role: "AGENT",   note: "1 task · QuickServe" },
  { email: "zain@novaworks.example",   name: "Zain Abbas",  role: "AGENT",   note: "2 tasks · HelpDeskPro" },
  { email: "maryam@novaworks.example", name: "Maryam Asif", role: "AGENT",   note: "2 tasks · HelpDeskPro" },
];

const FAST_PERSONAS = [
  {
    role: "ADMIN" as Role,
    label: "Admin Persona",
    name: "System Administrator",
    email: "admin@novaworks.example",
    icon: Sparkles,
    desc: "All projects, team workload & AI studio",
  },
  {
    role: "MANAGER" as Role,
    label: "Manager Persona",
    name: "Ayesha Khan",
    email: "ayesha@novaworks.example",
    icon: Briefcase,
    desc: "UrbanCart Clothing portfolio",
  },
  {
    role: "AGENT" as Role,
    label: "Engineer Persona",
    name: "Ali Raza",
    email: "ali@novaworks.example",
    icon: Code,
    desc: "3 personal assigned tasks",
  },
];

export function DemoAccounts() {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  async function copy(email: string) {
    await navigator.clipboard.writeText(email);
    setCopied(email);
    setTimeout(() => setCopied(null), 1400);
  }

  return (
    <div className="space-y-4">
      {/* 1-Click Fast Launch Personas */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider text-muted-foreground px-1">
          <span>1-Click Instant Demo Launch</span>
          <span className="text-primary font-semibold">Zero Setup</span>
        </div>

        <div className="grid gap-2">
          {FAST_PERSONAS.map((p) => (
            <form key={p.email} action={quickLogin}>
              <input type="hidden" name="email" value={p.email} />
              <input type="hidden" name="password" value="Demo123!" />
              <PersonaLaunchButton
                label={p.label}
                name={p.name}
                desc={p.desc}
                icon={p.icon}
              />
            </form>
          ))}
        </div>
      </div>

      {/* Expandable Directory of All 10 Seeded Accounts */}
      <div className="rounded-xl border border-border/70 bg-card/50 overflow-hidden shadow-2xs">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="flex w-full items-center justify-between px-4 py-3 text-xs font-medium hover:bg-muted/30 transition-colors"
        >
          <span className="flex items-center gap-2">
            <span>All 10 Pre-Seeded Accounts</span>
            <span className="rounded-md border border-border/80 bg-background/80 px-1.5 py-0.2 font-mono text-[10px] text-muted-foreground">
              pwd: Demo123!
            </span>
          </span>
          <ChevronDown
            aria-hidden="true"
            className={`size-3.5 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
          />
        </button>

        {open && (
          <div className="max-h-80 overflow-y-auto border-t border-border/60 p-1.5 space-y-1">
            {ACCOUNTS.map((a) => (
              <div
                key={a.email}
                className="flex items-center gap-2 rounded-lg p-2 hover:bg-accent/50 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={`${ROLE_STYLE[a.role]} shrink-0 text-[10px]`}>
                      {a.role}
                    </Badge>
                    <span className="truncate text-xs font-medium text-foreground">{a.name}</span>
                    <span className="ml-auto hidden text-[11px] text-muted-foreground sm:inline truncate">
                      {a.note}
                    </span>
                  </div>
                  <p className="mt-0.5 font-mono text-[11px] text-muted-foreground truncate">{a.email}</p>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="size-7"
                    type="button"
                    onClick={() => copy(a.email)}
                    aria-label={`Copy ${a.name}'s email address`}
                    title="Copy email"
                  >
                    {copied === a.email ? (
                      <Check className="size-3.5 text-success" aria-hidden="true" />
                    ) : (
                      <Copy className="size-3.5 text-muted-foreground" aria-hidden="true" />
                    )}
                  </Button>

                  <form action={quickLogin}>
                    <input type="hidden" name="email" value={a.email} />
                    <input type="hidden" name="password" value="Demo123!" />
                    <QuickSignInSubmitButton />
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function PersonaLaunchButton({
  label,
  name,
  desc,
  icon: Icon,
}: {
  label: string;
  name: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="group w-full flex items-center justify-between gap-3 rounded-xl border border-border/70 bg-background/60 p-2.5 text-left transition-all hover:border-primary/50 hover:bg-primary/[0.04] disabled:opacity-60"
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <span className="grid size-8 shrink-0 place-items-center rounded-lg border border-border/80 bg-muted/30 text-foreground group-hover:border-primary/40 group-hover:text-primary transition-colors">
          {pending ? <Loader2 className="size-4 animate-spin text-primary" /> : <Icon className="size-4" />}
        </span>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors truncate">
              {label}
            </span>
            <span className="text-[10px] text-muted-foreground font-mono truncate">
              ({name})
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground truncate">{desc}</p>
        </div>
      </div>

      <span className="font-mono text-[11px] font-medium text-primary shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        {pending ? "Launching…" : "Launch →"}
      </span>
    </button>
  );
}

function QuickSignInSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      size="sm"
      variant="outline"
      className="h-7 px-2 text-[11px] font-mono"
      disabled={pending}
    >
      {pending ? <Loader2 className="size-3 animate-spin" /> : "Sign in"}
    </Button>
  );
}

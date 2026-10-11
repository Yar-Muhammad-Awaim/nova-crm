"use client";

import { useState } from "react";
import {
  CheckCircle2,
  XCircle,
  Lock,
  FileCode2,
} from "lucide-react";
import { DEFENSIBILITY_MATRIX } from "@/lib/content/landing";
import { SectionHeading } from "./primitives";
import { Badge } from "@/components/ui/badge";

export function ArchitectureDeepDive() {
  const [activeTab, setActiveTab] = useState<number>(0);

  const pillars = [
    {
      title: "Zero-Hallucination Identity Engine",
      subtitle: "Deterministic Zod Directory Anchor",
      description:
        "Generic LLMs invent fictional attendees or misattribute roles. NovaWorks injects the authenticated corporate directory into the model context as strict JSON schema constraints. Any ID not present in Postgres fails validation before writing a single byte.",
      codeSnippet: `// lib/draft-schema.ts
export function validateDraft(draft: AiDraft, directory: User[]) {
  const userMap = new Map(directory.map((u) => [u.id, u]));
  for (const project of draft.projects) {
    const manager = userMap.get(project.managerId);
    if (!manager || manager.role !== "MANAGER") {
      return { valid: false, issue: "INVALID_MANAGER_ASSIGNMENT" };
    }
  }
}`,
    },
    {
      title: "Temporal Decision Delta Tracking",
      subtitle: "Resolves Counter-Proposals & Cut Scope",
      description:
        "Conversations are rarely linear. Clients suggest 8 hours, push back to 10 hours, and cancel ancillary modules like SMS notifications late in the hour. Our engine tracks conversational deltas and preserves solely the final agreed consensus.",
      codeSnippet: `// lib/ai.ts prompt constraints
- If an estimate or deadline was revised during the conversation,
  extract the FINAL agreed value, never the initial proposal.
- If a participant explicitly removed or declined a proposed task,
  omit it completely. Do not create tasks for cancelled scope.`,
    },
    {
      title: "All-Or-Nothing ACID Atomicity",
      subtitle: "Single PostgreSQL Stored Function",
      description:
        "Draft saving executes inside a dedicated PostgreSQL stored function (save_ai_draft_fn). Either all projects and all 12 tasks commit atomically, or the entire transaction rolls back. Network drops never cause half-persisted project states.",
      codeSnippet: `// supabase/migrations/0003_save_ai_draft_fn.sql
create or replace function save_ai_draft_fn(draft jsonb)
returns jsonb language plpgsql as $$
begin
  -- Executes inside an atomic PostgreSQL transaction block.
  -- Failure anywhere rolls back all created projects and tasks.
  ...
  return jsonb_build_object('success', true);
end;
$$;`,
    },
    {
      title: "Cryptographic Server-Side RBAC",
      subtitle: "Zero Client-Trust Security Architecture",
      description:
        "Role-based access is enforced inside SQL query builders using verified HS256 JWT cookies. Guessing URLs or altering browser storage cannot bypass Postgres constraints — unpermitted records are never queried or transmitted over the wire.",
      codeSnippet: `// lib/data.ts
export async function getProjects(session: Session) {
  let query = db.from("projects").select("*, manager:users(*), tasks(*)");
  if (session.role === "MANAGER") {
    query = query.eq("manager_id", session.userId);
  } else if (session.role === "AGENT") {
    query = query.eq("tasks.assignee_id", session.userId);
  }
  return query;
}`,
    },
  ];

  return (
    <section id="architecture" className="scroll-mt-24 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionHeading
          eyebrow="Technical Defensibility & Due Diligence"
          title={
            <>
              Why Generic AI Fails and <em className="italic text-primary">NovaWorks Ships</em>.
            </>
          }
          sub="The structural engineering moats that separate an enterprise-grade execution system from a fragile chatbot wrapper."
        />

        {/* Head-to-Head Comparison Table */}
        <div className="mt-14 overflow-hidden rounded-2xl border hairline bg-card/60 backdrop-blur-sm">
          <div className="grid grid-cols-1 divide-y hairline md:grid-cols-12 md:divide-y-0 md:divide-x">
            {/* Header / Column labels */}
            <div className="bg-muted/30 p-5 md:col-span-3">
              <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                Evaluation Dimension
              </span>
            </div>
            <div className="bg-destructive/5 p-5 md:col-span-4">
              <div className="flex items-center gap-2">
                <XCircle className="size-4 text-destructive" />
                <span className="font-semibold text-sm text-destructive">Generic AI Slop / Chatbots</span>
              </div>
            </div>
            <div className="bg-primary/5 p-5 md:col-span-5">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-primary" />
                <span className="font-semibold text-sm text-primary">NovaWorks Engine</span>
              </div>
            </div>
          </div>

          <div className="divide-y hairline">
            {DEFENSIBILITY_MATRIX.map((item) => (
              <div
                key={item.dimension}
                className="grid grid-cols-1 divide-y hairline md:grid-cols-12 md:divide-y-0 md:divide-x hover:bg-muted/15 transition-colors"
              >
                <div className="p-4.5 md:col-span-3 flex flex-col justify-center bg-muted/10">
                  <span className="font-semibold text-xs text-foreground sm:text-sm">
                    {item.dimension}
                  </span>
                  <span className="font-mono text-[10px] text-primary/80 mt-1">
                    {item.advantage}
                  </span>
                </div>

                <div className="p-4.5 md:col-span-4 flex items-start gap-2.5 text-xs text-muted-foreground leading-relaxed">
                  <XCircle className="size-3.5 text-destructive/70 shrink-0 mt-0.5" />
                  <span>{item.genericAi}</span>
                </div>

                <div className="p-4.5 md:col-span-5 flex items-start gap-2.5 text-xs text-foreground leading-relaxed bg-primary/[0.02]">
                  <CheckCircle2 className="size-3.5 text-primary shrink-0 mt-0.5" />
                  <span className="font-medium">{item.novaWorks}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Deep Dive Architecture Code & Schema Inspector */}
        <div className="mt-14 hairline rounded-3xl border bg-card/70 p-6 sm:p-9">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/70 pb-5">
            <div>
              <p className="font-mono text-xs text-primary uppercase tracking-wider">
                Under the Hood: Architecture Inspection
              </p>
              <h3 className="font-display text-2xl font-semibold tracking-tight text-foreground mt-1">
                Zero-Trust Defensive Pipeline
              </h3>
            </div>

            {/* Pillar Selector Buttons */}
            <div className="flex flex-wrap gap-1.5 rounded-xl border border-border/70 bg-secondary/40 p-1">
              {pillars.map((p, i) => (
                <button
                  key={p.title}
                  type="button"
                  onClick={() => setActiveTab(i)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                    activeTab === i
                      ? "bg-background text-foreground shadow-xs border border-border/60"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Pillar 0{i + 1}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8 grid gap-8 lg:grid-cols-12 lg:items-center">
            {/* Left: Pillar Explanation */}
            <div className="space-y-4 lg:col-span-5">
              <Badge variant="outline" className="border-primary/40 bg-primary/10 text-primary font-mono text-xs">
                {pillars[activeTab].subtitle}
              </Badge>
              <h4 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                {pillars[activeTab].title}
              </h4>
              <p className="text-sm leading-relaxed text-muted-foreground text-pretty">
                {pillars[activeTab].description}
              </p>
            </div>

            {/* Right: Code Snippet */}
            <div className="hairline overflow-hidden rounded-2xl border border-border/80 bg-background/95 lg:col-span-7">
              <div className="flex items-center justify-between border-b border-border/60 bg-muted/40 px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <FileCode2 className="size-3.5 text-primary" />
                  <span className="font-mono text-xs text-muted-foreground">Production Logic</span>
                </div>
                <span className="font-mono text-[10px] text-emerald-400 flex items-center gap-1">
                  <Lock className="size-3" /> Audited & Verified
                </span>
              </div>
              <div className="p-4 sm:p-5 overflow-x-auto">
                <pre className="font-mono text-xs leading-relaxed text-muted-foreground/90 selection:bg-primary/20">
                  <code>{pillars[activeTab].codeSnippet}</code>
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

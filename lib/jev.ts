import "server-only";
import type { AiDraft } from "./ai";
import type { User } from "./types";

/**
 * Second opinion on an AI draft, from TypeSafe's Jev model.
 *
 * DeepSeek *writes* the draft. Jev does not write anything: it answers typed
 * questions about the transcript with calibrated probabilities. We ask it two
 * atomic questions per task and flag the tasks where it disagrees with the draft:
 *
 *   owner_N  (choice) Who owns this task by the meeting's final decision?
 *   scope_N  (noul)   Was this work rejected, excluded or deferred?
 *
 * Advisory only. It never blocks a save, and with no API key it is skipped,
 * so the core transcript flow works exactly as before.
 *
 * API: https://docs.typesafe.ai/api (direct) or Vercel AI Gateway passthrough.
 */

const DIRECT = { url: "https://api.typesafe.ai/v1/systemone", model: "jev-latest" };
const GATEWAY = { url: "https://ai-gateway.vercel.sh/typesafe/v1/systemone", model: "typesafe-ai/jev" };

/** Below these, a disagreement is too uncertain to show the admin. */
const OWNER_THRESHOLD = 0.7;
const EXCLUDED_THRESHOLD = 0.8;

type Answer = {
  type: "noul" | "choice" | "score";
  noul?: number;
  choice?: string;
  probabilities?: Record<string, number>;
  confidence?: number;
};

export type TaskFlag = {
  path: string;
  title: string;
  kind: "owner" | "excluded";
  message: string;
  probability: number;
};

export type Verification =
  | { status: "skipped"; reason: string }
  | { status: "checked"; flags: TaskFlag[]; checkedTasks: number };

function endpoint() {
  if (process.env.TYPESAFE_API_KEY) return { ...DIRECT, key: process.env.TYPESAFE_API_KEY };
  if (process.env.AI_GATEWAY_API_KEY) return { ...GATEWAY, key: process.env.AI_GATEWAY_API_KEY };
  return null;
}

export async function verifyDraft(transcript: string, draft: AiDraft, directory: User[]): Promise<Verification> {
  const ep = endpoint();
  if (!ep) return { status: "skipped", reason: "No TYPESAFE_API_KEY or AI_GATEWAY_API_KEY set." };

  const agents = directory.filter((u) => u.role === "AGENT");
  const ownerCriteria = Object.fromEntries(agents.map((a) => [a.id, `${a.name}, ${a.specialization ?? "developer"}`]));
  const byId = new Map(directory.map((u) => [u.id, u]));

  const tasks = draft.projects.flatMap((p, pi) =>
    p.tasks.map((t, ti) => ({ ...t, project: p.name, path: `projects[${pi}].tasks[${ti}]` }))
  );

  const questions: Record<string, unknown> = {};
  tasks.forEach((t, i) => {
    questions[`owner_${i}`] = {
      type: "choice",
      instructions: `Going by the LAST decision made in the meeting, who owns the task "${t.title}" in the project "${t.project}"?`,
      criteria: ownerCriteria,
    };
    questions[`scope_${i}`] = {
      type: "noul",
      instructions: `Was the work "${t.title}" explicitly rejected, excluded, deferred or called future work in the meeting?`,
      criteria: {
        true: "The meeting decided this work should not be done in the current project.",
        false: "The meeting agreed this work is part of the current project.",
      },
    };
  });

  let answers: Record<string, Answer>;
  try {
    const res = await fetch(ep.url, {
      method: "POST",
      headers: { Authorization: `Bearer ${ep.key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: ep.model, state: transcript, questions }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) return { status: "skipped", reason: `Jev returned HTTP ${res.status}.` };
    answers = (await res.json()).answers ?? {};
  } catch (e) {
    return { status: "skipped", reason: e instanceof Error ? e.message : "Jev request failed." };
  }

  const flags: TaskFlag[] = [];
  tasks.forEach((t, i) => {
    const owner = answers[`owner_${i}`];
    const choice = owner?.choice;
    const p = choice ? owner.probabilities?.[choice] ?? 0 : 0;
    if (choice && choice !== t.assigneeId && p >= OWNER_THRESHOLD) {
      flags.push({
        path: `${t.path}.assigneeId`,
        title: t.title,
        kind: "owner",
        probability: p,
        message: `Draft says ${byId.get(t.assigneeId)?.name ?? t.assigneeId}; the meeting most likely settled on ${byId.get(choice)?.name ?? choice}.`,
      });
    }

    const excluded = answers[`scope_${i}`]?.noul ?? 0;
    if (excluded >= EXCLUDED_THRESHOLD) {
      flags.push({
        path: t.path,
        title: t.title,
        kind: "excluded",
        probability: excluded,
        message: "This work looks like something the meeting rejected or deferred.",
      });
    }
  });

  return { status: "checked", flags, checkedTasks: tasks.length };
}

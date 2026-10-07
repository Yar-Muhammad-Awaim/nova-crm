import "server-only";
import OpenAI from "openai";
import { z } from "zod";
import type { User } from "./types";

/**
 * DeepSeek speaks the OpenAI API dialect, so we use the official OpenAI
 * client and only swap the baseURL. Nothing else about the call changes.
 */
const client = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: "https://api.deepseek.com",
});

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** The exact shape we will accept back. Anything else is rejected. */
export const AiDraft = z.object({
  projects: z.array(
    z.object({
      name: z.string().min(1),
      clientName: z.string().min(1),
      description: z.string().default(""),
      managerId: z.string().min(1),
      deadline: z.string().regex(ISO_DATE),
      tasks: z.array(
        z.object({
          title: z.string().min(1),
          description: z.string().default(""),
          assigneeId: z.string().min(1),
          deadline: z.string().regex(ISO_DATE),
          estimatedHours: z.number().positive(),
        })
      ).min(1),
    })
  ).min(1),
});
export type AiDraft = z.infer<typeof AiDraft>;

function systemPrompt(directory: User[]) {
  const lines = directory
    .filter((u) => u.role !== "ADMIN")
    .map((u) => `${u.id} | ${u.name} | ${u.role} | ${u.specialization} | skills: ${u.skills.join(", ")}`)
    .join("\n");

  return `You convert a project-planning meeting transcript into structured project and task records.

TEAM DIRECTORY (the ONLY people who exist):
${lines}

HARD RULES
1. Use ONLY the ids above. Never invent a person. If a name in the transcript is not in the directory, it is an outsider - ignore them entirely and never assign work to them.
2. managerId must be a MANAGER id. assigneeId must be an AGENT id.
3. A transcript is a conversation: estimates, owners and dates get CORRECTED as it goes. Always obey the LAST agreed decision and ignore every superseded earlier figure.
4. Features that were explicitly rejected, excluded, deferred or called "future work" must NOT become tasks.
5. Keep separately-discussed projects separate. Keep separately-named tasks separate - never merge two tasks just because one person owns both.
6. estimatedHours is effort, not calendar span. Dates are ISO YYYY-MM-DD. Assume year 2026 when only a day and month are spoken.
7. Every task deadline must be on or before its project deadline.
8. Use the wording of the meeting for titles. Descriptions should state the agreed scope, including what was excluded when that was discussed.

Return ONLY JSON of this exact shape:
{"projects":[{"name":"","clientName":"","description":"","managerId":"PM01","deadline":"2026-10-20","tasks":[{"title":"","description":"","assigneeId":"DEV01","deadline":"2026-10-12","estimatedHours":12}]}]}`;
}

export type ValidationIssue = { path: string; message: string };

/**
 * Ask the model for a draft, then prove it is safe before anyone can save it.
 *
 * Two layers of checking:
 *   1. Zod  - is the SHAPE right? (fields present, dates look like dates,
 *             hours positive)
 *   2. Cross-checks - is the CONTENT real? (every id exists, managers are
 *             actually managers, agents are actually agents, task deadlines
 *             fit inside their project)
 *
 * Nothing is written to the database in this file. It only produces a draft
 * plus a list of problems; saving is a separate, explicit step.
 */
export async function draftFromTranscript(transcript: string, directory: User[]) {
  const res = await client.chat.completions.create({
    model: process.env.DEEPSEEK_MODEL || "deepseek-chat",
    temperature: 0,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: systemPrompt(directory) },
      { role: "user", content: transcript },
    ],
  });

  const raw = res.choices[0]?.message?.content ?? "";
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { draft: null, issues: [{ path: "response", message: "The AI did not return valid JSON. Try again." }] as ValidationIssue[] };
  }

  const shape = AiDraft.safeParse(parsed);
  if (!shape.success) {
    return {
      draft: null,
      issues: shape.error.issues.map((i) => ({ path: i.path.join("."), message: i.message })),
    };
  }

  const draft = shape.data;
  const byId = new Map(directory.map((u) => [u.id, u]));
  const issues: ValidationIssue[] = [];

  draft.projects.forEach((p, pi) => {
    const mgr = byId.get(p.managerId);
    if (!mgr) issues.push({ path: `projects[${pi}].managerId`, message: `"${p.managerId}" is not a person in the directory.` });
    else if (mgr.role !== "MANAGER") issues.push({ path: `projects[${pi}].managerId`, message: `${mgr.name} is not a manager.` });

    p.tasks.forEach((t, ti) => {
      const a = byId.get(t.assigneeId);
      const at = `projects[${pi}].tasks[${ti}]`;
      if (!a) issues.push({ path: `${at}.assigneeId`, message: `"${t.assigneeId}" is not a person in the directory.` });
      else if (a.role !== "AGENT") issues.push({ path: `${at}.assigneeId`, message: `${a.name} is not a developer.` });
      if (t.deadline > p.deadline) issues.push({ path: `${at}.deadline`, message: `Task due ${t.deadline}, after the project deadline ${p.deadline}.` });
    });
  });

  return { draft, issues };
}

import "server-only";
import OpenAI from "openai";
import { validateDraft, type AiDraft } from "./draft-schema";
export { AiDraft, type ValidationIssue } from "./draft-schema";
import type { User } from "./types";

/**
 * DeepSeek speaks the OpenAI API dialect, so we use the official OpenAI
 * client and only swap the baseURL. Nothing else about the call changes.
 */
const client = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: "https://api.deepseek.com",
});

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
    return { draft: null, issues: [{ path: "response", message: "The AI did not return valid JSON. Try again." }] };
  }

  return validateDraft(parsed, directory);
}

/** Revise the user's current draft; no writes occur until explicit approval. */
export async function reviseDraftWithAi(draft: AiDraft, instructions: string, directory: User[]) {
  const res = await client.chat.completions.create({
    model: process.env.DEEPSEEK_MODEL || "deepseek-chat",
    temperature: 0,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: systemPrompt(directory) + "\nYou are now REVISING an existing draft, not extracting a new transcript. The current draft includes the user's manual edits. Preserve all projects, tasks and fields unless the user asks to change them. Follow the user's revision instructions while obeying the directory, role and date constraints. Return the COMPLETE updated draft as JSON. Never claim to save anything." },
      { role: "user", content: JSON.stringify({ currentDraft: draft, revisionInstructions: instructions }) },
    ],
  });
  try { return validateDraft(JSON.parse(res.choices[0]?.message?.content ?? ""), directory); }
  catch { return { draft: null, issues: [{ path: "response", message: "DeepSeek did not return a usable revision. Your draft is unchanged." }] }; }
}

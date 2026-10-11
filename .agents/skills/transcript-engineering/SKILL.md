---
name: transcript-engineering
description: >-
  Procedures for testing, validating, and debugging the meeting transcript AI extraction pipeline,
  Zod schema verification, and atomic database persistence in NovaWorks.
---

# Transcript Engineering Skill

Use this skill when modifying or debugging the transcript extraction pipeline, DeepSeek prompt instructions, or the Zod schema validation logic.

## Architecture
1. **Raw Input**: Unstructured client meeting transcript (`lib/transcript.ts` sample).
2. **AI Extractor**: `lib/ai.ts` passes the transcript along with the seeded user directory to DeepSeek (`deepseek-chat`) via OpenAI SDK.
3. **Zod Validation**: `lib/draft-schema.ts` parses the raw model JSON response.
   - Rejects non-existent personnel.
   - Enforces role constraints (managers manage projects, agents perform tasks).
   - Validates chronological sanity (task deadlines <= project deadlines).
4. **Interactive Draft Review**: `components/draft-review.tsx` lets users inspect, tweak, add tasks, or invoke AI revisions.
5. **Atomic Save**: `lib/actions.ts` calls Postgres stored function `save_ai_draft_fn` to insert all projects and tasks in a single ACID transaction.

## Verification Checklist
- Run test suite: `node --test tests/draft-schema.test.mjs`
- Test sample extraction with edge cases (transcripts with schedule revisions, role reassignments, cut features).

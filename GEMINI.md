# NovaWorks — AI Meeting to Project CRM

Autonomous project execution platform converting unstructured meeting transcripts into fully scoped, estimated, and assigned CRM project graphs with enterprise-grade role governance and deterministic database persistence.

## Hard Rules & Instructions

### 1. Git Commit Policy (Mandatory)
- **NEVER** mention "AntiGravity", "Gemini", "Claude", "AI", "LLM", or assistant identity in git commit messages, branch names, or pull request descriptions.
- **NEVER** add `Co-Authored-By:` tags attributing changes to AI or automated assistants.
- Use clean, professional Conventional Commits (e.g. `feat: ...`, `fix: ...`, `refactor: ...`, `chore: ...`) written in imperative mood from the developer's perspective.

### 2. Architecture & Tech Stack
- **Framework**: Next.js 15 (App Router), React 19, TypeScript 5.
- **Styling**: Tailwind CSS v4, shadcn/ui primitives, Motion (`motion/react`).
- **Database**: PostgreSQL 17 (Supabase) with transactional function `save_ai_draft_fn`.
- **Validation**: Strict Zod schemas (`lib/draft-schema.ts`, `lib/management-schema.ts`).
- **Session/Auth**: Signed HS256 JWT cookie (`jose`), bcrypt password verification, zero client-trust RBAC.

### 3. Core Commands
- **Dev Server**: `npm run dev`
- **Build**: `npm run build`
- **Lint**: `npm run lint`
- **Tests**: `node --test tests/*.test.mjs`

### 4. Customization Discovery
- Rules are located in `.agents/rules/` and `GEMINI.md`.
- Skills are located in `.agents/skills/`.
- MCP configurations are managed in `~/.gemini/config/mcp_config.json`.

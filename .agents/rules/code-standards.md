# Engineering Code Standards & Architecture Guidelines

## Architecture Overview
- **Framework**: Next.js 15 (App Router) with React 19 and TypeScript 5.
- **Styling**: Tailwind CSS v4, Base UI / Radix primitives, Lucide React icons, Motion (motion/react).
- **Backend**: Next.js Server Components and Server Actions.
- **Database**: PostgreSQL (Supabase) accessed via `@supabase/supabase-js`.
- **Authentication**: Signed HS256 JWT in an `httpOnly` secure cookie (`jose`). Role-based access control (RBAC) enforced on data queries via server checks, never client-side button hiding.

## Key Rules
1. **Security & RLS**:
   - Queries must always respect user roles (`ADMIN`, `MANAGER`, `AGENT`).
   - Server Actions must validate caller session via `requireSession()`.
   - Never trust client-supplied user IDs or role claims; always derive identity from verified session cookies.
2. **Deterministic Schemas**:
   - All AI responses and form submissions must be validated through strict Zod schemas (`lib/draft-schema.ts`, `lib/management-schema.ts`).
   - AI outputs must conform to existing team directories with zero hallucinated assignees or invalid foreign keys.
3. **UI/UX Excellence**:
   - Clean, premium, venture-backed aesthetics: crisp typography, high-contrast accessible states, subtle micro-interactions, responsive layouts.
   - Avoid generic AI buzzwords or low-effort filler text. Maintain authoritative, product-centric engineering terminology.

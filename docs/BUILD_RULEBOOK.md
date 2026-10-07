# ⚙️ BUILD RULEBOOK — How this 3-hour build is run

Operating rules I follow for the rest of this session. Written down so the
whole team works the same way.

## R1 — Nothing blocking waits alone
Any command taking >5s runs with `run_in_background`. While it runs I write the
next file. I never sit and watch an install.

## R2 — Batch, don't drip
All npm installs go in **one** command (`npm i a b c d`), not four. All shadcn
components in **one** `shadcn add` call. One dependency tree resolution, not six.

## R3 — Decide, don't research
Allowed reference sites, in priority order. I go **one level deep** and stop:
1. `nextjs.org/docs` — framework behaviour
2. `ui.shadcn.com/docs/components/*` — component APIs
3. `supabase.com/docs` — client + SQL
4. `api-docs.deepseek.com` — model ids, JSON mode
5. `zod.dev`, `motion.dev` — only if an API surprises me

If an answer isn't on those five, I write the obvious version and move on.
**No speculative searching.** Training-data-dense stack chosen on purpose
(Next.js App Router + Tailwind + Postgres + OpenAI-shaped SDK) so I'm not
guessing APIs.

## R4 — Managed service over hand-written code, except when the brief says no
Supabase for the database (hosted Postgres, free, 30s to provision).
shadcn for components (copied in, no version fights).
But: **no Clerk / Supabase Auth** — the brief forbids signup/verification/reset,
which is the only thing those products save you. See LIGHTHOUSE Part 2.

## R5 — Security lives on the server, always
Every data read goes through one guard function. The browser never holds a
service key. Hiding a button is never the access control.

## R6 — The AI never writes to the database directly
AI output → Zod schema → cross-check every ID against real rows → single
transaction. Invalid output saves **nothing** and asks the admin to correct it.

## R7 — Demo path first, polish second
Ship in this order, and a judge can be shown the product at any checkpoint:
login → admin dashboard → transcript → AI → project detail → manager view →
agent view → motion/polish → README + deploy.

## R8 — The LIGHTHOUSE doc is written as we go
`docs/LIGHTHOUSE.md` grows with each feature, in plain English, for someone who
has never seen the code. It is a deliverable, not an afterthought.

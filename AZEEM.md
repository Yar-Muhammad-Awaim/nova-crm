# AZEEM.md — Onboarding: read this, then pick a lane

**Project:** AI Project-Manager CRM for The Infinity Hack '26 (3-hour MVP).
**Elevator pitch:** Admin pastes a meeting transcript → DeepSeek extracts 3 projects + 12 tasks
with owners/deadlines/effort → saved to Postgres → each role sees only their own slice.

Deeper explanation of *why* everything is built this way lives in **`docs/LIGHTHOUSE.md`** —
read that before a judge talks to you. This file is just "what's done, what's next, don't break this".

---

## 1. Current state (as of handover)

| Thing | Status |
|---|---|
| Next.js 15 (App Router) + TS + Tailwind v4 | ✅ running on `:3000` |
| Supabase Postgres — `users`, `projects`, `tasks` | ✅ live, hosted |
| 10 demo accounts, bcrypt `Demo123!` | ✅ seeded already |
| `save_ai_draft()` atomic save function | ✅ in the database |
| Session auth (signed JWT cookie) | ✅ written |
| Role guards (admin/manager/agent) | ✅ written |
| DeepSeek → Zod → ID validation pipeline | ✅ written, **never run yet** |
| 8 screens + 20 shadcn components + motion | ✅ built |
| Typecheck `npx tsc --noEmit` | ✅ clean |
| README.md for submission | ❌ **not started** |
| Vercel deploy | ❌ **not started** |
| Demo video | ❌ **not started** |

### 🔴 THE ONE BLOCKER
`.env.local` has two placeholder values. **Nothing that touches the database or the AI works until
these are real.** Login will fail, every page will 500.

```
SUPABASE_SERVICE_ROLE_KEY=PASTE_SERVICE_ROLE_KEY_HERE   <-- from Supabase dashboard
DEEPSEEK_API_KEY=PASTE_DEEPSEEK_KEY_HERE                <-- team has this
```

Supabase project ref: `eriokbmholwbqaylnreh` · keys at
`supabase.com/dashboard/project/eriokbmholwbqaylnreh/settings/api-keys` (the **service_role** one).

---

## 2. Run it

```sh
cd /home/uwaim/projects/infinity_hack
npm install        # ONLY if node_modules is missing — see gotcha #1
npm run dev        # http://localhost:3000
```

Log in as `admin@novaworks.example` / `Demo123!` → sidebar → **Create from Transcript** →
**Load sample** → **Create from Transcript** → review → **Save to CRM**.

Reset generated data between tests without deleting users: `resetGeneratedData()` in `lib/actions.ts`
(deletes projects; tasks cascade; the 10 seeded users are untouched).

---

## 3. File map — where everything lives

```
lib/
  types.ts        TS types for User / Project / Task / Session
  supabase.ts     server-only DB client (service role key)
  session.ts      signed-cookie login session (jose). getSession() = who is asking
  data.ts         ★ ALL ACCESS CONTROL. getProjects / getTasks / getProjectById
  ai.ts           ★ DeepSeek call + Zod schema + ID cross-checks
  actions.ts      server actions: login, logout, analyze, save, edit, reset
  transcript.ts   the supplied meeting transcript, verbatim
  ui.ts           role colours, date formatting, initials

app/
  page.tsx            public landing page (logged-in users → /dashboard). See §8
  login/page.tsx      split hero + sign-in
  (app)/layout.tsx    auth gate + sidebar
  (app)/dashboard     role-aware home
  (app)/transcript    ★ the AI studio (admin only)
  (app)/projects      list + [id] detail
  (app)/my-tasks      agent view
  (app)/workload      effort summed per developer
  (app)/team          read-only directory

components/
  transcript-studio.tsx  ★ the showpiece: input → staged progress → review → save
  task-list.tsx          task rows + inline edit dialog
  project-card.tsx, app-sidebar.tsx, projects-explorer.tsx, ...
  ui/                    shadcn — regenerate, don't hand-edit
  landing/               the public landing page (hero demo, bento grid, safeguards)

lib/jev.ts               optional Jev "second opinion" on AI drafts (not wired in yet)
docs/DESIGN_AUDIT.md     design research, gap analysis, prioritized fix list
```

---

## 4. ⚠️ Gotchas that will waste your time if you don't know them

1. **DO NOT run `npm install` casually.** Moving `node_modules` across filesystems corrupted the
   `@next/swc` native binary and `next dev` died with a silent **bus error** (exit 135) on both
   turbopack and webpack. If that happens: `rm -rf node_modules && npm ci`. Verify with
   `node -e "require('@next/swc-linux-x64-gnu');console.log('ok')"`.

2. **shadcn now ships the `base-nova` style, built on Base UI — NOT Radix.**
   - `asChild` **does not exist**. Use `render`: `<Button render={<Link href="/x" />}>Go</Button>`
   - `Select`'s `onValueChange` gives you `string | null`, not `string`.
   Add components with `npx shadcn@latest add <name> -y -o`.

3. **Turbopack is off on purpose** (`package.json` → `"dev": "next dev"`). It bus-errored here.

4. **No `next/font/google`.** It timed out for 10s on this network. We use a system font stack
   defined at the bottom of `globals.css`. Don't re-add Google Fonts — venue wifi may block it.

5. **The theme is custom, not stock shadcn.** A full NovaWorks palette (deep navy + amber, oklch)
   is appended to the bottom of `app/globals.css`. Dark-first; `<html class="dark">` is hardcoded.
   **Style with the CSS variables** (`bg-primary`, `text-muted-foreground`, `border-border`) —
   never raw `bg-blue-600`, it will clash instantly.
   Custom utilities available: `.bg-grid`, `.mask-fade-b`, `.text-gradient`, `.shimmer`.

6. **Never put `SUPABASE_SERVICE_ROLE_KEY` or `DEEPSEEK_API_KEY` in a `NEXT_PUBLIC_` variable.**
   They are server-only. RLS is ON with no policies, so the browser key can read nothing —
   that is deliberate, not a bug.

---

## 5. Who owns what (two people are already editing this repo)

- **Another Claude session owns:** `app/page.tsx`, `components/landing/*`, `lib/jev.ts`,
  `docs/DESIGN_AUDIT.md` (landing page + design audit; finished, see §8).
- **The main session owns:** `lib/*`, `app/(app)/*`, `app/login/*`, `components/*.tsx`,
  `globals.css`, `layout.tsx`, `package.json`.
- **Coordinate before touching anything in the second list.** Put suggestions in `DESIGN_AUDIT.md`.

---

## 6. 🎯 Where YOU should focus (ranked by marks-per-minute)

The judging criteria are: Problem Understanding, Working MVP, Technical Implementation,
Innovation, Practical Applicability, **UI/UX**, Presentation & Understanding.

### Priority 1 — `README.md` (nobody has started it; it is a submission requirement)
`README_Template (1).md` in the repo root is the official template. Fill in every bracket and save
as `README.md`. You have everything you need: stack is Next.js 15 / Supabase Postgres / DeepSeek
`deepseek-chat` / signed-cookie session. The demo-accounts table is already correct in the template.
**This is the single highest-value unclaimed task.**

### Priority 2 — Verify the demo script end-to-end, write down what breaks
Once the keys are in, walk the brief's own 8-step demo (challenge PDF §8) and note any failure:
1. Log in as admin, paste transcript → expect **3 projects, 12 tasks**
2. Open UrbanCart → manager Ayesha, deadline **20 Oct 2026**, 4 tasks
3. Log in as **Ayesha** → only UrbanCart visible
4. Log in as **Ali** → only his 3 tasks
5. Log in as **Hamza** → 2 tasks spanning UrbanCart *and* QuickServe
6. **Security test:** as Ali, paste another project's URL → must 404
7. Refresh → data persists
8. Edit the transcript (change an owner/estimate) → re-run → output must change

**Traps the AI must get right** (these are how judges separate real AI from a hardcoded answer):
Usman's estimate 8h → **10h** · UrbanCart deadline 18 Oct → **20 Oct** · Ali's integration task
17 Oct → **19 Oct** · testing owner Zain → **Maryam** · **Kamran must NOT appear** (he's an
outsider) · no payment/inventory/maps/driver-tracking tasks (all explicitly rejected).

### Priority 3 — Demo rehearsal & the 6 questions
The rulebook says a live demo is **mandatory** and that a team who cannot explain its own code
**loses marks**. Judges ask exactly six things (rulebook §12): what problem, how it works, what you
built, where the AI is, why it's useful, what's next.
Answers for all six are in `docs/LIGHTHOUSE.md` — the "Judge-facing one-liner" boxes are written to
be said out loud. **Rehearse the security one** (Part 4), it's the most impressive.

### Priority 4 — Deploy to Vercel (bonus marks)
Supabase is already hosted, so it's `npx vercel` + set the 4 env vars in the dashboard. ~5 min.

### Don't bother with
Task status / progress % / charts / budgets — the brief says **twice** that cost calculation and
progress monitoring are out of scope. Adding them reads as not having read the brief.
Signup / forgot-password / user-management — explicitly not required.

---

## 7. One-line summary to memorise

> *"The meeting already contained the plan. We turn an hour of talk into a working project board —
> and the AI is never trusted: it proposes, we validate every person and date against the real team
> directory, a human approves, and it saves all-or-nothing."*

---

## 8. Design session: what was done (7 Oct 2026)

A second Claude session worked on design and tooling while the main session built the app.
Everything here is a **new file**; no existing logic was changed. Full detail with sources:
**`docs/DESIGN_AUDIT.md`**.

### 8.1 Landing page at `/` (new)
Logged-out visitors now land on a product page instead of being bounced to `/login`.
Logged-in users still go straight to `/dashboard`.

| Section | What it shows (all data is from the real transcript, nothing invented) |
|---|---|
| Hero | Headline "Your meeting already made the plan." + a live demo of the 3 corrections the meeting made (date 17→19 Oct, estimate 8→10 h, owner Zain→Maryam) and the one task each became |
| Stats strip | 1 transcript → 3 projects → 12 tasks → 124 hours |
| Bento grid (5 cells) | Interactive Admin / Bilal / Hamza role switcher (12 → 4 → 2 tasks), workload per developer, deadline strip, rejected features struck out, "guess a URL, get a 404" |
| Safeguards | DeepSeek drafts → Zod checks → every person matched → one transaction |
| Final CTA + footer | One button label everywhere: **"Open the demo"** → `/login` |

Files: `app/page.tsx`, `components/landing/{data.ts, hero-demo.tsx, role-views.tsx, sections.tsx, motion.tsx}`.
Checked: typecheck clean, ESLint clean, no console errors, works at phone width (390px),
respects "reduce motion", only animates transform/opacity.

### 8.2 Research: what top design engineers do
Three research agents read and extracted checkable rules from: Emil Kowalski, Jakub Krehel,
Rauno Freiberg, Paco Coursey, Benji Taylor, the Vercel Web Interface Guidelines, Linear's redesign
posts, Josh Comeau, Refactoring UI, motion.dev. The rules are in `DESIGN_AUDIT.md` §8; the
gap analysis (where the app falls short) is §3 and the fix list with file:line is §5.

### 8.3 `@shadcn/lint` (shadcn's new design-system linter, Sept 2026)
Checks that code uses our own theme colours, type scale and component variants instead of
one-off overrides. Run from a scratch install, **not yet added to `package.json`**.
- First run: **~221 issues** outside `components/ui`.
- After the main session's fixes: **161**:
  - 111 restyled components
  - 25 raw colours
  - 21 off-scale values
  - 3 dynamic classes
  - 1 inline style
- Root causes: no type scale (was 12 sizes from 7 to 15 px), role colours hardcoded as `sky`/`emerald`, and Badge has no role variants.

### 8.4 Jev (TypeSafe AI's decision model, Sept 2026)
Jev doesn't write text; it answers typed questions with real probabilities (choice / yes-no / score).
`lib/jev.ts` → `verifyDraft()` uses it as a **second opinion** on DeepSeek's draft. For every task it asks:
- Who owns this by the final decision?
- Was this work rejected in the meeting?

It flags confident disagreements, never blocks a save, and switches itself off with no API key.
**Not wired in and never run against the live API** (no key was available).

### 8.5 Already fixed by the main session after the audit ✅
- Reduced-motion support in the app (`components/motion-provider.tsx`) + shimmer stops under reduced motion
- `loading.tsx`, `error.tsx`, `not-found.tsx` added
- Screen-reader announcements (`aria-live`) in the transcript studio
- Icon-only buttons named (`aria-label`) in sidebar, demo accounts, task list
- Dark browser chrome (`themeColor`) in `app/layout.tsx`
- `h-screen` removed from the sidebar; `transition-all` removed from Button
- Most off-scale font sizes collapsed (only `text-[10px]` remains)

---

## 9. ✅ TODO: Azeem Sarwar

Tick these off as you go. Ordered by what costs marks if missing.

### 🔴 Blockers (nothing works without these)
- [ ] Put the real `SUPABASE_SERVICE_ROLE_KEY` in `.env.local` (still a placeholder)
- [ ] Put the real `DEEPSEEK_API_KEY` in `.env.local` (still a placeholder)
- [ ] Restart `npm run dev`, log in as `admin@novaworks.example` / `Demo123!` and confirm the dashboard loads

### 📄 Submission requirements
- [ ] **Write `README.md`** from `README_Template (1).md`. The current README is still the create-next-app default. Mention the landing page and (if wired) Jev.
- [ ] Deploy to Vercel (`npx vercel`, add the env vars in the dashboard) for bonus marks
- [ ] Record the demo video
- [ ] Commit everything. **Nothing past the first scaffolding commit is committed yet**; one bad `rm` loses the whole day.

### 🧪 Verify the AI actually works (never run end-to-end yet)
- [ ] Run the 8-step demo in §6 Priority 2 and write down anything that breaks
- [ ] Confirm the traps: Usman **10 h**, UrbanCart **20 Oct**, Ali's integration **19 Oct**, testing owner **Maryam**, **no Kamran**, no payment/maps/inventory tasks
- [ ] Edit the transcript (change one owner) and confirm the output changes, which proves it's not hardcoded

### 🤖 Jev second opinion (optional, but strong "Innovation" marks)
- [ ] Get a key: `TYPESAFE_API_KEY` (docs.typesafe.ai) **or** `AI_GATEWAY_API_KEY` (Vercel AI Gateway)
- [ ] Add both names to `.env.example`
- [ ] Call it once by hand and check the response shape matches `lib/jev.ts` (it follows the docs but was never tested live)
- [ ] Wire it in: in `lib/actions.ts` right after `draftFromTranscript(...)` (~line 73), call
      `verifyDraft(transcript, result.draft, directory)` and return `flags` with the draft
- [ ] In `components/transcript-studio.tsx`, show each flag next to its task, e.g. *"Second model disagrees (82%)"*
- [ ] Pitch line: *"One model drafts, a second model with calibrated probabilities checks every owner and exclusion, and code validates everything before it's saved."*

### 🎨 Design fixes still open (details + file:line in `docs/DESIGN_AUDIT.md` §5)
- [ ] **Login page**: now that `/` carries the pitch, make `/login` a plain centered sign-in (drop the left pitch column, use the same logo as the landing page) — `DESIGN_AUDIT.md` §7
- [ ] Remove em dashes from UI copy: `app/login/page.tsx` (3), `app/layout.tsx` title (1)
- [ ] Replace the 11 remaining `text-[10px]` with `text-xs` in:
  - `transcript-studio.tsx`
  - `demo-accounts.tsx`
  - `projects/[id]/page.tsx`
  - `team/page.tsx`
  - `task-list.tsx`
  - `app-sidebar.tsx`
  - `project-card.tsx`
- [ ] Role colours: `lib/ui.ts` `ROLE_STYLE` still uses raw `sky-500` / `emerald-500`. Move to theme tokens and add `admin` / `manager` / `agent` variants to `components/ui/badge.tsx`
- [ ] Transcript box: Cmd/Ctrl+Enter to submit + "you have unsaved text" warning on leaving
- [ ] Project filters (`components/projects-explorer.tsx`) → keep them in the URL so refresh/back works
- [ ] Per-page browser titles (`export const metadata` in each `app/(app)/*/page.tsx`)
- [ ] Animate the AI results in one by one when the draft arrives (copy the variants from `components/landing/hero-demo.tsx`)
- [ ] Optional: adopt `@shadcn/lint` permanently. Run `npm i -D @shadcn/lint`, then copy the config from `DESIGN_AUDIT.md` §4 (start rules at `"warn"`)

### 🎤 Demo day
- [ ] Open the demo on the **landing page** (`/`, logged out): the hero animation explains the product in 10 seconds
- [ ] Then click "Open the demo" → log in → run the transcript live
- [ ] Rehearse the 6 judge questions from `docs/LIGHTHOUSE.md` (especially security: the 404 on someone else's project URL)

### Don't do
- Charts, progress %, budgets, signup/password reset: the brief says these are out of scope
- `npm install` while the dev server is running (see gotcha #1)

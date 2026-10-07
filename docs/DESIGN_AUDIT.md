# Design audit: what top design engineers do, and where Nova falls short

Written 7 Oct 2026 by the design session (the build session owns `app/(app)`, `app/login`, `lib/*`, `components/ui`).
Everything below is measured against the codebase as of this date, with file:line references so it can be fixed directly.

## Contents

1. [What shipped in this pass](#1-what-shipped-in-this-pass)
2. [Sources read](#2-sources-read)
3. [Scorecard: where we stand](#3-scorecard-where-we-stand)
4. [shadcn/lint results](#4-shadcnlint-results)
5. [Fix list for the build session, by priority](#5-fix-list-for-the-build-session-by-priority)
6. [Jev: where it fits](#6-jev-where-it-fits)
7. [Landing page vs login page](#7-landing-page-vs-login-page)
8. [Rules we adopted (the short version)](#8-rules-we-adopted-the-short-version)

---

## 1. What shipped in this pass

| File | What it is |
|---|---|
| `app/page.tsx` | Public landing page. Logged-in users still redirect to `/dashboard`. |
| `components/landing/data.ts` | All landing content, taken from the challenge transcript. No invented numbers. |
| `components/landing/hero-demo.tsx` | Hero: the three moments the meeting changed its mind (date, estimate, owner), and the one task each became. |
| `components/landing/role-views.tsx` | Bento cell: the same 12 tasks seen as Admin / Bilal (manager) / Hamza (developer). |
| `components/landing/sections.tsx` | Nav, hero, stats, bento (5 cells), safeguards pipeline, final CTA, footer. |
| `components/landing/motion.tsx` | `MotionConfig reducedMotion="user"`, scroll reveal, trackless bars that scale (never animate width). |
| `lib/jev.ts` | Optional Jev second-opinion check on AI drafts. Not wired in yet; see section 6. |

The landing page passes `@shadcn/lint` with every rule on (except one false positive, see 4), uses only theme tokens, uses only the Tailwind type scale, and has zero em dashes in visible copy.

## 2. Sources read

**Motion and interaction**
- Emil Kowalski: [You don't need animations](https://emilkowal.ski/ui/you-dont-need-animations), [7 practical animation tips](https://emilkowal.ski/ui/7-practical-animation-tips), [Good vs great animations](https://emilkowal.ski/ui/good-vs-great-animations), [Building a toast component](https://emilkowal.ski/ui/building-a-toast-component), [Building a drawer](https://emilkowal.ski/ui/building-a-drawer-component)
- Jakub Krehel: [Details that make interfaces feel better](https://jakub.kr/writing/details-that-make-interfaces-feel-better), [make-interfaces-feel-better skill](https://github.com/jakubkrehel/make-interfaces-feel-better)
- Benji Taylor: [Family values](https://benji.org/family-values)
- motion.dev: [Performance](https://motion.dev/docs/performance), [Accessibility](https://motion.dev/docs/react-accessibility), [Layout animations](https://motion.dev/docs/react-layout-animations)

**Interface details**
- [Vercel Web Interface Guidelines](https://vercel.com/design/guidelines), plus its [lint-style command version](https://github.com/vercel-labs/web-interface-guidelines/blob/main/command.md)
- Rauno Freiberg: [Invisible details of interaction design](https://rauno.me/craft/interaction-design)
- Paco Coursey: [Disable theme transitions](https://paco.me/writing/disable-theme-transitions), [px vs rem](https://paco.me/writing/px-vs-rem)
- ibelick: [baseline-ui](https://github.com/ibelick/ui-skills/blob/main/skills/baseline-ui/SKILL.md)

**Landing pages**
- Linear: [How we redesigned the Linear UI](https://linear.app/now/how-we-redesigned-the-linear-ui), [Behind the latest design refresh](https://linear.app/now/behind-the-latest-design-refresh), plus the live [linear.app](https://linear.app) and [attio.com](https://attio.com) homepages
- Josh Comeau: [Designing shadows](https://joshwcomeau.com/css/designing-shadows/), [Make beautiful gradients](https://joshwcomeau.com/css/make-beautiful-gradients/)
- Refactoring UI: [Labels are a last resort](https://www.refactoringui.com/previews/labels-are-a-last-resort)
- Bento: [When bento grids help vs hurt](https://www.buildmvpfast.com/blog/bento-grid-helps-vs-hurts-conversion-2026)
- Anti-slop: [925 Studios on AI design tells](https://www.925studios.co/blog/ai-slop-design-tells)

**Tooling**
- [`@shadcn/lint`](https://github.com/shadcn-ui/lint) v0.2.0 (README read from the npm package)
- Jev: [TypeSafe API reference](https://docs.typesafe.ai/api), [Vercel guide: Jev and AI SDK](https://vercel.com/kb/guide/typesafe-jev-and-ai-sdk)

## 3. Scorecard: where we stand

Each area is scored by how many of its checkable rules the app (not the new landing page) passes.

| Area | Status | The gap in one line |
|---|---|---|
| Design tokens & type scale | **Weak** | 12 different hand-picked font sizes from 7px to 15px; role colours use raw `sky`/`emerald` palette. |
| Motion | **Weak** | No reduced-motion handling anywhere; `.shimmer` loops forever; no press feedback. |
| Loading / empty / error states | **Weak** | `Skeleton` installed but unused; no `loading.tsx` / `error.tsx` / `not-found.tsx`. |
| Accessibility | **Mixed** | Labels and login autocomplete are right; 3 icon-only buttons have no name; nothing is announced while the AI works. |
| Forms & keyboard | **Mixed** | Good login form; transcript box lacks Cmd/Ctrl+Enter and an unsaved-changes guard. |
| URL as state | **Weak** | Project filters live in `useState`, so refresh/back loses them. |
| Content & typography details | **Good** | `tabular-nums` used, `text-balance` used, no `...` in copy, dates via `toLocaleDateString`. |
| Server-side security | **Good** | Access decided in the query (`lib/data.ts`), unauthorised project is a 404. |
| Dark mode basics | **Mostly good** | `color-scheme: dark` set; no `<meta name="theme-color">`. |

## 4. shadcn/lint results

`@shadcn/lint` (released Sept 2026) is an "agent-first" ESLint plugin: it knows our components, variants and theme, and when a rule breaks it says what to use instead. Six rules: `no-restyle`, `no-raw-colors`, `no-arbitrary-values`, `no-inline-styles`, `no-unknown-classes`, `require-static-classes`.

I ran it **from a scratch install** (not added to `package.json`, to avoid colliding with the build session's `npm ci`) over `app`, `components`, `lib`:

| Rule | Hits (excluding generated `components/ui`) |
|---|---|
| `no-arbitrary-values` | ~105, almost all `text-[11px]`, `text-[13px]`, `text-[12.5px]`… |
| `no-restyle` | ~90, mostly re-colouring and re-sizing `Badge` / `AvatarFallback` inline |
| `no-raw-colors` | 24, all `sky-*` / `emerald-*` role colours |
| `require-static-classes` | 3, `className={ROLE_STYLE[role]}` on `Badge` |
| `no-inline-styles` | 2 (`workload/page.tsx:86` width, `login/page.tsx:17` gradient) |
| `no-unknown-classes` | 1 |

Worst files: `transcript-studio.tsx` (62), `task-list.tsx` (33), `project-card.tsx` (29), `team/page.tsx` (22).

**What the numbers mean.** They are not 221 separate bugs. They come down to three missing design-system decisions:

1. **No type scale.** Sizes used: 7, 8, 9, 10, 10.5, 11, 11.5, 12, 12.5, 13, 14, 15 px. Refactoring UI says no two sizes within about 25% of each other; Vercel says nothing a user must read below 12px. Fix: map to `text-xs` (12) / `text-sm` (14) / `text-base` (16) and delete the rest. Anything at 7-9px (avatar initials, `team/page.tsx`, `project-card.tsx`) is unreadable and fails accessibility.
2. **Role colours aren't tokens.** `lib/ui.ts:11-15` `ROLE_STYLE` hardcodes `sky-500` / `emerald-500`. Fix: declare `--color-role-manager` / `--color-role-agent` in `globals.css` (the linter suggests `chart-2` and `chart-3`, which are close), then...
3. **Badge has no role variant.** Add `manager` / `agent` / `admin` variants to `components/ui/badge.tsx` and pass `variant={role}` instead of `className={ROLE_STYLE[role]}`. That alone clears the `require-static-classes` hits and most `no-restyle` ones.

**Adopting it** (needs the build session's OK since it touches `package.json`):

```bash
npm i -D @shadcn/lint @typescript-eslint/parser
```

```js
// eslint.config.mjs, add to the existing config
import { plugin as shadcn } from "@shadcn/lint"
// ...
{
  files: ["**/*.{ts,tsx}"],
  plugins: { shadcn },
  rules: {
    "shadcn/no-restyle": ["error", { allow: ["layout"] }],
    "shadcn/no-raw-colors": "error",
    "shadcn/no-arbitrary-values": "error",
    "shadcn/no-inline-styles": "error",
    "shadcn/require-static-classes": "error",
  },
},
{ files: ["components/ui/**"], rules: { "shadcn/no-restyle": "off" } },
```

Start everything at `"warn"` if the error count blocks the demo.

**Known false positive:** our custom `.bg-grid` utility (`globals.css`) is read as a colour named `grid`. Renaming the utility to `.grid-paper` would silence it.

## 5. Fix list for the build session, by priority

Ordered by what a judge would notice first, then by effort.

**P0: visible in the demo**

1. **Announce AI progress.** `components/transcript-studio.tsx`: wrap the status text ("Generating…") in `aria-live="polite"`, keep the button label and add a spinner rather than replacing the label, and end loading text with `…` (the single ellipsis character, not three dots). *(Vercel guidelines)*
2. **Stagger the AI result in.** When the draft arrives, reveal projects then tasks with about 80-100ms stagger, `opacity 0 → 1, y: 8 → 0, blur(4px) → 0`, ~300ms ease-out `[0.23, 1, 0.32, 1]`. This is the "wow" moment; it should feel like assembly, not a page swap. *(Jakub Krehel, Emil Kowalski)* `hero-demo.tsx` has a working version to copy.
3. **Name the icon-only buttons.** `components/app-sidebar.tsx:106` (menu toggle), `components/demo-accounts.tsx:66` (copy email), `components/task-list.tsx:85`. Add `aria-label`; mark decorative icons `aria-hidden="true"`.
4. **Collapse the type scale** (section 4, point 1). Biggest single visual lift; also fixes unreadable 7-9px text.

**P1: polish judges feel without naming it**

5. **Reduced motion.** Wrap `app/(app)/layout.tsx` children in `<MotionConfig reducedMotion="user">` (or reuse `LandingMotion` from `components/landing/motion.tsx`). In `globals.css`, stop `.shimmer` under `@media (prefers-reduced-motion: reduce)`.
6. **Press feedback.** `components/ui/button.tsx:6` uses `transition-all` and `active:translate-y-px`. Prefer `transition-[color,background-color,border-color,box-shadow,scale]` + `active:scale-[0.97]`. Never `transition: all`. *(Emil: 0.97; Jakub: 0.96, never below 0.95)*
7. **Loading and error routes.** Add `app/(app)/loading.tsx` using the already-installed `Skeleton`, shaped like the real page so nothing shifts; add `app/(app)/error.tsx` with a retry button and `app/not-found.tsx` with a way back. Show the skeleton only after ~150ms. *(Vercel guidelines)*
8. **Transcript box keyboard + safety.** Cmd/Ctrl+Enter submits (Enter stays a newline); `beforeunload` warning when text is present and unsaved. *(Vercel guidelines)*
9. **Per-page titles.** Only `app/layout.tsx` sets `metadata`. Add `export const metadata = { title: "Projects · NovaWorks" }` etc. per page.

**P2: correctness that shows up on refresh, mobile, or a screen reader**

10. **Filters in the URL.** `components/projects-explorer.tsx:13-14` keeps search and manager filter in `useState`. Move them to search params so refresh and Back keep them.
11. **`h-screen` → `h-dvh`.** `components/app-sidebar.tsx:115` (`min-h-screen` elsewhere → `min-h-dvh`). Prevents the iOS address-bar jump.
12. **Theme colour.** Add `export const viewport = { themeColor: "#0a0e18" }` (the dark `--background`, oklch(0.165 0.022 265)) in `app/layout.tsx` so the mobile browser chrome is dark.
13. **Inline styles.** `workload/page.tsx:86` animates bar `width`; use `scaleX` with `origin-left` like `GrowBar` in `components/landing/motion.tsx` (transform-only, no layout). `login/page.tsx:17` radial gradient can become `bg-radial from-primary/20 to-transparent to-70%`.
14. **Mobile input size.** Inputs at `text-sm` (14px) make iOS zoom on focus. Use `text-base md:text-sm`.

## 6. Jev: where it fits

**What it is.** Jev (TypeSafe AI, launched 15 Sept 2026) is a "System One" model. It **does not write text**: given a `state` (our transcript) and named questions, it returns typed answers with real probability distributions:
- `choice`: pick one of up to 255 options
- `noul`: a yes/no probability
- `score`: a rating on a 2-10 level rubric

It costs $0.042 per million input tokens, has no output-token charge, and answers in 70-500ms. Model id: `jev-latest` (direct) or `typesafe-ai/jev` (AI Gateway).

**Why it fits Nova.** It doesn't replace DeepSeek, because Jev can't produce the 3 projects and 12 tasks. It **checks** them. This app's hardest cases are exactly the corrections and exclusions the hero demo shows: "8 hours, no wait, 10", "Zain, actually Maryam", "no payment gateway". Those are atomic decisions, which is what Jev is built for.

**What `lib/jev.ts` does.** `verifyDraft(transcript, draft, directory)` asks two questions per task:

| Question | Type | Asks |
|---|---|---|
| `owner_N` | `choice` | Over all AGENT ids: who owns this by the final decision? |
| `scope_N` | `noul` | Was this rejected, excluded or deferred? |

It returns `flags` when Jev disagrees with the draft confidently (owner probability ≥ 0.7, excluded ≥ 0.8; thresholds follow Vercel's guidance of 0.7 for read-only actions and 0.9+ for destructive ones). It is advisory, never blocks a save, and returns `{ status: "skipped" }` when no key is set or the call fails.

**To wire it in** (build session, `lib/actions.ts` around line 73, after `draftFromTranscript` succeeds):

```ts
const check = await verifyDraft(transcript, result.draft, directory);
// return check.flags alongside the draft, and in transcript-studio.tsx show each
// flagged task with an amber "Second model disagrees (82%)" note next to it.
```

Env: `TYPESAFE_API_KEY` (direct) or `AI_GATEWAY_API_KEY` (Vercel AI Gateway). Add one to `.env.example`.

**Not verified:** I had no Jev key in this environment, so the request shape follows the published API reference but hasn't been exercised against the live endpoint. The Vercel AI SDK names the yes/no type `boolean` where the direct API uses `noul`; `lib/jev.ts` uses the direct API's names. Run it once with a key before demoing.

**Pitch line for judges:** "One model drafts, a second model with calibrated probabilities checks every owner and every exclusion, and code validates everything before it is saved."

## 7. Landing page vs login page

`/` is now the pitch. `app/login/page.tsx` still carries its own pitch column (headline, flow steps), so a visitor reads the story twice in two different layouts. Recommendation:

- Make `/login` a **focused sign-in**: one centered column, max-w-sm, the logo linking back to `/`, the form, then `DemoAccounts`. Drop the left pitch section and its inline radial gradient (`login/page.tsx:17`).
- If you want a visual on wide screens, keep a narrow panel showing **only** the landing headline "Your meeting already made the plan." so the two pages read as one product.
- Copy alignment: the landing CTA everywhere says **"Open the demo"** and goes to `/login`. The login heading "Sign in" is right as-is.
- Use the same logo treatment as `components/landing/sections.tsx` `Logo()` (primary square + Sparkles + "NovaWorks"). Drop the "Technologies" pill.
- Remove the em dash in the login subtitle ("…twelve assigned tasks — with owners…") and in `app/layout.tsx` `title`. Em dashes in UI copy are the most-cited "AI wrote this" tell.

## 8. Rules we adopted (the short version)

**Motion**
- Under 300ms for UI. Enter `ease-out`; on-screen movement `ease-in-out`. House curve `cubic-bezier(0.23, 1, 0.32, 1)`.
- Never animate from `scale(0)`: start at 0.95-0.97 plus opacity 0.
- Animate only `transform` and `opacity`. Never `transition: all`.
- Don't animate keyboard-triggered or high-frequency actions.
- Everything under `MotionConfig reducedMotion="user"`.

**Layout**
- Hero headline 2 lines max, subtext 20 words max, one primary CTA label used everywhere.
- Bento: one dominant cell, exact cell count, each cell shows a real product moment rather than an icon plus text.
- No equal three-card rows, no purple gradients, no eyebrow above every heading.

**Detail**
- `tabular-nums` on every number that changes.
- `text-balance` on headings, `text-pretty` on paragraphs.
- `…` not `...`. Non-breaking space in `12&nbsp;h`.

**System**
- Theme tokens only.
- Tailwind type scale only.
- Restyle components through variants, not `className`. `@shadcn/lint` enforces all three.

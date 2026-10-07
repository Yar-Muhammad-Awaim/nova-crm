# 🗼 LIGHTHOUSE — How We Solved This, Explained For Humans

> This document is written **as the code is being written**. Read it top-to-bottom
> and you will be able to stand in front of a judge and explain every single
> decision without having read one line of code.
>
> Audience assumption: **you have never seen this codebase before.**

---

## PART 0 — What are we even building?

A company called **NovaWorks Technologies** (fictional, Lahore) has a problem.

They had a 1-hour meeting. In that meeting they decided on **3 client projects**
and **12 tasks**, who owns each task, how many hours each takes, and when each
is due. Normally, someone now has to sit down and **type all 15 records into a
project-management tool by hand**. That is boring, slow, and people make mistakes.

**Our app removes that step.**

```
Admin pastes the meeting transcript  →  AI reads it  →  3 projects + 12 tasks
                                                          appear in the CRM
```

That's it. That is the whole product. Everything else exists to support that one move.

### The three people who use it

| Who | What they see | Why |
|---|---|---|
| **Admin** | Everything + the "Create from Transcript" button | They run the company |
| **Manager** (3 of them) | Only the projects *they* manage | They don't need other PMs' work |
| **Agent / Developer** (6 of them) | Only the tasks *assigned to them* | They just need their to-do list |

> ⚠️ **The trap the brief sets:** it is not enough to *hide* buttons. If an Agent
> manually types another project's URL, the server must still say **no**.
> We enforce this on the server, never in the browser. See Part 4.

---

## PART 1 — The shape of the data

Three tables. That's all. If you understand this picture you understand the app.

```
┌─────────────┐          ┌──────────────┐          ┌─────────────┐
│    users    │          │   projects   │          │    tasks    │
├─────────────┤          ├──────────────┤          ├─────────────┤
│ id   "PM01" │◄────┐    │ id    (uuid) │◄────┐    │ id   (uuid) │
│ name        │     │    │ name         │     └────┤ project_id  │
│ email       │     └────┤ manager_id   │          │ title       │
│ password_   │          │ client_name  │          │ description │
│   hash      │          │ description  │     ┌────┤ assignee_id │
│ role        │          │ deadline     │     │    │ deadline    │
│ specializa- │          └──────────────┘     │    │ estimated_  │
│   tion      │◄───────────────────────────────┘   │   hours     │
│ skills[]    │                                    └─────────────┘
└─────────────┘
```

**Read it in plain English:**
- A **user** is one of the 10 seeded employees. `role` is `ADMIN`, `MANAGER`, or `AGENT`.
- A **project** belongs to exactly one **manager**.
- A **task** belongs to exactly one **project** and is assigned to exactly one **agent**.

### Why are user IDs text like `PM01` and `DEV03` instead of random UUIDs?

This is the single most important design decision in the project, so read this twice.

When we send the meeting transcript to the AI, we also send it the **team
directory**. The AI has to tell us *"this task belongs to Ali Raza."* But the AI
must **never invent a database row**. So instead of letting it return a name
(which we would then have to fuzzy-match — fragile), we make it return an **ID
that already exists**: `"assigneeId": "DEV01"`.

Those IDs come straight from the challenge brief (ADMIN, PM01–PM03, DEV01–DEV06),
so they are short, human-readable, and **impossible to hallucinate without us
noticing** — because we validate every returned ID against the real users table
before we save anything.

> **Judge-facing one-liner:** *"The AI never creates people. It can only point at
> people that already exist, using stable IDs, and we verify every pointer."*

---

## PART 2 — The stack, and why each piece was chosen

We had **3 hours**. Every choice below was made to maximise *working features per
minute*, not to look clever.

| Layer | Choice | Why this and not something else |
|---|---|---|
| Framework | **Next.js 15 (App Router)** | Frontend *and* backend in one deploy. Server Components mean our data-access rules run on the server by default — security is the default, not an add-on. |
| Styling | **Tailwind CSS v4** | No CSS files to invent at 2am. |
| Components | **shadcn/ui** | Not a dependency — it *copies* accessible Radix-based components into our repo. Zero version conflicts, fully restyleable. |
| Motion | **Framer Motion** | The polish layer. Judges score UI/UX heavily. |
| Database | **Supabase (hosted Postgres)** | Free, hosted, real Postgres. Hosted DB = deployment bonus marks. Provisioned in ~30 seconds. |
| Auth | **Hand-rolled cookie session (~40 lines)** | See the honest note below. |
| AI | **DeepSeek** via the **OpenAI SDK** | DeepSeek speaks the OpenAI API dialect, so we use the battle-tested OpenAI client and just change the `baseURL`. Supports forced JSON output. |
| Validation | **Zod** | The safety net between "AI said something" and "we wrote to the database". |

### ❗ Honest note: why we did NOT use Clerk / Supabase Auth

The brief says, in bold: **"No signup, no email verification, no password reset,
no user-management screens."**

Clerk and Supabase Auth are *excellent* — at exactly the thing we were told not
to build. Both are built around a self-service signup funnel, email
confirmation, and a hosted user table we'd have to sync with our own. Bending
them into "10 pre-made accounts, password login only, no signup page" is **more**
work than writing the login ourselves, not less.

What we wrote instead: one email+password check, one signed cookie, one helper
that reads it. That's it.

> **Judge-facing one-liner:** *"We used a managed service everywhere it saved us
> time, and skipped it in the one place where it would have cost us time. Auth
> here is 10 fixed accounts and no signup flow — a signed cookie is the right
> size for that."*

### ❗ Honest note: why we did NOT mix in Ant Design

Ant Design is a complete design system with its own tokens, fonts, spacing scale
and reset. Dropping it on top of Tailwind + shadcn means **two design systems
fighting over the same buttons** — that is exactly how a UI starts to look
"generated". We picked one system (shadcn + Tailwind) and committed to it.

---

## PART 3 — *(filled in as we build)*

# Architecture — How This Works, Explained For Humans

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

---

## PART 3 — The AI flow, step by step

This is the part judges will ask about. Learn this section properly.

### The naive version (what we did NOT do)

> *"Send the transcript to the AI, take the JSON back, write it to the database."*

This fails in at least four ways, and the challenge brief is quietly built to
punish every one of them:

1. The AI invents an employee who doesn't exist (the transcript deliberately
   mentions **Kamran**, an outsider — "Do not add him to our team").
2. The AI uses a number that was **later corrected**. The transcript is full of
   traps: Usman's estimate changes 8h → **10h**. UrbanCart's deadline changes
   18 Oct → **20 Oct**. Ali's integration task moves 17 Oct → **19 Oct**. The
   testing owner changes Zain → **Maryam**.
3. The AI creates tasks for features that were **explicitly rejected** —
   payment gateway, inventory, live maps, driver tracking.
4. The AI succeeds on project 1 and 2, fails on project 3, and you are left
   with **two orphan projects** in your database.

### What we actually built: a four-gate pipeline

```
  transcript ──▶ [1] PROMPT ──▶ [2] SHAPE ──▶ [3] IDENTITY ──▶ [4] HUMAN ──▶ [5] ATOMIC
                   gate           gate          gate             gate          save
                                                                                │
                  anything that fails ──▶ nothing is saved, admin sees why ◀────┘
```

#### Gate 1 — The prompt (`lib/ai.ts`)

We hand the model the **real team directory** as part of the system prompt —
every id, name, role, specialization and skill list — then state eight hard
rules. The two that matter most:

> *"A transcript is a conversation: estimates, owners and dates get CORRECTED as
> it goes. Always obey the LAST agreed decision and ignore every superseded
> earlier figure."*
>
> *"Features that were explicitly rejected, excluded, deferred or called 'future
> work' must NOT become tasks."*

We also set `temperature: 0` (we want the same answer every time, not
creativity) and `response_format: { type: "json_object" }`, which forces the
model to emit valid JSON rather than a chatty paragraph with JSON in the middle.

#### Gate 2 — Shape validation (Zod)

Is it the right *structure*? Every project has a name, a client, a manager id, a
deadline matching `YYYY-MM-DD`; every task has a title, an assignee, a date, and
`estimatedHours` that is a **positive number**. If any field is missing or
malformed, we stop here.

#### Gate 3 — Identity validation (our own code)

Shape being right doesn't make the content true. So we check the *facts*:

- Does `managerId` exist in the users table — **and is that person actually a MANAGER?**
- Does `assigneeId` exist — **and is that person actually an AGENT?**
- Is every task deadline **on or before** its project deadline?

This is the gate that catches "Kamran". He isn't in the directory, so he cannot
pass, and nothing is saved.

#### Gate 4 — The human (the review panel)

Even after passing every automated gate, **we still do not save.** The admin sees
the proposed projects and tasks laid out, with each person's name resolved from
their id, and presses **Save to CRM** — or edits the transcript and runs it again.

> **Judge-facing one-liner:** *"The AI proposes. It never commits. A human always
> presses the button."*

#### Gate 5 — Atomic save (`save_ai_draft` in Postgres)

The save is a single Postgres function. A Postgres function runs inside one
implicit transaction, so if task 11 of 12 fails, **projects 1 and 2 roll back
too** and the database is byte-for-byte as it was before. The brief asks for
"a database transaction or equivalent all-or-nothing save" — this is it.

It re-checks the manager and agent roles a *third* time, in SQL. Not paranoia:
that function is the last door before the data is real, and it should not depend
on the caller having been careful.

### The double-click problem

The brief says: *"Disable repeated clicks while processing to avoid accidental
duplicates."* The Create button is disabled for the whole round-trip, so an
impatient admin cannot create six copies of the same three projects.

---

## PART 4 — Security: why hiding a button is not access control

The brief says this twice, so it is clearly where teams lose marks:

> *"Enforce the same access restrictions in data requests, not only by hiding
> frontend buttons."*

Here is the attack a judge will try: **log in as Ali (a developer), then paste
another project's URL into the address bar.**

Our answer is in `lib/data.ts`:

```ts
export async function getProjectById(s: Session, projectId: string) {
  const allowed = await getProjects(s);                  // what may THIS user see?
  const project = allowed.find((p) => p.id === projectId);
  if (!project) throw new Error("FORBIDDEN");            // not on your list → no.
  return { ...project, tasks: await getTasks(s, projectId) };
}
```

Read what that does: it **ignores** the fact that you asked for a specific id. It
independently rebuilds the list of projects you are entitled to and then checks
whether your id is on it. There is no path through this function that returns a
project you weren't already allowed to see.

Three more things make this hold:

1. **Identity comes from a signed cookie, never from the request.**
   `getSession()` reads an HS256-signed JWT. Nothing anywhere accepts a
   `role` or `userId` sent by the caller — so you cannot simply claim to be the
   admin.

2. **The browser has no database credentials.** The Supabase service key lives
   only in server-side environment variables. All three tables have Row Level
   Security **enabled with no policies**, which means the public key can read
   *nothing*. There is no client-side query to intercept, because there are no
   client-side queries.

3. **An agent never receives a teammate's task.** In `getTasks`, when the role is
   `AGENT` we add `.eq("assignee_id", s.userId)` to the query itself. Other
   developers' tasks are not filtered out in the browser — **they never leave
   Postgres.**

> **Judge-facing one-liner:** *"Try it. Log in as Ali and paste Bilal's project
> URL. You get a 404, because the server rebuilt his permission list and his id
> wasn't on it."*

---

## PART 5 — The screens, and what each one proves

| Screen | Who | What it demonstrates |
|---|---|---|
| **Login** | everyone | 10 seeded accounts, no signup. One-click copy per account so judges can switch users fast. |
| **Dashboard** | role-aware | The same route renders three different realities. Admin sees all projects, a manager sees theirs, a developer sees their task list instead. |
| **Create from Transcript** | admin only | The product. Paste → narrated AI processing → review panel → atomic save. |
| **Projects** | everyone | Scoped list with live search and manager filter. |
| **Project detail** | everyone | Client, manager, deadline, effort + task rows. An agent sees only their own rows and is *told* so. |
| **My Tasks** | agents | One developer's work across every project, nearest deadline first. Hamza's view spans two projects — proof the model is relational, not per-project. |
| **Team Workload** | admin + managers | Effort summed per developer. **Nobody computed this in the meeting** — it only exists because the data is now structured. This is the argument for the whole product. |
| **Team Directory** | everyone | Read-only. The exact pool the AI is allowed to assign to. |

### Why Team Workload matters more than it looks

Everything else in the app reproduces what the meeting already said. Workload is
the first screen that tells you something **the meeting did not know**: that
Hamza is carrying 30 hours across two projects while Usman carries 10.

Twelve tasks and nine people is small enough to hold in your head. Four hundred
tasks is not. That slide — *"this is what you get once the meeting is data"* — is
the answer to "what would you build next?"

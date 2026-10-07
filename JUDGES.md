# For the Judges

Everything you need to evaluate this project in three minutes, plus the things we
expect you to try to break.

---

## 1. Three-minute test

**Sign in:** `admin@novaworks.example` · `Demo123!`
(The sign-in page lists all ten accounts with a copy button — switching users is one click.)

| # | Do this | You should see |
|---|---|---|
| 1 | Sidebar → **Create from Transcript** → **Load sample** | The supplied 60-minute meeting fills the box |
| 2 | **Create from Transcript** | A narrated progress state, then a reviewable proposal |
| 3 | **Save to CRM** | **3 projects, 12 tasks** |
| 4 | Open **UrbanCart Website** | Client UrbanCart Clothing · manager Ayesha Khan · deadline **20 Oct 2026** · 4 tasks |
| 5 | Sign out → sign in as `ayesha@` | **Only UrbanCart.** QuickServe and HelpDeskPro are absent |
| 6 | Sign in as `ali@` | **Only his 3 tasks** |
| 7 | Sign in as `hamza@` | **2 tasks spanning two different projects** |
| 8 | Refresh any page | Everything persists |

---

## 2. Please try to break it

We built for these specifically.

### 2.1 Can a developer reach another manager's project by URL?

Sign in as `ali@novaworks.example`. Copy a project id from the admin account, then paste
`/projects/<that-id>` into the address bar.

**Expected: "not found".** The server does not filter the page after fetching — it
rebuilds Ali's permitted project list from the database and refuses any id that is not on
it (`getProjectById` in `lib/data.ts`). Hiding links is not our access control.

### 2.2 Can a developer see a teammate's task on a project they share?

Sign in as `ali@`, open UrbanCart. He owns 3 of the 4 tasks. **Hamza's task is not in the
response at all** — for an `AGENT` we add `.eq("assignee_id", session.userId)` to the SQL
query itself, so other people's rows never leave Postgres.

### 2.3 Can someone claim to be the admin?

No endpoint anywhere accepts a role or user id from the caller. Identity comes only from
an HS256-signed httpOnly cookie (`lib/session.ts`). Tampering with it fails verification
and you are signed out.

### 2.4 Is the AI output real, or hardcoded?

**Edit the transcript and run it again.** Change an owner's name, an hours figure or a
date and the saved result changes to match. Or paste a completely different meeting.

The sample meeting also contains five deliberate traps. A hardcoded answer passes none of
them; ours handles all five:

| Trap in the transcript | Wrong answer | Correct answer |
|---|---|---|
| Usman re-estimates his task mid-meeting | 8 hours | **10 hours** |
| Client moves UrbanCart delivery | 18 Oct | **20 Oct** |
| Ali asks for more calendar space | 17 Oct | **19 Oct** |
| Testing owner is reassigned | Zain Abbas | **Maryam Asif** |
| "Kamran" is mentioned — an outsider, not an employee | Creates/assigns Kamran | **Never appears** |

Rejected scope must also be absent: no payment gateway, no inventory, no live maps, no
driver tracking. All four were explicitly cut in the meeting.

### 2.5 What if the AI returns something invalid?

Nothing is saved, and you are told which field failed. Try pasting nonsense, or a meeting
that names a person who does not work here — you get a specific error, an untouched
transcript box, and an empty database.

---

## 3. Where the AI actually is

`lib/ai.ts` → `lib/actions.ts` → `supabase/migrations/0003_save_ai_draft_fn.sql`

```
transcript ──▶ [1] PROMPT ──▶ [2] SHAPE ──▶ [3] IDENTITY ──▶ [4] HUMAN ──▶ [5] ATOMIC
                  gate          gate          gate            gate          save
                                                                             │
                 anything fails ──▶ nothing saved, admin told why ◀──────────┘
```

1. **Prompt** — the model receives the *real team directory* and eight hard rules, the
   most important being "obey the last agreed decision" and "rejected features must not
   become tasks". `temperature: 0`, forced JSON output.
2. **Shape** — Zod. Right fields, real dates, positive hours.
3. **Identity** — our own checks. Every id must exist; managers must be managers; agents
   must be agents; every task deadline must fall on or before its project deadline.
   This is the gate that stops "Kamran".
4. **Human** — even after passing everything, it is a *proposal*. You press Save.
5. **Atomic** — one Postgres function, one transaction. 12 tasks commit together or not
   at all.

The model is never allowed to invent a person. It can only return ids that already exist
(`PM01`, `DEV03`…), and we verify every one against the database before writing.

---

## 4. Requirement checklist

Mapped to the challenge pack, section by section.

| Required | Where |
|---|---|
| Simple login/logout, seeded accounts | `app/login/` · `lib/session.ts` |
| No signup / reset / verification / user management | Not built, by design |
| Admin home: project cards + Create from Transcript | `app/(app)/dashboard/` · `app/(app)/transcript/` |
| Read-only team directory with specializations | `app/(app)/team/` |
| Projects list + detail (client, manager, deadline, tasks) | `app/(app)/projects/` |
| Task rows: title, description, assignee, deadline, hours | `components/task-list.tsx` |
| Manager view filtered to their projects | `getProjects()` in `lib/data.ts` |
| Agent My Tasks filtered to their assignments | `getMyTasks()` in `lib/data.ts` |
| Persistent saved projects/tasks | Hosted PostgreSQL 17 |
| Access rules enforced in data requests | `lib/data.ts` — every query is scoped |
| Loading state, success result, understandable error | `components/transcript-studio.tsx` |
| Correction allowed when info is unresolved | Validation issues listed by field; nothing saved |
| Repeated clicks disabled while processing | Submit button disabled for the round trip |
| All-or-nothing save | `save_ai_draft()` |
| Passwords never sent to the AI | Only id/name/role/skills go into the prompt |
| Editing created projects/tasks (optional) | Inline edit dialog, server re-verified |

**Extras beyond the brief:** Team Workload (effort summed per developer), project search
and manager filter, and a landing page at `/`.

---

## 5. The six demo questions

From the rulebook, §12.

**1. What problem are you solving?**
A planning meeting already contains the whole project plan — owners, dates, estimates.
Today someone retypes all of it into a tool afterwards. That is slow, boring, and where
detail gets lost.

**2. How does your solution work?**
The admin pastes the transcript. We send it to DeepSeek together with the real team
directory. The model returns structured projects and tasks referencing existing employee
ids. We validate the shape, then verify every person and date against the database, show
the admin a proposal, and save it as a single transaction.

**3. What did your team build?**
A working CRM: seeded login, three role-scoped views, project and task screens, the AI
conversion flow, and a hosted Postgres database — plus the validation layer that makes
the AI output trustworthy.

**4. Where is AI used?**
One place, deliberately: converting unstructured meeting speech into validated records.
We did not sprinkle a chatbot on top. The hard part is not calling a model — it is
refusing to trust it, which is what gates 2, 3 and 5 above do.

**5. What makes it useful?**
It survives how meetings actually behave. People revise estimates, move deadlines, swap
owners and cut scope mid-conversation. Following the *final* decision rather than the
first thing said is the difference between a demo and something a company could use.

**6. What would you build next?**
Capacity planning — Team Workload already shows one developer carrying 30 hours across
two projects while another carries 10. That is the first thing the meeting itself did not
know. After that: audio in (we currently take text), and a diff view when a follow-up
meeting changes an existing project.

---

## 6. Deeper reading

- **[`ARCHITECTURE.md`](./ARCHITECTURE.md)** — how the whole system works, written for
  someone who has never seen the code. Start at Part 3 for the AI, Part 4 for security.
- **[`README.md`](./README.md)** — setup, environment variables, demo accounts.
- **`supabase/migrations/`** — the complete schema, seed and atomic save function.

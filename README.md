# NovaWorks — AI Meeting to Project CRM

**The Infinity Hack '26 · AI Project Manager — Meeting to Execution**

> Paste a meeting transcript. The AI reads it against your real team directory and
> creates the projects, tasks, owners, deadlines and effort estimates for you.
> Nobody types a row.

| | |
|---|---|
| **Live application** | _Not deployed yet — see [Deployment](#deployment-details)_ |
| **Demo video** | _To be added_ |
| **Repository** | https://github.com/Yar-Muhammad-Awaim/nova-crm |

**Judges: start with [`JUDGES.md`](./JUDGES.md)** — a 3-minute test script, the exact things
to try to break, and where each requirement from the challenge pack is implemented.
[`ARCHITECTURE.md`](./ARCHITECTURE.md) explains how the whole thing works in plain English.

---

## Team

- **Team name:** _[fill in]_
- **Members and responsibilities:** _[fill in — four members]_

---

## What Works

| Feature | Status |
|---|---|
| Login / logout with the ten seeded demo accounts | ✅ Working |
| Seeded team directory (1 admin, 3 managers, 6 developers) | ✅ Working |
| Admin home with project cards and **Create from Transcript** | ✅ Working |
| AI transcript → projects + tasks, validated before saving | ✅ Working |
| Review step before anything is written | ✅ Working |
| All-or-nothing save (single Postgres transaction) | ✅ Working |
| Read-only team directory (names, specializations, skills) | ✅ Working |
| Projects list and project detail (client, manager, deadline, tasks) | ✅ Working |
| Task rows: title, description, assignee, deadline, estimated hours | ✅ Working |
| Manager view filtered to their own projects | ✅ Working |
| Agent "My Tasks" view filtered to their own assignments | ✅ Working |
| Role rules enforced on **data requests**, not just hidden buttons | ✅ Working |
| Persistence across refresh (hosted Postgres) | ✅ Working |
| Editing created projects/tasks (optional in the brief) | ✅ Working |
| Team Workload — effort summed per developer | ✅ Extra |
| Project search + manager filter | ✅ Extra |
| Marketing landing page at `/` | ✅ Extra |
| Deployment to a public URL | ⬜ Not done yet |
| Recorded demo video | ⬜ Not done yet |

**Deliberately not built,** because the challenge pack excludes them: signup, forgot
password, email verification, user-management screens, cost calculation, progress
monitoring, charts, timesheets and budgets.

---

## Technology Stack

| Layer | Choice |
|---|---|
| Frontend | Next.js 15.5 (App Router) · React 19 · TypeScript 5 |
| Backend | Next.js Server Actions and Server Components (Node 22) |
| Database | PostgreSQL 17 (Supabase, hosted) |
| AI | DeepSeek `deepseek-chat`, called through the OpenAI SDK (DeepSeek is OpenAI-API compatible) |
| Validation | Zod, plus our own identity cross-checks against the users table |
| Styling | Tailwind CSS v4 · shadcn/ui (base-nova, Base UI) · Motion |
| Auth / session | Email + password against bcrypt hashes, then a signed **HS256 JWT in an httpOnly cookie** (`jose`). No third-party auth provider. |

### Why no Clerk / Supabase Auth / NextAuth?

The challenge pack forbids signup, email verification, password reset and
user-management screens — which is the main thing those products provide. With ten
fixed, pre-seeded accounts, a signed session cookie is about forty lines and has no
hosted-user-table to keep in sync. The session is the only thing we hand-rolled;
the database, the AI and every UI primitive come from established libraries.

---

## Requirements

- **Node.js** 20 or newer (built on 22.23.1)
- **npm** 10+
- A **PostgreSQL** database — a free Supabase project is the fastest route
- A **DeepSeek API key** (`https://platform.deepseek.com`)

---

## Run Locally

1. **Clone and enter the project**
   ```sh
   git clone https://github.com/Yar-Muhammad-Awaim/nova-crm.git
   cd nova-crm
   ```

2. **Install dependencies**
   ```sh
   npm install
   ```

3. **Create the environment file**
   ```sh
   cp .env.example .env.local
   ```

4. **Set the variables** in `.env.local` — see [Environment Variables](#environment-variables).
   Generate a session secret with:
   ```sh
   node -e "console.log(require('crypto').randomBytes(48).toString('base64'))"
   ```

5. **Create the schema and seed the ten demo users.** Open the Supabase SQL editor
   (or any `psql` session against your database) and run, in order:
   ```
   supabase/migrations/0001_init_crm_schema.sql
   supabase/migrations/0002_seed_demo_users.sql
   supabase/migrations/0003_save_ai_draft_fn.sql
   ```
   The seed is idempotent (`on conflict (email) do nothing`), so re-running it will
   **not** duplicate users. Passwords are hashed with bcrypt inside Postgres via
   `pgcrypto` — no plaintext password is ever stored or transmitted to the AI.

6. **Start the app**
   ```sh
   npm run dev
   ```
   Open <http://localhost:3000>. One terminal is enough — frontend and backend are
   the same Next.js process.

For a production build: `npm run build && npm start`.

---

## Environment Variables

| Variable | Purpose | Where configured |
|---|---|---|
| `SUPABASE_URL` | Database project URL | backend (server only) |
| `SUPABASE_SERVICE_ROLE_KEY` | Database credential | backend (server only) |
| `SESSION_SECRET` | Signs the session cookie | backend (server only) |
| `DEEPSEEK_API_KEY` | AI provider credential | backend (server only) |
| `DEEPSEEK_MODEL` | Model id, defaults to `deepseek-chat` | backend |

**None of these are `NEXT_PUBLIC_`, so none reach the browser.** `.env.example`
contains placeholders only; real values are git-ignored. Row Level Security is enabled
on all three tables with no policies, so even the public Supabase key can read nothing —
every query runs through server code that applies the role rules first.

---

## Demo Login Accounts

Fictional identifiers, not real mailboxes. No signup, verification or password reset.
**Every account uses the password `Demo123!`**

| Role | Name | Demo email | What they should see |
|---|---|---|---|
| Admin | Admin | admin@novaworks.example | Everything + Create from Transcript |
| Manager | Ayesha Khan | ayesha@novaworks.example | UrbanCart only |
| Manager | Bilal Ahmed | bilal@novaworks.example | QuickServe only |
| Manager | Hina Malik | hina@novaworks.example | HelpDeskPro only |
| Agent | Ali Raza | ali@novaworks.example | 3 tasks, UrbanCart |
| Agent | Hamza Shah | hamza@novaworks.example | 2 tasks across 2 projects |
| Agent | Sara Noor | sara@novaworks.example | 2 tasks, QuickServe |
| Agent | Usman Tariq | usman@novaworks.example | 1 task, QuickServe |
| Agent | Zain Abbas | zain@novaworks.example | 2 tasks, HelpDeskPro |
| Agent | Maryam Asif | maryam@novaworks.example | 2 tasks, HelpDeskPro |

The sign-in page lists all ten with a one-click copy button, so switching accounts
during judging takes a couple of seconds.

---

## How Judges Can Test

The full script with expected values is in **[`JUDGES.md`](./JUDGES.md)**. In short:

1. Sign in as `admin@novaworks.example` / `Demo123!`
2. Open **Create from Transcript** → **Load sample** (the supplied meeting is built in;
   you can also paste your own)
3. Click **Create from Transcript** → review the proposal → **Save to CRM**
4. Expect **3 projects and 12 tasks**
5. Open **UrbanCart Website** → manager Ayesha Khan, deadline **20 October 2026**, 4 tasks
6. Sign out, sign in as **Ayesha** → only UrbanCart appears
7. Sign in as **Ali** → only his 3 tasks
8. Sign in as **Hamza** → 2 tasks spanning UrbanCart *and* QuickServe
9. **Try to break it:** while signed in as Ali, paste another project's URL into the
   address bar → you get "not found", not the data
10. Refresh anywhere → everything persists
11. Edit the transcript (change an owner, an estimate or a date) and run it again →
    the output changes, proving the result is genuine AI conversion

**To reset between tests without deleting the seeded users:** sign in as admin and use
the reset action, or run `delete from projects;` — tasks cascade, and the ten user rows
are untouched.

---

## Deployment Details

- **Deployment status:** Local only at the time of writing
- **Database:** Supabase (hosted PostgreSQL 17, `ap-south-1`) — already remote, so the
  app runs against a hosted database even locally
- **Frontend/backend host:** intended Vercel (single deployment — Next.js serves both)
- **Deployed branch/commit:** `main`

### How we would deploy

1. `npx vercel` from the repository root. Build command `next build`, output `.next`.
2. Set the five environment variables from the table above in the Vercel project
   settings (Production and Preview).
3. The database needs no extra provisioning — it is already hosted on Supabase, and the
   three migration files have been applied to it.
4. No CORS configuration is needed: the browser only ever talks to the same origin.

---

## Known Limitations

- **Not deployed yet**, and no demo video recorded yet.
- The AI call depends on DeepSeek availability and your API quota. If the provider is
  slow or rate-limited, the conversion step shows an error and saves nothing — the app
  stays usable, you just retry.
- Conversion takes roughly 10–25 seconds for a full 60-minute transcript, because the
  model is asked for the complete structured result in one pass at `temperature: 0`.
- A manager or admin can edit tasks after creation; there is no audit trail of edits.
- No pagination anywhere — fine at 3 projects and 12 tasks, would need work at scale.
- Team Workload sums effort estimates only; it is not a progress or cost feature, both
  of which the challenge pack puts out of scope.

---

## Submission Summary

- **Source repository:** https://github.com/Yar-Muhammad-Awaim/nova-crm
- **Branches:** `main` is the submission. `dev` carries full working history.
- **Setup and seed commands:** documented above; migrations in `supabase/migrations/`
- **Demo login accounts:** ten accounts, all `Demo123!`, confirmed seeded
- **Features completed:** seeded login, role-based access enforced server-side, AI
  transcript conversion with validation and atomic save, project and task screens for
  all three roles, persistence, plus workload and search as extras

/**
 * Every string on the landing page. Typed, in one place, so copy can be
 * reviewed without reading JSX.
 *
 * Honesty rule: no invented customers, no fake logos, no made-up metrics.
 * Every number below is counted from the actual NovaWorks demo meeting.
 */

export interface NavLink { href: string; label: string }

export const NAV_LINKS: readonly NavLink[] = [
  { href: "#how", label: "How it works" },
  { href: "#features", label: "Features" },
  { href: "#roles", label: "Roles" },
  { href: "#faq", label: "FAQ" },
] as const;

export const HERO = {
  eyebrow: "NovaWorks Technologies · Lahore",
  // Split for per-word masked reveal. `em` renders in display italic.
  headline: [
    { text: "Your meeting" },
    { text: "already" , em: true },
    { text: "contained" },
    { text: "the plan." },
  ],
  sub:
    "Paste the transcript. NovaWorks reads it the way a project manager would — who owns what, " +
    "which estimate was revised, what the client cut — and writes the projects, tasks, owners, " +
    "deadlines and hours straight into your CRM.",
  primary: { href: "/login", label: "Try the demo" },
  secondary: { href: "#how", label: "See how it works" },
} as const;

export interface TrustFigure { value: number; suffix?: string; label: string }

/** Counted from the supplied 60-minute planning meeting. Nothing invented. */
export const TRUST_FIGURES: readonly TrustFigure[] = [
  { value: 3,  label: "projects" },
  { value: 12, label: "tasks" },
  { value: 9,  label: "people assigned" },
  { value: 1,  label: "meeting" },
] as const;

export const TRUST_LINE =
  "One sixty-minute planning call, turned into a working project board. No one typed a row.";

export interface Step { n: string; title: string; body: string }

export const STEPS: readonly Step[] = [
  {
    n: "01",
    title: "Paste the transcript",
    body:
      "The whole meeting, exactly as it was recorded. No tagging, no templates, no cleaning it up first.",
  },
  {
    n: "02",
    title: "The AI reads it",
    body:
      "It gets your real team directory as input, so it can only assign work to people who exist. " +
      "It follows the last decision made, not the first one spoken.",
  },
  {
    n: "03",
    title: "Projects and tasks appear",
    body:
      "Validated, reviewed by you, then saved as one transaction. Every task has an owner, a date " +
      "and an effort estimate.",
  },
] as const;

export interface Feature {
  title: string;
  body: string;
  span: "lg" | "md" | "sm";
  visual: "transcript" | "roles" | "revision" | "schedule" | "atomic" | "persist";
}

export const FEATURES: readonly Feature[] = [
  {
    title: "Transcript to tasks",
    body:
      "Three separate client projects and twelve tasks, pulled out of one conversation and kept " +
      "apart the way the room agreed they should be.",
    span: "lg",
    visual: "transcript",
  },
  {
    title: "It follows revisions",
    body:
      "People change their minds mid-meeting. An estimate moves from eight hours to ten; a deadline " +
      "slips from the 18th to the 20th; an owner is swapped. The last agreement wins.",
    span: "md",
    visual: "revision",
  },
  {
    title: "Role-based access",
    body:
      "Admins see everything. Managers see their own projects. Developers see only the tasks assigned " +
      "to them — enforced on the server, not by hiding buttons.",
    span: "md",
    visual: "roles",
  },
  {
    title: "Deadlines and effort",
    body: "Every task carries a date and an hours estimate, so workload is a sum, not a guess.",
    span: "sm",
    visual: "schedule",
  },
  {
    title: "All-or-nothing saves",
    body:
      "Twelve tasks commit together or not at all. A failure halfway through never leaves you with " +
      "half a project board.",
    span: "sm",
    visual: "atomic",
  },
  {
    title: "It stays put",
    body: "Saved to Postgres. Refresh, log out, come back tomorrow — the work is still there.",
    span: "sm",
    visual: "persist",
  },
] as const;

export type RoleKey = "ADMIN" | "MANAGER" | "AGENT";

export interface RoleView {
  key: RoleKey;
  label: string;
  person: string;
  summary: string;
  sees: readonly string[];
  hidden: string;
}

export const ROLE_VIEWS: readonly RoleView[] = [
  {
    key: "ADMIN",
    label: "Admin",
    person: "Administrator",
    summary: "Runs the conversion and sees the whole company.",
    sees: ["All 3 projects", "All 12 tasks", "Create from Transcript", "Team workload"],
    hidden: "Nothing is hidden from the admin.",
  },
  {
    key: "MANAGER",
    label: "Manager",
    person: "Ayesha Khan · Web PM",
    summary: "Sees only the projects she manages.",
    sees: ["UrbanCart Website", "4 tasks", "Her team's workload"],
    hidden: "QuickServe and HelpDeskPro are not returned to her at all.",
  },
  {
    key: "AGENT",
    label: "Developer",
    person: "Hamza Shah · Full-Stack",
    summary: "Sees only what he has been asked to build.",
    sees: ["Product and cart APIs · 14h", "Booking and account APIs · 16h", "Across 2 projects"],
    hidden: "Teammates' tasks on the same project never leave the database.",
  },
] as const;

export const BEFORE_AFTER = {
  eyebrow: "The actual difference",
  title: "Same meeting. One of these you can work from.",
  beforeLabel: "Raw transcript",
  afterLabel: "Structured result",
  before: [
    "Ayesha: First project is UrbanCart Website, for client UrbanCart Clothing. I'll manage it.",
    "Ali: I can own the product catalog interface… Put that down as 12 estimated hours, due on 12 October.",
    "Ayesha: Let's start with a six-hour estimate and a 17 October deadline.",
    "Ali: Six hours is reasonable… But please move that task to 19 October.",
    "Ayesha: Accepted. Website integration and testing is 6 hours, due 19 October. Also, the client has " +
      "just confirmed that final project delivery can be 20 October. That replaces the earlier 18 October date.",
  ],
  after: {
    project: "UrbanCart Website",
    client: "UrbanCart Clothing",
    manager: "Ayesha Khan",
    deadline: "20 Oct 2026",
    tasks: [
      { title: "Product catalog UI", owner: "Ali Raza", hours: 12, due: "12 Oct" },
      { title: "Demo cart UI", owner: "Ali Raza", hours: 8, due: "15 Oct" },
      { title: "Product and cart APIs", owner: "Hamza Shah", hours: 14, due: "14 Oct" },
      { title: "Website integration and testing", owner: "Ali Raza", hours: 6, due: "19 Oct" },
    ],
  },
} as const;

export interface Faq { q: string; a: string }

export const FAQS: readonly Faq[] = [
  {
    q: "Do I need to create an account?",
    a: "No. The demo ships with ten seeded company accounts — one admin, three managers, six developers. " +
       "There is no signup, no email verification and no password reset, because there is nothing to sign up for.",
  },
  {
    q: "What stops the AI inventing a person?",
    a: "It is given the real team directory and can only return ids that already exist in it. Before anything " +
       "is saved we check every id against the database, confirm managers are managers and developers are " +
       "developers, and reject the whole draft if one does not match. In the demo meeting an outsider is " +
       "mentioned by name — he never becomes an employee.",
  },
  {
    q: "What happens if something in the meeting is unclear?",
    a: "Nothing is saved. You get a specific message naming the field that could not be resolved, and the " +
       "transcript stays exactly as you left it so you can correct it and run it again.",
  },
  {
    q: "Who can see which projects?",
    a: "An admin sees everything. A manager sees only projects they manage. A developer sees only tasks " +
       "assigned to them, plus the name of the project those tasks live in. The rules run on the server, " +
       "so changing the address bar does not get you someone else's data.",
  },
  {
    q: "Does it handle people changing their minds?",
    a: "That is the hard part, and yes. Meetings revise themselves constantly — an estimate goes up, a date " +
       "moves, an owner is swapped late in the call. The extraction follows the final agreement and ignores " +
       "every superseded figure, including features the client explicitly cut.",
  },
  {
    q: "Is the data actually saved?",
    a: "To Postgres, as a single transaction. Either every project and task from that transcript commits, or " +
       "none of them do.",
  },
] as const;

export const FINAL_CTA = {
  title: "Stop retyping your own meetings.",
  sub: "Sign in with a demo account and convert the transcript yourself. It takes about thirty seconds.",
  cta: { href: "/login", label: "Open the demo" },
} as const;

export const FOOTER = {
  company: "NovaWorks Technologies",
  city: "Lahore, Pakistan",
  note: "An AI project manager: meeting in, execution out.",
} as const;

/** Drives the looping hero mock: each line lands, then its card appears. */
export interface MockLine { speaker: string; text: string; emits?: number }

export const MOCK_LINES: readonly MockLine[] = [
  { speaker: "Ayesha", text: "First project is UrbanCart Website, for client UrbanCart Clothing. I'll manage it.", emits: 0 },
  { speaker: "Ali",    text: "I can own the product catalog interface. 12 estimated hours, due 12 October." },
  { speaker: "Bilal",  text: "Second project is QuickServe Mobile App. I'm the project manager.", emits: 1 },
  { speaker: "Sara",   text: "I'll own Login and profile screens. 8 hours, due 12 October." },
  { speaker: "Hina",   text: "Third project is HelpDeskPro AI Assistant. I'm managing it.", emits: 2 },
  { speaker: "Zain",   text: "14 hours, due 17 October, for assistant answer generation." },
] as const;

export interface MockCard {
  project: string;
  client: string;
  manager: string;
  deadline: string;
  tasks: number;
  hours: number;
}

export const MOCK_CARDS: readonly MockCard[] = [
  { project: "UrbanCart Website",     client: "UrbanCart Clothing",  manager: "Ayesha Khan", deadline: "20 Oct", tasks: 4, hours: 40 },
  { project: "QuickServe Mobile App", client: "QuickServe Services", manager: "Bilal Ahmed", deadline: "24 Oct", tasks: 4, hours: 46 },
  { project: "HelpDeskPro AI",        client: "HelpDeskPro Solutions", manager: "Hina Malik", deadline: "22 Oct", tasks: 4, hours: 38 },
] as const;

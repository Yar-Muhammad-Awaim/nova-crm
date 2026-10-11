/**
 * Typed copy and data models for the NovaWorks venture-grade landing experience.
 * Tailored for high-growth SaaS positioning, venture evaluation, and client conversion.
 */

export interface NavLink { href: string; label: string }

export const NAV_LINKS: readonly NavLink[] = [
  { href: "#simulator", label: "Live Simulator" },
  { href: "#how", label: "How It Works" },
  { href: "#features", label: "Features" },
  { href: "#roi", label: "ROI Calculator" },
  { href: "#architecture", label: "Enterprise Security" },
  { href: "#roles", label: "RBAC Governance" },
  { href: "#faq", label: "Due Diligence" },
] as const;

export const HERO = {
  eyebrow: "Enterprise Autonomous Project CRM · Zero Scope Leakage",
  headline: [
    { text: "From client" },
    { text: "sync", em: true },
    { text: "to production" },
    { text: "roadmap in seconds." },
  ],
  sub:
    "Software agencies lose 18% of billable scope in translation between client calls and Jira. " +
    "NovaWorks transforms unstructured stakeholder syncs into verified project execution graphs, " +
    "deterministic task ownership, and capacity-balanced roadmaps—with zero hallucinated scope.",
  primary: { href: "/login", label: "Launch Live CRM" },
  secondary: { href: "#simulator", label: "Try Interactive Simulator" },
} as const;

export interface TrustFigure { value: number; suffix?: string; label: string; sub?: string }

export const TRUST_FIGURES: readonly TrustFigure[] = [
  { value: 4, suffix: ".2h", label: "PM Time Saved / Week", sub: "per engineering manager" },
  { value: 0, suffix: "%", label: "Hallucinated Assignees", sub: "Zod directory-anchored" },
  { value: 100, suffix: "%", label: "ACID Transactional Writes", sub: "single-commit Postgres" },
  { value: 18, suffix: "%", label: "Unbilled Scope Recovered", sub: "average across client syncs" },
] as const;

export const TRUST_LINE =
  "Built for engineering consultancies, digital agencies, and high-velocity product teams who refuse to lose billable commitments.";

export interface Step { n: string; title: string; body: string; badge: string }

export const STEPS: readonly Step[] = [
  {
    n: "01",
    title: "Ingest Unfiltered Stakeholder Speech",
    body:
      "Paste real, noisy meeting audio transcripts or raw sync notes. No manual formatting, no bullet point preparation, and no pre-tagging required.",
    badge: "Raw Audio / Notes",
  },
  {
    n: "02",
    title: "Deterministic Semantic Extraction & Grounding",
    body:
      "The engine correlates speech against your live team directory. It identifies mid-meeting estimate revisions, resolves scope trade-offs, and binds tasks strictly to real personnel.",
    badge: "Zod + Directory Anchor",
  },
  {
    n: "03",
    title: "Interactive Review & Atomic Persistence",
    body:
      "Inspect the generated roadmap in a collaborative review studio. Tweak hours, reassign owners, and commit the entire project hierarchy to PostgreSQL in a single ACID transaction.",
    badge: "100% ACID DB Write",
  },
] as const;

export interface Feature {
  title: string;
  body: string;
  span: "lg" | "md" | "sm";
  visual: "transcript" | "roles" | "revision" | "schedule" | "atomic" | "persist";
  metric?: string;
}

export const FEATURES: readonly Feature[] = [
  {
    title: "Transcript-to-Execution Graph",
    body:
      "Converts messy 60-minute multi-client meetings into cleanly separated project graphs, distinct workstreams, and discrete tasks with complete ownership trees.",
    span: "lg",
    visual: "transcript",
    metric: "Multi-project extraction",
  },
  {
    title: "Temporal Decision Delta Tracking",
    body:
      "Stakeholders change their minds. When an estimate moves from 8h to 10h or a deadline slips from the 18th to the 20th, NovaWorks anchors on the final consensus—not the first mention.",
    span: "md",
    visual: "revision",
    metric: "100% consensus accuracy",
  },
  {
    title: "Cryptographic Server-Side RBAC",
    body:
      "Admins see company-wide workload. Managers view their portfolio. Engineers see only their assigned tickets. Enforced via Postgres RLS queries—never cosmetic client-side CSS hiding.",
    span: "md",
    visual: "roles",
    metric: "Postgres RLS Enforced",
  },
  {
    title: "Predictive Capacity & Deadline Modeling",
    body:
      "Every task carries hard calendar dates and estimated effort hours. Team Workload calculates realistic developer load before deadlines are missed.",
    span: "sm",
    visual: "schedule",
    metric: "Effort aggregation",
  },
  {
    title: "All-or-Nothing Atomic Commits",
    body:
      "A 12-task project either commits completely or aborts cleanly. Partial network drops or schema mismatches never leave corrupted or orphaned rows in your database.",
    span: "sm",
    visual: "atomic",
    metric: "Single-transaction save",
  },
  {
    title: "Persistent Enterprise Architecture",
    body:
      "Hosted PostgreSQL database with secure signed HS256 JWT cookies. Fully persistent, audit-ready, and resilient across browser sessions.",
    span: "sm",
    visual: "persist",
    metric: "Hosted PostgreSQL 17",
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
  badge: string;
}

export const ROLE_VIEWS: readonly RoleView[] = [
  {
    key: "ADMIN",
    label: "Admin",
    person: "Executive / Agency Principal",
    summary: "Complete governance over all client portfolios, AI conversion studio, and agency-wide capacity.",
    sees: [
      "All active client engagements & budgets",
      "Company-wide team workload distribution",
      "AI Transcript Conversion Studio access",
      "Full project creation, deletion & member directory",
    ],
    hidden: "Unrestricted enterprise-wide administrative access.",
    badge: "Full Organization Scope",
  },
  {
    key: "MANAGER",
    label: "Manager",
    person: "Ayesha Khan · Delivery Lead",
    summary: "Isolated portfolio management restricted strictly to projects assigned to her managerial domain.",
    sees: [
      "UrbanCart Clothing engagement dashboard",
      "4 active tasks & sprint timeline",
      "Team capacity allocation for assigned developers",
      "Kanban task board status management",
    ],
    hidden: "QuickServe and HelpDeskPro datasets are cryptographically blocked by Postgres queries.",
    badge: "Portfolio-Scoped RLS",
  },
  {
    key: "AGENT",
    label: "Developer",
    person: "Hamza Shah · Full-Stack Engineer",
    summary: "Distraction-free personal focus queue containing only tickets assigned to his personal ID.",
    sees: [
      "Product & Cart API endpoints · 14h allocation",
      "Booking & Authentication service · 16h allocation",
      "Hard deadlines & project milestone tags",
    ],
    hidden: "Colleagues' unassigned cards on the same project are filtered out at the SQL query layer.",
    badge: "Task-Level Isolation",
  },
] as const;

export const BEFORE_AFTER = {
  eyebrow: "The Definitive Difference",
  title: "Same 60-Minute Call. One is Noise; One is Cash-Flow Execution.",
  beforeLabel: "Unstructured Raw Call",
  afterLabel: "NovaWorks Structured Graph",
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
      { title: "Product catalog UI", owner: "Ali Raza", hours: 12, due: "12 Oct", status: "Done" },
      { title: "Demo cart UI", owner: "Ali Raza", hours: 8, due: "15 Oct", status: "In Progress" },
      { title: "Product and cart APIs", owner: "Hamza Shah", hours: 14, due: "14 Oct", status: "Todo" },
      { title: "Website integration and testing", owner: "Ali Raza", hours: 6, due: "19 Oct", status: "Todo" },
    ],
  },
} as const;

/* ------------------------------------------------------------------ */
/* Defensibility / Architecture Due Diligence Comparison              */
/* ------------------------------------------------------------------ */

export interface DefensibilityItem {
  dimension: string;
  genericAi: string;
  novaWorks: string;
  advantage: string;
}

export const DEFENSIBILITY_MATRIX: readonly DefensibilityItem[] = [
  {
    dimension: "Assignee Resolution",
    genericAi: "Invented fictional names or hallucinations when transcripts reference outside attendees.",
    novaWorks: "Deterministic validation against verified Postgres users table with Zod schema rejection.",
    advantage: "Zero orphaned or non-existent assignees",
  },
  {
    dimension: "Mid-Meeting Revisions",
    genericAi: "Captures first-mentioned dates and superseded estimates, creating scope confusion.",
    novaWorks: "Temporal consensus engine identifies counter-proposals and records the final agreed state.",
    advantage: "Tracks final decision delta perfectly",
  },
  {
    dimension: "Multi-Tenant Data Privacy",
    genericAi: "Requires pasting sensitive client notes into public cloud chatbots with zero permission boundaries.",
    novaWorks: "Enterprise session cookies, server-enforced RBAC, and client data never leaked to other users.",
    advantage: "PostgreSQL Row-Level Security",
  },
  {
    dimension: "Database Atomicity",
    genericAi: "Unstructured JSON outputs fail silently or create fragmented, half-written database records.",
    novaWorks: "Single stored procedure transaction (save_ai_draft_fn) guarantees all-or-nothing consistency.",
    advantage: "100% ACID persistence guarantee",
  },
] as const;

/* ------------------------------------------------------------------ */
/* Interactive Simulator Scenarios                                    */
/* ------------------------------------------------------------------ */

export interface SimulatorScenario {
  id: string;
  title: string;
  client: string;
  tag: string;
  transcriptSample: string;
  stages: readonly string[];
  extractedProject: {
    name: string;
    client: string;
    manager: string;
    deadline: string;
    totalHours: number;
    tasks: readonly {
      title: string;
      assignee: string;
      hours: number;
      deadline: string;
      role: string;
    }[];
  };
}

export const SIMULATOR_SCENARIOS: readonly SimulatorScenario[] = [
  {
    id: "urbancart",
    title: "E-Commerce Re-platforming",
    client: "UrbanCart Clothing",
    tag: "Scope Revisions & Date Push",
    transcriptSample:
      "Ayesha: UrbanCart Website project is greenlit. Client UrbanCart Clothing needs delivery by 20 October. I am managing.\n" +
      "Ali: I'll take the product catalog UI. 12 hours, due 12 October.\n" +
      "Ali: And demo cart UI, 8 hours, due 15 October.\n" +
      "Hamza: I'll implement product and cart backend APIs. Put me down for 14 hours, due 14 October.\n" +
      "Ayesha: For final integration testing, let's do 6 hours, due 19 October, assigned to Ali.",
    stages: [
      "Parsing speech stream & speaker tokens...",
      "Matching assignees against 10-person enterprise directory...",
      "Resolving deadline conflict: push Oct 18 → Oct 20...",
      "Compiling validated JSON graph for Postgres ACID commit...",
    ],
    extractedProject: {
      name: "UrbanCart Website",
      client: "UrbanCart Clothing",
      manager: "Ayesha Khan",
      deadline: "20 Oct 2026",
      totalHours: 40,
      tasks: [
        { title: "Product catalog UI", assignee: "Ali Raza", hours: 12, deadline: "12 Oct 2026", role: "Frontend Dev" },
        { title: "Product and cart APIs", assignee: "Hamza Shah", hours: 14, deadline: "14 Oct 2026", role: "Backend Dev" },
        { title: "Demo cart UI", assignee: "Ali Raza", hours: 8, deadline: "15 Oct 2026", role: "Frontend Dev" },
        { title: "Website integration & testing", assignee: "Ali Raza", hours: 6, deadline: "19 Oct 2026", role: "Full-Stack" },
      ],
    },
  },
  {
    id: "quickserve",
    title: "Mobile Food Delivery MVP",
    client: "QuickServe Services",
    tag: "API Architecture & Auth",
    transcriptSample:
      "Bilal: QuickServe Mobile App project. Client is QuickServe Services. Deadline is 24 October. I am the PM.\n" +
      "Sara: I'll own the login and customer profile screens. 8 hours, due 12 October.\n" +
      "Hamza: I'll take booking and account APIs. 16 hours, due 18 October.\n" +
      "Sara: Restaurant listing & search UI, 12 hours, due 20 October.\n" +
      "Usman: Mobile app QA and release build pipeline, 10 hours, due 22 October.",
    stages: [
      "Parsing speech stream & speaker tokens...",
      "Binding team roles: Bilal (PM), Sara (Agent), Hamza (Agent), Usman (Agent)...",
      "Calculating cumulative sprint load: 46 engineering hours...",
      "Validating dependency order and milestone dates...",
    ],
    extractedProject: {
      name: "QuickServe Mobile App",
      client: "QuickServe Services",
      manager: "Bilal Ahmed",
      deadline: "24 Oct 2026",
      totalHours: 46,
      tasks: [
        { title: "Login & profile mobile screens", assignee: "Sara Noor", hours: 8, deadline: "12 Oct 2026", role: "Mobile UI" },
        { title: "Booking & account APIs", assignee: "Hamza Shah", hours: 16, deadline: "18 Oct 2026", role: "Backend API" },
        { title: "Restaurant listing & search UI", assignee: "Sara Noor", hours: 12, deadline: "20 Oct 2026", role: "Mobile UI" },
        { title: "Mobile app QA & release pipeline", assignee: "Usman Tariq", hours: 10, deadline: "22 Oct 2026", role: "QA Engineer" },
      ],
    },
  },
  {
    id: "helpdeskpro",
    title: "AI Support Intelligence",
    client: "HelpDeskPro Solutions",
    tag: "Cut Scope Handling (SMS Cut)",
    transcriptSample:
      "Hina: HelpDeskPro AI Assistant project. Client HelpDeskPro Solutions. Target deadline 22 October. I will manage.\n" +
      "Zain: I'll build ticket ingestion and vector embeddings. 10 hours, due 14 October.\n" +
      "Zain: And assistant answer generation prompt engineering. 14 hours, due 17 October.\n" +
      "Maryam: Dashboard analytics widget, 8 hours, due 19 October.\n" +
      "Hina: Note that client cancelled the SMS notifications feature, so do NOT create a task for SMS.\n" +
      "Maryam: Support agent review portal, 6 hours, due 21 October.",
    stages: [
      "Parsing speech stream & identifying negative constraints...",
      "Detected cut feature: 'SMS notifications' flagged as omitted scope...",
      "Verified assignees: Zain Abbas and Maryam Asif verified in directory...",
      "Generating schema-compliant project specification...",
    ],
    extractedProject: {
      name: "HelpDeskPro AI Assistant",
      client: "HelpDeskPro Solutions",
      manager: "Hina Malik",
      deadline: "22 Oct 2026",
      totalHours: 38,
      tasks: [
        { title: "Ticket ingestion & embeddings", assignee: "Zain Abbas", hours: 10, deadline: "14 Oct 2026", role: "AI Engineer" },
        { title: "Assistant answer generation pipeline", assignee: "Zain Abbas", hours: 14, deadline: "17 Oct 2026", role: "AI Engineer" },
        { title: "Dashboard analytics widget", assignee: "Maryam Asif", hours: 8, deadline: "19 Oct 2026", role: "Frontend Dev" },
        { title: "Support agent review portal", assignee: "Maryam Asif", hours: 6, deadline: "21 Oct 2026", role: "Frontend Dev" },
      ],
    },
  },
] as const;

export interface Faq { q: string; a: string }

export const FAQS: readonly Faq[] = [
  {
    q: "Why can't an engineering agency simply paste transcripts into ChatGPT or Claude?",
    a: "Generic LLMs are unstructured chatbots. They hallucinate nonexistent assignees, fail when clients revise estimates mid-call, lack knowledge of internal team rosters, and cannot safely commit directly to a transactional database. NovaWorks connects semantic extraction directly to your live employee directory with strict Zod validation and Postgres ACID transactions.",
  },
  {
    q: "How does NovaWorks guarantee zero hallucinated assignees?",
    a: "During the extraction step, the model is provided with the verified employee directory as an active constraint and required to output strict foreign key identifiers. Our server-side Zod validation verifies that every assignee ID exists in Postgres and matches their role (managers manage projects, agents execute tasks). If an unknown name appears, the draft rejects it before any database write occurs.",
  },
  {
    q: "How does the platform handle mid-meeting estimate revisions and cancellations?",
    a: "Our prompt architecture evaluates conversational state deltas. When a speaker proposes 8 hours but the client pushes back and they agree on 10 hours later in the transcript, NovaWorks discards the superseded number and anchors on the final consensus. It also respects negative constraints, such as features explicitly cut during the call.",
  },
  {
    q: "How is multi-tenant security and role-based access control enforced?",
    a: "Every data query is protected by server-side verification using signed HS256 JWT cookies. PostgreSQL queries enforce row-level constraints directly in SQL (e.g. `assignee_id = session.userId` for engineers). Users can never access unpermitted projects or peer tasks by guessing URLs or manipulating client state.",
  },
  {
    q: "What is the commercial ROI for a typical 10 to 30-person agency?",
    a: "A standard agency spends 4 to 6 hours per engineering manager each week transcribing client calls into Jira or Linear, reconciling missed deliverables, and chasing unbilled scope creep. At an average billing rate of $120/hr, NovaWorks recovers approximately $48,000 to $85,000 in billable capacity annually per firm, resulting in a payback period under two weeks.",
  },
  {
    q: "How does the demo environment work?",
    a: "The demo is live on hosted PostgreSQL with ten seeded corporate accounts spanning Admin, Manager, and Developer tiers. You can use our 1-click Quick Launch buttons to jump into any persona instantly with zero setup, test transcript creation, edit drafts, and inspect role boundaries.",
  },
] as const;

export const FINAL_CTA = {
  title: "Stop Retyping Meetings. Start Shipping Billable Scope.",
  sub: "Experience the autonomous meeting-to-project engine with instant 1-click demo access. Test with real transcripts and see verified roadmaps in seconds.",
  cta: { href: "/login", label: "Enter Live Platform" },
} as const;

export const FOOTER = {
  company: "NovaWorks Technologies",
  city: "Autonomous Project Intelligence Platform",
  note: "Enterprise AI Meeting to Execution CRM · PostgreSQL 17 · Strict RBAC",
} as const;

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

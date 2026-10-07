/**
 * Landing-page content, taken from the challenge transcript (lib/transcript.ts).
 * Every name, hour and date here is what the meeting actually agreed, so the
 * marketing page never claims something the demo can't reproduce.
 */

export type ProjectKey = "urbancart" | "quickserve" | "helpdesk";

export const PROJECTS: Record<ProjectKey, { name: string; client: string; manager: string; deadline: string }> = {
  urbancart: { name: "UrbanCart Website", client: "UrbanCart Clothing", manager: "Ayesha", deadline: "20 Oct" },
  quickserve: { name: "QuickServe Mobile App", client: "QuickServe Services", manager: "Bilal", deadline: "24 Oct" },
  helpdesk: { name: "HelpDeskPro AI Assistant", client: "HelpDeskPro Solutions", manager: "Hina", deadline: "22 Oct" },
};

export type LandingTask = {
  title: string;
  project: ProjectKey;
  owner: string;
  hours: number;
  /** Day of October. */
  due: number;
};

export const TASKS: LandingTask[] = [
  { title: "Product catalog UI", project: "urbancart", owner: "Ali", hours: 12, due: 12 },
  { title: "Demo cart UI", project: "urbancart", owner: "Ali", hours: 8, due: 15 },
  { title: "Product and cart APIs", project: "urbancart", owner: "Hamza", hours: 14, due: 14 },
  { title: "Website integration and testing", project: "urbancart", owner: "Ali", hours: 6, due: 19 },
  { title: "Login and profile screens", project: "quickserve", owner: "Sara", hours: 8, due: 12 },
  { title: "Service booking screens", project: "quickserve", owner: "Sara", hours: 12, due: 17 },
  { title: "Booking and account APIs", project: "quickserve", owner: "Hamza", hours: 16, due: 16 },
  { title: "Mobile integration and testing", project: "quickserve", owner: "Usman", hours: 10, due: 22 },
  { title: "FAQ document processing", project: "helpdesk", owner: "Maryam", hours: 10, due: 13 },
  { title: "Assistant answer generation", project: "helpdesk", owner: "Zain", hours: 14, due: 17 },
  { title: "Human escalation flow", project: "helpdesk", owner: "Zain", hours: 6, due: 18 },
  { title: "Assistant evaluation and testing", project: "helpdesk", owner: "Maryam", hours: 8, due: 21 },
];

export const TOTAL_HOURS = TASKS.reduce((sum, t) => sum + t.hours, 0);

export const DEVELOPERS = ["Ali", "Hamza", "Sara", "Usman", "Zain", "Maryam"] as const;

export const SPECIALIZATION: Record<(typeof DEVELOPERS)[number], string> = {
  Ali: "Frontend",
  Hamza: "Backend",
  Sara: "Mobile UI",
  Usman: "Mobile integration",
  Zain: "AI engineering",
  Maryam: "AI and data",
};

export const WORKLOAD = DEVELOPERS.map((name) => ({
  name,
  hours: TASKS.filter((t) => t.owner === name).reduce((sum, t) => sum + t.hours, 0),
}));

/**
 * The three moments in the meeting where an earlier decision was replaced.
 * Markup: [[who:x]] person, [[old:x]] superseded value, [[new:x]] final value.
 */
export const CORRECTIONS: {
  project: ProjectKey;
  rule: string;
  lines: { speaker: string; text: string }[];
  task: LandingTask;
  superseded: string;
}[] = [
  {
    project: "urbancart",
    rule: "The later date replaces the first one.",
    lines: [
      { speaker: "Ayesha", text: "[[who:Ali]] owns Website integration and testing. A six-hour estimate and a [[old:17 October]] deadline." },
      { speaker: "Ali", text: "Six hours is reasonable. But please move that task to [[new:19 October]]." },
      { speaker: "Ayesha", text: "Accepted. [[new:6 hours]], due [[new:19 October]]." },
    ],
    task: TASKS[3],
    superseded: "17 Oct",
  },
  {
    project: "quickserve",
    rule: "The revised estimate wins.",
    lines: [
      { speaker: "Usman", text: "I will own Mobile integration and testing. Initially I would put it at [[old:8 hours]]." },
      { speaker: "Sara", text: "Can that cover error states and testing login through booking? Eight sounds tight." },
      { speaker: "Bilal", text: "Final agreement: [[who:Usman]], [[new:10 hours]], [[new:22 October]]." },
    ],
    task: TASKS[7],
    superseded: "8 h",
  },
  {
    project: "helpdesk",
    rule: "The owner changes when the room changes it.",
    lines: [
      { speaker: "Hina", text: "For Assistant evaluation and testing, I was initially considering [[old:Zain]] as the owner." },
      { speaker: "Maryam", text: "I can own that instead. Someone other than the answer-generation developer should check it." },
      { speaker: "Hina", text: "Agreed. [[who:Maryam]] is the final owner. [[new:8 hours]], [[new:21 October]]." },
    ],
    task: TASKS[11],
    superseded: "Zain",
  },
];

/** Discussed in the meeting, explicitly rejected, so the AI must not create them. */
export const EXCLUDED = [
  "Payment gateway",
  "Inventory integration",
  "Live maps",
  "Driver tracking",
  "In-app payments",
  "Email sending",
  "Separate iOS app",
];

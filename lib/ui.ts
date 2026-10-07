import type { Role } from "./types";

export const ROLE_LABEL: Record<Role, string> = {
  ADMIN: "Administrator",
  MANAGER: "Project Manager",
  AGENT: "Developer",
};

/** One colour per role, reused everywhere so the hierarchy is learnable. */
export const ROLE_STYLE: Record<Role, string> = {
  ADMIN: "bg-primary/15 text-primary border-primary/30",
  MANAGER: "bg-manager/15 text-manager border-manager/30",
  AGENT: "bg-success/15 text-success border-success/30",
};

export function initials(name: string) {
  return name.split(" ").filter(Boolean).slice(0, 2).map((p) => p[0]).join("").toUpperCase();
}

export function formatDate(iso: string) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
  });
}

export function shortDate(iso: string) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

/** How close a deadline is, used to tint date chips. */
export function urgency(iso: string): "past" | "soon" | "normal" {
  const days = Math.ceil((new Date(`${iso}T00:00:00`).getTime() - Date.now()) / 86_400_000);
  if (days < 0) return "past";
  if (days <= 7) return "soon";
  return "normal";
}

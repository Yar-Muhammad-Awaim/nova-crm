import test from "node:test";
import assert from "node:assert/strict";
import { initials, formatDate, shortDate, urgency, ROLE_LABEL, ROLE_STYLE } from "../lib/ui.ts";
import { APP_THEMES, DEFAULT_THEME, getAppTheme } from "../lib/themes.ts";

test("initials extracts up to two uppercase initials from names", () => {
  assert.equal(initials("Ayesha Khan"), "AK");
  assert.equal(initials("Ali Raza"), "AR");
  assert.equal(initials("Admin"), "A");
  assert.equal(initials("John Robert Smith"), "JR");
  assert.equal(initials("   Bilal   Ahmed   "), "BA");
  assert.equal(initials(""), "");
  assert.equal(initials("     "), "");
  assert.equal(initials("single"), "S");
});

test("formatDate produces consistent en-GB date representations", () => {
  assert.equal(formatDate("2026-10-20"), "20 Oct 2026");
  assert.equal(formatDate("2026-01-05"), "5 Jan 2026");
  assert.equal(formatDate("2028-02-29"), "29 Feb 2028"); // Leap year
  assert.equal(formatDate("2026-12-31"), "31 Dec 2026");
});

test("shortDate formats without the year", () => {
  assert.equal(shortDate("2026-10-20"), "20 Oct");
  assert.equal(shortDate("2026-04-01"), "1 Apr");
  assert.equal(shortDate("2026-11-15"), "15 Nov");
});

test("urgency computes deadline status accurately", () => {
  const now = new Date();
  
  // Past deadline (10 days ago)
  const pastDate = new Date(now.getTime() - 10 * 86_400_000).toISOString().slice(0, 10);
  assert.equal(urgency(pastDate), "past");

  // Near-term deadline (3 days in future)
  const soonDate = new Date(now.getTime() + 3 * 86_400_000).toISOString().slice(0, 10);
  assert.equal(urgency(soonDate), "soon");

  // Far future deadline (30 days in future)
  const futureDate = new Date(now.getTime() + 30 * 86_400_000).toISOString().slice(0, 10);
  assert.equal(urgency(futureDate), "normal");
});

test("ROLE_LABEL covers all enterprise roles with human-readable labels", () => {
  assert.equal(ROLE_LABEL.ADMIN, "Administrator");
  assert.equal(ROLE_LABEL.MANAGER, "Project Manager");
  assert.equal(ROLE_LABEL.AGENT, "Developer");
});

test("ROLE_STYLE provides distinct theme styling tokens for every role", () => {
  assert.match(ROLE_STYLE.ADMIN, /primary/);
  assert.match(ROLE_STYLE.MANAGER, /manager/);
  assert.match(ROLE_STYLE.AGENT, /success/);
});

test("themes catalogue includes all enterprise design themes", () => {
  assert.equal(DEFAULT_THEME, "nova");
  assert.equal(APP_THEMES.length, 4);

  const themeIds = APP_THEMES.map(t => t.id);
  assert.ok(themeIds.includes("nova"));
  assert.ok(themeIds.includes("white"));
  assert.ok(themeIds.includes("slate"));
  assert.ok(themeIds.includes("sand"));
});

test("getAppTheme retrieves configured theme and falls back safely", () => {
  const nova = getAppTheme("nova");
  assert.equal(nova.id, "nova");
  assert.equal(nova.colorScheme, "dark");

  const white = getAppTheme("white");
  assert.equal(white.id, "white");
  assert.equal(white.colorScheme, "light");

  const slate = getAppTheme("slate");
  assert.equal(slate.id, "slate");
  assert.equal(slate.colorScheme, "dark");

  const sand = getAppTheme("sand");
  assert.equal(sand.id, "sand");
  assert.equal(sand.colorScheme, "light");

  // Unknown theme falls back to DEFAULT_THEME ("nova")
  assert.equal(getAppTheme("non-existent-theme").id, "nova");
  assert.equal(getAppTheme(undefined).id, "nova");
  assert.equal(getAppTheme("").id, "nova");
});

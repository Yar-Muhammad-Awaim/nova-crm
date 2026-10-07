"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { SidebarAccount } from "@/components/sidebar-account";
import type { Session } from "@/lib/types";
import {
  Sparkles, LayoutDashboard, FolderKanban, Users, ListChecks,
  FileText, BarChart3, Menu, X, PanelLeftClose, PanelLeftOpen,
} from "lucide-react";
import { useState } from "react";

export function AppSidebar({ session }: { session: Session }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  // Navigation is built from the role, so a user is never shown a door
  // they cannot walk through. (The server refuses them anyway — this is
  // just so the UI doesn't lie.)
  const nav = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, show: true },
    { href: "/transcript", label: "Create from Transcript", icon: FileText, show: session.role === "ADMIN" },
    { href: "/projects", label: "Projects", icon: FolderKanban, show: true },
    { href: "/my-tasks", label: "My Tasks", icon: ListChecks, show: session.role === "AGENT" },
    { href: "/workload", label: "Team Workload", icon: BarChart3, show: session.role !== "AGENT" },
    { href: "/team", label: "People & teams", icon: Users, show: true },
  ].filter((n) => n.show);

  const renderBody = (compact: boolean, desktop = false) => (
    <>
      <div className={`flex items-center gap-2.5 py-5 ${compact ? "flex-col px-2" : "px-5"}`}>
        <div className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground">
          <Sparkles className="size-4" />
        </div>
        {!compact && <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold tracking-tight">NovaWorks</p>
          <p className="truncate text-xs text-muted-foreground">Project CRM</p>
        </div>}
        {desktop && (
          <Button
            type="button"
            size="icon"
            variant="ghost"
            onClick={() => setCollapsed((value) => !value)}
            aria-label={compact ? "Expand sidebar" : "Collapse sidebar"}
            aria-expanded={!compact}
            aria-controls="desktop-navigation"
            title={compact ? "Expand sidebar" : "Collapse sidebar"}
          >
            {compact ? <PanelLeftOpen className="size-4" aria-hidden="true" /> : <PanelLeftClose className="size-4" aria-hidden="true" />}
          </Button>
        )}
      </div>

      <nav id={desktop ? "desktop-navigation" : undefined} aria-label="Main navigation" className={`flex-1 space-y-0.5 ${compact ? "px-2" : "px-3"}`}>
        {nav.map((item) => {
          const active = path === item.href || path.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              aria-label={compact ? item.label : undefined}
              title={compact ? item.label : undefined}
              className={`relative flex items-center rounded-lg py-2 text-sm font-medium transition-colors ${compact ? "justify-center px-2" : "gap-3 px-3"} ${
                active ? "text-foreground" : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground"
              }`}
            >
              {active && (
                <motion.span
                  layoutId="nav-active"
                  className="absolute inset-0 rounded-lg border border-primary/25 bg-primary/12"
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                />
              )}
              <item.icon className={`relative size-4 shrink-0 ${active ? "text-primary" : ""}`} aria-hidden="true" />
              {!compact && <span className="relative">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <SidebarAccount session={session} compact={compact} />
    </>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="fixed inset-x-0 top-0 z-40 flex items-center justify-between border-b bg-background/85 px-4 py-3 backdrop-blur lg:hidden">
        <div className="flex items-center gap-2">
          <div className="grid size-7 place-items-center rounded-md bg-primary text-primary-foreground">
            <Sparkles className="size-3.5" />
          </div>
          <span className="text-sm font-semibold">NovaWorks</span>
        </div>
        <Button
          size="icon"
          variant="ghost"
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={open}
        >
          {open ? <X className="size-4" aria-hidden="true" /> : <Menu className="size-4" aria-hidden="true" />}
        </Button>
      </div>

      {open && (
        <div className="fixed inset-0 top-[53px] z-30 flex flex-col bg-sidebar lg:hidden">{renderBody(false)}</div>
      )}

      <aside className={`sticky top-0 hidden h-dvh shrink-0 flex-col border-r bg-sidebar transition-[width] duration-200 lg:flex ${collapsed ? "w-16" : "w-62"}`}>
        {renderBody(collapsed, true)}
      </aside>
    </>
  );
}

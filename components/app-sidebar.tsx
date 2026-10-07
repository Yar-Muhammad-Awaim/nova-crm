"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { logout } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ROLE_LABEL, ROLE_STYLE, initials } from "@/lib/ui";
import type { Session } from "@/lib/types";
import {
  Sparkles, LayoutDashboard, FolderKanban, Users, ListChecks,
  FileText, LogOut, BarChart3, Menu, X,
} from "lucide-react";
import { useState } from "react";

export function AppSidebar({ session }: { session: Session }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);

  // Navigation is built from the role, so a user is never shown a door
  // they cannot walk through. (The server refuses them anyway — this is
  // just so the UI doesn't lie.)
  const nav = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, show: true },
    { href: "/transcript", label: "Create from Transcript", icon: FileText, show: session.role === "ADMIN" },
    { href: "/projects", label: "Projects", icon: FolderKanban, show: true },
    { href: "/my-tasks", label: "My Tasks", icon: ListChecks, show: session.role === "AGENT" },
    { href: "/workload", label: "Team Workload", icon: BarChart3, show: session.role !== "AGENT" },
    { href: "/team", label: "Team Directory", icon: Users, show: true },
  ].filter((n) => n.show);

  const body = (
    <>
      <div className="flex items-center gap-2.5 px-5 py-5">
        <div className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground">
          <Sparkles className="size-4" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold tracking-tight">NovaWorks</p>
          <p className="truncate text-xs text-muted-foreground">Project CRM</p>
        </div>
      </div>

      <nav className="flex-1 space-y-0.5 px-3">
        {nav.map((item) => {
          const active = path === item.href || path.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={`relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
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
              <item.icon className={`relative size-4 ${active ? "text-primary" : ""}`} />
              <span className="relative">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t p-3">
        <div className="flex items-center gap-3 rounded-lg px-2 py-2">
          <Avatar className="size-8">
            <AvatarFallback className="bg-primary/15 text-xs font-semibold text-primary">
              {initials(session.name)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{session.name}</p>
            <p className="truncate text-xs text-muted-foreground">{ROLE_LABEL[session.role]}</p>
          </div>
        </div>
        <Badge variant="outline" className={`${ROLE_STYLE[session.role]} mx-2 mt-1 text-[10px]`}>
          {session.userId}
        </Badge>
        <form action={logout} className="mt-2">
          <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground">
            <LogOut className="size-4" /> Sign out
          </Button>
        </form>
      </div>
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
        <div className="fixed inset-0 top-[53px] z-30 flex flex-col bg-sidebar lg:hidden">{body}</div>
      )}

      <aside className="sticky top-0 hidden h-dvh w-62 shrink-0 flex-col border-r bg-sidebar lg:flex">
        {body}
      </aside>
    </>
  );
}

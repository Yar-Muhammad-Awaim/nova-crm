"use client";

import { useTransition } from "react";
import { useTheme } from "next-themes";
import { ChevronUp, LogOut, Palette } from "lucide-react";
import { logout } from "@/lib/actions";
import { APP_THEMES, DEFAULT_THEME } from "@/lib/themes";
import { initials, ROLE_LABEL } from "@/lib/ui";
import type { Session } from "@/lib/types";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export function SidebarAccount({ session, compact }: { session: Session; compact: boolean }) {
  const { theme, setTheme } = useTheme();
  const [pending, start] = useTransition();
  return <div className="border-t p-2" data-sidebar-account>
    <DropdownMenu>
      <DropdownMenuTrigger aria-label={`Account menu for ${session.name}`} disabled={pending} className={`flex w-full items-center rounded-lg py-2 text-left outline-none transition-colors hover:bg-sidebar-accent focus-visible:ring-2 focus-visible:ring-ring ${compact ? "justify-center" : "gap-2.5 px-2"}`}>
        <Avatar className="size-8 shrink-0"><AvatarFallback className="bg-primary/15 text-xs font-semibold text-primary">{initials(session.name)}</AvatarFallback></Avatar>
        {!compact && <><span className="min-w-0 flex-1"><span className="block truncate text-sm font-medium">{session.name}</span><span className="block truncate text-xs text-muted-foreground">{ROLE_LABEL[session.role]}</span></span><ChevronUp className="size-3.5 shrink-0 text-muted-foreground" /></>}
      </DropdownMenuTrigger>
      <DropdownMenuContent side="top" align="start" sideOffset={8} className="w-60" aria-label="Account settings">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="flex items-center gap-2 px-2 py-2"><Palette className="size-3.5" />Theme</DropdownMenuLabel>
          <DropdownMenuRadioGroup value={theme ?? DEFAULT_THEME} onValueChange={setTheme}>
            {APP_THEMES.map(item => <DropdownMenuRadioItem key={item.id} value={item.id} className="px-2 py-2"><span className="font-medium">{item.name}</span><span className="text-xs text-muted-foreground">{item.description}</span></DropdownMenuRadioItem>)}
          </DropdownMenuRadioGroup>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" className="px-2 py-2" disabled={pending} onClick={() => start(async () => { await logout(); })}><LogOut className="size-4" />{pending ? "Signing out…" : "Sign out"}</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>;
}

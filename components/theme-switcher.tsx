"use client";

import { useId, useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { ChevronDown, Palette } from "lucide-react";
import { APP_THEMES, DEFAULT_THEME } from "@/lib/themes";

const subscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

export function ThemeSwitcher({ compact = false }: { compact?: boolean }) {
  const { theme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const id = useId();

  return (
    <div className={compact ? "relative w-24 sm:w-28" : "space-y-2"}>
      <label htmlFor={id} className={compact ? "sr-only" : "flex items-center gap-2 px-1 text-xs font-medium text-muted-foreground"}>
        <Palette className="size-3.5" aria-hidden="true" />
        Theme
      </label>
      <div className="relative">
        <select
          id={id}
          value={mounted ? theme ?? DEFAULT_THEME : DEFAULT_THEME}
          onChange={(event) => setTheme(event.target.value)}
          disabled={!mounted}
          className="h-9 w-full appearance-none rounded-lg border border-input bg-background py-1.5 pr-8 pl-3 text-sm text-foreground outline-none transition-colors hover:bg-accent focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 disabled:opacity-60"
        >
          {APP_THEMES.map((item) => (
            <option key={item.id} value={item.id}>
              {compact ? item.name : `${item.name} · ${item.description}`}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute top-1/2 right-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
      </div>
    </div>
  );
}

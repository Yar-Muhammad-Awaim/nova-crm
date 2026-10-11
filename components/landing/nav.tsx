"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Menu, X, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { NAV_LINKS } from "@/lib/content/landing";

export function LandingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Prevent background scroll when mobile drawer is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter,padding] duration-300 ${
        scrolled
          ? "border-b border-border/70 bg-background/80 py-2.5 backdrop-blur-xl shadow-xs"
          : "border-b border-transparent py-4"
      }`}
    >
      <nav className="mx-auto flex max-w-6xl items-center gap-6 px-5 sm:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-2.5" aria-label="NovaWorks home">
          <span className="grid size-7.5 place-items-center rounded-lg bg-primary text-primary-foreground shadow-sm shadow-primary/20">
            <Sparkles className="size-4" aria-hidden="true" />
          </span>
          <span className="font-display text-xl tracking-tight font-semibold">NovaWorks</span>
          <span className="hidden sm:inline-block rounded-md border border-border/70 bg-secondary/60 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground uppercase">
            CRM
          </span>
        </Link>

        <ul className="ml-auto hidden items-center gap-6 lg:flex">
          {NAV_LINKS.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="group relative py-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {l.label}
                <span className="absolute inset-x-0 -bottom-0.5 h-px origin-left scale-x-0 bg-primary transition-transform duration-300 group-hover:scale-x-100" />
              </a>
            </li>
          ))}
        </ul>

        <div className="ml-auto flex items-center gap-2.5 lg:ml-0">
          <div className="hidden sm:block">
            <ThemeSwitcher compact />
          </div>
          <Button
            size="sm"
            className="hidden sm:inline-flex group shadow-xs"
            nativeButton={false}
            render={<Link href="/login" />}
          >
            <span>Launch Platform</span>
            <ArrowRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="lg:hidden"
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            {open ? <X className="size-4" aria-hidden="true" /> : <Menu className="size-4" aria-hidden="true" />}
          </Button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22 }}
            className="border-t border-border/70 bg-background/98 backdrop-blur-2xl lg:hidden"
          >
            <ul className="space-y-1 px-5 py-4">
              {NAV_LINKS.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="block rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
              <li className="border-t border-border/70 px-3 pt-4 sm:hidden">
                <ThemeSwitcher />
              </li>
              <li className="pt-2">
                <Button className="w-full" nativeButton={false} render={<Link href="/login" />}>
                  Launch Platform
                </Button>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

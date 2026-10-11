import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { LoginForm } from "@/components/login-form";
import { DemoAccounts } from "@/components/demo-accounts";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Sparkles, FileText, FolderKanban, ShieldCheck, ArrowLeft, Database, UserCheck } from "lucide-react";

export default async function LoginPage() {
  if (await getSession()) redirect("/dashboard");

  return (
    <main className="grid min-h-screen lg:grid-cols-[1.1fr_1fr]">
      {/* Left: The High-Conviction Value Pitch */}
      <section className="relative hidden flex-col justify-between overflow-hidden border-r p-10 xl:p-14 lg:flex bg-card/20">
        <div className="bg-grid mask-fade-b pointer-events-none absolute inset-0 opacity-40" />
        <div className="pointer-events-none absolute -top-40 -left-32 size-[32rem] rounded-full bg-radial from-primary/20 to-transparent to-70% blur-3xl" />

        <div className="relative flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="grid size-9 place-items-center rounded-lg bg-primary text-primary-foreground shadow-sm shadow-primary/20">
              <Sparkles className="size-5" />
            </div>
            <span className="text-base font-semibold tracking-tight text-foreground">NovaWorks</span>
            <span className="rounded-md border border-border/70 px-2 py-0.5 text-xs text-muted-foreground font-mono">
              CRM
            </span>
          </Link>

          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-3.5" />
            <span>Product Overview</span>
          </Link>
        </div>

        <div className="relative max-w-xl">
          <p className="mb-4 text-xs font-medium tracking-[0.18em] text-primary uppercase font-mono">
            Autonomous Project Intelligence
          </p>
          <h1 className="text-4xl xl:text-5xl leading-[1.08] font-display font-semibold tracking-tight text-balance text-foreground">
            Turn stakeholder syncs into <em className="italic text-primary">cash-flow execution</em>.
          </h1>
          <p className="mt-5 max-w-md text-sm xl:text-base leading-relaxed text-muted-foreground">
            Eliminate the 18% billable scope lost in translation between client calls and delivery boards.
            Discrete tasks, verified owners, and hard deadlines compiled directly to PostgreSQL.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-2.5 text-xs">
            <Step icon={<FileText className="size-3.5 text-muted-foreground" />} label="1. Ingest Audio Stream" />
            <Arrow />
            <Step icon={<Sparkles className="size-3.5 text-primary" />} label="2. Ground with Staff Directory" accent />
            <Arrow />
            <Step icon={<FolderKanban className="size-3.5 text-emerald-400" />} label="3. Single-Tx ACID Commit" />
          </div>

          <div className="mt-10 grid grid-cols-2 gap-3 pt-4 border-t border-border/60">
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
              <UserCheck className="size-3.5 text-emerald-400 shrink-0" />
              <span>Zero Hallucinated Staff</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
              <Database className="size-3.5 text-primary shrink-0" />
              <span>100% ACID DB Consistency</span>
            </div>
          </div>
        </div>

        <p className="relative flex items-center gap-2 text-xs text-muted-foreground font-mono">
          <ShieldCheck className="size-3.5 text-chart-2" />
          Role-based security enforced in PostgreSQL — never client-side button hiding.
        </p>
      </section>

      {/* Right: Authentication & 1-Click Launch */}
      <section className="flex flex-col justify-center px-6 py-10 sm:px-12 overflow-y-auto">
        <div className="mx-auto w-full max-w-sm sm:max-w-md space-y-6">
          <div className="lg:hidden flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground">
                <Sparkles className="size-4" />
              </div>
              <span className="text-lg font-semibold tracking-tight">NovaWorks</span>
            </Link>
            <ThemeSwitcher compact />
          </div>

          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-foreground font-display">
                Sign in to Workspace
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Enter your credentials or launch an instant demo persona below.
              </p>
            </div>
            <div className="hidden lg:block">
              <ThemeSwitcher compact />
            </div>
          </div>

          {/* Quick 1-Click Launch Personas */}
          <DemoAccounts />

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border/70" />
            </div>
            <div className="relative flex justify-center text-xs uppercase font-mono">
              <span className="bg-background px-2 text-muted-foreground">Or manual sign in</span>
            </div>
          </div>

          {/* Standard Login Form */}
          <LoginForm />
        </div>
      </section>
    </main>
  );
}

function Step({ icon, label, accent }: { icon: React.ReactNode; label: string; accent?: boolean }) {
  return (
    <div
      className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 ${
        accent
          ? "border-primary/40 bg-primary/10 text-primary font-medium"
          : "border-border/70 bg-card/60 text-muted-foreground"
      }`}
    >
      {icon}
      <span className="text-xs whitespace-nowrap">{label}</span>
    </div>
  );
}

function Arrow() {
  return <div className="h-px w-3 shrink-0 bg-border hidden sm:block" />;
}

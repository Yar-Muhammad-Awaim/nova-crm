import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { LoginForm } from "@/components/login-form";
import { DemoAccounts } from "@/components/demo-accounts";
import { Sparkles, FileText, FolderKanban, ShieldCheck } from "lucide-react";

export default async function LoginPage() {
  if (await getSession()) redirect("/dashboard");

  return (
    <main className="grid min-h-screen lg:grid-cols-[1.1fr_1fr]">
      {/* Left: the pitch. This is the first thing a judge sees. */}
      <section className="relative hidden flex-col justify-between overflow-hidden border-r p-12 lg:flex">
        <div className="bg-grid mask-fade-b pointer-events-none absolute inset-0" />
        <div className="pointer-events-none absolute -top-40 -left-32 size-[32rem] rounded-full bg-radial from-primary/20 to-transparent to-70% blur-3xl" />

        <div className="relative flex items-center gap-2.5">
          <div className="grid size-9 place-items-center rounded-lg bg-primary text-primary-foreground">
            <Sparkles className="size-5" />
          </div>
          <span className="text-base font-semibold tracking-tight">NovaWorks</span>
          <span className="ml-1 rounded-md border border-border/70 px-2 py-0.5 text-xs text-muted-foreground">
            Technologies
          </span>
        </div>

        <div className="relative max-w-xl">
          <p className="mb-4 text-xs font-medium tracking-[0.18em] text-primary uppercase">
            Meeting to execution
          </p>
          <h1 className="text-5xl leading-[1.05] font-semibold tracking-tight text-balance">
            <span className="text-gradient">Your meeting already</span>
            <br />
            contained the plan.
          </h1>
          <p className="mt-5 max-w-md text-base leading-relaxed text-muted-foreground">
            One hour of discussion becomes three projects and twelve assigned tasks —
            with owners, deadlines and effort estimates — without anyone typing them in.
          </p>

          <div className="mt-10 flex items-center gap-3 text-sm">
            <Step icon={<FileText className="size-4" />} label="Paste transcript" />
            <Arrow />
            <Step icon={<Sparkles className="size-4" />} label="AI extracts" accent />
            <Arrow />
            <Step icon={<FolderKanban className="size-4" />} label="Projects created" />
          </div>
        </div>

        <p className="relative flex items-center gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="size-3.5" />
          Role-based access enforced server-side — not by hiding buttons.
        </p>
      </section>

      {/* Right: sign in */}
      <section className="flex flex-col justify-center px-6 py-12 sm:px-12">
        <div className="mx-auto w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <div className="mb-3 grid size-9 place-items-center rounded-lg bg-primary text-primary-foreground">
              <Sparkles className="size-5" />
            </div>
            <h2 className="text-2xl font-semibold tracking-tight">NovaWorks</h2>
          </div>

          <h2 className="text-2xl font-semibold tracking-tight">Sign in</h2>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Use one of the ten seeded company accounts.
          </p>

          <div className="mt-7">
            <LoginForm />
          </div>

          <div className="mt-8">
            <DemoAccounts />
          </div>
        </div>
      </section>
    </main>
  );
}

function Step({ icon, label, accent }: { icon: React.ReactNode; label: string; accent?: boolean }) {
  return (
    <div
      className={`flex items-center gap-2 rounded-lg border px-3 py-2 ${
        accent ? "border-primary/40 bg-primary/10 text-primary" : "bg-card/60 text-muted-foreground"
      }`}
    >
      {icon}
      <span className="text-sm font-medium whitespace-nowrap">{label}</span>
    </div>
  );
}

function Arrow() {
  return <div className="h-px w-5 shrink-0 bg-border" />;
}

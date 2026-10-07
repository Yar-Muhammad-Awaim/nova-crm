import { requireSession, listUsers } from "@/lib/data";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ROLE_LABEL, ROLE_STYLE, initials } from "@/lib/ui";

export const dynamic = "force-dynamic";

export default async function TeamPage() {
  await requireSession();
  const users = (await listUsers()).filter((u) => u.role !== "ADMIN");

  const groups = [
    { role: "MANAGER" as const, title: "Project Managers" },
    { role: "AGENT" as const, title: "Developers" },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Directory"
        title="Team Directory"
        description="Read-only. These nine people are the entire pool the AI is allowed to assign work to — it cannot invent anyone else."
      />
      <div className="space-y-9 px-6 py-7 lg:px-9">
        {groups.map((g) => (
          <section key={g.role}>
            <h2 className="mb-4 text-sm font-semibold tracking-tight">{g.title}</h2>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {users.filter((u) => u.role === g.role).map((u) => (
                <Card key={u.id} className="gap-0 p-5">
                  <div className="flex items-start gap-3.5">
                    <Avatar className="size-11">
                      <AvatarFallback
                        className={`text-sm font-semibold ${
                          u.role === "MANAGER"
                            ? "bg-sky-500/15 text-sky-400"
                            : "bg-emerald-500/15 text-emerald-400"
                        }`}
                      >
                        {initials(u.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="truncate text-base font-semibold tracking-tight">{u.name}</h3>
                        <Badge variant="outline" className="shrink-0 font-mono text-[10px]">{u.id}</Badge>
                      </div>
                      <p className="mt-0.5 truncate text-sm text-muted-foreground">{u.email}</p>
                      <Badge variant="outline" className={`${ROLE_STYLE[u.role]} mt-2.5 text-[10px]`}>
                        {u.specialization ?? ROLE_LABEL[u.role]}
                      </Badge>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-1.5 border-t pt-4">
                    {u.skills.map((s) => (
                      <span
                        key={s}
                        className="rounded-md border bg-secondary/40 px-2 py-0.5 text-xs text-muted-foreground"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}

import { requireSession, listUsers, listTeams } from "@/lib/data";
import { PageHeader } from "@/components/page-header";
import { MemberDialog, TeamDialog } from "@/components/create-dialogs";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ROLE_STYLE, initials } from "@/lib/ui";
import { Users } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function TeamPage() {
  const session = await requireSession();
  const [directory, teams] = await Promise.all([listUsers(), listTeams()]);
  const users = directory.filter(user => user.role !== "ADMIN");
  const admin = session.role === "ADMIN";
  return (
    <div className="pt-14 lg:pt-0">
      <PageHeader eyebrow="Workspace" title="People & teams"
        description="Manage the people and teams behind your projects."
        action={admin ? <div className="flex flex-wrap gap-2"><TeamDialog users={users} /><MemberDialog initialRole="MANAGER" /><MemberDialog /></div> : undefined} />
      <div className="space-y-8 px-6 py-6 lg:px-9">
        <section aria-label="Teams">
          <h2 className="mb-4 text-sm font-semibold">Teams <span className="ml-2 font-normal text-muted-foreground">{teams.length}</span></h2>
          {teams.length === 0 ? <div className="rounded-xl border border-dashed p-6 text-sm text-muted-foreground">No teams yet. {admin ? "Create a team and choose its project manager and members." : "Your administrator can organize members into teams."}</div> : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {teams.map(team => {
                const members = users.filter(user => team.members.some(member => member.user_id === user.id));
                return <Card key={team.id} className="gap-0 p-5">
                  <div className="flex items-start justify-between gap-3"><div className="flex min-w-0 items-center gap-2"><Users className="size-4 shrink-0 text-muted-foreground" /><h3 className="break-words text-base font-semibold">{team.name}</h3></div>{admin && <TeamDialog team={team} users={users} />}</div>
                  {team.description && <p className="mt-2 text-sm text-muted-foreground">{team.description}</p>}
                  <p className="mt-4 text-xs text-muted-foreground">Project manager</p><p className="mt-1 text-sm font-medium">{team.manager?.name ?? "Unassigned"}</p>
                  <div className="mt-4 border-t pt-3"><p className="mb-2 text-xs text-muted-foreground">{members.length} {members.length === 1 ? "member" : "members"}</p><div className="flex flex-wrap gap-1.5">{members.map(member => <Badge key={member.id} variant="secondary" className="font-normal">{member.name}</Badge>)}</div></div>
                </Card>;
              })}
            </div>
          )}
        </section>
        {[{ role: "MANAGER", label: "Project managers" }, { role: "AGENT", label: "Members" }].map(group => (
          <section key={group.role} aria-label={group.label}>
            <h2 className="mb-4 text-sm font-semibold">{group.label} <span className="ml-2 font-normal text-muted-foreground">{users.filter(user => user.role === group.role).length}</span></h2>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {users.filter(user => user.role === group.role).map(user => (
                <Card key={user.id} className="gap-0 p-5">
                  <div className="flex items-start gap-3"><Avatar className="size-10"><AvatarFallback className={user.role === "MANAGER" ? "bg-manager/15 text-manager" : "bg-success/15 text-success"}>{initials(user.name)}</AvatarFallback></Avatar>
                    <div className="min-w-0"><h3 className="break-words text-base font-semibold">{user.name}</h3><p className="mt-0.5 break-all text-sm text-muted-foreground">{user.email}</p><Badge variant="outline" className={`${ROLE_STYLE[user.role]} mt-2 text-xs`}>{user.specialization || (user.role === "MANAGER" ? "Project manager" : "Member")}</Badge></div>
                  </div>
                  {user.skills.length > 0 && <div className="mt-4 flex flex-wrap gap-1.5 border-t pt-3">{user.skills.map(skill => <span key={skill} className="rounded-md bg-secondary/50 px-2 py-0.5 text-xs text-muted-foreground">{skill}</span>)}</div>}
                </Card>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

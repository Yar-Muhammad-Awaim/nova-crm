import { redirect } from "next/navigation";
import { requireSession, listUsers } from "@/lib/data";
import { TranscriptStudio } from "@/components/transcript-studio";
import { SAMPLE_TRANSCRIPT } from "@/lib/transcript";

export const dynamic = "force-dynamic";

export default async function TranscriptPage() {
  const s = await requireSession();
  // Admin-only, enforced here AND inside the server action itself.
  if (s.role !== "ADMIN") redirect("/dashboard");

  const directory = await listUsers();

  return (
    <div className="pt-14 lg:pt-0">
      <header className="px-5 pb-3 pt-5 sm:px-8 lg:px-9">
        <h1 className="text-2xl font-semibold tracking-tight">Create from Transcript</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">Turn meeting notes into projects and assigned tasks. Review the draft before saving.</p>
      </header>
      <TranscriptStudio sample={SAMPLE_TRANSCRIPT} directory={directory} />
    </div>
  );
}

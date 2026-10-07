import { redirect } from "next/navigation";
import { requireSession, listUsers } from "@/lib/data";
import { PageHeader } from "@/components/page-header";
import { TranscriptStudio } from "@/components/transcript-studio";
import { SAMPLE_TRANSCRIPT } from "@/lib/transcript";

export const dynamic = "force-dynamic";

export default async function TranscriptPage() {
  const s = await requireSession();
  // Admin-only, enforced here AND inside the server action itself.
  if (s.role !== "ADMIN") redirect("/dashboard");

  const directory = await listUsers();

  return (
    <>
      <PageHeader
        eyebrow="AI automation"
        title="Create from Transcript"
        description="Paste a project-planning meeting. The AI reads it against the team directory and proposes projects with owners, deadlines and effort estimates. Nothing is saved until you approve it."
      />
      <TranscriptStudio sample={SAMPLE_TRANSCRIPT} directory={directory} />
    </>
  );
}

import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { AppSidebar } from "@/components/app-sidebar";
import { MotionProvider } from "@/components/motion-provider";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <MotionProvider>
      <div className="flex min-h-dvh">
        <AppSidebar session={session} />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </MotionProvider>
  );
}

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SearchX } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <div className="mb-4 grid size-11 place-items-center rounded-xl border bg-secondary/40 text-muted-foreground">
        <SearchX className="size-5" aria-hidden="true" />
      </div>
      <h1 className="text-xl font-semibold tracking-tight">Not found</h1>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
        This page does not exist — or it belongs to someone whose projects you are not permitted
        to see. Access rules are applied on the server.
      </p>
      <Button className="mt-6" nativeButton={false} render={<Link href="/dashboard" />}>
        Back to dashboard
      </Button>
    </div>
  );
}

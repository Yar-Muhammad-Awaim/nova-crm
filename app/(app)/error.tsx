"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { claimDocumentReload, needsDocumentReload } from "@/lib/runtime-recovery";

export default function AppError({
  error, reset,
}: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
    if (needsDocumentReload(error.message)) {
      // reset() reuses the same router/runtime that failed to decode the page.
      // sessionStorage survives the reload and prevents an automatic loop.
      try {
        if (claimDocumentReload(window.sessionStorage, window.location.pathname, error.message)) {
          window.location.reload();
        }
      } catch { /* Storage can be disabled; the manual reload remains available. */ }
    }
  }, [error]);

  // The guards in lib/data.ts throw this when a user reaches past their scope.
  const forbidden = error.message === "FORBIDDEN";

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <div className="mb-4 grid size-11 place-items-center rounded-xl border bg-secondary/40 text-muted-foreground">
        <AlertTriangle className="size-5" aria-hidden="true" />
      </div>
      <h1 className="text-xl font-semibold tracking-tight">
        {forbidden ? "You do not have access to this" : "Something went wrong"}
      </h1>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
        {forbidden
          ? "This record belongs to another person's projects. Access is checked on the server, so it cannot be reached by changing the address."
          : "The page could not be loaded. Reload it to try again."}
      </p>
      <Button onClick={() => needsDocumentReload(error.message) ? window.location.reload() : reset()} className="mt-6">
        <RotateCcw className="size-4" aria-hidden="true" /> {needsDocumentReload(error.message) ? "Reload page" : "Try again"}
      </Button>
    </div>
  );
}

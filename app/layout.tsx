import type { Metadata, Viewport } from "next";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "NovaWorks — Meeting to Execution",
  description: "Paste a meeting transcript. Get real projects and assigned tasks.",
};

export const viewport: Viewport = { themeColor: "#0a0e18" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className="min-h-dvh bg-background text-foreground antialiased"
        /* Some browser extensions inject attributes onto <body> before React
           hydrates, which React reports as a mismatch. Not our markup. */
        suppressHydrationWarning
      >
        {children}
        <Toaster position="top-center" richColors closeButton />
      </body>
    </html>
  );
}

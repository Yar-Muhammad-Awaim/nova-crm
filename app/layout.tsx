import type { Metadata, Viewport } from "next";
import { ThemeProvider } from "@/components/theme-provider";
// Self-hosted via fontsource: no Google Fonts CDN, no runtime network call,
// so the page renders identically on a venue wifi that blocks third parties.
import "@fontsource/instrument-serif/400.css";
import "@fontsource/instrument-serif/400-italic.css";
import "@fontsource-variable/inter-tight";
import "@fontsource-variable/geist-mono";
import "./globals.css";

export const metadata: Metadata = {
  title: "NovaWorks — Meeting to Execution",
  description: "Paste a meeting transcript. Get real projects and assigned tasks.",
};

export const viewport: Viewport = { themeColor: "#0a0e18" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className="min-h-dvh bg-background text-foreground antialiased"
        /* Some browser extensions inject attributes onto <body> before React
           hydrates, which React reports as a mismatch. Not our markup. */
        suppressHydrationWarning
      >
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}

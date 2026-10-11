import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { LandingNav } from "@/components/landing/nav";
import { Hero } from "@/components/landing/hero";
import { TrustStrip } from "@/components/landing/trust-strip";
import { InteractiveSimulator } from "@/components/landing/interactive-simulator";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Bento } from "@/components/landing/bento";
import { RoiCalculator } from "@/components/landing/roi-calculator";
import { ArchitectureDeepDive } from "@/components/landing/architecture-deep-dive";
import { RoleViews } from "@/components/landing/role-views";
import { BeforeAfter } from "@/components/landing/before-after";
import { Faq } from "@/components/landing/faq";
import { FinalCta, LandingFooter } from "@/components/landing/final-cta";

const title = "NovaWorks — Autonomous Project CRM for Engineering Teams";
const description =
  "Stop losing 18% of billable project scope between client calls and execution boards. " +
  "NovaWorks converts unstructured stakeholder syncs into verified project execution graphs, " +
  "deterministic task ownership, and capacity-balanced roadmaps with zero hallucinated scope.";

export const metadata: Metadata = {
  title,
  description,
  openGraph: { title, description, type: "website", siteName: "NovaWorks" },
  twitter: { card: "summary_large_image", title, description },
};

export default async function LandingPage() {
  // Signed-in users navigate directly to the workspace dashboard.
  if (await getSession()) redirect("/dashboard");

  return (
    <>
      <LandingNav />
      <main>
        <Hero />
        <TrustStrip />
        <InteractiveSimulator />
        <HowItWorks />
        <Bento />
        <RoiCalculator />
        <ArchitectureDeepDive />
        <RoleViews />
        <BeforeAfter />
        <Faq />
        <FinalCta />
      </main>
      <LandingFooter />
    </>
  );
}

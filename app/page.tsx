import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { LandingNav } from "@/components/landing/nav";
import { Hero } from "@/components/landing/hero";
import { TrustStrip } from "@/components/landing/trust-strip";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Bento } from "@/components/landing/bento";
import { RoleViews } from "@/components/landing/role-views";
import { BeforeAfter } from "@/components/landing/before-after";
import { Faq } from "@/components/landing/faq";
import { FinalCta, LandingFooter } from "@/components/landing/final-cta";

const title = "NovaWorks — Meeting to Execution";
const description =
  "Paste a meeting transcript and get real projects and tasks: owners, deadlines and effort " +
  "estimates, written straight into your CRM.";

export const metadata: Metadata = {
  title,
  description,
  openGraph: { title, description, type: "website", siteName: "NovaWorks" },
  twitter: { card: "summary_large_image", title, description },
};

export default async function LandingPage() {
  // Someone already signed in has no use for the pitch.
  if (await getSession()) redirect("/dashboard");

  return (
    <>
      <LandingNav />
      <main>
        <Hero />
        <TrustStrip />
        <HowItWorks />
        <Bento />
        <RoleViews />
        <BeforeAfter />
        <Faq />
        <FinalCta />
      </main>
      <LandingFooter />
    </>
  );
}

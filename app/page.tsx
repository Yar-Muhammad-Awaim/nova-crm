import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { LandingMotion } from "@/components/landing/motion";
import { Bento, FinalCta, Footer, Hero, Nav, Safeguards, Stats } from "@/components/landing/sections";

export const metadata: Metadata = {
  title: "NovaWorks: from meeting transcript to assigned work",
  description: "Paste a meeting transcript. Get real projects and assigned tasks, visible only to the people they belong to.",
};

export default async function Home() {
  if (await getSession()) redirect("/dashboard");

  return (
    <LandingMotion>
      <Nav />
      <main>
        <Hero />
        <Stats />
        <Bento />
        <Safeguards />
        <FinalCta />
      </main>
      <Footer />
    </LandingMotion>
  );
}

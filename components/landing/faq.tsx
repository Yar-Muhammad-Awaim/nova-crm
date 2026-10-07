"use client";

import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import { FAQS } from "@/lib/content/landing";
import { Reveal, SectionHeading } from "./primitives";

export function Faq() {
  return (
    <section id="faq" className="scroll-mt-24 py-24 sm:py-32">
      <div className="mx-auto max-w-3xl px-5 sm:px-8">
        <SectionHeading
          eyebrow="Questions"
          title={<>The things people ask <em className="italic text-primary">first</em>.</>}
          align="center"
        />

        <Reveal delay={0.1}>
          <Accordion className="hairline mt-12 border-t">
            {FAQS.map((f, i) => (
              <AccordionItem key={f.q} value={`item-${i}`}>
                <AccordionTrigger className="text-left text-[15px]">{f.q}</AccordionTrigger>
                <AccordionContent>
                  <p className="measure-tight text-pretty text-sm leading-relaxed text-muted-foreground">
                    {f.a}
                  </p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>
      </div>
    </section>
  );
}

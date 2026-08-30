"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { faqs as fallbackFaqs } from "@/lib/site-data";
import { useApi } from "@/hooks/use-api";
import { useI18n } from "@/i18n/I18nProvider";

export function Faq() {
  const { data: apiFaqs } = useApi<any[]>("/api/public/faqs");
  const { t } = useI18n();
  const faqs = apiFaqs && apiFaqs.length > 0
    ? apiFaqs.map((f: any) => ({ question: f.question, answer: f.answer }))
    : fallbackFaqs;
  return (
    <section className="relative py-20 sm:py-28 bg-background">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-ocean-50 border border-ocean-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-ocean-700">
            {t.faq.badge}
          </span>
          <h2 className="mt-4 font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
            {t.faq.title}
          </h2>
          <p className="mt-4 text-base sm:text-lg text-muted-foreground leading-relaxed">
            {t.faq.subtitle}
          </p>
        </div>

        <Accordion type="single" collapsible className="mt-10 space-y-3">
          {faqs.map((faq, i) => (
            <AccordionItem
              key={i}
              value={`item-${i}`}
              className="rounded-xl border border-border bg-card px-5 shadow-sm data-[state=open]:shadow-md transition-shadow"
            >
              <AccordionTrigger className="text-left font-semibold text-foreground hover:no-underline py-5 text-base">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed text-sm sm:text-base pb-5">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}

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
    <section className="relative py-20 text-foam sm:py-28">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <span className="oi-eyebrow justify-center">{t.faq.badge}</span>
          <h2 className="oi-section-title mt-4">{t.faq.title}</h2>
          <p className="oi-lead mx-auto mt-4 max-w-2xl">{t.faq.subtitle}</p>
        </div>

        <Accordion type="single" collapsible className="mt-10 space-y-3">
          {faqs.map((faq, i) => (
            <AccordionItem
              key={i}
              value={`item-${i}`}
              className="oi-glass rounded-xl border-white/10 px-5 transition-colors data-[state=open]:border-amber-light/30"
            >
              <AccordionTrigger className="py-5 text-left text-base font-semibold text-foam hover:no-underline">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="pb-5 text-sm leading-relaxed text-slate-300 sm:text-base">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}

"use client";

import { Star, Quote } from "lucide-react";
import { testimonials as fallbackTestimonials } from "@/lib/site-data";
import { useApi } from "@/hooks/use-api";
import { useI18n } from "@/i18n/I18nProvider";

export function Testimonials() {
  const { data: apiTestimonials } = useApi<any[]>("/api/public/testimonials");
  const { t } = useI18n();
  const testimonials = apiTestimonials && apiTestimonials.length > 0
    ? apiTestimonials.map((t: any) => ({
        name: t.name,
        role: t.role,
        location: t.location,
        rating: t.rating,
        quote: t.quote,
      }))
    : fallbackTestimonials;
  return (
    <section className="relative py-20 text-foam sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Encabezado */}
        <div className="mx-auto max-w-3xl text-center">
          <span className="oi-eyebrow justify-center">{t.testimonials.badge}</span>
          <h2 className="oi-section-title mt-4">{t.testimonials.title}</h2>
          <p className="oi-lead mx-auto mt-4 max-w-2xl">{t.testimonials.subtitle}</p>
        </div>

        {/* Grid */}
        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          {testimonials.map((t) => (
            <figure
              key={t.name}
              className="oi-glass relative flex flex-col rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:border-amber-light/40 sm:p-7"
              data-hover
            >
              <Quote className="absolute right-5 top-5 h-8 w-8 text-teal-light/20" />

              {/* Estrellas */}
              <div className="flex items-center gap-0.5">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-amber-light text-amber-light" />
                ))}
              </div>

              <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-foam/85 sm:text-base">
                &ldquo;{t.quote}&rdquo;
              </blockquote>

              <figcaption className="mt-6 flex items-center gap-3 border-t border-white/10 pt-5">
                <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-teal-light to-teal-deep font-display font-bold text-abyss">
                  {t.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                </span>
                <div>
                  <p className="font-semibold leading-tight text-foam">{t.name}</p>
                  <p className="mt-0.5 text-xs text-slate-400">
                    {t.role} · {t.location}
                  </p>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

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
    <section className="relative py-20 sm:py-28 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Encabezado */}
        <div className="max-w-3xl mx-auto text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-amber-brand-50 border border-amber-brand-200 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-brand-700">
            {t.testimonials.badge}
          </span>
          <h2 className="mt-4 font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
            {t.testimonials.title}
          </h2>
          <p className="mt-4 text-base sm:text-lg text-muted-foreground leading-relaxed">
            {t.testimonials.subtitle}
          </p>
        </div>

        {/* Grid */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <figure
              key={t.name}
              className="relative flex flex-col rounded-2xl border border-border bg-card p-6 sm:p-7 shadow-sm hover:shadow-lg transition-shadow"
            >
              <Quote className="absolute top-5 right-5 h-8 w-8 text-ocean-100" />

              {/* Estrellas */}
              <div className="flex items-center gap-0.5">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-amber-brand-400 text-amber-brand-400" />
                ))}
              </div>

              <blockquote className="mt-4 text-sm sm:text-base text-foreground/85 leading-relaxed flex-1">
                &ldquo;{t.quote}&rdquo;
              </blockquote>

              <figcaption className="mt-6 pt-5 border-t border-border flex items-center gap-3">
                <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-ocean-500 to-ocean-700 text-white font-display font-bold">
                  {t.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                </span>
                <div>
                  <p className="font-semibold text-foreground leading-tight">{t.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
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

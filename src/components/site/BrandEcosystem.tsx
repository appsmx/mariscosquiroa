"use client";

import { Clock, Phone, MapPin, ArrowUpRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { brandEcosystem as fallbackBrands } from "@/lib/site-data";
import { useApi } from "@/hooks/use-api";
import { useI18n } from "@/i18n/I18nProvider";
import { cn } from "@/lib/utils";

const accentMap: Record<string, { gradient: string; text: string; bg: string; border: string; ring: string }> = {
  teal: {
    gradient: "from-ocean-500 to-ocean-700",
    text: "text-ocean-700",
    bg: "bg-ocean-50",
    border: "border-ocean-200",
    ring: "ring-ocean-100",
  },
  amber: {
    gradient: "from-amber-brand-500 to-amber-brand-700",
    text: "text-amber-brand-700",
    bg: "bg-amber-brand-50",
    border: "border-amber-brand-200",
    ring: "ring-amber-brand-100",
  },
};

export function BrandEcosystem() {
  const { data: apiBrands } = useApi<any[]>("/api/public/brands");
  const { t, locale } = useI18n();
  const brandEcosystem = apiBrands && apiBrands.length > 0
    ? apiBrands.map((b: any) => ({
        name: b.name,
        subtitle: b.subtitle,
        address: b.address,
        description: b.description,
        hours: b.hours,
        accent: b.accent,
        phone: b.phone,
      }))
    : fallbackBrands;
  return (
    <section id="ecosistema" className="relative py-20 sm:py-28 bg-ocean-950 text-white overflow-hidden">
      {/* Decoración */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 -left-32 h-96 w-96 rounded-full bg-ocean-500/20 blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 h-96 w-96 rounded-full bg-amber-brand-500/15 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Encabezado */}
        <div className="max-w-3xl">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-brand-200">
            {t.ecosystem.badge}
          </span>
          <h2 className="mt-4 font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white">
            {t.ecosystem.title}
          </h2>
          <p className="mt-4 text-base sm:text-lg text-white/75 leading-relaxed">
            {t.ecosystem.subtitle}
          </p>
        </div>

        {/* Tarjetas */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {brandEcosystem.map((brand) => {
            const accent = accentMap[brand.accent];
            const logoSrc = brand.name.includes("1") ? "/jona-1-logo.svg" : "/jona-2-logo.svg";
            const phoneClean = brand.phone.replace(/\s/g, "");

            return (
              <Card
                key={brand.name}
                className={cn(
                  "relative overflow-hidden border-2 bg-card text-foreground p-6 sm:p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1",
                  accent.border
                )}
              >
                {/* Logo + nombre */}
                <div className="flex items-start gap-4">
                  <div className="relative shrink-0">
                    <img
                      src={logoSrc}
                      alt={`Logo ${brand.name}`}
                      className="h-20 w-20 sm:h-24 sm:w-24 rounded-2xl shadow-lg ring-1 ring-black/5"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                        accent.bg,
                        accent.text
                      )}
                    >
                      {brand.subtitle}
                    </span>
                    <h3 className="mt-2 font-display text-2xl sm:text-3xl font-bold leading-tight">
                      {brand.name}
                    </h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {brand.address}
                    </p>
                  </div>
                </div>

                {/* Descripción */}
                <p className="mt-5 text-sm text-foreground/80 leading-relaxed">
                  {brand.description}
                </p>

                {/* Info */}
                <div className="mt-6 space-y-2.5 pt-5 border-t border-border">
                  <div className="flex items-center gap-3 text-sm">
                    <Clock className={cn("h-4 w-4 shrink-0", accent.text)} />
                    <span className="text-foreground/80">{brand.hours}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className={cn("h-4 w-4 shrink-0", accent.text)} />
                    <a
                      href={`tel:${phoneClean}`}
                      className="text-foreground/80 hover:text-foreground font-medium"
                    >
                      {brand.phone}
                    </a>
                  </div>
                  <div className="flex items-start gap-3 text-sm">
                    <MapPin className={cn("h-4 w-4 shrink-0 mt-0.5", accent.text)} />
                    <span className="text-foreground/80">{brand.address}</span>
                  </div>
                </div>

                {/* CTA */}
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(brand.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "mt-6 inline-flex items-center justify-center gap-2 w-full rounded-xl px-4 py-3 text-sm font-semibold transition-colors",
                    cn(accent.bg, accent.text, "hover:brightness-95")
                  )}
                >
                  {t.ecosystem.visit}
                  <ArrowUpRight className="h-4 w-4" />
                </a>
              </Card>
            );
          })}
        </div>

        {/* Nota */}
        <p className="mt-10 text-center text-sm text-white/65 max-w-2xl mx-auto">
          {locale === "es"
            ? "¿Quieres abastecer tu propio restaurante con nuestra calidad?"
            : "Want to supply your own restaurant with our quality?"}{" "}
          <a
            href={`https://wa.me/${brandEcosystem[0] ? "526636999689" : ""}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-amber-brand-200 hover:text-amber-brand-100 underline underline-offset-2"
          >
            {locale === "es" ? "Conversemos sobre mayoreo" : "Let's talk wholesale"}
          </a>
        </p>
      </div>
    </section>
  );
}

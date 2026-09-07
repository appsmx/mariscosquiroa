"use client";

import { Clock, Phone, MapPin, ArrowUpRight } from "lucide-react";
import { brandEcosystem as fallbackBrands } from "@/lib/site-data";
import { useApi } from "@/hooks/use-api";
import { useI18n } from "@/i18n/I18nProvider";
import { cn } from "@/lib/utils";

const accentMap: Record<string, { text: string; chipBg: string; hoverBorder: string; ctaBg: string }> = {
  teal: {
    text: "text-teal-light",
    chipBg: "bg-teal-light/15 text-teal-light",
    hoverBorder: "hover:border-teal-light/50",
    ctaBg: "bg-teal-light/15 text-teal-light hover:bg-teal-light/25",
  },
  amber: {
    text: "text-amber-light",
    chipBg: "bg-amber-light/15 text-amber-light",
    hoverBorder: "hover:border-amber-light/50",
    ctaBg: "bg-amber-light/15 text-amber-light hover:bg-amber-light/25",
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
    <section id="ecosistema" className="relative overflow-hidden py-20 text-foam sm:py-28">
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Encabezado */}
        <div className="max-w-3xl">
          <span className="oi-eyebrow">{t.ecosystem.badge}</span>
          <h2 className="oi-section-title mt-4">{t.ecosystem.title}</h2>
          <p className="oi-lead mt-4">{t.ecosystem.subtitle}</p>
        </div>

        {/* Tarjetas */}
        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:gap-8">
          {brandEcosystem.map((brand) => {
            const accent = accentMap[brand.accent] || accentMap.teal;
            const logoSrc = brand.name.includes("1") ? "/jona-1-logo.svg" : "/jona-2-logo.svg";
            const phoneClean = brand.phone.replace(/\s/g, "");

            return (
              <div
                key={brand.name}
                className={cn(
                  "oi-product-card p-6 transition-all duration-300 hover:-translate-y-1 sm:p-8",
                  accent.hoverBorder
                )}
                data-hover
              >
                <div className="relative z-[4]">
                  {/* Logo + nombre */}
                  <div className="flex items-start gap-4">
                    <div className="relative shrink-0">
                      <img
                        src={logoSrc}
                        alt={`Logo ${brand.name}`}
                        className="h-20 w-20 rounded-2xl bg-white/5 shadow-lg ring-1 ring-white/10 sm:h-24 sm:w-24"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                          accent.chipBg
                        )}
                      >
                        {brand.subtitle}
                      </span>
                      <h3 className="mt-2 font-display text-2xl font-bold leading-tight text-foam sm:text-3xl">
                        {brand.name}
                      </h3>
                      <p className="mt-1 text-xs text-slate-400">{brand.address}</p>
                    </div>
                  </div>

                  {/* Descripción */}
                  <p className="mt-5 text-sm leading-relaxed text-foam/80">{brand.description}</p>

                  {/* Info */}
                  <div className="mt-6 space-y-2.5 border-t border-white/10 pt-5">
                    <div className="flex items-center gap-3 text-sm">
                      <Clock className={cn("h-4 w-4 shrink-0", accent.text)} />
                      <span className="text-foam/80">{brand.hours}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Phone className={cn("h-4 w-4 shrink-0", accent.text)} />
                      <a href={`tel:${phoneClean}`} className="font-medium text-foam/80 hover:text-foam">
                        {brand.phone}
                      </a>
                    </div>
                    <div className="flex items-start gap-3 text-sm">
                      <MapPin className={cn("mt-0.5 h-4 w-4 shrink-0", accent.text)} />
                      <span className="text-foam/80">{brand.address}</span>
                    </div>
                  </div>

                  {/* CTA */}
                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(brand.address)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      "mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-colors",
                      accent.ctaBg
                    )}
                    data-hover
                  >
                    {t.ecosystem.visit}
                    <ArrowUpRight className="h-4 w-4" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {/* Nota */}
        <p className="mx-auto mt-10 max-w-2xl text-center text-sm text-slate-400">
          {locale === "es"
            ? "¿Quieres abastecer tu propio restaurante con nuestra calidad?"
            : "Want to supply your own restaurant with our quality?"}{" "}
          <a
            href={`https://wa.me/${brandEcosystem[0] ? "526636999689" : ""}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-amber-light underline underline-offset-2 hover:text-amber-light/80"
          >
            {locale === "es" ? "Conversemos sobre mayoreo" : "Let's talk wholesale"}
          </a>
        </p>
      </div>
    </section>
  );
}

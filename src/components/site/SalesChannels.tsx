"use client";

import { Building2, Home, Check, ArrowRight } from "lucide-react";
import { salesChannels, siteConfig as fallbackConfig } from "@/lib/site-data";
import { useSiteConfig } from "@/hooks/use-site-config";
import { useI18n } from "@/i18n/I18nProvider";
import { cn } from "@/lib/utils";

const iconMap = {
  Building2,
  Home,
};

export function SalesChannels() {
  const { data: siteConfig } = useSiteConfig();
  const { t, locale } = useI18n();
  const config = siteConfig || fallbackConfig;
  const waLink = `https://wa.me/${config.contact.whatsapp}?text=${encodeURIComponent(
    config.contact.whatsappMessage
  )}`;

  return (
    <section id="mayoreo-menudeo" className="relative py-20 text-foam sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Encabezado */}
        <div className="mx-auto max-w-3xl text-center">
          <span className="oi-eyebrow justify-center">{t.channels.badge}</span>
          <h2 className="oi-section-title mt-4">{t.channels.title}</h2>
          <p className="oi-lead mx-auto mt-4 max-w-2xl">{t.channels.subtitle}</p>
        </div>

        {/* Tarjetas */}
        <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
          {salesChannels.map((channel) => {
            const Icon = iconMap[channel.icon as keyof typeof iconMap];
            const isTeal = channel.color === "teal";
            const waLinkChannel = `https://wa.me/${config.contact.whatsapp}?text=${encodeURIComponent(
              `Hola ${config.brand.name}, me interesa el canal de ${channel.name}. ${channel.cta}.`
            )}`;

            return (
              <div
                key={channel.id}
                className={cn(
                  "oi-product-card overflow-hidden transition-all duration-300 hover:-translate-y-1",
                  isTeal ? "hover:border-teal-light/50" : "hover:border-amber-light/50"
                )}
                data-hover
              >
                {/* Header con gradiente */}
                <div
                  className={cn(
                    "relative p-6 sm:p-8",
                    isTeal
                      ? "bg-gradient-to-br from-teal to-teal-deep text-white"
                      : "bg-gradient-to-br from-amber-light to-amber-deep text-abyss"
                  )}
                >
                  <div className="absolute right-0 top-0 h-32 w-32 -translate-y-12 translate-x-12 rounded-full bg-white/15 blur-2xl" />
                  <div className="relative flex items-start justify-between gap-4">
                    <div>
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-black/15 px-3 py-1 text-xs font-semibold backdrop-blur-sm">
                        {channel.badge}
                      </span>
                      <h3 className="mt-3 font-display text-3xl font-bold sm:text-4xl">{channel.name}</h3>
                      <p className={cn("mt-1 text-sm font-medium", isTeal ? "text-white/85" : "text-abyss/80")}>
                        {channel.minimum}
                      </p>
                    </div>
                    <span className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
                      <Icon className="h-7 w-7" />
                    </span>
                  </div>
                </div>

                {/* Body */}
                <div className="relative z-[4] p-6 sm:p-8">
                  <p className="text-sm leading-relaxed text-slate-300 sm:text-base">{channel.description}</p>

                  <ul className="mt-6 space-y-3">
                    {channel.features.map((f) => (
                      <li key={f} className="flex items-start gap-3">
                        <span
                          className={cn(
                            "mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
                            isTeal ? "bg-teal-light/15" : "bg-amber-light/15"
                          )}
                        >
                          <Check className={cn("h-3.5 w-3.5", isTeal ? "text-teal-light" : "text-amber-light")} />
                        </span>
                        <span className="text-sm text-foam/90">{f}</span>
                      </li>
                    ))}
                  </ul>

                  <a
                    href={waLinkChannel}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn("mt-8", isTeal ? "oi-btn-aqua" : "oi-btn-gold w-full justify-center")}
                    data-hover
                  >
                    {channel.cta}
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {/* Nota inferior */}
        <p className="mx-auto mt-10 max-w-2xl text-center text-sm text-slate-400">
          {locale === "es"
            ? "Todos los pedidos se confirman por WhatsApp con foto del producto real antes del envío. Precios sujetos a disponibilidad y temporada — consulta vigencia"
            : "All orders are confirmed via WhatsApp with a photo of the real product before shipping. Prices subject to availability and season — check validity"}{" "}
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-teal-light underline underline-offset-2 hover:text-amber-light"
          >
            {locale === "es" ? "aquí" : "here"}
          </a>
          .
        </p>
      </div>
    </section>
  );
}

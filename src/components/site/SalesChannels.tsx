"use client";

import { Building2, Home, Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { salesChannels, siteConfig as fallbackConfig } from "@/lib/site-data";
import { useSiteConfig } from "@/hooks/use-site-config";
import { useI18n } from "@/i18n/I18nProvider";
import { cn } from "@/lib/utils";

const iconMap = {
  Building2,
  Home,
};

const colorMap: Record<string, { bg: string; border: string; text: string; accent: string; gradient: string; ring: string }> = {
  teal: {
    bg: "bg-ocean-50",
    border: "border-ocean-200",
    text: "text-ocean-700",
    accent: "text-ocean-600",
    gradient: "from-ocean-500 to-ocean-700",
    ring: "ring-ocean-200",
  },
  amber: {
    bg: "bg-amber-brand-50",
    border: "border-amber-brand-200",
    text: "text-amber-brand-700",
    accent: "text-amber-brand-600",
    gradient: "from-amber-brand-500 to-amber-brand-700",
    ring: "ring-amber-brand-200",
  },
};

export function SalesChannels() {
  const { data: siteConfig } = useSiteConfig();
  const { t, locale } = useI18n();
  const config = siteConfig || fallbackConfig;
  const waLink = `https://wa.me/${config.contact.whatsapp}?text=${encodeURIComponent(
    config.contact.whatsappMessage
  )}`;

  return (
    <section id="mayoreo-menudeo" className="relative py-20 sm:py-28 bg-gradient-to-b from-muted/40 via-background to-muted/40 wave-pattern">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Encabezado */}
        <div className="max-w-3xl mx-auto text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-amber-brand-50 border border-amber-brand-200 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-brand-700">
            {t.channels.badge}
          </span>
          <h2 className="mt-4 font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
            {t.channels.title}
          </h2>
          <p className="mt-4 text-base sm:text-lg text-muted-foreground leading-relaxed">
            {t.channels.subtitle}
          </p>
        </div>

        {/* Tarjetas */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {salesChannels.map((channel) => {
            const Icon = iconMap[channel.icon as keyof typeof iconMap];
            const colors = colorMap[channel.color];
            const waLinkChannel = `https://wa.me/${config.contact.whatsapp}?text=${encodeURIComponent(
              `Hola ${config.brand.name}, me interesa el canal de ${channel.name}. ${channel.cta}.`
            )}`;

            return (
              <Card
                key={channel.id}
                className={cn(
                  "relative overflow-hidden border-2 bg-card shadow-lg hover:shadow-xl transition-shadow",
                  colors.border
                )}
              >
                {/* Header con gradiente */}
                <div className={cn("relative bg-gradient-to-br p-6 sm:p-8 text-white", colors.gradient)}>
                  <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/10 blur-2xl -translate-y-12 translate-x-12" />
                  <div className="relative flex items-start justify-between gap-4">
                    <div>
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 backdrop-blur-sm px-3 py-1 text-xs font-semibold">
                        {channel.badge}
                      </span>
                      <h3 className="mt-3 font-display text-3xl sm:text-4xl font-bold">
                        {channel.name}
                      </h3>
                      <p className="mt-1 text-sm text-white/85 font-medium">{channel.minimum}</p>
                    </div>
                    <span className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
                      <Icon className="h-7 w-7" />
                    </span>
                  </div>
                </div>

                {/* Body */}
                <div className="p-6 sm:p-8">
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                    {channel.description}
                  </p>

                  <ul className="mt-6 space-y-3">
                    {channel.features.map((f) => (
                      <li key={f} className="flex items-start gap-3">
                        <span className={cn("inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full mt-0.5", colors.bg)}>
                          <Check className={cn("h-3.5 w-3.5", colors.accent)} />
                        </span>
                        <span className="text-sm text-foreground/90">{f}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    asChild
                    size="lg"
                    className={cn(
                      "mt-8 w-full text-white shadow-md",
                      channel.color === "teal"
                        ? "bg-ocean-600 hover:bg-ocean-700"
                        : "bg-amber-brand-500 hover:bg-amber-brand-600"
                    )}
                  >
                    <a href={waLinkChannel} target="_blank" rel="noopener noreferrer">
                      {channel.cta}
                      <ArrowRight className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Nota inferior */}
        <p className="mt-10 text-center text-sm text-muted-foreground max-w-2xl mx-auto">
          {locale === "es"
            ? "Todos los pedidos se confirman por WhatsApp con foto del producto real antes del envío. Precios sujetos a disponibilidad y temporada — consulta vigencia"
            : "All orders are confirmed via WhatsApp with a photo of the real product before shipping. Prices subject to availability and season — check validity"}{" "}
          <a href={waLink} target="_blank" rel="noopener noreferrer" className="font-semibold text-ocean-700 hover:text-ocean-800 underline underline-offset-2">
            {locale === "es" ? "aquí" : "here"}
          </a>.
        </p>
      </div>
    </section>
  );
}

"use client";

import { ArrowRight, MessageCircle, Fish } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSiteConfig } from "@/hooks/use-site-config";
import { useI18n } from "@/i18n/I18nProvider";

export function Hero() {
  const { data: siteConfig } = useSiteConfig();
  const { t } = useI18n();
  if (!siteConfig) return null;

  const waLink = `https://wa.me/${siteConfig.contact.whatsapp}?text=${encodeURIComponent(
    siteConfig.contact.whatsappMessage
  )}`;

  // Mapeo de etiquetas de stats por orden (los stats vienen del backend en español)
  const statLabels = [
    t.hero.stat1Label,
    t.hero.stat2Label,
    t.hero.stat3Label,
    t.hero.stat4Label,
  ];

  return (
    <section id="inicio" className="relative min-h-[100svh] flex items-center overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0 z-0">
        <img
          src={siteConfig.images.hero}
          alt="Atardecer en el puerto de Rosarito"
          className="h-full w-full object-cover"
          fetchPriority="high"
        />
        {/* Overlays para legibilidad */}
        <div className="absolute inset-0 bg-gradient-to-b from-ocean-950/70 via-ocean-900/55 to-ocean-950/85" />
        <div className="absolute inset-0 bg-gradient-to-r from-ocean-950/70 via-transparent to-transparent" />
      </div>

      {/* Decorative shapes */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-amber-brand-400/20 blur-3xl animate-float-slow" />
        <div className="absolute bottom-0 -left-32 h-96 w-96 rounded-full bg-ocean-400/25 blur-3xl" />
      </div>

      {/* Contenido */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-28 pb-20 sm:pt-32 sm:pb-24">
        <div className="max-w-3xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 px-4 py-1.5 text-xs sm:text-sm font-medium text-white mb-6 animate-fade-up">
            <span className="inline-flex h-2 w-2 rounded-full bg-amber-brand-400 animate-pulse" />
            {t.hero.badge}
          </div>

          {/* Título */}
          <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.05] animate-fade-up [animation-delay:0.1s]">
            Mariscos Quiroa
          </h1>
          <p className="mt-4 font-display text-xl sm:text-2xl lg:text-3xl font-medium text-amber-brand-200 italic animate-fade-up [animation-delay:0.2s]">
            {t.hero.tagline}
          </p>

          {/* Subtítulo */}
          <p className="mt-6 text-base sm:text-lg text-white/85 leading-relaxed max-w-2xl animate-fade-up [animation-delay:0.3s]">
            {siteConfig.brand.slogan}
          </p>

          {/* CTAs */}
          <div className="mt-8 flex flex-col sm:flex-row gap-3 animate-fade-up [animation-delay:0.4s]">
            <Button
              asChild
              size="lg"
              className="bg-amber-brand-500 hover:bg-amber-brand-600 text-white shadow-xl shadow-amber-brand-900/30 text-base h-12 px-6"
            >
              <a href={waLink} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="h-5 w-5" />
                {t.hero.ctaSecondary}
              </a>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="bg-white/10 backdrop-blur-md border-white/30 text-white hover:bg-white/20 hover:text-white hover:border-white/50 text-base h-12 px-6"
            >
              <a href="#productos">
                {t.hero.ctaPrimary}
                <ArrowRight className="h-5 w-5" />
              </a>
            </Button>
          </div>

          {/* Stats */}
          <dl className="mt-12 sm:mt-16 grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-5 max-w-2xl animate-fade-up [animation-delay:0.5s]">
            {siteConfig.stats.map((s, idx) => (
              <div key={s.label} className="border-l-2 border-amber-brand-400/60 pl-4">
                <dt className="font-display text-3xl sm:text-4xl font-bold text-white leading-none">
                  {s.value}
                </dt>
                <dd className="mt-1.5 text-xs sm:text-sm text-white/70 leading-tight">
                  {statLabels[idx] || s.label}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {/* Indicador scroll */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 hidden sm:flex flex-col items-center gap-2 text-white/60">
        <Fish className="h-5 w-5" />
        <div className="h-10 w-px bg-gradient-to-b from-white/60 to-transparent" />
      </div>
    </section>
  );
}

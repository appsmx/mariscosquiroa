"use client";

import { Compass, MessageCircle, Snowflake, Fish, Zap, Clock, Award, BadgeCheck, Truck } from "lucide-react";
import { useSiteConfig } from "@/hooks/use-site-config";
import { useI18n } from "@/i18n/I18nProvider";

// Iconos para las tarjetas de stats (por orden). Si hay más stats que iconos,
// se reutiliza el último.
const STAT_ICONS = [Award, BadgeCheck, Truck, Fish];

export function Hero() {
  const { data: siteConfig } = useSiteConfig();
  const { t } = useI18n();
  if (!siteConfig) return null;

  const waLink = `https://wa.me/${siteConfig.contact.whatsapp}?text=${encodeURIComponent(
    siteConfig.contact.whatsappMessage
  )}`;

  const statLabels = [
    t.hero.stat1Label,
    t.hero.stat2Label,
    t.hero.stat3Label,
    t.hero.stat4Label,
  ];

  return (
    <section
      id="inicio"
      className="relative flex min-h-[100svh] items-center justify-center overflow-hidden px-5 pb-20 pt-32 text-foam"
    >
      {/* Orbes difusos (el fondo de olas lo pinta OceanCanvas detrás de todo) */}
      <div className="oi-orb oi-orb-a" aria-hidden="true" />
      <div className="oi-orb oi-orb-b" aria-hidden="true" />
      <div className="oi-orb oi-orb-c" aria-hidden="true" />

      {/* Chips flotantes (solo desktop) — datos reales del negocio */}
      <div className="pointer-events-none absolute left-[6%] top-[23%] hidden lg:block">
        <span className="oi-fchip" style={{ animationDelay: ".4s" }}>
          <Snowflake className="h-[15px] w-[15px]" /> Cadena de frío −18 °C
        </span>
      </div>
      <div className="pointer-events-none absolute right-[7%] top-[21%] hidden lg:block">
        <span className="oi-fchip" style={{ animationDelay: "1.3s" }}>
          <Fish className="h-[15px] w-[15px]" /> Captura del día · Rosarito
        </span>
      </div>
      <div className="pointer-events-none absolute bottom-[31%] left-[9%] hidden lg:block">
        <span className="oi-fchip" style={{ animationDelay: "2.1s" }}>
          <Zap className="oi-gold h-[15px] w-[15px]" /> LOGAN IA · en línea
        </span>
      </div>
      <div className="pointer-events-none absolute bottom-[36%] right-[11%] hidden lg:block">
        <span className="oi-fchip" style={{ animationDelay: ".9s" }}>
          <Clock className="h-[15px] w-[15px]" /> Entrega el mismo día
        </span>
      </div>

      {/* Contenido */}
      <div className="relative z-10 flex max-w-4xl flex-col items-center text-center">
        {/* Badge en vivo */}
        <div className="oi-glass-pill animate-fade-up">
          <span className="oi-live-dot" />
          <span>{t.hero.badge}</span>
          <span className="hidden h-[3px] w-[3px] rounded-full bg-white/30 sm:inline-block" />
          <span className="text-[#fde68a]">Rosarito · Baja California</span>
        </div>

        {/* Título con palabras acento */}
        <h1 className="font-display mt-6 text-[clamp(2.55rem,7vw,5.3rem)] font-extrabold leading-[1.05] tracking-tight text-white">
          <span className="oi-line-mask animate-fade-up [animation-delay:0.1s]">
            <span className="block">
              Del <em className="oi-accent">Océano</em> de Baja California
            </span>
          </span>
          <span className="oi-line-mask animate-fade-up [animation-delay:0.2s]">
            <span className="block">
              a tu <em className="oi-accent gold">Mesa</em>
            </span>
          </span>
        </h1>

        {/* Subtítulo — slogan real del negocio */}
        <p className="mt-6 max-w-2xl text-base leading-relaxed text-[#a9bacd] animate-fade-up [animation-delay:0.3s] sm:text-lg">
          {siteConfig.brand.slogan}
        </p>

        {/* CTAs — WhatsApp real + ancla al catálogo */}
        <div className="mt-9 flex flex-wrap justify-center gap-4 animate-fade-up [animation-delay:0.4s]">
          <a href="#productos" className="oi-btn-gold">
            <Compass className="h-[18px] w-[18px]" />
            {t.hero.ctaPrimary}
          </a>
          <a href={waLink} target="_blank" rel="noopener noreferrer" className="oi-btn-glass">
            <MessageCircle className="h-[18px] w-[18px]" />
            {t.hero.ctaSecondary}
          </a>
        </div>

        {/* Nota de confianza */}
        <p className="mt-5 text-[.7rem] uppercase tracking-[0.16em] text-slate-500 animate-fade-up [animation-delay:0.45s]">
          Cadena de frío −18 °C &nbsp;·&nbsp; Entregas diarias en BC &nbsp;·&nbsp; Atención con LOGAN IA
        </p>

        {/* Stats reales desde la BD, con tarjetas de vidrio */}
        <div className="mt-12 grid w-full max-w-3xl grid-cols-1 gap-4 sm:grid-cols-3 animate-fade-up [animation-delay:0.5s]">
          {siteConfig.stats.slice(0, 3).map((s, idx) => {
            const Icon = STAT_ICONS[idx] || STAT_ICONS[STAT_ICONS.length - 1];
            return (
              <div key={s.label} className="oi-stat">
                <span className="oi-stat-ico">
                  <Icon className="h-[22px] w-[22px]" />
                </span>
                <span>
                  <span className="oi-stat-num block">{s.value}</span>
                  <span className="oi-stat-label block">{statLabels[idx] || s.label}</span>
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Indicador de scroll */}
      <div className="absolute bottom-7 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2 text-[.66rem] uppercase tracking-[0.28em] text-[#7c8ea3]">
        <span className="oi-mouse"><span className="oi-wheel" /></span>
        <span>Desliza para sumergirte</span>
      </div>
    </section>
  );
}

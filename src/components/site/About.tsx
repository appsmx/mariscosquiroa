"use client";

import { Award, Anchor, Users, MapPin } from "lucide-react";
import { siteConfig as fallbackConfig } from "@/lib/site-data";
import { useSiteConfig } from "@/hooks/use-site-config";
import { useI18n } from "@/i18n/I18nProvider";

const timeline = [
  {
    year: "2008",
    title: "El primer puesto",
    description:
      "Don Jonathan abrió un modesto mostrador en el mercado de abastos de Rosarito, vendiendo el producto que él mismo seleccionaba cada madrugada en el puerto.",
  },
  {
    year: "2013",
    title: "Primer restaurante",
    description:
      "La demanda creció hasta abrir Marisco Preparado Quiroa, donde los clientes podían probar los mariscos cocinados al momento. La distribuidora se quedó como corazón del negocio.",
  },
  {
    year: "2019",
    title: "Expansión a mayoreo",
    description:
      "Sumamos clientes en Tijuana, Ensenada y Mexicali. Implementamos cadena de frío con monitoreo de temperatura y línea de crédito para restaurantes recurrentes.",
  },
  {
    year: "2024",
    title: "Marisquería Quiroa y digitalización",
    description:
      "Abrimos Marisquería Quiroa frente al malecón y lanzamos nuestra plataforma digital para que cualquier cliente pueda cotizar y pedir por WhatsApp en minutos.",
  },
];

export function About() {
  const { data: siteConfig } = useSiteConfig();
  const { t, locale } = useI18n();
  const config = siteConfig || fallbackConfig;
  return (
    <section id="nosotros" className="relative py-20 sm:py-28 bg-background overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Imagen */}
          <div className="relative order-2 lg:order-1">
            <div className="relative aspect-[4/5] sm:aspect-[5/6] rounded-3xl overflow-hidden shadow-2xl">
              <img
                src={config.images.story}
                alt="Puerto pesquero de Rosarito al atardecer"
                className="h-full w-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ocean-950/60 via-transparent to-transparent" />
            </div>

            {/* Card flotante */}
            <div className="absolute -bottom-6 -right-2 sm:right-6 max-w-[260px] rounded-2xl bg-card border border-border shadow-xl p-5">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-amber-brand-100 text-amber-brand-700">
                  <Award className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-display text-2xl font-bold text-foreground">
                    +{config.brand.trajectoryYears} {locale === "es" ? "años" : "years"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {locale === "es" ? "de trayectoria" : "in business"}
                  </p>
                </div>
              </div>
              <p className="mt-3 text-xs text-muted-foreground leading-relaxed">
                {locale === "es"
                  ? `Abasteciendo a la región desde ${config.brand.foundedYear}.`
                  : `Supplying the region since ${config.brand.foundedYear}.`}
              </p>
            </div>

            {/* Decoración */}
            <div className="absolute -top-6 -left-6 -z-10 h-40 w-40 rounded-full bg-ocean-100 blur-2xl" />
          </div>

          {/* Contenido */}
          <div className="order-1 lg:order-2">
            <span className="inline-flex items-center gap-2 rounded-full bg-ocean-50 border border-ocean-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-ocean-700">
              {t.about.badge}
            </span>
            <h2 className="mt-4 font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
              {t.about.title}
            </h2>
            <p className="mt-5 text-base sm:text-lg text-muted-foreground leading-relaxed">
              {config.brand.description}
            </p>

            {/* Mini stats */}
            <div className="mt-8 grid grid-cols-3 gap-4">
              <div className="rounded-xl border border-border bg-card p-4">
                <Users className="h-5 w-5 text-ocean-600" />
                <p className="mt-2 font-display text-2xl font-bold text-foreground">+800</p>
                <p className="text-xs text-muted-foreground">{locale === "es" ? "Clientes activos" : "Active customers"}</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-4">
                <Anchor className="h-5 w-5 text-ocean-600" />
                <p className="mt-2 font-display text-2xl font-bold text-foreground">12</p>
                <p className="text-xs text-muted-foreground">{locale === "es" ? "Cooperativas aliadas" : "Partner cooperatives"}</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-4">
                <MapPin className="h-5 w-5 text-ocean-600" />
                <p className="mt-2 font-display text-2xl font-bold text-foreground">5</p>
                <p className="text-xs text-muted-foreground">{locale === "es" ? "Ciudades servidas" : "Cities served"}</p>
              </div>
            </div>

            {/* Línea de tiempo */}
            <div className="mt-10 space-y-5">
              {timeline.map((item) => (
                <div key={item.year} className="relative pl-6 border-l-2 border-ocean-200">
                  <span className="absolute -left-[7px] top-1 h-3 w-3 rounded-full bg-amber-brand-500 ring-4 ring-amber-brand-100" />
                  <div className="flex items-baseline gap-3">
                    <span className="font-display text-lg font-bold text-ocean-700">{item.year}</span>
                    <h4 className="font-semibold text-foreground">{item.title}</h4>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

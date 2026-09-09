"use client";

import Image from "next/image";
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
    <section id="nosotros" className="relative overflow-hidden py-20 text-foam sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">
          {/* Imagen */}
          <div className="relative order-2 lg:order-1">
            <div className="relative aspect-[4/5] overflow-hidden rounded-3xl shadow-2xl sm:aspect-[5/6]">
              <Image
                src={config.images.story || "/placeholder-producto.svg"}
                alt="Puerto pesquero de Rosarito al atardecer"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-abyss/70 via-transparent to-transparent" />
            </div>

            {/* Card flotante */}
            <div className="oi-glass absolute -bottom-6 -right-2 max-w-[260px] rounded-2xl p-5 shadow-xl sm:right-6">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-amber-light/15 text-amber-light">
                  <Award className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-display text-2xl font-bold text-foam">
                    +{config.brand.trajectoryYears} {locale === "es" ? "años" : "years"}
                  </p>
                  <p className="text-xs text-slate-400">
                    {locale === "es" ? "de trayectoria" : "in business"}
                  </p>
                </div>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-slate-400">
                {locale === "es"
                  ? `Abasteciendo a la región desde ${config.brand.foundedYear}.`
                  : `Supplying the region since ${config.brand.foundedYear}.`}
              </p>
            </div>

            {/* Decoración */}
            <div className="absolute -left-6 -top-6 -z-10 h-40 w-40 rounded-full bg-teal/20 blur-2xl" />
          </div>

          {/* Contenido */}
          <div className="order-1 lg:order-2">
            <span className="oi-eyebrow">{t.about.badge}</span>
            <h2 className="oi-section-title mt-4">{t.about.title}</h2>
            <p className="oi-lead mt-5">{config.brand.description}</p>

            {/* Mini stats */}
            <div className="mt-8 grid grid-cols-3 gap-4">
              <div className="oi-glass rounded-xl p-4">
                <Users className="h-5 w-5 text-teal-light" />
                <p className="mt-2 font-display text-2xl font-bold text-foam">+800</p>
                <p className="text-xs text-slate-400">{locale === "es" ? "Clientes activos" : "Active customers"}</p>
              </div>
              <div className="oi-glass rounded-xl p-4">
                <Anchor className="h-5 w-5 text-teal-light" />
                <p className="mt-2 font-display text-2xl font-bold text-foam">12</p>
                <p className="text-xs text-slate-400">{locale === "es" ? "Cooperativas aliadas" : "Partner cooperatives"}</p>
              </div>
              <div className="oi-glass rounded-xl p-4">
                <MapPin className="h-5 w-5 text-teal-light" />
                <p className="mt-2 font-display text-2xl font-bold text-foam">5</p>
                <p className="text-xs text-slate-400">{locale === "es" ? "Ciudades servidas" : "Cities served"}</p>
              </div>
            </div>

            {/* Línea de tiempo */}
            <div className="mt-10 space-y-5">
              {timeline.map((item) => (
                <div key={item.year} className="relative border-l-2 border-teal/40 pl-6">
                  <span className="absolute -left-[7px] top-1 h-3 w-3 rounded-full bg-amber-light ring-4 ring-amber-light/20" />
                  <div className="flex items-baseline gap-3">
                    <span className="font-display text-lg font-bold text-teal-light">{item.year}</span>
                    <h4 className="font-semibold text-foam">{item.title}</h4>
                  </div>
                  <p className="mt-1 text-sm leading-relaxed text-slate-400">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

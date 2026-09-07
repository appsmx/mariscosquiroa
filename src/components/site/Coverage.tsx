"use client";

import { MapPin, Truck, Clock, Package } from "lucide-react";
import { coverage as fallbackCoverage, siteConfig as fallbackConfig } from "@/lib/site-data";
import { useApi } from "@/hooks/use-api";
import { useSiteConfig } from "@/hooks/use-site-config";
import { useI18n } from "@/i18n/I18nProvider";

export function Coverage() {
  const { data: apiCoverage } = useApi<any>("/api/public/coverage");
  const { data: siteConfig } = useSiteConfig();
  const { t, locale } = useI18n();
  const config = siteConfig || fallbackConfig;
  const coverageData = apiCoverage || fallbackCoverage;
  return (
    <section id="cobertura" className="relative py-20 text-foam sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">
          {/* Texto */}
          <div>
            <span className="oi-eyebrow">{t.coverage.badge}</span>
            <h2 className="oi-section-title mt-4">{t.coverage.title}</h2>
            <p className="oi-lead mt-5">
              {coverageData.deliverySchedule} {t.coverage.body}
            </p>

            <div className="mt-8 space-y-4">
              <div className="flex items-start gap-3">
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-light/15 text-teal-light">
                  <MapPin className="h-5 w-5" />
                </span>
                <div>
                  <h4 className="font-semibold text-foam">{t.coverage.primaryTitle}</h4>
                  <p className="mt-1 text-sm text-slate-400">{coverageData.primary.join(" · ")}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-light/15 text-amber-light">
                  <Truck className="h-5 w-5" />
                </span>
                <div>
                  <h4 className="font-semibold text-foam">{t.coverage.extendedTitle}</h4>
                  <p className="mt-1 text-sm text-slate-400">{coverageData.extended.join(" · ")}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-400/15 text-emerald-300">
                  <Clock className="h-5 w-5" />
                </span>
                <div>
                  <h4 className="font-semibold text-foam">{t.coverage.scheduleTitle}</h4>
                  <p className="mt-1 text-sm text-slate-400">{t.coverage.scheduleDesc}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Mapa decorativo (tema oscuro) */}
          <div className="relative">
            <div className="oi-glass-deep relative overflow-hidden rounded-3xl shadow-xl">
              <div className="relative aspect-[4/3] bg-gradient-to-br from-teal-deep/40 via-abyss/40 to-abyss/60">
                {/* Mapa simplificado */}
                <svg viewBox="0 0 400 300" className="absolute inset-0 h-full w-full">
                  <defs>
                    <linearGradient id="mapGrad" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#2dd4bf" stopOpacity="0.18" />
                      <stop offset="100%" stopColor="#0c4a6e" stopOpacity="0.28" />
                    </linearGradient>
                  </defs>
                  <rect width="400" height="300" fill="url(#mapGrad)" />
                  {/* Costa estilizada */}
                  <path
                    d="M0 180 Q80 160 140 175 T280 165 T400 180 L400 300 L0 300 Z"
                    fill="#2dd4bf"
                    opacity="0.15"
                  />
                  <path
                    d="M0 180 Q80 160 140 175 T280 165 T400 180"
                    fill="none"
                    stroke="#5eead4"
                    strokeWidth="2"
                    opacity="0.6"
                  />
                  {/* Marcadores de ciudad */}
                  {[
                    { x: 80, y: 180, label: "Tijuana" },
                    { x: 120, y: 210, label: "Rosarito" },
                    { x: 180, y: 160, label: "Tecate" },
                    { x: 240, y: 220, label: "Ensenada" },
                    { x: 320, y: 250, label: "San Quintín" },
                  ].map((c) => (
                    <g key={c.label}>
                      <circle cx={c.x} cy={c.y} r="6" fill="#fbbf24" />
                      <circle cx={c.x} cy={c.y} r="12" fill="#fbbf24" opacity="0.3" />
                      <text x={c.x} y={c.y - 12} textAnchor="middle" fontSize="10" fontWeight="600" fill="#eef8f7">
                        {c.label}
                      </text>
                    </g>
                  ))}
                  {/* Línea de conexión */}
                  <path
                    d="M80 180 L120 210 L180 160 L240 220 L320 250"
                    fill="none"
                    stroke="#fbbf24"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                    opacity="0.7"
                  />
                </svg>

                {/* Badge flotante */}
                <div className="oi-glass absolute left-4 top-4 rounded-lg px-3 py-2 shadow-md">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-amber-light" />
                    <span className="text-xs font-semibold text-foam">
                      {locale === "es" ? "Cobertura Baja California" : "Baja California coverage"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="border-t border-white/10 p-5">
                <p className="text-sm text-slate-400">
                  {locale === "es" ? "¿Tu ciudad no está en la lista?" : "Your city not on the list?"}{" "}
                  <a
                    href={`https://wa.me/${config.contact.whatsapp}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-teal-light underline underline-offset-2 hover:text-amber-light"
                  >
                    {locale === "es" ? "Consultanos" : "Contact us"}
                  </a>
                  {locale === "es"
                    ? ", hacemos envíos foráneos por paquetería refrigerada a todo México."
                    : ", we ship nationwide via refrigerated parcel."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

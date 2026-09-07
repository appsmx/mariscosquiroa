"use client";

import { Waves, ShieldCheck, Truck, Handshake } from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";

const iconMap = {
  Waves,
  ShieldCheck,
  Truck,
  Handshake,
};

export function Differentiators() {
  const { t } = useI18n();
  const items = t.differentiators.items;

  return (
    <section className="relative overflow-hidden py-16 text-foam sm:py-20">
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center sm:mb-14">
          <h2 className="oi-section-title">{t.differentiators.title}</h2>
          <p className="oi-lead mx-auto mt-4 max-w-2xl">{t.differentiators.subtitle}</p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8 lg:grid-cols-4">
          {items.map((d, idx) => {
            const icons = [Waves, ShieldCheck, Truck, Handshake];
            const Icon = icons[idx] || Waves;
            return (
              <div
                key={d.title}
                className="oi-glass group relative rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:border-amber-light/40"
                data-hover
              >
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-teal-light to-teal-deep shadow-lg shadow-black/40 transition-transform group-hover:scale-110">
                  <Icon className="h-6 w-6 text-abyss" />
                </span>
                <h3 className="mt-4 font-display text-lg font-bold text-foam">{d.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-300">{d.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

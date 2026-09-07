"use client";

import { MapPin, Phone, Mail, Clock, MessageCircle, Navigation } from "lucide-react";
import { siteConfig as fallbackConfig } from "@/lib/site-data";
import { useSiteConfig } from "@/hooks/use-site-config";
import { useI18n } from "@/i18n/I18nProvider";

export function Location() {
  const { data: siteConfig } = useSiteConfig();
  const { t, locale } = useI18n();
  if (!siteConfig) return null;
  const waLink = `https://wa.me/${siteConfig.contact.whatsapp}?text=${encodeURIComponent(
    siteConfig.contact.whatsappMessage
  )}`;
  const { contact } = siteConfig;
  const mapQuery = encodeURIComponent(
    `${contact.address.street}, ${contact.address.city}, ${contact.address.state}, ${contact.address.zip}, México`
  );

  const dayLabel = (day: string): string => {
    switch (day) {
      case "Lunes": return t.location.days.monday;
      case "Martes": return t.location.days.tuesday;
      case "Miércoles": return t.location.days.wednesday;
      case "Jueves": return t.location.days.thursday;
      case "Viernes": return t.location.days.friday;
      case "Sábado": return t.location.days.saturday;
      case "Domingo": return t.location.days.sunday;
      default: return day;
    }
  };

  const timeLabel = (time: string): string =>
    time === "Cerrado" ? t.location.closed : time;

  return (
    <section id="ubicacion" className="relative py-20 text-foam sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-stretch gap-10 lg:grid-cols-2 lg:gap-12">
          {/* Información de contacto */}
          <div className="flex flex-col justify-center">
            <span className="oi-eyebrow w-fit">{t.location.badge}</span>
            <h2 className="oi-section-title mt-4">{t.location.title}</h2>
            <p className="oi-lead mt-4">
              {locale === "es"
                ? "Pasa a comprar directo al mostrador, llámanos por teléfono o escríbenos por WhatsApp. La atención es personalizada y siempre vas a hablar con alguien del equipo, nunca con un menú automático."
                : "Stop by the counter to buy directly, call us by phone or message us on WhatsApp. Attention is personalized and you always talk to someone from the team, never an automated menu."}
            </p>

            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="oi-glass rounded-xl p-5">
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-teal-light/15 text-teal-light">
                    <MapPin className="h-5 w-5" />
                  </span>
                  <h3 className="font-semibold text-foam">{t.location.addressLabel}</h3>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-slate-400">
                  {contact.address.street}
                  <br />
                  {contact.address.city}, {contact.address.state}
                  <br />
                  C.P. {contact.address.zip}, {contact.address.country}
                </p>
                <a
                  href={`https://maps.google.com/?q=${mapQuery}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-teal-light hover:text-amber-light"
                >
                  <Navigation className="h-3.5 w-3.5" />
                  {t.location.getDirections}
                </a>
              </div>

              <div className="oi-glass rounded-xl p-5">
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-amber-light/15 text-amber-light">
                    <Clock className="h-5 w-5" />
                  </span>
                  <h3 className="font-semibold text-foam">{t.location.hoursLabel}</h3>
                </div>
                <ul className="mt-3 space-y-1.5">
                  {contact.hours.map((h) => (
                    <li key={h.day} className="text-sm text-slate-400">
                      <span className="font-medium text-foam/80">{dayLabel(h.day)}:</span>{" "}
                      {timeLabel(h.time)}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="oi-glass rounded-xl p-5">
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-teal-light/15 text-teal-light">
                    <Phone className="h-5 w-5" />
                  </span>
                  <h3 className="font-semibold text-foam">{t.location.phoneLabel}</h3>
                </div>
                <a
                  href={`tel:${contact.phone}`}
                  className="mt-3 block text-sm font-medium text-teal-light hover:text-amber-light"
                >
                  {contact.phoneDisplay}
                </a>
              </div>

              <div className="oi-glass rounded-xl p-5">
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-amber-light/15 text-amber-light">
                    <Mail className="h-5 w-5" />
                  </span>
                  <h3 className="font-semibold text-foam">{t.location.emailLabel}</h3>
                </div>
                <a
                  href={`mailto:${contact.email}`}
                  className="mt-3 block break-all text-sm font-medium text-teal-light hover:text-amber-light"
                >
                  {contact.email}
                </a>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <a href={waLink} target="_blank" rel="noopener noreferrer" className="oi-btn-gold justify-center">
                <MessageCircle className="h-5 w-5" />
                {locale === "es" ? "Escribir por WhatsApp" : "Message on WhatsApp"}
              </a>
              <a href={`tel:${contact.phone}`} className="oi-btn-glass justify-center">
                <Phone className="h-5 w-5" />
                {locale === "es" ? "Llamar ahora" : "Call now"}
              </a>
            </div>
          </div>

          {/* Mapa */}
          <div className="relative min-h-[400px] overflow-hidden rounded-3xl border border-white/10 shadow-xl lg:min-h-full">
            <iframe
              title="Ubicación de Mariscos Quiroa"
              src={`https://www.openstreetmap.org/export/embed.html?bbox=-117.10%2C32.25%2C-116.95%2C32.32&layer=mapnik&marker=32.284%2C-117.032`}
              className="absolute inset-0 h-full w-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
            <div className="oi-glass-deep absolute bottom-4 left-4 right-4 flex items-center gap-3 rounded-xl p-4 shadow-lg">
              <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-teal-light to-teal-deep text-abyss">
                <MapPin className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold leading-tight text-foam">
                  {locale === "es"
                    ? "Mariscos Quiroa — Mostrador & Distribuidora"
                    : "Mariscos Quiroa — Counter & Distribution"}
                </p>
                <p className="mt-0.5 truncate text-xs text-slate-400">
                  {contact.address.street}, {contact.address.city}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

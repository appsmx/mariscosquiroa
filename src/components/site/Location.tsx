"use client";

import { MapPin, Phone, Mail, Clock, MessageCircle, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
    <section id="ubicacion" className="relative py-20 sm:py-28 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12 items-stretch">
          {/* Información de contacto */}
          <div className="flex flex-col justify-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-amber-brand-50 border border-amber-brand-200 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-brand-700 w-fit">
              {t.location.badge}
            </span>
            <h2 className="mt-4 font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
              {t.location.title}
            </h2>
            <p className="mt-4 text-base sm:text-lg text-muted-foreground leading-relaxed">
              {locale === "es"
                ? "Pasa a comprar directo al mostrador, llámanos por teléfono o escríbenos por WhatsApp. La atención es personalizada y siempre vas a hablar con alguien del equipo, nunca con un menú automático."
                : "Stop by the counter to buy directly, call us by phone or message us on WhatsApp. Attention is personalized and you always talk to someone from the team, never an automated menu."}
            </p>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card className="p-5 border-ocean-100">
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-ocean-100 text-ocean-700">
                    <MapPin className="h-5 w-5" />
                  </span>
                  <h3 className="font-semibold text-foreground">{t.location.addressLabel}</h3>
                </div>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
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
                  className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-ocean-700 hover:text-ocean-800"
                >
                  <Navigation className="h-3.5 w-3.5" />
                  {t.location.getDirections}
                </a>
              </Card>

              <Card className="p-5 border-ocean-100">
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-amber-brand-100 text-amber-brand-700">
                    <Clock className="h-5 w-5" />
                  </span>
                  <h3 className="font-semibold text-foreground">{t.location.hoursLabel}</h3>
                </div>
                <ul className="mt-3 space-y-1.5">
                  {contact.hours.map((h) => (
                    <li key={h.day} className="text-sm text-muted-foreground">
                      <span className="font-medium text-foreground/80">{dayLabel(h.day)}:</span>{" "}
                      {timeLabel(h.time)}
                    </li>
                  ))}
                </ul>
              </Card>

              <Card className="p-5 border-ocean-100">
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-ocean-100 text-ocean-700">
                    <Phone className="h-5 w-5" />
                  </span>
                  <h3 className="font-semibold text-foreground">{t.location.phoneLabel}</h3>
                </div>
                <a
                  href={`tel:${contact.phone}`}
                  className="mt-3 block text-sm font-medium text-ocean-700 hover:text-ocean-800"
                >
                  {contact.phoneDisplay}
                </a>
              </Card>

              <Card className="p-5 border-ocean-100">
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-amber-brand-100 text-amber-brand-700">
                    <Mail className="h-5 w-5" />
                  </span>
                  <h3 className="font-semibold text-foreground">{t.location.emailLabel}</h3>
                </div>
                <a
                  href={`mailto:${contact.email}`}
                  className="mt-3 block text-sm font-medium text-ocean-700 hover:text-ocean-800 break-all"
                >
                  {contact.email}
                </a>
              </Card>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <Button asChild size="lg" className="bg-amber-brand-500 hover:bg-amber-brand-600 text-white h-12 px-6">
                <a href={waLink} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="h-5 w-5" />
                  {locale === "es" ? "Escribir por WhatsApp" : "Message on WhatsApp"}
                </a>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 px-6 border-ocean-200 text-ocean-700 hover:bg-ocean-50">
                <a href={`tel:${contact.phone}`}>
                  <Phone className="h-5 w-5" />
                  {locale === "es" ? "Llamar ahora" : "Call now"}
                </a>
              </Button>
            </div>
          </div>

          {/* Mapa */}
          <div className="relative min-h-[400px] lg:min-h-full rounded-3xl overflow-hidden shadow-xl border border-border">
            <iframe
              title="Ubicación de Mariscos Quiroa"
              src={`https://www.openstreetmap.org/export/embed.html?bbox=-117.10%2C32.25%2C-116.95%2C32.32&layer=mapnik&marker=32.284%2C-117.032`}
              className="absolute inset-0 h-full w-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
            <div className="absolute bottom-4 left-4 right-4 rounded-xl bg-card/95 backdrop-blur-md border border-border shadow-lg p-4 flex items-center gap-3">
              <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-ocean-600 text-white">
                <MapPin className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="font-semibold text-foreground text-sm leading-tight">
                  {locale === "es"
                    ? "Mariscos Quiroa — Mostrador & Distribuidora"
                    : "Mariscos Quiroa — Counter & Distribution"}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5 truncate">
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

"use client";

import Link from "next/link";
import { Phone, Mail, MapPin, Facebook, Instagram, MessageCircle } from "lucide-react";
import { useSiteConfig } from "@/hooks/use-site-config";
import { useI18n } from "@/i18n/I18nProvider";
import { LanguageSwitcher } from "@/components/site/LanguageSwitcher";
import { LoganSeal } from "@/components/site/LoganSeal";

export function Footer() {
  const { data: siteConfig } = useSiteConfig();
  const { t, locale } = useI18n();
  if (!siteConfig) return null;
  const waLink = `https://wa.me/${siteConfig.contact.whatsapp}?text=${encodeURIComponent(
    siteConfig.contact.whatsappMessage
  )}`;
  const { contact, social } = siteConfig;

  const navColumns = [
    {
      title: t.footer.colProductsTitle,
      links: [
        { label: locale === "es" ? "Camarón" : "Shrimp", href: "#productos" },
        { label: locale === "es" ? "Pulpo" : "Octopus", href: "#productos" },
        { label: locale === "es" ? "Callo de hacha" : "Scallop", href: "#productos" },
        { label: locale === "es" ? "Ostiones" : "Oysters", href: "#productos" },
        { label: locale === "es" ? "Pescados frescos" : "Fresh fish", href: "#productos" },
      ],
    },
    {
      title: t.footer.colCompanyTitle,
      links: [
        { label: t.nav.about, href: "#nosotros" },
        { label: t.nav.mayoreoMenudeo, href: "#mayoreo-menudeo" },
        { label: t.nav.coverage, href: "#cobertura" },
        { label: locale === "es" ? "Ecosistema Quiroa" : "Quiroa Ecosystem", href: "#ecosistema" },
        { label: t.nav.location, href: "#ubicacion" },
      ],
    },
  ];

  const ctaTitle = locale === "es" ? "¿Listo para llevar el mar a tu cocina?" : "Ready to bring the sea to your kitchen?";
  const ctaSubtitle = locale === "es" ? "Cotiza en segundos. Respuesta directa del equipo, sin esperas." : "Get a quote in seconds. Direct response from the team, no waiting.";
  const callLabel = locale === "es" ? "Llamar" : "Call";
  const bottomBar = locale === "es" ? "Rosarito, Baja California · México" : "Rosarito, Baja California · Mexico";
  const bottomMade = locale === "es" ? "Hecho con orgullo bajacaliforniano" : "Made with Baja California pride";

  return (
    <footer className="bg-ocean-950 text-white">
      {/* CTA superior */}
      <div className="border-b border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <h3 className="font-display text-2xl sm:text-3xl font-bold text-white">
                {ctaTitle}
              </h3>
              <p className="mt-2 text-white/70">
                {ctaSubtitle}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-brand-500 hover:bg-amber-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-amber-brand-900/30 transition-colors"
              >
                <MessageCircle className="h-4 w-4" />
                {t.footer.whatsappBtn}
              </a>
              <a
                href={`tel:${contact.phone}`}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 px-6 py-3 text-sm font-semibold text-white transition-colors"
              >
                <Phone className="h-4 w-4" />
                {callLabel}
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3">
              <img
                src="/logo.png"
                alt="Mariscos Quiroa"
                className="h-12 w-12 rounded-xl object-cover ring-1 ring-white/20"
              />
              <div>
                <p className="font-display text-xl font-extrabold text-white">
                  Mariscos Quiroa
                </p>
                <p className="text-xs text-amber-brand-200 uppercase tracking-[0.18em]">
                  {t.hero.tagline}
                </p>
              </div>
            </div>

            <p className="mt-5 text-sm text-white/70 leading-relaxed max-w-md">
              {t.footer.tagline}
            </p>

            <div className="mt-6 space-y-2 text-sm">
              <a href={`tel:${contact.phone}`} className="flex items-center gap-3 text-white/80 hover:text-white transition-colors">
                <Phone className="h-4 w-4 text-amber-brand-300" />
                {contact.phoneDisplay}
              </a>
              <a href={`mailto:${contact.email}`} className="flex items-center gap-3 text-white/80 hover:text-white transition-colors break-all">
                <Mail className="h-4 w-4 text-amber-brand-300 shrink-0" />
                {contact.email}
              </a>
              <p className="flex items-start gap-3 text-white/80">
                <MapPin className="h-4 w-4 text-amber-brand-300 shrink-0 mt-0.5" />
                <span>
                  {contact.address.street}
                  <br />
                  {contact.address.city}, {contact.address.state}
                </span>
              </p>
            </div>
          </div>

          {/* Columnas de navegación */}
          {navColumns.map((col) => (
            <div key={col.title}>
              <h4 className="font-display text-sm font-bold uppercase tracking-wide text-white">
                {col.title}
              </h4>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/65 hover:text-amber-brand-200 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Redes + idioma */}
          <div>
            <h4 className="font-display text-sm font-bold uppercase tracking-wide text-white">
              {t.footer.follow}
            </h4>
            <div className="mt-4 flex flex-col gap-2.5">
              <a
                href={social.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 text-sm text-white/65 hover:text-white transition-colors"
              >
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
                  <Facebook className="h-4 w-4" />
                </span>
                Facebook
              </a>
              <a
                href={social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 text-sm text-white/65 hover:text-white transition-colors"
              >
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
                  <Instagram className="h-4 w-4" />
                </span>
                Instagram
              </a>
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 text-sm text-white/65 hover:text-white transition-colors"
              >
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
                  <MessageCircle className="h-4 w-4" />
                </span>
                WhatsApp
              </a>
            </div>
            <div className="mt-5">
              <LanguageSwitcher scrolled />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/50">
          <p>
            © {new Date().getFullYear()} Mariscos Quiroa. {t.footer.rights}
          </p>

          {/* Sello Logan */}
          <LoganSeal variant="dark" />

          <div className="flex items-center gap-4">
            <span>{bottomBar}</span>
            <span className="hidden sm:inline">·</span>
            <span>{bottomMade}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

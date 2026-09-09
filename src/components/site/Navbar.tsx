"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, Phone } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSiteConfig } from "@/hooks/use-site-config";
import { useI18n } from "@/i18n/I18nProvider";
import { LanguageSwitcher } from "@/components/site/LanguageSwitcher";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { data: siteConfig } = useSiteConfig();
  const { t } = useI18n();

  const navLinks = [
    { href: "#productos", label: t.nav.products },
    { href: "#mayoreo-menudeo", label: t.nav.mayoreoMenudeo },
    { href: "#nosotros", label: t.nav.about },
    { href: "#cobertura", label: t.nav.coverage },
    { href: "#ecosistema", label: t.nav.ecosystem },
    { href: "#ubicacion", label: t.nav.location },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!siteConfig) return null;

  const waLink = `https://wa.me/${siteConfig.contact.whatsapp}?text=${encodeURIComponent(
    siteConfig.contact.whatsappMessage
  )}`;

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled
          ? "border-b border-white/10 bg-deep/80 shadow-lg backdrop-blur-xl"
          : "bg-transparent"
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 sm:h-20 items-center justify-between gap-4">
          {/* Logo */}
          <Link href="#inicio" className="flex items-center gap-3 group">
            <Image
              src="/logo.png"
              alt="Mariscos Quiroa"
              width={256}
              height={256}
              priority
              className="h-10 w-10 sm:h-12 sm:w-12 shrink-0 rounded-xl object-cover shadow-md"
            />
            <div className="flex flex-col leading-none">
              <span className="font-display text-lg font-extrabold tracking-tight text-white drop-shadow-md transition-colors sm:text-xl">
                Mariscos Quiroa
              </span>
              <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-amber-light transition-colors sm:text-xs">
                {t.hero.tagline}
              </span>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-lg px-3 py-2 text-sm font-medium text-white/85 transition-colors hover:bg-white/10 hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* CTAs */}
          <div className="hidden lg:flex items-center gap-2">
            <LanguageSwitcher scrolled={false} />
            <a
              href={`tel:${siteConfig.contact.phone}`}
              className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10"
            >
              <Phone className="h-4 w-4" />
              {siteConfig.contact.phoneDisplay}
            </a>
            <a href={waLink} target="_blank" rel="noopener noreferrer" className="oi-btn-gold !px-5 !py-2 text-sm">
              {t.nav.quote}
            </a>
          </div>

          {/* Mobile toggle */}
          <div className="lg:hidden flex items-center gap-2">
            <LanguageSwitcher scrolled={false} />
            <button
              onClick={() => setOpen(!open)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-white transition-colors hover:bg-white/10"
              aria-label={open ? t.chat.closeChat : t.chat.openChat}
            >
              {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-white/10 bg-deep/95 backdrop-blur-xl lg:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-3 text-base font-medium text-white/80 hover:bg-white/10 hover:text-white"
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-3 flex flex-col gap-2 border-t border-white/10 pt-3">
              <a
                href={`tel:${siteConfig.contact.phone}`}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-white/10 px-3 py-3 text-sm font-medium text-white"
              >
                <Phone className="h-4 w-4" />
                {siteConfig.contact.phoneDisplay}
              </a>
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
                className="oi-btn-gold justify-center"
              >
                {t.nav.quote}
              </a>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

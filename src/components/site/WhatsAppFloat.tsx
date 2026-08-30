"use client";

import { useEffect, useState } from "react";
import { MessageCircle, X } from "lucide-react";
import { siteConfig as fallbackConfig } from "@/lib/site-data";
import { useSiteConfig } from "@/hooks/use-site-config";
import { useI18n } from "@/i18n/I18nProvider";
import { cn } from "@/lib/utils";

export function WhatsAppFloat() {
  const [visible, setVisible] = useState(false);
  const [open, setOpen] = useState(false);
  const { data: siteConfig } = useSiteConfig();
  const { t, locale } = useI18n();
  const config = siteConfig || fallbackConfig;

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const waLink = `https://wa.me/${config.contact.whatsapp}?text=${encodeURIComponent(
    config.contact.whatsappMessage
  )}`;

  if (!visible) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      {open && (
        <div className="rounded-2xl bg-card border border-border shadow-2xl p-4 max-w-[280px] animate-fade-up">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                <MessageCircle className="h-4 w-4" />
              </span>
              <div>
                <p className="text-sm font-semibold text-foreground">Mariscos Quiroa</p>
                <p className="text-[10px] text-emerald-600 flex items-center gap-1">
                  <span className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  {locale === "es" ? "En línea ahora" : "Online now"}
                </p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-muted-foreground hover:text-foreground"
              aria-label={locale === "es" ? "Cerrar" : "Close"}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
            {t.whatsapp.floatCta}
          </p>
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white transition-colors"
          >
            <MessageCircle className="h-4 w-4" />
            {locale === "es" ? "Abrir WhatsApp" : "Open WhatsApp"}
          </a>
        </div>
      )}

      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "relative inline-flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-xl shadow-emerald-900/30 transition-all hover:scale-105",
          open && "rotate-90"
        )}
        style={{ right: 0 }}
        aria-label={t.whatsapp.label}
      >
        {!open && (
          <span className="absolute inset-0 rounded-full bg-emerald-600 animate-ping opacity-30" />
        )}
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-7 w-7" />}
      </button>
    </div>
  );
}

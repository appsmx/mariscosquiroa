"use client";

import { useState, useRef, useEffect } from "react";
import { Globe, Check, ChevronDown } from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";
import { locales, localeNames, Locale } from "@/i18n/dictionaries";
import { cn } from "@/lib/utils";

/**
 * Switcher de idioma ES/EN para el navbar.
 * Tamaño compacto, dropdown con banderas.
 */
export function LanguageSwitcher({ scrolled = false }: { scrolled?: boolean }) {
  const { locale, setLocale } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Cerrar al click fuera
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const current = localeNames[locale];

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={current.native}
        aria-expanded={open}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs sm:text-sm font-medium transition-colors border",
          scrolled
            ? "bg-background/80 border-border text-foreground hover:bg-accent"
            : "bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-md"
        )}
      >
        <Globe className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">{current.native}</span>
        <span className="sm:hidden uppercase">{locale}</span>
        <ChevronDown className={cn("h-3 w-3 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-44 rounded-xl border border-border bg-background shadow-lg overflow-hidden z-50"
        >
          {locales.map((loc: Locale) => {
            const info = localeNames[loc];
            const active = loc === locale;
            return (
              <button
                key={loc}
                role="menuitem"
                onClick={() => {
                  setLocale(loc);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-center justify-between px-3 py-2 text-sm transition-colors",
                  active
                    ? "bg-accent text-foreground font-semibold"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                )}
              >
                <span className="flex items-center gap-2">
                  <span className="text-base">{info.flag}</span>
                  {info.native}
                </span>
                {active && <Check className="h-4 w-4 text-ocean-600" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

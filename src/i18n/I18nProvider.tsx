"use client";

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { dictionaries, defaultLocale, Locale, DictType } from "./dictionaries";

interface I18nContextValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: DictType;
  isClient: boolean;
}

const I18nContext = createContext<I18nContextValue | null>(null);

const COOKIE_NAME = "mq_locale";

/**
 * Provider que maneja el locale actual y expone el diccionario.
 *
 * Estrategia:
 * 1. Al montar en cliente, lee la cookie `mq_locale`.
 * 2. Si no hay cookie, usa `navigator.language` para detectar ES/EN.
 * 3. Persiste el locale elegido en cookie (1 año) para que el server lo lea en SSR.
 */
export function I18nProvider({
  children,
  initialLocale,
}: {
  children: ReactNode;
  initialLocale?: Locale;
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale || defaultLocale);
  const [isClient, setIsClient] = useState(false);

  // Detectar locale en cliente al montar
  useEffect(() => {
    setIsClient(true);
    const stored = readCookie(COOKIE_NAME) as Locale | null;
    if (stored && (stored === "es" || stored === "en")) {
      setLocaleState(stored);
      return;
    }
    // Detectar por idioma del navegador
    const nav = (navigator.language || "").toLowerCase();
    if (nav.startsWith("en")) {
      setLocaleState("en");
      writeCookie(COOKIE_NAME, "en", 365);
    } else {
      // default español para todo lo demás
      setLocaleState("es");
      writeCookie(COOKIE_NAME, "es", 365);
    }
  }, []);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    writeCookie(COOKIE_NAME, l, 365);
    // refrescar <html lang> para SEO
    if (typeof document !== "undefined") {
      document.documentElement.lang = l;
    }
  }, []);

  // Actualizar <html lang> al cambiar locale
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = locale;
    }
  }, [locale]);

  const value: I18nContextValue = {
    locale,
    setLocale,
    t: dictionaries[locale],
    isClient,
  };

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error("useI18n debe usarse dentro de I18nProvider");
  }
  return ctx;
}

// Helpers
function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? decodeURIComponent(match[2]) : null;
}

function writeCookie(name: string, value: string, days: number) {
  if (typeof document === "undefined") return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  const sameSite = "; SameSite=Lax";
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/${secure}${sameSite}`;
}

/**
 * Utilidades server-side para i18n.
 * - getLocaleFromRequest: detecta locale desde cookie o Accept-Language header
 * - Útil para Server Components y API routes que necesitan saber el locale del usuario
 */

import { cookies, headers } from "next/headers";
import { defaultLocale, Locale, locales } from "./dictionaries";

const COOKIE_NAME = "mq_locale";

export async function getLocaleFromRequest(): Promise<Locale> {
  // 1. Revisar cookie
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get(COOKIE_NAME)?.value as Locale | undefined;
  if (cookieLocale && locales.includes(cookieLocale)) {
    return cookieLocale;
  }

  // 2. Revisar Accept-Language header
  const headerStore = await headers();
  const acceptLang = headerStore.get("accept-language") || "";
  const detected = detectFromAcceptLanguage(acceptLang);
  return detected;
}

function detectFromAcceptLanguage(acceptLang: string): Locale {
  // Parsear Accept-Language: ej "en-US,en;q=0.9,es;q=0.8"
  const langs = acceptLang
    .split(",")
    .map((l) => {
      const [tag, qStr] = l.trim().split(";");
      const q = qStr ? parseFloat(qStr.split("=")[1]) : 1;
      return { tag: tag.toLowerCase(), q };
    })
    .filter((l) => l.tag)
    .sort((a, b) => b.q - a.q);

  for (const { tag } of langs) {
    if (tag.startsWith("en")) return "en";
    if (tag.startsWith("es")) return "es";
  }

  return defaultLocale;
}

/**
 * Lee el locale desde un objeto Request (API routes) sin necesidad de async cookies.
 */
export function getLocaleFromHeaders(req: Request): Locale {
  // 1. Cookie header
  const cookieHeader = req.headers.get("cookie") || "";
  const cookieMatch = cookieHeader.match(new RegExp(`(?:^|; )${COOKIE_NAME}=([^;]+)`));
  if (cookieMatch) {
    const val = decodeURIComponent(cookieMatch[1]) as Locale;
    if (locales.includes(val)) return val;
  }

  // 2. Accept-Language
  const acceptLang = req.headers.get("accept-language") || "";
  return detectFromAcceptLanguage(acceptLang);
}

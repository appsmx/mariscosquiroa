"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Sello de Logan — marca de autoría.
 * Indica que este sitio fue creado siguiendo la metodología Logan.
 *
 * Props:
 *  - variant: "light" (fondo claro, texto oscuro) | "dark" (fondo oscuro, texto claro)
 *  - show: si debe animarse al entrar en viewport (default true)
 */
type LoganSealProps = {
  variant?: "light" | "dark";
  className?: string;
  show?: boolean;
};

export function LoganSeal({
  variant = "dark",
  className,
  show = true,
}: LoganSealProps) {
  const [visible, setVisible] = useState(!show);

  useEffect(() => {
    if (!show) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setVisible(true);
            obs.disconnect();
          }
        });
      },
      { threshold: 0.4 }
    );
    // Observar el elemento tras montar
    const el = document.getElementById("logan-seal");
    if (el) obs.observe(el);
    return () => obs.disconnect();
  }, [show]);

  const isDark = variant === "dark";

  return (
    <a
      id="logan-seal"
      href="https://www.loganos.com"
      target="_blank"
      rel="noopener noreferrer"
      title="Sitio creado con la metodología Logan"
      aria-label="Sello Logan — Creado con la metodología Logan"
      className={cn(
        "group inline-flex items-center gap-2.5 rounded-full border transition-all",
        isDark
          ? "border-white/15 bg-white/5 hover:bg-white/10 hover:border-white/25"
          : "border-ocean-200 bg-ocean-50/60 hover:bg-ocean-50 hover:border-ocean-300",
        "px-3 py-1.5",
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2",
        "duration-500",
        className
      )}
    >
      {/* Monograma Logan */}
      <span
        className={cn(
          "relative inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-display text-sm font-black",
          isDark
            ? "bg-gradient-to-br from-amber-brand-400 to-amber-brand-600 text-ocean-950"
            : "bg-gradient-to-br from-ocean-500 to-ocean-700 text-white"
        )}
      >
        L
        {/* Anillo orbital decorativo */}
        <span
          className={cn(
            "absolute inset-0 rounded-full border opacity-50 group-hover:opacity-100 transition-opacity",
            isDark ? "border-amber-brand-300/40" : "border-ocean-300/60"
          )}
        />
      </span>

      {/* Texto */}
      <span className="flex flex-col leading-none">
        <span
          className={cn(
            "text-[10px] font-semibold uppercase tracking-[0.14em]",
            isDark ? "text-amber-brand-200" : "text-ocean-700"
          )}
        >
          Creado con
        </span>
        <span
          className={cn(
            "font-display text-sm font-bold",
            isDark ? "text-white" : "text-ocean-900"
          )}
        >
          Logan
        </span>
      </span>

      {/* Indicador de方法论 */}
      <span
        className={cn(
          "hidden sm:inline-flex h-1.5 w-1.5 rounded-full ml-0.5",
          isDark ? "bg-emerald-400" : "bg-emerald-500"
        )}
        title="Metodología activa"
      />
    </a>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { Fish } from "lucide-react";

/**
 * OceanPreloader — Pantalla de carga "Sumergiéndote…" (fiel a index-v2.html).
 *
 * Fondo degradado teal→abismo, líneas que caen (pl-line), pez animado, marca
 * "Mariscos Quiroa", barra de progreso que se llena por JS y el texto
 * "Sumergiéndote…". Se marca `.done` (fade-out) al llegar a 100% o por failsafe
 * a los ~3.2 s, y luego se desmonta. Respeta prefers-reduced-motion.
 */
export function OceanPreloader() {
  const barRef = useRef<HTMLDivElement | null>(null);
  const [done, setDone] = useState(false);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Bloquear scroll mientras el preloader está visible.
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    let p = 0;
    let interval: ReturnType<typeof setInterval> | undefined;
    let failsafe: ReturnType<typeof setTimeout>;
    let removeTimer: ReturnType<typeof setTimeout>;

    const finish = () => {
      setDone(true);
      document.body.style.overflow = prevOverflow;
      // Coincide con la transición de opacidad (.8s) antes de desmontar.
      removeTimer = setTimeout(() => setGone(true), 850);
    };

    if (REDUCED) {
      if (barRef.current) barRef.current.style.width = "100%";
      failsafe = setTimeout(finish, 300);
    } else {
      // Progreso incremental como en index-v2.html.
      interval = setInterval(() => {
        p = Math.min(100, p + Math.random() * 18 + 6);
        if (barRef.current) barRef.current.style.width = p + "%";
        if (p >= 100) {
          if (interval) clearInterval(interval);
          setTimeout(finish, 350);
        }
      }, 180);
      // Failsafe: nunca dejar el preloader colgado.
      failsafe = setTimeout(() => {
        if (barRef.current) barRef.current.style.width = "100%";
        finish();
      }, 3200);
    }

    return () => {
      if (interval) clearInterval(interval);
      clearTimeout(failsafe);
      clearTimeout(removeTimer);
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  if (gone) return null;

  return (
    <div
      id="oi-preloader"
      className={done ? "done" : ""}
      role="status"
      aria-live="polite"
      aria-label="Cargando Mariscos Quiroa"
    >
      {/* Líneas que descienden */}
      <div className="pl-line" style={{ animationDelay: "0s", left: "30%" }} aria-hidden="true" />
      <div className="pl-line" style={{ animationDelay: ".4s", left: "55%" }} aria-hidden="true" />
      <div className="pl-line" style={{ animationDelay: ".8s", left: "72%" }} aria-hidden="true" />

      <div className="relative flex flex-col items-center">
        <div className="pl-fish mb-4 text-[#fbbf24]" aria-hidden="true">
          <Fish className="h-12 w-12" />
        </div>
        <div className="font-display text-2xl font-bold tracking-wide text-foam">
          Mariscos <span className="oi-text-gold">Quiroa</span>
        </div>
        <div className="mt-4 h-1 w-48 overflow-hidden rounded-full bg-white/15">
          <div
            ref={barRef}
            className="h-full w-0 bg-gradient-to-r from-[#2dd4bf] to-[#f59e0b]"
            style={{ transition: "width .18s ease" }}
          />
        </div>
        <div className="mt-3 text-xs uppercase tracking-[0.35em] text-foam/70">Sumergiéndote…</div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";

/**
 * OceanPreloader — Pantalla de carga inicial "Sumergiéndote…".
 *
 * Aparece al abrir la página con la estética "Océano Interactivo":
 * un pez dorado que se zambulle en el agua (clavado), burbujas que ascienden
 * y el texto "Sumergiéndote".
 * Se desvanece cuando la página termina de cargar (window load) o tras un
 * máximo de seguridad, y luego se desmonta. Respeta prefers-reduced-motion
 * (se salta la animación de burbujas y se cierra más rápido).
 */
export function OceanPreloader() {
  const [hiding, setHiding] = useState(false);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Bloquear el scroll mientras el preloader está visible.
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    let hideTimer: ReturnType<typeof setTimeout>;
    let removeTimer: ReturnType<typeof setTimeout>;

    const startHide = () => {
      setHiding(true);
      // Duración del fade (coincide con la transición CSS de abajo).
      removeTimer = setTimeout(() => {
        setGone(true);
        document.body.style.overflow = prevOverflow;
      }, 700);
    };

    // Mínimo visible para que se aprecie el efecto; menos si reduce-motion.
    const minVisible = REDUCED ? 350 : 1100;

    const onLoad = () => {
      hideTimer = setTimeout(startHide, minVisible);
    };

    if (document.readyState === "complete") {
      onLoad();
    } else {
      window.addEventListener("load", onLoad, { once: true });
      // Red de seguridad: nunca dejar el preloader colgado.
      hideTimer = setTimeout(startHide, 4000);
    }

    return () => {
      clearTimeout(hideTimer);
      clearTimeout(removeTimer);
      window.removeEventListener("load", onLoad);
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  if (gone) return null;

  return (
    <div
      className={`oi-preloader${hiding ? " oi-preloader-hide" : ""}`}
      role="status"
      aria-live="polite"
      aria-label="Cargando Mariscos Quiroa"
    >
      {/* Burbujas ascendentes */}
      <div className="oi-pre-bubbles" aria-hidden="true">
        {Array.from({ length: 9 }).map((_, i) => (
          <span key={i} className="oi-pre-bubble" style={{ ["--i" as string]: i }} />
        ))}
      </div>

      {/* Pez que se zambulle (clavado) + marca */}
      <div className="oi-pre-core">
        <span className="oi-pre-diver" aria-hidden="true">
          {/* Superficie del agua con ondas que se abren al entrar el pez */}
          <span className="oi-pre-water">
            <span className="oi-pre-ripple" />
            <span className="oi-pre-ripple" />
          </span>
          {/* Salpicadura al momento del clavado */}
          <span className="oi-pre-splash">
            <i /><i /><i /><i /><i />
          </span>
          {/* El pez que se sumerge de cabeza */}
          <span className="oi-pre-fish">
            <svg viewBox="0 0 64 64" width="60" height="60" aria-hidden="true">
              <defs>
                <linearGradient id="oiFishBody" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#fde68a" />
                  <stop offset="40%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#0d9488" />
                </linearGradient>
                <linearGradient id="oiFishFin" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#5eead4" />
                  <stop offset="100%" stopColor="#0c4a6e" />
                </linearGradient>
              </defs>
              {/* Cola (aletea) */}
              <path
                className="oi-fish-tail"
                d="M46 32c8-6 13-9 16-6 2 3 2 9 0 12-3 3-8 0-16-6z"
                fill="url(#oiFishFin)"
              />
              {/* Cuerpo */}
              <path
                d="M6 32c8-13 22-19 34-15 7 2 12 8 12 15s-5 13-12 15C28 51 14 45 6 32z"
                fill="url(#oiFishBody)"
              />
              {/* Aleta dorsal */}
              <path
                className="oi-fish-fin"
                d="M24 20c4-6 9-9 13-8-2 4-3 8-3 12z"
                fill="url(#oiFishFin)"
                opacity="0.9"
              />
              {/* Ojo */}
              <circle cx="16" cy="30" r="3" fill="#031b28" />
              <circle cx="15" cy="29" r="1" fill="#e0f7ff" />
            </svg>
          </span>
        </span>
        <span className="oi-pre-brand">Mariscos Quiroa</span>
        <span className="oi-pre-text">
          Sumergiéndote<span className="oi-pre-dots"><i>.</i><i>.</i><i>.</i></span>
        </span>
        <span className="oi-pre-bar" aria-hidden="true"><span /></span>
      </div>
    </div>
  );
}

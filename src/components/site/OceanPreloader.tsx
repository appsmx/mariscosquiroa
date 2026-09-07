"use client";

import { useEffect, useState } from "react";

/**
 * OceanPreloader — Pantalla de carga inicial "Sumergiéndote…".
 *
 * Aparece al abrir la página con la estética "Océano Interactivo":
 * orbe LOGAN girando, burbujas que ascienden y el texto "Sumergiéndote".
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

      {/* Orbe LOGAN + marca */}
      <div className="oi-pre-core">
        <span className="oi-pre-orb" aria-hidden="true" />
        <span className="oi-pre-brand">Mariscos Quiroa</span>
        <span className="oi-pre-text">
          Sumergiéndote<span className="oi-pre-dots"><i>.</i><i>.</i><i>.</i></span>
        </span>
        <span className="oi-pre-bar" aria-hidden="true"><span /></span>
      </div>
    </div>
  );
}

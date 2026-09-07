"use client";

import { useEffect, useRef } from "react";

/**
 * OceanCursor — Cursor personalizado "gota del océano".
 *
 * Reemplaza el puntero por un punto dorado con un anillo aqua que lo persigue
 * con un ligero retraso (lerp). Al pasar sobre elementos interactivos
 * (a, button, input, etc.) el anillo se agranda y se torna dorado.
 *
 * Solo se activa en dispositivos con puntero fino (mouse/trackpad) y respeta
 * prefers-reduced-motion (no se monta). En touch no aparece.
 */
export function OceanCursor() {
  const dotRef = useRef<HTMLDivElement | null>(null);
  const ringRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!finePointer || REDUCED) return;

    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    document.documentElement.classList.add("oi-cursor-on");

    let mx = window.innerWidth / 2, my = window.innerHeight / 2;
    let rx = mx, ry = my; // posición del anillo (persigue con retraso)
    let raf = 0;
    let visible = false;

    const onMove = (e: PointerEvent) => {
      mx = e.clientX; my = e.clientY;
      if (!visible) {
        visible = true;
        dot.style.opacity = "1";
        ring.style.opacity = "1";
      }
      // El punto sigue exacto; el anillo se interpola en el rAF.
      dot.style.transform = `translate(${mx}px, ${my}px)`;

      const target = e.target as HTMLElement | null;
      const interactive = !!(target && target.closest &&
        target.closest('a,button,input,select,textarea,label,[role="button"],[role="dialog"]'));
      ring.classList.toggle("is-active", interactive);
    };

    const onLeave = () => {
      visible = false;
      dot.style.opacity = "0";
      ring.style.opacity = "0";
    };

    const loop = () => {
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      ring.style.transform = `translate(${rx}px, ${ry}px)`;
      raf = requestAnimationFrame(loop);
    };

    dot.style.opacity = "0";
    ring.style.opacity = "0";
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      document.documentElement.classList.remove("oi-cursor-on");
    };
  }, []);

  return (
    <>
      <div ref={ringRef} className="oi-cursor-ring" aria-hidden="true" style={{ opacity: 0 }} />
      <div ref={dotRef} className="oi-cursor oi-cursor-dot" aria-hidden="true" style={{ opacity: 0 }} />
    </>
  );
}

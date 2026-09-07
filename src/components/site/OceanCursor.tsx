"use client";

import { useEffect, useRef } from "react";

/**
 * OceanCursor — Cursor personalizado (spotlight) fiel a index-v2.html.
 *
 * Punto dorado (6px) + anillo teal (34px) que persigue con lerp (.18). El anillo
 * crece a dorado (.grow) al pasar sobre elementos interactivos. Solo en puntero
 * fino (hover:hover / pointer:fine); en touch no aparece. Respeta
 * prefers-reduced-motion (no se monta y restaura el cursor nativo).
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

    // Oculta el cursor nativo (como `body{cursor:none}` en index-v2.html).
    document.documentElement.classList.add("oi-cursor-on");

    let mx = window.innerWidth / 2, my = window.innerHeight / 2;
    let rx = mx, ry = my;
    let raf = 0;
    let visible = false;

    const show = () => {
      if (visible) return;
      visible = true;
      dot.style.opacity = "1";
      ring.style.opacity = "1";
    };

    const onMove = (e: PointerEvent) => {
      mx = e.clientX; my = e.clientY;
      show();
      dot.style.transform = `translate(${mx - 3}px, ${my - 3}px)`;

      // .grow sobre elementos interactivos (equivalente a [data-hover]).
      const target = e.target as HTMLElement | null;
      const interactive = !!(target && target.closest &&
        target.closest('a,button,input,select,textarea,label,[role="button"],[data-hover]'));
      ring.classList.toggle("grow", interactive);
    };

    const onLeave = () => {
      visible = false;
      dot.style.opacity = "0";
      ring.style.opacity = "0";
    };

    const loop = () => {
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      ring.style.transform = `translate(${rx - 17}px, ${ry - 17}px)`;
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
      <div id="oi-cursor-ring" ref={ringRef} aria-hidden="true" style={{ opacity: 0 }} />
      <div id="oi-cursor-dot" ref={dotRef} aria-hidden="true" style={{ opacity: 0 }} />
    </>
  );
}

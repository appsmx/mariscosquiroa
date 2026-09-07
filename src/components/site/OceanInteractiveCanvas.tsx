"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

/**
 * OceanInteractiveCanvas
 * -----------------------------------------------------------------------------
 * Capa de fondo interactiva estilo Web3 / Igloo Inc. Se renderiza detrás de
 * toda la interfaz existente (Navbar, Hero, ProductCatalog, etc.) sin modificar
 * ni un solo componente actual: sólo se monta como fondo fijo.
 *
 * Interacción:
 *  - Cursor / touch: ondas de agua + destellos dorados y teales que siguen al puntero.
 *  - Click / touchstart: un pez estilizado (neón/dorado) salta en parábola,
 *    salpica gotas y vuelve a sumergirse.
 *  - Scroll: acelera partículas ascendentes (burbujas / sales marinas) según la
 *    profundidad a la que navega el usuario (efecto de inmersión).
 *
 * Rendimiento:
 *  - requestAnimationFrame (~60 FPS), densidad adaptada a viewport.
 *  - devicePixelRatio limitado a 2 para no saturar pantallas 4K/retina.
 *  - Respeta prefers-reduced-motion (dibuja un fondo estático suave).
 *  - Limpieza total de listeners y del rAF al desmontar.
 *
 * Identidad de marca (paleta del proyecto):
 *  - Océano Teal: #0d9488 → #0c4a6e
 *  - Ámbar dorado: #d97706 → #f59e0b
 */

type Foam = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  r: number;
  gold: boolean;
};

type Ripple = { x: number; y: number; r: number; life: number };

type Fish = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  g: number;
  size: number;
  dir: 1 | -1;
  trail: { x: number; y: number }[];
};

type Drift = {
  x: number;
  y: number;
  r: number;
  speed: number;
  alpha: number;
  gold: boolean;
  sway: number;
};

// Paleta de marca (RGB para construir rgba con alpha dinámico)
const TEAL = "13,148,136"; // #0d9488
const TEAL_LIGHT = "153,246,228"; // teal-200
const OCEAN = "12,74,110"; // #0c4a6e
const GOLD = "245,158,11"; // #f59e0b
const GOLD_DEEP = "217,119,6"; // #d97706

export function OceanInteractiveCanvas({
  className,
}: {
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let rafId = 0;

    const pointer = { x: -9999, y: -9999, moved: false };
    let scrollY = typeof window !== "undefined" ? window.scrollY : 0;
    let scrollVelocity = 0;
    let lastScrollY = scrollY;

    const foam: Foam[] = [];
    const ripples: Ripple[] = [];
    const fishes: Fish[] = [];
    const drift: Drift[] = [];

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    // Partículas ambientales (burbujas / sal marina) reutilizables
    const ambientCount = width < 640 ? 24 : width < 1280 ? 48 : 72;
    for (let i = 0; i < ambientCount; i++) {
      drift.push({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 1.9 + 0.4,
        speed: Math.random() * 0.4 + 0.1,
        alpha: Math.random() * 0.45 + 0.12,
        gold: Math.random() > 0.62,
        sway: Math.random() * Math.PI * 2,
      });
    }

    const spawnFoam = (x: number, y: number, amount: number) => {
      for (let i = 0; i < amount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 2.2 + 0.3;
        foam.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 0.6,
          life: 1,
          r: Math.random() * 2.1 + 0.6,
          gold: Math.random() > 0.7,
        });
      }
    };

    const spawnRipple = (x: number, y: number) => {
      ripples.push({ x, y, r: 4, life: 1 });
    };

    const spawnFish = (x: number, y: number) => {
      const dir: 1 | -1 = Math.random() > 0.5 ? 1 : -1;
      fishes.push({
        x,
        y,
        vx: dir * (Math.random() * 3 + 3),
        vy: -(Math.random() * 6 + 9),
        g: 0.32,
        size: Math.random() * 8 + 16,
        dir,
        trail: [],
      });
      spawnRipple(x, y);
      spawnFoam(x, y, 16);
    };

    const drawFish = (f: Fish) => {
      ctx.save();
      ctx.translate(f.x, f.y);
      const angle = Math.atan2(f.vy, f.vx * f.dir) * f.dir;
      ctx.rotate(angle * 0.6);
      ctx.scale(f.dir, 1);
      const s = f.size;
      const grad = ctx.createLinearGradient(-s, 0, s, 0);
      grad.addColorStop(0, `rgba(${GOLD_DEEP},0.95)`);
      grad.addColorStop(1, `rgba(${GOLD},0.6)`);
      ctx.fillStyle = grad;
      ctx.shadowColor = `rgba(${GOLD},0.7)`;
      ctx.shadowBlur = 18;
      // cuerpo
      ctx.beginPath();
      ctx.moveTo(-s, 0);
      ctx.quadraticCurveTo(0, -s * 0.55, s, 0);
      ctx.quadraticCurveTo(0, s * 0.55, -s, 0);
      ctx.fill();
      // cola
      ctx.beginPath();
      ctx.moveTo(-s, 0);
      ctx.lineTo(-s - s * 0.6, -s * 0.4);
      ctx.lineTo(-s - s * 0.6, s * 0.4);
      ctx.closePath();
      ctx.fill();
      // ojo
      ctx.shadowBlur = 0;
      ctx.fillStyle = `rgba(${OCEAN},1)`;
      ctx.beginPath();
      ctx.arc(s * 0.45, -s * 0.08, s * 0.08, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Aceleración por scroll (inmersión): decae suavemente
      scrollVelocity += (Math.abs(window.scrollY - lastScrollY) - scrollVelocity) * 0.1;
      lastScrollY = window.scrollY;
      const depth = Math.min(window.scrollY / (height * 4), 1); // 0..1
      const boost = 1 + depth * 1.8 + Math.min(scrollVelocity * 0.05, 2);

      // Partículas ambientales ascendentes
      for (const d of drift) {
        d.y -= d.speed * boost;
        d.sway += 0.01;
        if (d.y < -12) {
          d.y = height + 12;
          d.x = Math.random() * width;
        }
        const x = d.x + Math.sin(d.sway) * 8;
        ctx.beginPath();
        ctx.fillStyle = d.gold
          ? `rgba(${GOLD},${d.alpha})`
          : `rgba(${TEAL_LIGHT},${d.alpha})`;
        ctx.arc(x, d.y, d.r, 0, Math.PI * 2);
        ctx.fill();
      }

      // Ondas de agua
      for (let i = ripples.length - 1; i >= 0; i--) {
        const rp = ripples[i];
        rp.r += 2.4;
        rp.life -= 0.02;
        if (rp.life <= 0) {
          ripples.splice(i, 1);
          continue;
        }
        ctx.beginPath();
        ctx.strokeStyle = `rgba(${TEAL},${rp.life * 0.5})`;
        ctx.lineWidth = 2;
        ctx.arc(rp.x, rp.y, rp.r, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.strokeStyle = `rgba(${GOLD},${rp.life * 0.22})`;
        ctx.lineWidth = 1;
        ctx.arc(rp.x, rp.y, rp.r * 0.6, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Partículas de espuma (rastro del puntero / splashes)
      for (let i = foam.length - 1; i >= 0; i--) {
        const p = foam[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.12;
        p.vx *= 0.98;
        p.life -= 0.022;
        if (p.life <= 0) {
          foam.splice(i, 1);
          continue;
        }
        ctx.beginPath();
        ctx.fillStyle = p.gold
          ? `rgba(${GOLD},${p.life})`
          : `rgba(${TEAL_LIGHT},${p.life * 0.9})`;
        ctx.shadowColor = p.gold ? `rgba(${GOLD},0.6)` : `rgba(${TEAL},0.5)`;
        ctx.shadowBlur = 6;
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // Peces saltando (parábola + estela de gotas)
      for (let i = fishes.length - 1; i >= 0; i--) {
        const f = fishes[i];
        f.x += f.vx;
        f.y += f.vy;
        f.vy += f.g;
        f.trail.push({ x: f.x, y: f.y });
        if (f.trail.length > 12) f.trail.shift();
        for (let t = 0; t < f.trail.length; t++) {
          const tp = f.trail[t];
          ctx.beginPath();
          ctx.fillStyle = `rgba(${TEAL_LIGHT},${(t / f.trail.length) * 0.4})`;
          ctx.arc(tp.x, tp.y, 2, 0, Math.PI * 2);
          ctx.fill();
        }
        drawFish(f);
        if (f.y > height + 40) {
          spawnRipple(f.x, height - 4);
          spawnFoam(f.x, height - 4, 12);
          fishes.splice(i, 1);
        }
      }

      // Rastro de espuma continuo mientras se mueve el puntero
      if (pointer.moved) {
        spawnFoam(pointer.x, pointer.y, 2);
        if (Math.random() > 0.85) spawnRipple(pointer.x, pointer.y);
        pointer.moved = false;
      }

      rafId = window.requestAnimationFrame(render);
    };

    // Fondo estático accesible cuando el usuario reduce el movimiento
    const renderStatic = () => {
      ctx.clearRect(0, 0, width, height);
      for (const d of drift) {
        ctx.beginPath();
        ctx.fillStyle = d.gold
          ? `rgba(${GOLD},${d.alpha * 0.6})`
          : `rgba(${TEAL_LIGHT},${d.alpha * 0.6})`;
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    // ----- Handlers -----
    const isInteractive = (target: EventTarget | null) => {
      const el = target as HTMLElement | null;
      return !!el?.closest?.(
        "a,button,input,textarea,select,label,[role=button],[data-no-fish]"
      );
    };

    const onPointerMove = (x: number, y: number) => {
      pointer.x = x;
      pointer.y = y;
      pointer.moved = true;
    };

    const onMouseMove = (e: MouseEvent) => onPointerMove(e.clientX, e.clientY);
    const onTouchMove = (e: TouchEvent) => {
      const t = e.touches[0];
      if (t) onPointerMove(t.clientX, t.clientY);
    };
    const onClick = (e: MouseEvent) => {
      if (!isInteractive(e.target)) spawnFish(e.clientX, e.clientY);
    };
    const onTouchStart = (e: TouchEvent) => {
      const t = e.touches[0];
      if (t && !isInteractive(e.target)) spawnFish(t.clientX, t.clientY);
    };
    const onScroll = () => {
      scrollY = window.scrollY;
    };
    const onResize = () => resize();

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("click", onClick);
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);

    if (reduceMotion) {
      renderStatic();
    } else {
      rafId = window.requestAnimationFrame(render);
    }

    // ----- Cleanup en desmontaje -----
    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("click", onClick);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={cn(
        "pointer-events-none fixed inset-0 -z-10 h-full w-full",
        className
      )}
    />
  );
}

export default OceanInteractiveCanvas;

"use client";

import { useEffect, useRef } from "react";

/**
 * OceanCanvas — Fondo interactivo "Océano Interactivo".
 *
 * Lienzo fijo detrás de todo el sitio que dibuja:
 *  - gradiente de profundidad que se oscurece al hacer scroll
 *  - partículas ambientales (burbujas, destellos, resplandores)
 *  - ondas (ripples) reactivas al cursor/touch
 *  - gotas de espuma
 *  - un pez procedural que salta al tocar/clicar en zonas no interactivas
 *
 * Respeta prefers-reduced-motion (desactiva peces, ripples de cursor y god-rays).
 * Todo el trabajo vive en un solo requestAnimationFrame. z-index 0: el contenido
 * del sitio va por encima (z-10).
 */
export function OceanCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const TAU = Math.PI * 2;
    const rand = (a: number, b: number) => a + Math.random() * (b - a);
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    let W = 0, H = 0, dpr = 1;
    let time = 0;
    let raf = 0;

    let scrollYRaw = window.scrollY || 0;
    let scrollSmooth = scrollYRaw;
    let scrollVel = 0;
    let lastScrollY = scrollYRaw;
    let scrollProgress = 0;

    type Particle = {
      type: "bubble" | "spark" | "glow";
      x: number; y: number; r: number; vy: number; depth: number;
      phase: number; wobble: number; alpha: number; gold: boolean; py: number;
    };
    type Ripple = { x: number; y: number; r: number; vr: number; alpha: number; decay: number; flat: number };
    type Drop = { x: number; y: number; vx: number; vy: number; r: number; life: number; maxLife: number; gold: boolean };
    type Fish = {
      x: number; y: number; vx: number; vy: number; waterY: number; size: number;
      trail: Array<{ x: number; y: number }>; gold: boolean; dir: number;
    };

    let P: Particle[] = [];
    const ripples: Ripple[] = [];
    const drops: Drop[] = [];
    const fishes: Fish[] = [];

    const MAX_AMBIENT = 70, MAX_RIPPLES = 42, MAX_DROPS = 240, MAX_FISH = 6;
    const FISH_G = 1000;

    function mixRGB(c1: number[], c2: number[], t: number) {
      return `rgb(${Math.round(lerp(c1[0], c2[0], t))},${Math.round(lerp(c1[1], c2[1], t))},${Math.round(lerp(c1[2], c2[2], t))})`;
    }

    function makeParticle(fromBottom: boolean): Particle {
      const type = Math.random() < 0.45 ? "bubble" : (Math.random() < 0.78 ? "spark" : "glow");
      return {
        type,
        x: rand(0, W),
        y: fromBottom ? H + rand(20, 120) : rand(-60, H + 60),
        r: type === "glow" ? rand(38, 90) : (type === "bubble" ? rand(1.5, 5) : rand(0.6, 1.9)),
        vy: type === "glow" ? rand(3, 8) : rand(9, 26),
        depth: rand(0.2, 1),
        phase: rand(0, TAU),
        wobble: rand(4, 14),
        alpha: type === "glow" ? rand(0.03, 0.07) : rand(0.25, 0.7),
        gold: Math.random() < 0.3,
        py: 0,
      };
    }

    function initParticles() {
      P = [];
      const n = Math.round(Math.min(MAX_AMBIENT, Math.max(28, (W * H) / 26000)));
      for (let i = 0; i < n; i++) P.push(makeParticle(false));
    }

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = window.innerWidth;
      H = window.innerHeight;
      canvas!.width = Math.floor(W * dpr);
      canvas!.height = Math.floor(H * dpr);
      canvas!.style.width = W + "px";
      canvas!.style.height = H + "px";
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      initParticles();
    }

    function addRipple(x: number, y: number, big: boolean) {
      if (ripples.length > MAX_RIPPLES) ripples.shift();
      ripples.push({
        x, y,
        r: big ? 6 : 3,
        vr: big ? rand(140, 200) : rand(60, 110),
        alpha: big ? 0.5 : 0.28,
        decay: big ? 0.48 : 0.75,
        flat: big ? 0.82 : 0.55,
      });
    }

    function addDrop(x: number, y: number, vx: number, vy: number, r: number | undefined, gold: boolean) {
      if (drops.length > MAX_DROPS) drops.shift();
      drops.push({ x, y, vx, vy, r: r || rand(1, 2.6), life: 0, maxLife: rand(0.5, 1.1), gold: !!gold });
    }

    function burst(x: number, y: number, n: number, power: number, gold: boolean) {
      for (let i = 0; i < n; i++) {
        const a = rand(-Math.PI, 0);
        const sp = rand(power * 0.35, power);
        addDrop(x, y, Math.cos(a) * sp, Math.sin(a) * sp, undefined, gold);
      }
    }

    function addFish(x: number, y: number) {
      if (fishes.length >= MAX_FISH) fishes.shift();
      const dir = Math.random() < 0.5 ? -1 : 1;
      fishes.push({
        x: x - dir * 26, y: y + 46,
        vx: dir * rand(150, 265), vy: -rand(520, 640),
        waterY: y, size: rand(17, 25), trail: [], gold: Math.random() < 0.8, dir,
      });
      addRipple(x, y, true);
      burst(x, y, 16, 330, true);
    }

    function updateFish(f: Fish, dt: number) {
      f.x += f.vx * dt;
      f.y += f.vy * dt;
      f.vy += FISH_G * dt;
      f.trail.push({ x: f.x, y: f.y });
      if (f.trail.length > 14) f.trail.shift();
      if (Math.random() < 0.55) {
        addDrop(f.x - f.dir * f.size * 0.6, f.y + rand(-4, 4), f.vx * -0.15 + rand(-20, 20), f.vy * -0.1 + rand(-30, 10), undefined, f.gold);
      }
      if (f.vy > 0 && f.y > f.waterY + 22) {
        addRipple(f.x, f.waterY, true);
        burst(f.x, f.waterY, 20, 400, f.gold);
        return false;
      }
      return true;
    }

    function drawFish(f: Fish) {
      const s = f.size;
      for (let i = 0; i < f.trail.length - 2; i += 3) {
        const tp = f.trail[i];
        ctx!.globalAlpha = (i / f.trail.length) * 0.2;
        ctx!.fillStyle = f.gold ? "#f59e0b" : "#0d9488";
        ctx!.beginPath();
        ctx!.arc(tp.x, tp.y, s * 0.28, 0, TAU);
        ctx!.fill();
      }
      ctx!.globalAlpha = 1;
      ctx!.save();
      ctx!.translate(f.x, f.y);
      ctx!.rotate(Math.atan2(f.vy, f.vx));
      const g = ctx!.createLinearGradient(-s, -s, s, s);
      if (f.gold) { g.addColorStop(0, "#fde68a"); g.addColorStop(0.5, "#f59e0b"); g.addColorStop(1, "#0d9488"); }
      else { g.addColorStop(0, "#5eead4"); g.addColorStop(0.5, "#0d9488"); g.addColorStop(1, "#0c4a6e"); }
      ctx!.fillStyle = g;
      ctx!.shadowColor = f.gold ? "rgba(245,158,11,.85)" : "rgba(13,148,136,.85)";
      ctx!.shadowBlur = 20;
      ctx!.beginPath();
      ctx!.moveTo(s * 1.05, 0);
      ctx!.bezierCurveTo(s * 0.45, -s * 0.5, -s * 0.45, -s * 0.48, -s * 0.62, -s * 0.08);
      ctx!.lineTo(-s * 0.62, s * 0.08);
      ctx!.bezierCurveTo(-s * 0.45, s * 0.48, s * 0.45, s * 0.5, s * 1.05, 0);
      ctx!.closePath();
      ctx!.fill();
      ctx!.beginPath();
      ctx!.moveTo(-s * 0.5, 0);
      ctx!.lineTo(-s * 1.15, -s * 0.55);
      ctx!.quadraticCurveTo(-s * 0.8, 0, -s * 1.15, s * 0.55);
      ctx!.closePath();
      ctx!.fill();
      ctx!.beginPath();
      ctx!.moveTo(-s * 0.05, -s * 0.36);
      ctx!.quadraticCurveTo(s * 0.18, -s * 0.85, s * 0.38, -s * 0.32);
      ctx!.closePath();
      ctx!.fill();
      ctx!.shadowBlur = 0;
      ctx!.fillStyle = "#031019";
      ctx!.beginPath(); ctx!.arc(s * 0.55, -s * 0.1, s * 0.11, 0, TAU); ctx!.fill();
      ctx!.fillStyle = "#ffffff";
      ctx!.beginPath(); ctx!.arc(s * 0.58, -s * 0.13, s * 0.04, 0, TAU); ctx!.fill();
      ctx!.restore();
    }

    function update(dt: number) {
      time += dt;
      const doc = document.documentElement;
      const maxScroll = Math.max(1, doc.scrollHeight - window.innerHeight);
      scrollProgress = Math.min(1, Math.max(0, scrollYRaw / maxScroll));
      scrollSmooth += (scrollYRaw - scrollSmooth) * Math.min(1, dt * 6);
      const dScroll = scrollYRaw - lastScrollY;
      lastScrollY = scrollYRaw;
      scrollVel += (Math.abs(dScroll) / Math.max(dt, 0.001) - scrollVel) * Math.min(1, dt * 4);

      const boost = Math.min(3, scrollVel / 900);
      const span = H + 120;
      for (let i = 0; i < P.length; i++) {
        const p = P[i];
        p.y -= p.vy * (1 + boost * p.depth) * dt;
        p.x += Math.sin(time * 0.8 + p.phase) * p.wobble * dt;
        const py = p.y - scrollSmooth * p.depth * 0.35;
        p.py = ((py + 60) % span + span) % span - 60;
        if (p.y < -90) { p.y = H + 80; p.x = rand(0, W); }
      }

      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        r.r += r.vr * dt;
        r.alpha -= r.decay * dt;
        if (r.alpha <= 0) ripples.splice(i, 1);
      }

      for (let i = drops.length - 1; i >= 0; i--) {
        const d = drops[i];
        d.life += dt;
        d.vy += 900 * dt;
        d.x += d.vx * dt;
        d.y += d.vy * dt;
        if (d.life > d.maxLife || d.y > H + 20) drops.splice(i, 1);
      }

      for (let i = fishes.length - 1; i >= 0; i--) {
        if (!updateFish(fishes[i], dt)) fishes.splice(i, 1);
      }
    }

    function drawBackground() {
      const d = scrollProgress;
      const top = ctx!.createLinearGradient(0, 0, 0, H);
      top.addColorStop(0, mixRGB([8, 29, 47], [2, 6, 12], d));
      top.addColorStop(1, mixRGB([3, 7, 18], [0, 2, 6], d));
      ctx!.fillStyle = top;
      ctx!.fillRect(0, 0, W, H);

      const glow = ctx!.createRadialGradient(W * 0.5, -H * 0.25, 0, W * 0.5, -H * 0.25, H * 0.95);
      glow.addColorStop(0, `rgba(13,148,136,${(0.14 * (1 - d)).toFixed(3)})`);
      glow.addColorStop(1, "rgba(13,148,136,0)");
      ctx!.fillStyle = glow;
      ctx!.fillRect(0, 0, W, H);

      if (!REDUCED && d < 0.55) {
        ctx!.save();
        ctx!.globalCompositeOperation = "lighter";
        const rayAlpha = (1 - d / 0.55) * 0.05;
        for (let i = 0; i < 5; i++) {
          const bx = W * (0.12 + i * 0.2) + Math.sin(time * 0.12 + i * 1.7) * 46;
          const grad = ctx!.createLinearGradient(bx, 0, bx + 90, H);
          grad.addColorStop(0, `rgba(125,211,252,${rayAlpha.toFixed(3)})`);
          grad.addColorStop(1, "rgba(125,211,252,0)");
          ctx!.fillStyle = grad;
          ctx!.beginPath();
          ctx!.moveTo(bx, -20);
          ctx!.lineTo(bx + 70, -20);
          ctx!.lineTo(bx + 210, H);
          ctx!.lineTo(bx + 60, H);
          ctx!.closePath();
          ctx!.fill();
        }
        ctx!.restore();
      }
    }

    function drawParticles() {
      for (let i = 0; i < P.length; i++) {
        const p = P[i];
        if (p.type === "glow") {
          const gr = ctx!.createRadialGradient(p.x, p.py, 0, p.x, p.py, p.r);
          const c = p.gold ? "245,158,11" : "13,148,136";
          gr.addColorStop(0, `rgba(${c},${p.alpha})`);
          gr.addColorStop(1, `rgba(${c},0)`);
          ctx!.fillStyle = gr;
          ctx!.beginPath(); ctx!.arc(p.x, p.py, p.r, 0, TAU); ctx!.fill();
        } else if (p.type === "bubble") {
          ctx!.strokeStyle = `rgba(148,197,222,${(p.alpha * 0.8).toFixed(3)})`;
          ctx!.lineWidth = 1;
          ctx!.beginPath(); ctx!.arc(p.x, p.py, p.r, 0, TAU); ctx!.stroke();
          ctx!.fillStyle = `rgba(255,255,255,${(p.alpha * 0.45).toFixed(3)})`;
          ctx!.beginPath(); ctx!.arc(p.x - p.r * 0.35, p.py - p.r * 0.35, p.r * 0.25, 0, TAU); ctx!.fill();
        } else {
          const tw = 0.35 + 0.65 * Math.abs(Math.sin(time * (1.5 + p.depth) + p.phase));
          ctx!.fillStyle = p.gold ? `rgba(253,230,138,${(p.alpha * tw).toFixed(3)})` : `rgba(125,211,252,${(p.alpha * tw).toFixed(3)})`;
          ctx!.beginPath(); ctx!.arc(p.x, p.py, p.r, 0, TAU); ctx!.fill();
        }
      }
    }

    function drawRipples() {
      for (let i = 0; i < ripples.length; i++) {
        const r = ripples[i];
        ctx!.strokeStyle = `rgba(226,243,255,${Math.max(0, r.alpha).toFixed(3)})`;
        ctx!.lineWidth = 2;
        ctx!.beginPath(); ctx!.ellipse(r.x, r.y, r.r, r.r * r.flat, 0, 0, TAU); ctx!.stroke();
        if (r.r > 14) {
          ctx!.strokeStyle = `rgba(94,234,212,${Math.max(0, r.alpha * 0.6).toFixed(3)})`;
          ctx!.lineWidth = 1;
          ctx!.beginPath(); ctx!.ellipse(r.x, r.y, r.r * 0.6, r.r * 0.6 * r.flat, 0, 0, TAU); ctx!.stroke();
        }
      }
    }

    function drawDrops() {
      for (let i = 0; i < drops.length; i++) {
        const d = drops[i];
        const a = Math.max(0, 1 - d.life / d.maxLife);
        ctx!.fillStyle = d.gold ? `rgba(253,230,138,${a.toFixed(3)})` : `rgba(203,233,255,${a.toFixed(3)})`;
        ctx!.beginPath(); ctx!.arc(d.x, d.y, d.r, 0, TAU); ctx!.fill();
      }
    }

    // ---- Entrada: cursor y touch ----
    let lastRX = -999, lastRY = -999, lastRippleT = 0;
    const clampV = (v: number) => Math.max(-380, Math.min(380, v * 6));

    function onPointerMove(e: PointerEvent) {
      if (REDUCED) return;
      const now = performance.now();
      const dx = e.clientX - lastRX, dy = e.clientY - lastRY;
      if (now - lastRippleT > 45 && dx * dx + dy * dy > 110) {
        lastRX = e.clientX; lastRY = e.clientY; lastRippleT = now;
        addRipple(e.clientX, e.clientY, false);
        for (let i = 0; i < 3; i++) {
          addDrop(e.clientX + rand(-7, 7), e.clientY + rand(-5, 5), clampV(dx) + rand(-30, 30), clampV(dy) + rand(-70, -10), rand(0.8, 1.8), Math.random() < 0.4);
        }
      }
    }

    let tapDown: { x: number; y: number; t: number; id: number; target: EventTarget | null } | null = null;
    function onPointerDown(e: PointerEvent) {
      tapDown = { x: e.clientX, y: e.clientY, t: performance.now(), id: e.pointerId, target: e.target };
    }
    function onPointerUp(e: PointerEvent) {
      if (tapDown && e.pointerId === tapDown.id) {
        const dt = performance.now() - tapDown.t;
        const dist = Math.hypot(e.clientX - tapDown.x, e.clientY - tapDown.y);
        if (dt < 320 && dist < 12 && !REDUCED) {
          const t = tapDown.target as HTMLElement | null;
          const interactive = t && t.closest && t.closest('a,button,input,select,textarea,label,[role="dialog"],[data-no-fx]');
          if (!interactive) addFish(e.clientX, e.clientY);
          else addRipple(e.clientX, e.clientY, false);
        }
      }
      tapDown = null;
    }

    let lastFrame = performance.now();
    function frame(now: number) {
      const dt = Math.min(0.05, (now - lastFrame) / 1000) || 0.016;
      lastFrame = now;
      update(dt);
      drawBackground();
      drawParticles();
      drawRipples();
      drawDrops();
      for (let i = 0; i < fishes.length; i++) drawFish(fishes[i]);
      raf = requestAnimationFrame(frame);
    }

    const onScroll = () => { scrollYRaw = window.scrollY || 0; };
    const onVisibility = () => { lastFrame = performance.now(); };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerdown", onPointerDown, { passive: true });
    window.addEventListener("pointerup", onPointerUp, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointerup", onPointerUp);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 block"
    />
  );
}

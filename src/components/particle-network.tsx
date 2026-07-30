"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";

/**
 * Ambient constellation behind the hero.
 *
 * Tuned for elegance rather than density: fewer points, slower drift, hairline
 * links. The cursor is a gentle attractor — nearby particles lean toward it and
 * link to it in the accent colour, so the field feels aware of you without
 * swarming.
 *
 * Note the pointer listener is on `window`, not the canvas. The canvas is
 * pointer-events:none (it must be, or it would eat every click in the hero), so
 * a listener bound to the canvas can never fire.
 */

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  /** Phase offset so particles twinkle out of sync. */
  phase: number;
  /** Rendered position for this frame, including cursor lean. */
  rx: number;
  ry: number;
}

const CONFIG = {
  /** Scales with area so density is constant across screen sizes. */
  perMegapixel: 46,
  maxParticles: 110,
  linkDistance: 130,
  speed: 0.16,
  mouseRadius: 190,
  lean: 0.2,
};

export default function ParticleNetwork({
  className = "",
}: {
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: -9999, y: -9999, active: false });
  const rafRef = useRef<number | undefined>(undefined);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !mounted) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const isDark = resolvedTheme === "dark";
    // Matched to the palette: cream on ink lit by champagne, or soft ink on
    // ivory lit by bronze.
    const ink = isDark ? "242, 237, 226" : "36, 32, 27";
    const accent = isDark ? "226, 197, 140" : "150, 116, 68";

    let width = 0;
    let height = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.min(
        CONFIG.maxParticles,
        Math.round(((width * height) / 1_000_000) * CONFIG.perMegapixel),
      );
      const list: Particle[] = [];
      for (let i = 0; i < count; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        list.push({
          x,
          y,
          rx: x,
          ry: y,
          vx: (Math.random() - 0.5) * CONFIG.speed,
          vy: (Math.random() - 0.5) * CONFIG.speed,
          size: Math.random() * 1.4 + 0.7,
          phase: Math.random() * Math.PI * 2,
        });
      }
      particlesRef.current = list;
    };

    const draw = (ts: number) => {
      const t = ts / 1000;
      ctx.clearRect(0, 0, width, height);
      const ps = particlesRef.current;
      const m = mouseRef.current;

      for (const p of ps) {
        p.x += p.vx;
        p.y += p.vy;

        // Wrap rather than bounce — bouncing makes the edges legible.
        if (p.x < -10) p.x = width + 10;
        else if (p.x > width + 10) p.x = -10;
        if (p.y < -10) p.y = height + 10;
        else if (p.y > height + 10) p.y = -10;

        p.rx = p.x;
        p.ry = p.y;

        if (m.active) {
          const dx = m.x - p.x;
          const dy = m.y - p.y;
          const d = Math.hypot(dx, dy);
          if (d < CONFIG.mouseRadius && d > 0.001) {
            // Lean toward the cursor as a render offset only, so the underlying
            // drift is never disturbed and nothing clumps over time.
            const k = (1 - d / CONFIG.mouseRadius) * CONFIG.lean;
            p.rx += dx * k;
            p.ry += dy * k;
          }
        }

        const twinkle = 0.5 + 0.5 * Math.sin(t * 0.7 + p.phase);
        ctx.beginPath();
        ctx.arc(p.rx, p.ry, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${ink}, ${0.16 + twinkle * 0.2})`;
        ctx.fill();
      }

      // Links between neighbours.
      ctx.lineWidth = 0.6;
      for (let i = 0; i < ps.length; i++) {
        for (let j = i + 1; j < ps.length; j++) {
          const a = ps[i];
          const b = ps[j];
          const d = Math.hypot(a.rx - b.rx, a.ry - b.ry);
          if (d < CONFIG.linkDistance) {
            ctx.strokeStyle = `rgba(${ink}, ${(1 - d / CONFIG.linkDistance) * 0.13})`;
            ctx.beginPath();
            ctx.moveTo(a.rx, a.ry);
            ctx.lineTo(b.rx, b.ry);
            ctx.stroke();
          }
        }
      }

      // Links to the cursor, in the accent.
      if (m.active) {
        ctx.lineWidth = 0.85;
        for (const p of ps) {
          const d = Math.hypot(p.rx - m.x, p.ry - m.y);
          if (d < CONFIG.mouseRadius) {
            ctx.strokeStyle = `rgba(${accent}, ${(1 - d / CONFIG.mouseRadius) * 0.34})`;
            ctx.beginPath();
            ctx.moveTo(p.rx, p.ry);
            ctx.lineTo(m.x, m.y);
            ctx.stroke();
          }
        }
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    // Bound to window: the canvas itself is pointer-events:none, so a listener
    // attached to it would never receive an event.
    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      mouseRef.current = {
        x,
        y,
        active: x >= 0 && x <= rect.width && y >= 0 && y <= rect.height,
      };
    };
    const onLeave = () => {
      mouseRef.current.active = false;
    };

    resize();
    rafRef.current = requestAnimationFrame(draw);
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
    };
  }, [mounted, resolvedTheme]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 ${className}`}
      style={{
        width: "100%",
        height: "100%",
        opacity: mounted ? 1 : 0,
        transition: "opacity 1.2s ease-in-out",
      }}
    />
  );
}

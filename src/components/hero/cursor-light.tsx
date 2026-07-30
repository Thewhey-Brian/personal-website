"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

/**
 * A warm light source that follows the pointer across the hero.
 *
 * Two layers doing different jobs:
 *  - a wide, very soft wash that lifts the paper around the cursor
 *  - a tighter core that reads as the actual bulb
 *
 * The whole thing is positioned with gsap.quickTo on transforms only (never
 * top/left), so it composites on the GPU and costs nothing per frame. It sits
 * behind the hero content and is pointer-events:none, so it can never
 * intercept a click.
 */
export function CursorLight({ className = "" }: { className?: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const lightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const light = lightRef.current;
    if (!wrap || !light) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // A light that follows a finger you cannot see is just a bright blob.
    if (!window.matchMedia("(hover: hover)").matches) return;

    const xTo = gsap.quickTo(light, "x", {
      duration: 0.55,
      ease: "power2.out",
    });
    const yTo = gsap.quickTo(light, "y", {
      duration: 0.55,
      ease: "power2.out",
    });

    let visible = false;

    const onMove = (e: PointerEvent) => {
      const r = wrap.getBoundingClientRect();
      const inside =
        e.clientX >= r.left &&
        e.clientX <= r.right &&
        e.clientY >= r.top &&
        e.clientY <= r.bottom;

      if (inside !== visible) {
        visible = inside;
        gsap.to(light, {
          opacity: inside ? 1 : 0,
          duration: 0.5,
          ease: "power2.out",
        });
      }
      if (!inside) return;

      xTo(e.clientX - r.left);
      yTo(e.clientY - r.top);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  return (
    <div
      ref={wrapRef}
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      aria-hidden="true"
    >
      <div
        ref={lightRef}
        className="absolute left-0 top-0 opacity-0"
        style={{ willChange: "transform" }}
      >
        {/* wide wash */}
        <div
          className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            width: "44rem",
            height: "44rem",
            background:
              "radial-gradient(closest-side, var(--signal), transparent)",
            opacity: 0.1,
            filter: "blur(28px)",
          }}
        />
        {/* core */}
        <div
          className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            width: "15rem",
            height: "15rem",
            background:
              "radial-gradient(closest-side, var(--signal), transparent)",
            opacity: 0.14,
            filter: "blur(10px)",
          }}
        />
      </div>
    </div>
  );
}

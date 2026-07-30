"use client";

import { useCallback, useEffect, useRef } from "react";
import { gsap } from "gsap";

import { canTrackPointer, clamp, prefersReducedMotion } from "@/lib/motion";

/**
 * The hero character — a monitor-headed machine that watches the cursor.
 *
 * Rendering notes. Depth comes from stacked gradients and hand-placed shadows,
 * never from SVG filters: a filter on a group that GSAP transforms every frame
 * forces the whole subtree to re-rasterise, which is the usual reason these
 * characters stutter. An offset dark plate behind the chassis plus a radial
 * contact shadow buys the same volume for free.
 *
 * The rig is layered so motion reads as a body, not a moving picture:
 *
 *   float   slow idle bob
 *   └ head  parallax tilt + rotation toward the pointer  (lags, 0.7s)
 *     ├ eyes  track further and arrive sooner            (leads, 0.35s)
 *     ├ lids  irregular blink, occasional double
 *     └ sheen specular band slides against the turn
 *
 * That lead/lag difference between eyes and head is what makes it read as
 * attention rather than as a rigid transform.
 */

/* The screen stays dark in both themes — a lit panel is what makes it a
   monitor. Only the chassis follows the palette. */
const SCREEN_TOP = "#2A2420";
const SCREEN_BOTTOM = "#1B1613";
const PHOSPHOR = "#F4EFE4";

export function Robot({
  size = 150,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  const rootRef = useRef<SVGSVGElement>(null);
  const floatRef = useRef<SVGGElement>(null);
  const headRef = useRef<SVGGElement>(null);
  const eyesRef = useRef<SVGGElement>(null);
  const lidsRef = useRef<SVGGElement>(null);
  const sheenRef = useRef<SVGGElement>(null);

  // ---- pointer tracking ---------------------------------------------------
  useEffect(() => {
    const svg = rootRef.current;
    const head = headRef.current;
    const eyes = eyesRef.current;
    const sheen = sheenRef.current;
    if (!svg || !head || !eyes || !sheen) return;
    if (!canTrackPointer()) return;

    const headX = gsap.quickTo(head, "x", {
      duration: 0.7,
      ease: "power3.out",
    });
    const headY = gsap.quickTo(head, "y", {
      duration: 0.7,
      ease: "power3.out",
    });
    const headR = gsap.quickTo(head, "rotation", {
      duration: 0.85,
      ease: "power3.out",
    });
    const eyeX = gsap.quickTo(eyes, "x", {
      duration: 0.35,
      ease: "power2.out",
    });
    const eyeY = gsap.quickTo(eyes, "y", {
      duration: 0.35,
      ease: "power2.out",
    });
    const sheenX = gsap.quickTo(sheen, "x", {
      duration: 0.95,
      ease: "power2.out",
    });

    const onMove = (e: PointerEvent) => {
      const r = svg.getBoundingClientRect();
      const cx = clamp(
        (e.clientX - (r.left + r.width / 2)) / (window.innerWidth / 2),
      );
      const cy = clamp(
        (e.clientY - (r.top + r.height / 2)) / (window.innerHeight / 2),
      );

      headX(cx * 7);
      headY(cy * 4);
      headR(cx * 4.5);
      eyeX(cx * 6.5);
      eyeY(cy * 4.5);
      // Light travels against the turn, the way it catches curved glass.
      sheenX(cx * -30);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  // ---- idle float ---------------------------------------------------------
  useEffect(() => {
    const el = floatRef.current;
    if (!el || prefersReducedMotion()) return;
    const tween = gsap.to(el, {
      y: -6,
      duration: 2.8,
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1,
    });
    return () => {
      tween.kill();
    };
  }, []);

  // ---- blink --------------------------------------------------------------
  useEffect(() => {
    const lids = lidsRef.current;
    if (!lids || prefersReducedMotion()) return;

    let timer: ReturnType<typeof setTimeout>;
    const blink = () => {
      const tl = gsap.timeline();
      tl.to(lids, { scaleY: 1, duration: 0.06, ease: "power2.in" }).to(
        lids,
        { scaleY: 0, duration: 0.13, ease: "power2.out" },
        ">0.04",
      );
      // Real blinking isn't metronomic, and doubles happen.
      if (Math.random() > 0.72) {
        tl.to(lids, { scaleY: 1, duration: 0.06 }, ">0.13").to(lids, {
          scaleY: 0,
          duration: 0.13,
        });
      }
      timer = setTimeout(blink, 2800 + Math.random() * 4200);
    };
    timer = setTimeout(blink, 1500 + Math.random() * 2200);
    return () => clearTimeout(timer);
  }, []);

  /** Poke it: squash into the base, then spring back. */
  const nudge = useCallback(() => {
    const el = headRef.current;
    if (!el || prefersReducedMotion()) return;
    gsap
      .timeline()
      .to(el, {
        scaleX: 1.07,
        scaleY: 0.91,
        duration: 0.12,
        ease: "power2.out",
        transformOrigin: "50% 100%",
      })
      .to(el, {
        scaleX: 1,
        scaleY: 1,
        duration: 1.15,
        ease: "elastic.out(1, 0.32)",
      });
  }, []);

  return (
    <svg
      ref={rootRef}
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      onPointerDown={nudge}
      className={className}
      role="img"
      aria-label="A small monitor-headed robot that follows your cursor"
    >
      <defs>
        {/* chassis: light from top-left, so the gradient runs slightly diagonal */}
        <linearGradient id="rb-chassis" x1="0.15" y1="0" x2="0.7" y2="1">
          <stop offset="0%" stopColor="var(--surface-raised)" />
          <stop offset="55%" stopColor="var(--surface)" />
          <stop offset="100%" stopColor="var(--surface-raised)" />
        </linearGradient>

        <linearGradient id="rb-screen" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={SCREEN_TOP} />
          <stop offset="100%" stopColor={SCREEN_BOTTOM} />
        </linearGradient>

        {/* vignette pushes the corners back so the panel feels concave */}
        <radialGradient id="rb-vignette" cx="0.5" cy="0.45" r="0.72">
          <stop offset="55%" stopColor="#000" stopOpacity="0" />
          <stop offset="100%" stopColor="#000" stopOpacity="0.45" />
        </radialGradient>

        {/* inner shadow under the top bezel */}
        <linearGradient id="rb-inner" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#000" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#000" stopOpacity="0" />
        </linearGradient>

        <linearGradient id="rb-eye" x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0%" stopColor="#FFFDF7" />
          <stop offset="100%" stopColor={PHOSPHOR} />
        </linearGradient>

        <radialGradient id="rb-contact">
          <stop offset="0%" stopColor="var(--foreground)" stopOpacity="0.22" />
          <stop offset="100%" stopColor="var(--foreground)" stopOpacity="0" />
        </radialGradient>

        <radialGradient id="rb-bulb">
          <stop offset="0%" stopColor="var(--signal)" stopOpacity="0.55" />
          <stop offset="100%" stopColor="var(--signal)" stopOpacity="0" />
        </radialGradient>

        <clipPath id="rb-screen-clip">
          <rect x="48" y="38" width="104" height="72" rx="15" />
        </clipPath>
      </defs>

      {/* ground shadow stays put while the body floats above it */}
      <ellipse cx="100" cy="170" rx="44" ry="8" fill="url(#rb-contact)" />

      <g ref={floatRef}>
        {/* base */}
        <rect
          x="68"
          y="152"
          width="64"
          height="11"
          rx="5.5"
          fill="url(#rb-chassis)"
          stroke="var(--foreground)"
          strokeOpacity="0.22"
          strokeWidth="2"
        />
        {/* Neck, narrowing upward. Starts at y=108 so it tucks *behind* the
            chassis (drawn after it) rather than starting below the head — the
            previous 116→146 gap read as a severed floating head. */}
        <path
          d="M89 108 h22 l-3 46 h-16 z"
          fill="url(#rb-chassis)"
          stroke="var(--foreground)"
          strokeOpacity="0.22"
          strokeWidth="2"
          strokeLinejoin="round"
        />

        <g ref={headRef} style={{ transformOrigin: "100px 130px" }}>
          {/* antenna */}
          <line
            x1="100"
            y1="34"
            x2="100"
            y2="20"
            stroke="var(--foreground)"
            strokeOpacity="0.32"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <circle cx="100" cy="15" r="9" fill="url(#rb-bulb)" />
          <circle cx="100" cy="15" r="3.6" fill="var(--signal)">
            <animate
              attributeName="opacity"
              values="1;0.4;1"
              dur="2.8s"
              repeatCount="indefinite"
            />
          </circle>

          {/* offset plate — reads as a cast shadow without costing a filter */}
          <rect
            x="40"
            y="34"
            width="120"
            height="86"
            rx="26"
            fill="var(--foreground)"
            opacity="0.09"
          />

          {/* side knobs, drawn under the chassis so they tuck in */}
          <rect
            x="30"
            y="66"
            width="12"
            height="26"
            rx="6"
            fill="url(#rb-chassis)"
            stroke="var(--foreground)"
            strokeOpacity="0.22"
            strokeWidth="2"
          />
          <rect
            x="158"
            y="66"
            width="12"
            height="26"
            rx="6"
            fill="url(#rb-chassis)"
            stroke="var(--foreground)"
            strokeOpacity="0.22"
            strokeWidth="2"
          />

          {/* chassis */}
          <rect
            x="40"
            y="30"
            width="120"
            height="86"
            rx="26"
            fill="url(#rb-chassis)"
            stroke="var(--foreground)"
            strokeOpacity="0.26"
            strokeWidth="2.5"
          />
          {/* rim light along the top edge */}
          <path
            d="M62 33 h76"
            stroke="#FFF"
            strokeOpacity="0.5"
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* screen */}
          <rect
            x="48"
            y="38"
            width="104"
            height="72"
            rx="15"
            fill="url(#rb-screen)"
          />

          <g clipPath="url(#rb-screen-clip)">
            {/* scanlines */}
            {Array.from({ length: 12 }).map((_, i) => (
              <line
                key={i}
                x1="48"
                y1={40 + i * 6}
                x2="152"
                y2={40 + i * 6}
                stroke={PHOSPHOR}
                strokeOpacity="0.045"
                strokeWidth="2"
              />
            ))}

            <rect x="48" y="38" width="104" height="16" fill="url(#rb-inner)" />

            {/* eyes */}
            <g ref={eyesRef}>
              {[80, 120].map((cx) => (
                <g key={cx}>
                  {/* soft bloom so the phosphor looks emitted, not painted */}
                  <ellipse
                    cx={cx}
                    cy="72"
                    rx="15"
                    ry="16"
                    fill={PHOSPHOR}
                    opacity="0.1"
                  />
                  <rect
                    x={cx - 9}
                    y="60"
                    width="18"
                    height="24"
                    rx="9"
                    fill="url(#rb-eye)"
                  />
                  {/* two highlights — the large one sells the gloss */}
                  <ellipse
                    cx={cx - 3}
                    cy="66.5"
                    rx="3.6"
                    ry="4.4"
                    fill="#FFF"
                    opacity="0.85"
                  />
                  <circle
                    cx={cx + 3.6}
                    cy="78"
                    r="1.7"
                    fill="#FFF"
                    opacity="0.5"
                  />
                </g>
              ))}
            </g>

            {/* mouth */}
            <path
              d="M89 96 q11 8 22 0"
              stroke={PHOSPHOR}
              strokeOpacity="0.5"
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
            />

            {/* eyelids — scaleY 0 at rest, snap to 1 to blink */}
            <g
              ref={lidsRef}
              style={{ transform: "scaleY(0)", transformOrigin: "100px 52px" }}
            >
              <rect
                x="48"
                y="38"
                width="104"
                height="40"
                fill="url(#rb-screen)"
              />
            </g>

            {/* vignette above the contents, below the sheen */}
            <rect
              x="48"
              y="38"
              width="104"
              height="72"
              fill="url(#rb-vignette)"
            />

            {/* specular sweep */}
            <g ref={sheenRef}>
              <rect
                x="26"
                y="26"
                width="30"
                height="100"
                fill="#FFF"
                opacity="0.07"
                transform="rotate(16 41 76)"
              />
              <rect
                x="64"
                y="26"
                width="11"
                height="100"
                fill="#FFF"
                opacity="0.05"
                transform="rotate(16 69 76)"
              />
            </g>
          </g>

          {/* bezel inner edge, catching the same top-left light */}
          <rect
            x="48"
            y="38"
            width="104"
            height="72"
            rx="15"
            fill="none"
            stroke="#FFF"
            strokeOpacity="0.13"
            strokeWidth="1.5"
          />
        </g>
      </g>
    </svg>
  );
}

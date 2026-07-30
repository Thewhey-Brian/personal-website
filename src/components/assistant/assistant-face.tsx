"use client";

import { useCallback, useEffect, useRef } from "react";
import { gsap } from "gsap";

import { ASSISTANT } from "@/lib/assistant";

/**
 * The assistant's face — a single-celled organism that is also a terminal.
 *
 * Not a cute robot. The concept is a microorganism made of light: a membrane
 * ringed with cilia, a nucleus that doubles as an eye, and a double helix
 * scrolling behind it like output on a phosphor screen.
 *
 * The signature behaviour is chemotaxis. Real cells swim toward a chemical
 * gradient by beating their cilia asymmetrically — so the assistant's cilia bend
 * toward your cursor, strongest on the near side, tapering around the far side.
 * The result is an organism that visibly orients toward you. It is a genuine
 * piece of cell biology used as a microinteraction, which is exactly the joke.
 *
 * Cost: one RAF loop mutating ~22 rotate transforms, two quickTo tweens for the
 * nucleus, and no layout work. Idles fine on a phone.
 */

type ByteState = "idle" | "thinking" | "happy";

const CILIA_COUNT = 22;
const MEMBRANE_R = 30;
const CX = 50;
const CY = 50;

export function AssistantFace({
  size = 44,
  state = "idle",
  className = "",
}: {
  size?: number;
  state?: ByteState;
  className?: string;
}) {
  const rootRef = useRef<SVGSVGElement>(null);
  const nucleusRef = useRef<SVGGElement>(null);
  const lidRef = useRef<SVGGElement>(null);
  const helixRef = useRef<SVGGElement>(null);
  const ciliaRef = useRef<(SVGGElement | null)[]>([]);

  // Pointer direction in the organism's local frame, plus how far away it is.
  const pointer = useRef({ angle: 0, reach: 0 });
  const stateRef = useRef<ByteState>(state);
  stateRef.current = state;

  // --- chemotaxis: cilia bend toward the cursor ----------------------------
  useEffect(() => {
    const svg = rootRef.current;
    if (!svg) return;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const canHover = window.matchMedia("(hover: hover)").matches;

    const onMove = (e: PointerEvent) => {
      const r = svg.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      const dist = Math.hypot(dx, dy) || 1;
      pointer.current.angle = Math.atan2(dy, dx);
      // Saturate at ~280px so the organism reads as "aware of you" rather than
      // proportionally drifting across the whole viewport.
      pointer.current.reach = Math.min(dist / 280, 1);
    };

    if (canHover && !reduced) {
      window.addEventListener("pointermove", onMove, { passive: true });
    }

    // Current vs target tilt per cilium, eased each frame into a travelling wave.
    const tilt = new Float32Array(CILIA_COUNT);
    let frame = 0;
    let t0: number | null = null;

    const loop = (ts: number) => {
      if (t0 === null) t0 = ts;
      const t = (ts - t0) / 1000;
      const beat = stateRef.current === "thinking" ? 7.5 : 2.4;
      const { angle, reach } = pointer.current;

      for (let i = 0; i < CILIA_COUNT; i++) {
        const a = (i / CILIA_COUNT) * Math.PI * 2 - Math.PI / 2;
        // Cilia nearest the cursor bend hardest; the far side barely moves.
        const facing = Math.cos(a - angle);
        const gradient = Math.max(0, facing);
        const chemotaxis = Math.sin(a - angle) * -26 * reach * gradient;
        // Baseline metachronal wave — cilia beat in sequence, never in unison.
        const idle =
          Math.sin(t * beat - i * 0.55) *
          (stateRef.current === "thinking" ? 9 : 5);

        const target = chemotaxis + idle;
        tilt[i] += (target - tilt[i]) * 0.12;

        const el = ciliaRef.current[i];
        if (el) {
          el.setAttribute(
            "transform",
            `rotate(${(a * 180) / Math.PI + 90 + tilt[i]} ${CX} ${CY})`,
          );
        }
      }
      frame = requestAnimationFrame(loop);
    };

    if (!reduced) frame = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  // --- nucleus tracks the cursor -------------------------------------------
  useEffect(() => {
    const nucleus = nucleusRef.current;
    if (!nucleus) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(hover: hover)").matches) return;

    const xTo = gsap.quickTo(nucleus, "x", {
      duration: 0.55,
      ease: "power2.out",
    });
    const yTo = gsap.quickTo(nucleus, "y", {
      duration: 0.55,
      ease: "power2.out",
    });

    let frame = 0;
    const follow = () => {
      const { angle, reach } = pointer.current;
      xTo(Math.cos(angle) * reach * 6.5);
      yTo(Math.sin(angle) * reach * 6.5);
      frame = requestAnimationFrame(follow);
    };
    frame = requestAnimationFrame(follow);
    return () => cancelAnimationFrame(frame);
  }, []);

  // --- blinking -------------------------------------------------------------
  useEffect(() => {
    const lid = lidRef.current;
    if (!lid) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let timer: ReturnType<typeof setTimeout>;
    const blink = () => {
      gsap
        .timeline()
        .to(lid, { scaleY: 1, duration: 0.06, ease: "power2.in" })
        .to(lid, { scaleY: 0, duration: 0.13, ease: "power2.out" }, ">0.04");
      // Irregular — a metronome blink reads as mechanical.
      timer = setTimeout(blink, 2800 + Math.random() * 4500);
    };
    timer = setTimeout(blink, 1500 + Math.random() * 2500);
    return () => clearTimeout(timer);
  }, []);

  // --- helix scrolls behind the nucleus ------------------------------------
  useEffect(() => {
    const helix = helixRef.current;
    if (!helix) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const tween = gsap.to(helix, {
      x: -24,
      duration: state === "thinking" ? 1.1 : 3.4,
      ease: "none",
      repeat: -1,
    });
    return () => {
      tween.kill();
      gsap.set(helix, { x: 0 });
    };
  }, [state]);

  /** Poke it and the whole cell recoils, then settles. */
  const nudge = useCallback(() => {
    const el = rootRef.current;
    if (!el) return;
    gsap.fromTo(
      el,
      { scale: 0.86 },
      {
        scale: 1,
        duration: 1.1,
        ease: "elastic.out(1, 0.3)",
        transformOrigin: "50% 50%",
      },
    );
  }, []);

  return (
    <svg
      ref={rootRef}
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      onPointerDown={nudge}
      className={className}
      role="img"
      aria-label={`${ASSISTANT.name} assistant`}
    >
      <defs>
        <clipPath id="assistant-membrane">
          <circle cx={CX} cy={CY} r={MEMBRANE_R - 1} />
        </clipPath>
        <radialGradient id="assistant-cytoplasm">
          <stop offset="55%" stopColor="var(--signal)" stopOpacity="0.05" />
          <stop offset="100%" stopColor="var(--signal)" stopOpacity="0.2" />
        </radialGradient>
      </defs>

      {/* cilia — the chemotaxis ring */}
      <g>
        {Array.from({ length: CILIA_COUNT }).map((_, i) => (
          <g
            key={i}
            ref={(el) => {
              ciliaRef.current[i] = el;
            }}
          >
            {/* Drawn pointing "up" from the membrane; the RAF loop rotates it
                into position, so the transform is a single rotate. */}
            <path
              d={`M ${CX} ${CY - MEMBRANE_R} q 2.5 -5 0.5 -10`}
              stroke="var(--signal)"
              strokeWidth="1.6"
              strokeLinecap="round"
              fill="none"
              opacity="0.5"
            />
          </g>
        ))}
      </g>

      {/* membrane */}
      <circle cx={CX} cy={CY} r={MEMBRANE_R} fill="url(#assistant-cytoplasm)" />
      <circle
        cx={CX}
        cy={CY}
        r={MEMBRANE_R}
        stroke="var(--signal)"
        strokeWidth="1.8"
        opacity="0.75"
        fill="none"
      />

      <g clipPath="url(#assistant-membrane)">
        {/* double helix scrolling behind the nucleus, like terminal output */}
        <g ref={helixRef} opacity="0.3">
          {Array.from({ length: 7 }).map((_, i) => {
            const x = 14 + i * 12;
            return (
              <g key={i}>
                <path
                  d={`M ${x} 26 q 6 12 0 24`}
                  stroke="var(--signal)"
                  strokeWidth="1.1"
                  fill="none"
                />
                <path
                  d={`M ${x} 26 q -6 12 0 24`}
                  stroke="var(--signal)"
                  strokeWidth="1.1"
                  fill="none"
                />
                <line
                  x1={x - 2.6}
                  y1="38"
                  x2={x + 2.6}
                  y2="38"
                  stroke="var(--signal)"
                  strokeWidth="1"
                />
              </g>
            );
          })}
        </g>

        {/* organelles drifting in the cytoplasm */}
        {[
          [30, 66, 1.7],
          [70, 33, 1.3],
          [66, 70, 2.1],
        ].map(([x, y, r], i) => (
          <circle
            key={i}
            cx={x}
            cy={y}
            r={r}
            fill="var(--signal)"
            opacity="0.35"
          >
            <animate
              attributeName="opacity"
              values="0.35;0.12;0.35"
              dur={`${2.8 + i * 0.9}s`}
              repeatCount="indefinite"
            />
          </circle>
        ))}

        {/* nucleus — the eye */}
        <g ref={nucleusRef}>
          <circle cx={CX} cy={CY} r="14" fill="var(--signal)" opacity="0.14" />
          <circle
            cx={CX}
            cy={CY}
            r="14"
            stroke="var(--signal)"
            strokeWidth="1.3"
            opacity="0.5"
            fill="none"
          />
          {state === "happy" ? (
            // A contented squint: nucleus folds into an arc.
            <path
              d={`M ${CX - 8} ${CY + 2} q 8 -8 16 0`}
              stroke="var(--signal)"
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
            />
          ) : (
            <>
              <circle cx={CX} cy={CY} r="7" fill="var(--signal)" />
              {/* specular highlight — what makes it read as alive */}
              <circle
                cx={CX - 2.6}
                cy={CY - 2.8}
                r="2.2"
                fill="var(--background)"
                opacity="0.75"
              />
            </>
          )}

          {/* eyelid */}
          <g
            ref={lidRef}
            style={{
              transform: "scaleY(0)",
              transformOrigin: `${CX}px ${CY - 14}px`,
            }}
          >
            <rect
              x={CX - 15}
              y={CY - 15}
              width="30"
              height="30"
              fill="var(--background)"
              opacity="0.92"
            />
          </g>
        </g>
      </g>
    </svg>
  );
}

"use client";

import { useRef, type ElementType, type ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

import { canTrackPointer, prefersReducedMotion } from "@/lib/motion";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * Motion primitives.
 *
 * One rule governs all of them: **markup renders visible**. Nothing here is
 * hidden by a CSS class or an inline style. Each component arms its own
 * from-state inside useGSAP — which runs in useLayoutEffect, before paint — so
 * there is no flash, and a dead tween, a paused ticker, a background tab or no
 * JS at all degrades to readable content instead of a blank page.
 *
 * An earlier version hid content via CSS and revealed it with JS. It cost us a
 * permanently invisible hero heading. Don't reintroduce that.
 */

/** Common ScrollTrigger config: fire once, never replay on scroll-back. */
const once = (trigger: Element | null, start = "top 85%") => ({
  trigger,
  start,
  once: true,
});

/**
 * Masked line reveal — the site's primary heading treatment. Each line is
 * clipped by its own wrapper and rises into place.
 *
 * Lines are plain strings, not JSX, and accented words are named separately.
 * Passing an array of elements through a prop makes React validate it as a
 * child list and warn about missing keys, which is noise the caller shouldn't
 * have to manage for what is really just text.
 */
export function RevealLines({
  lines,
  accent,
  as: Tag = "h2",
  className = "",
  lineClassName = "",
  delay = 0,
  trigger = "load",
}: {
  lines: string[];
  /** Words rendered in the accent colour, matched case-insensitively. */
  accent?: string[];
  as?: ElementType;
  className?: string;
  lineClassName?: string;
  delay?: number;
  trigger?: "load" | "scroll";
}) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const targets = gsap.utils.toArray<HTMLElement>(
        "[data-reveal-line]",
        root.current,
      );
      if (!targets.length) return;

      gsap.set(targets, { yPercent: 115 });
      gsap.to(targets, {
        yPercent: 0,
        duration: 1.05,
        ease: "expo.out",
        stagger: 0.075,
        delay,
        ...(trigger === "scroll"
          ? { scrollTrigger: once(root.current, "top 82%") }
          : {}),
      });
    },
    { scope: root },
  );

  const accented = new Set((accent ?? []).map((w) => w.toLowerCase()));
  const bare = (w: string) => w.toLowerCase().replace(/[^a-z']/g, "");

  return (
    <Tag ref={root} className={className} aria-label={lines.join(" ")}>
      {lines.map((line, i) => (
        <span key={i} className="reveal-mask" aria-hidden="true">
          <span data-reveal-line className={lineClassName}>
            {line.split(" ").map((word, j, all) => (
              <span
                key={j}
                className={accented.has(bare(word)) ? "text-signal" : undefined}
              >
                {word}
                {j < all.length - 1 ? " " : ""}
              </span>
            ))}
          </span>
        </span>
      ))}
    </Tag>
  );
}

/**
 * Per-word masked reveal for display copy. Wrapping is left to the browser, so
 * this stays correct at every viewport width.
 *
 * The full sentence is preserved for assistive tech via aria-label and the
 * fragments hidden — a screen reader announcing fourteen separate words is
 * unusable.
 */
export function RevealWords({
  text,
  as: Tag = "h2",
  className = "",
  highlight,
  delay = 0,
}: {
  text: string;
  as?: ElementType;
  className?: string;
  /** Words matching this set render in the accent colour. */
  highlight?: string[];
  delay?: number;
}) {
  const root = useRef<HTMLElement>(null);
  const words = text.split(" ");
  const accent = new Set((highlight ?? []).map((w) => w.toLowerCase()));

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const targets = gsap.utils.toArray<HTMLElement>(
        "[data-reveal-line]",
        root.current,
      );
      if (!targets.length) return;

      gsap.set(targets, { yPercent: 115 });
      gsap.to(targets, {
        yPercent: 0,
        duration: 0.95,
        ease: "expo.out",
        stagger: 0.035,
        delay,
        scrollTrigger: once(root.current, "top 85%"),
      });
    },
    { scope: root },
  );

  return (
    <Tag ref={root} className={className} aria-label={text}>
      {words.map((word, i) => (
        <span
          key={i}
          className="reveal-mask"
          aria-hidden="true"
          // inline-block keeps each word a box the parent can still wrap on
          style={{ display: "inline-block", verticalAlign: "bottom" }}
        >
          <span
            data-reveal-line
            className={
              accent.has(word.toLowerCase().replace(/[^a-z]/g, ""))
                ? "text-signal"
                : undefined
            }
          >
            {word}
            {i < words.length - 1 ? " " : ""}
          </span>
        </span>
      ))}
    </Tag>
  );
}

/**
 * Fade + rise for anything that isn't a heading. Fires once on scroll-in and
 * deliberately never replays — repeated entrance animation is the fastest way
 * for a site to feel cheap.
 */
export function Reveal({
  children,
  className = "",
  delay = 0,
  y = 16,
  stagger,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  /** When set, animates direct children in sequence instead of the box. */
  stagger?: number;
}) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = root.current;
      if (!el || prefersReducedMotion()) return;

      const targets = stagger != null ? Array.from(el.children) : [el];
      if (!targets.length) return;

      gsap.set(targets, { opacity: 0, y });
      gsap.to(targets, {
        opacity: 1,
        y: 0,
        duration: 0.9,
        ease: "expo.out",
        delay,
        stagger: stagger ?? 0,
        scrollTrigger: once(el, "top 88%"),
      });
    },
    { scope: root },
  );

  return (
    <div ref={root} className={className}>
      {children}
    </div>
  );
}

/**
 * Magnetic proximity. The element drifts toward the cursor within `radius`.
 * Reserved for things we want clicked — it reads as a directional cue, so
 * applying it broadly destroys the signal.
 */
export function Magnetic({
  children,
  className = "",
  strength = 0.32,
  radius = 80,
}: {
  children: ReactNode;
  className?: string;
  strength?: number;
  radius?: number;
}) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = root.current;
      if (!el || !canTrackPointer()) return;

      const xTo = gsap.quickTo(el, "x", { duration: 0.5, ease: "power3.out" });
      const yTo = gsap.quickTo(el, "y", { duration: 0.5, ease: "power3.out" });

      const onMove = (e: PointerEvent) => {
        const r = el.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);

        if (Math.hypot(dx, dy) < radius + Math.max(r.width, r.height) / 2) {
          xTo(dx * strength);
          yTo(dy * strength);
        } else {
          xTo(0);
          yTo(0);
        }
      };

      window.addEventListener("pointermove", onMove, { passive: true });
      return () => window.removeEventListener("pointermove", onMove);
    },
    { scope: root },
  );

  return (
    <div ref={root} className={className}>
      {children}
    </div>
  );
}

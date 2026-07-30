"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Owns the single Lenis instance for the app and wires it to GSAP.
 *
 * The three lines that matter:
 *  1. Lenis tells ScrollTrigger to recompute on every scroll frame.
 *  2. GSAP's ticker drives Lenis' RAF, so there is exactly one loop.
 *  3. lagSmoothing(0) stops GSAP from "catching up" after a tab is backgrounded,
 *     which otherwise makes pinned sections jump on return.
 */
export function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    gsap.registerPlugin(ScrollTrigger);

    if (prefersReduced) return;

    const lenis = new Lenis({
      lerp: 0.1,
      wheelMultiplier: 1,
      smoothWheel: true,
      // Touch devices already have native momentum; doubling it feels sticky.
      syncTouch: false,
    });

    lenis.on("scroll", ScrollTrigger.update);

    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(raf);
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}

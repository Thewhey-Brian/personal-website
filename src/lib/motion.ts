/**
 * Motion capability checks, in one place.
 *
 * Every animated component needs the same two questions answered: may I move,
 * and is there a real pointer to react to. Duplicating matchMedia calls made it
 * easy to forget one and ship an effect that jitters on touch or ignores a
 * reduced-motion preference.
 */

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return true;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** True only for devices with a real hover-capable pointer. */
export function hasFinePointer(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
}

/** Pointer-driven effects need both: permission to move and a cursor to track. */
export function canTrackPointer(): boolean {
  return !prefersReducedMotion() && hasFinePointer();
}

export const clamp = (v: number, min = -1, max = 1) =>
  Math.min(max, Math.max(min, v));

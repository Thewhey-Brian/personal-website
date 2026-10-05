"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

import { canTrackPointer, prefersReducedMotion } from "@/lib/motion";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * Career as a genome-browser view: a coordinate axis in years, one track per
 * kind of work, features as bars and papers/notes as point "variants".
 *
 * The axis is zoomed like a browser focused on a region of interest: early
 * years are compressed and the last months get most of the width, because
 * that is where most of the ongoing work sits.
 */

type TrackId =
  "education" | "research" | "industry" | "projects" | "papers" | "products";

export interface TrackFeature {
  id: string;
  track: TrackId;
  start: number; // fractional year
  end: number; // fractional year; equal to start for point features
  label: string;
  detail: string;
  href?: string;
  tag?: string; // short label drawn on the chart (papers: journal)
  lead?: boolean; // first-author paper
}

const AXIS_START = 2018;

const TRACK_STYLE: Record<
  TrackId,
  { color: string; label: { en: string; zh: string } }
> = {
  education: {
    color: "var(--chart-4)",
    label: { en: "education", zh: "教育" },
  },
  research: { color: "var(--signal)", label: { en: "research", zh: "研究" } },
  industry: { color: "var(--chart-5)", label: { en: "industry", zh: "业界" } },
  projects: {
    color: "var(--foreground)",
    label: { en: "projects", zh: "项目" },
  },
  papers: {
    color: "var(--secondary-signal)",
    label: { en: "papers", zh: "论文" },
  },
  products: {
    color: "var(--chart-3)",
    label: { en: "products", zh: "产品" },
  },
};

const TRACK_ORDER: TrackId[] = [
  "education",
  "research",
  "industry",
  "projects",
  "papers",
  "products",
];

const MONTHS = {
  en: [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ],
  zh: [
    "1月",
    "2月",
    "3月",
    "4月",
    "5月",
    "6月",
    "7月",
    "8月",
    "9月",
    "10月",
    "11月",
    "12月",
  ],
};

const LANE = 20; // px per stacked lane
const PAPERS_H = 112; // px; the papers track is drawn as labelled lollipops

const trackHeight = (t: { id: TrackId; lanes: number }) =>
  t.id === "papers" ? PAPERS_H : t.lanes * LANE + 22;

/**
 * Lollipop layout for papers: each stem sits at the paper's date on the
 * axis; heads are spread apart (alternating two rows) so every journal name
 * stays legible even when several papers share a year.
 */
function layoutPapers(
  papers: TrackFeature[],
  toPct: (y: number) => number,
  maxPct: number,
) {
  const sorted = [...papers].sort((a, b) => a.start - b.start);
  const n = sorted.length;
  const gap = 8.5; // % between neighbouring heads (they alternate rows)
  const span = (n - 1) * gap;
  const xs = sorted.map((p) => toPct(p.start));
  const centre = xs.reduce((a, b) => a + b, 0) / Math.max(n, 1);
  const first = Math.min(Math.max(centre - span / 2, 3), maxPct - span);
  return sorted.map((p, i) => ({
    ...p,
    stemX: xs[i],
    headX: first + i * gap,
    headY: i % 2 === 0 ? 26 : 60,
  }));
}
const POINT_PCT = 0.9; // visual width a point feature occupies when packing

/** Piecewise-linear zoom: [year, % of axis] stops. */
function makeScale(now: number) {
  const end = now + 0.14;
  const stops: [number, number][] = [
    [AXIS_START, 0],
    [2022, 16],
    [2025, 36],
    [2026.5, 62],
    [end, 100],
  ];
  const toPct = (y: number) => {
    if (y <= stops[0][0]) return 0;
    for (let i = 1; i < stops.length; i++) {
      const [y0, p0] = stops[i - 1];
      const [y1, p1] = stops[i];
      if (y <= y1) return p0 + ((y - y0) / (y1 - y0)) * (p1 - p0);
    }
    return 100;
  };
  const toYear = (p: number) => {
    for (let i = 1; i < stops.length; i++) {
      const [y0, p0] = stops[i - 1];
      const [y1, p1] = stops[i];
      if (p <= p1) return y0 + ((p - p0) / (p1 - p0)) * (y1 - y0);
    }
    return end;
  };
  // How much wider a month is in the zoomed region than in the early years.
  const zoom = Math.round(
    (stops[4][1] - stops[3][1]) /
      (stops[4][0] - stops[3][0]) /
      ((stops[1][1] - stops[0][1]) / (stops[1][0] - stops[0][0])),
  );
  return { toPct, toYear, end, stops, zoom };
}

const fmt = (y: number) => {
  const year = Math.floor(y);
  const month = Math.min(11, Math.floor((y - year) * 12));
  return `${year}.${String(month + 1).padStart(2, "0")}`;
};

/** Greedy lane packing in screen space, as genome browsers stack features. */
function pack(features: TrackFeature[], toPct: (y: number) => number) {
  const lanes: number[] = [];
  return [...features]
    .sort((a, b) => a.start - b.start)
    .map((f) => {
      const left = toPct(f.start);
      const right = Math.max(toPct(f.end), left + POINT_PCT) + 0.4;
      let lane = lanes.findIndex((end) => end <= left);
      if (lane === -1) {
        lane = lanes.length;
        lanes.push(0);
      }
      lanes[lane] = right;
      return { ...f, lane, left, width: toPct(f.end) - left };
    });
}

export function CareerTracks({
  features,
  locale = "en",
  now,
}: {
  features: TrackFeature[];
  locale?: "en" | "zh";
  now: number;
}) {
  const zh = locale === "zh";
  const scale = useMemo(() => makeScale(now), [now]);

  const tracks = useMemo(
    () =>
      TRACK_ORDER.map((id) => {
        const packed = pack(
          features.filter((f) => f.track === id),
          scale.toPct,
        );
        const lanes = Math.max(1, ...packed.map((f) => f.lane + 1));
        return { id, packed, lanes };
      }).filter((t) => t.packed.length > 0),
    [features, scale],
  );

  const papers = useMemo(
    () =>
      layoutPapers(
        features.filter((f) => f.track === "papers"),
        scale.toPct,
        scale.stops[3][1] - 2,
      ),
    [features, scale],
  );

  const initial = features.find((f) => f.id === "yale") ?? features[0];
  const [active, setActive] = useState<TrackFeature>(initial);

  // Year ticks, then month ticks inside the zoomed region.
  const ticks = useMemo(() => {
    const out: { at: number; label: string; major: boolean }[] = [];
    for (let y = AXIS_START; y <= Math.floor(now); y++)
      out.push({
        at: y,
        // The compressed early years only have room for every other label.
        label: y < 2022 && y % 2 === 1 ? "" : String(y),
        major: true,
      });
    const zoomStart = scale.stops[3][0];
    for (let m = Math.ceil(zoomStart * 12); m / 12 < scale.end; m++) {
      const at = m / 12;
      if (Number.isInteger(at)) continue;
      out.push({ at, label: MONTHS[locale][m % 12], major: false });
    }
    return out;
  }, [now, scale, locale]);

  const root = useRef<HTMLElement>(null);
  const plot = useRef<HTMLDivElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const crossX = useRef<((v: number) => void) | null>(null);

  const { contextSafe } = useGSAP(
    () => {
      // On narrow screens the plot scrolls sideways; start at the recent end.
      if (scroller.current)
        scroller.current.scrollLeft = scroller.current.scrollWidth;

      const q = gsap.utils.selector(root);
      const cross = q("[data-cross]")[0];
      if (cross)
        crossX.current = gsap.quickTo(cross, "x", {
          duration: 0.35,
          ease: "power3.out",
        });

      // Markup renders visible; from-states are armed here, pre-paint, so a
      // failed tween or no JS still leaves a readable chart.
      if (prefersReducedMotion()) return;

      const bars = q("[data-bar]");
      const points = q("[data-point]");

      gsap.set(q("[data-axis]"), { scaleX: 0, transformOrigin: "left center" });
      gsap.set(q("[data-tick]"), { opacity: 0, y: 6 });
      gsap.set(q("[data-track-label]"), { opacity: 0, x: -10 });
      gsap.set(bars, { scaleX: 0, transformOrigin: "left center" });
      gsap.set(points, { scaleY: 0, transformOrigin: "center bottom" });
      gsap.set(q("[data-stem]"), { opacity: 0 });
      gsap.set(q("[data-head]"), { scale: 0, transformOrigin: "left center" });
      gsap.set(q("[data-now]"), { scaleY: 0, transformOrigin: "top center" });
      gsap.set(q("[data-zoom-band]"), { opacity: 0 });
      gsap.set(q("[data-inspector]"), { opacity: 0, y: 12 });

      // Bars grow in the order they happened, so the timeline plays forward.
      const byTime = (els: Element[]) =>
        [...els].sort(
          (a, b) =>
            Number((a as HTMLElement).dataset.t) -
            Number((b as HTMLElement).dataset.t),
        );

      const tl = gsap.timeline({
        defaults: { ease: "expo.out" },
        scrollTrigger: { trigger: root.current, start: "top 75%", once: true },
      });
      tl.to(q("[data-axis]"), { scaleX: 1, duration: 1.1 }, 0)
        .to(
          q("[data-tick]"),
          { opacity: 1, y: 0, duration: 0.6, stagger: 0.025 },
          0.15,
        )
        .to(
          q("[data-track-label]"),
          { opacity: 1, x: 0, duration: 0.7, stagger: 0.06 },
          0.1,
        )
        .to(
          q("[data-zoom-band]"),
          { opacity: 1, duration: 1.2, ease: "sine.out" },
          0.4,
        )
        .to(byTime(bars), { scaleX: 1, duration: 1.1, stagger: 0.045 }, 0.35)
        .to(
          byTime(points),
          { scaleY: 1, duration: 0.7, ease: "back.out(2.6)", stagger: 0.03 },
          0.7,
        )
        .to(q("[data-stem]"), { opacity: 1, duration: 0.8, stagger: 0.04 }, 0.8)
        .to(
          byTime(q("[data-head]")),
          { scale: 1, duration: 0.8, ease: "back.out(2.2)", stagger: 0.07 },
          0.95,
        )
        .to(
          q("[data-now]"),
          { scaleY: 1, duration: 0.9, ease: "power3.inOut" },
          1.1,
        )
        .to(q("[data-inspector]"), { opacity: 1, y: 0, duration: 0.8 }, 1.3);

      // The present keeps a slow pulse, like a live cursor.
      gsap.to(q("[data-now-dot]"), {
        scale: 2.2,
        opacity: 0,
        duration: 1.6,
        ease: "sine.out",
        repeat: -1,
        delay: 2,
      });
    },
    { scope: root, dependencies: [] },
  );

  /** Focus one feature: lift it, dim the rest, swap the inspector. */
  const focus = contextSafe((f: TrackFeature) => {
    const q = gsap.utils.selector(root);
    const reduced = prefersReducedMotion();
    const d = reduced ? 0 : 0.35;
    const others = `:not([data-visual="${f.id}"])`;
    gsap.to(q(`[data-visual]${others}`), {
      opacity: 0.3,
      duration: d,
      overwrite: "auto",
    });
    gsap.to(q(`[data-bar]${others}, [data-point]${others}`), { scaleY: 1, duration: d });
    gsap.to(q(`[data-head]${others}`), { scale: 1, duration: d });
    gsap.to(q("[data-stem-for]"), { opacity: 0.25, duration: d });
    gsap.to(q(`[data-stem-for="${f.id}"]`), { opacity: 1, duration: d });

    const target = q(`[data-visual="${f.id}"]`);
    const isHead = target[0]?.hasAttribute("data-head");
    gsap.to(target, {
      opacity: 1,
      ...(isHead ? { scale: reduced ? 1 : 1.15 } : { scaleY: reduced ? 1 : 1.5 }),
      duration: reduced ? 0 : 0.5,
      ease: "back.out(3)",
    });
    if (f.id !== active.id) {
      setActive(f);
      if (!reduced)
        gsap.fromTo(
          q("[data-inspector-body]"),
          { opacity: 0, y: 10 },
          {
            opacity: 1,
            y: 0,
            duration: 0.5,
            ease: "expo.out",
            overwrite: "auto",
          },
        );
    }
  });

  const release = contextSafe(() => {
    const q = gsap.utils.selector(root);
    const d = prefersReducedMotion() ? 0 : 0.4;
    gsap.to(q("[data-visual]"), { opacity: 0.85, duration: d });
    gsap.to(q("[data-bar], [data-point]"), { scaleY: 1, duration: d });
    gsap.to(q("[data-head]"), { scale: 1, duration: d });
    gsap.to(q("[data-stem-for]"), { opacity: 0.55, duration: d });
    gsap.to(q("[data-cross]"), { opacity: 0, duration: 0.25 });
  });

  // Crosshair that follows the pointer with a date readout, like a browser ruler.
  const [crossDate, setCrossDate] = useState("");
  const onMove = contextSafe((e: React.PointerEvent<HTMLDivElement>) => {
    if (!canTrackPointer() || !plot.current) return;
    const r = plot.current.getBoundingClientRect();
    const x = e.clientX - r.left;
    if (x < 0 || x > r.width) return;
    crossX.current?.(x);
    gsap.to(gsap.utils.selector(root)("[data-cross]"), {
      opacity: 1,
      duration: 0.2,
    });
    setCrossDate(fmt(scale.toYear((x / r.width) * 100)));
  });

  const nowPct = scale.toPct(now);
  const zoomLeft = scale.toPct(scale.stops[3][0]);

  return (
    <section
      ref={root}
      id="tracks"
      className="scroll-mt-16 border-t border-border"
      aria-labelledby="tracks-title"
    >
      <div className="container mx-auto max-w-5xl px-6 py-20 md:py-24">
        <div className="mb-8 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
          <h2 id="tracks-title" className="label-mono !text-foreground">
            {zh ? "职业轨迹" : "Career tracks"}
          </h2>
          <span className="font-mono text-xs text-muted-foreground">
            chr<span className="text-signal">XG</span>:{AXIS_START}–
            {Math.floor(now)}
            <span className="mx-2 text-border">|</span>
            {zh
              ? `近几个月放大 ×${scale.zoom}`
              : `zoom ×${scale.zoom} on recent months`}
          </span>
        </div>

        <div
          ref={scroller}
          className="overflow-x-auto pb-2 [scrollbar-width:thin]"
        >
          <div className="min-w-[720px]">
            {/* coordinate axis */}
            <div className="grid grid-cols-[6.5rem_1fr] items-end">
              <span className="sticky left-0 z-20 self-stretch bg-background" />
              <div className="relative h-8">
                <span
                  data-axis
                  className="absolute inset-x-0 bottom-0 h-px bg-foreground/30"
                />
                {ticks.map((t) => (
                  <span
                    key={`${t.at}`}
                    // The first label hangs right of its tick so it isn't clipped.
                    className={`absolute bottom-0 ${t.at === AXIS_START ? "" : "-translate-x-1/2"}`}
                    style={{ left: `${scale.toPct(t.at)}%` }}
                  >
                    <span
                      data-tick
                      className="flex flex-col items-center whitespace-nowrap"
                    >
                      <span
                        className={`font-mono ${
                          t.major
                            ? "text-[10px] text-muted-foreground"
                            : "text-[9px] text-muted-foreground/70"
                        }`}
                      >
                        {t.label}
                      </span>
                      <span
                        className={`mt-1 w-px ${t.major ? "h-2 bg-foreground/40" : "h-1 bg-foreground/25"}`}
                      />
                    </span>
                  </span>
                ))}
              </div>
            </div>

            {/* tracks */}
            <div
              className="relative grid grid-cols-[6.5rem_1fr]"
              onPointerMove={onMove}
              onPointerLeave={release}
            >
              <div className="sticky left-0 z-20 bg-background">
                {tracks.map((track) => (
                  <div
                    key={track.id}
                    className="flex items-center border-b border-border/70 font-mono text-[11px] uppercase tracking-[0.1em] text-muted-foreground"
                    style={{ height: `${trackHeight(track)}px` }}
                  >
                    <span data-track-label className="flex items-center gap-2">
                      <span
                        className="h-2 w-2 rounded-[1px]"
                        style={{ background: TRACK_STYLE[track.id].color }}
                        aria-hidden="true"
                      />
                      {TRACK_STYLE[track.id].label[locale]}
                    </span>
                  </div>
                ))}
              </div>

              <div ref={plot} className="relative">
                {/* zoomed region, shaded so the change of scale is visible */}
                <div
                  data-zoom-band
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-y-0 right-0 bg-signal-soft"
                  style={{ left: `${zoomLeft}%` }}
                />

                {/* crosshair */}
                <div
                  data-cross
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-y-0 left-0 z-10 w-px bg-foreground/35 opacity-0"
                >
                  <span className="absolute -bottom-6 left-1.5 whitespace-nowrap rounded-sm bg-foreground px-1.5 py-0.5 font-mono text-[10px] text-background">
                    {crossDate}
                  </span>
                </div>

                {/* now */}
                <div
                  data-now
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-y-0 z-10 w-px bg-signal"
                  style={{ left: `${nowPct}%` }}
                >
                  <span className="absolute -left-[3px] -top-[3px] h-[7px] w-[7px] rounded-full bg-signal" />
                  <span
                    data-now-dot
                    className="absolute -left-[3px] -top-[3px] h-[7px] w-[7px] rounded-full bg-signal"
                  />
                  <span className="absolute -top-1.5 left-2 whitespace-nowrap font-mono text-[9px] uppercase tracking-[0.12em] text-signal">
                    {zh ? "现在" : "now"}
                  </span>
                </div>

                {tracks.map((track) => {
                  const color = TRACK_STYLE[track.id].color;
                  return (
                    <div
                      key={track.id}
                      className="relative border-b border-border/70"
                      style={{ height: `${trackHeight(track)}px` }}
                    >
                      {track.id === "papers" && (
                        <svg
                          aria-hidden="true"
                          className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
                          viewBox={`0 0 100 ${PAPERS_H}`}
                          preserveAspectRatio="none"
                        >
                          {papers.map((p) => (
                            <polyline
                              key={p.id}
                              data-stem
                              data-stem-for={p.id}
                              points={`${p.stemX},${PAPERS_H} ${p.stemX},${PAPERS_H - 12} ${p.headX},${p.headY + 7}`}
                              fill="none"
                              stroke={color}
                              strokeWidth={1}
                              vectorEffect="non-scaling-stroke"
                              opacity={0.55}
                            />
                          ))}
                        </svg>
                      )}
                      {track.id === "papers" &&
                        papers.map((p) => (
                          <span
                            key={`${p.id}-dot`}
                            data-stem
                            aria-hidden="true"
                            className="absolute bottom-0 h-[7px] w-[7px] -translate-x-1/2 translate-y-1/2 rounded-full"
                            style={{ left: `${p.stemX}%`, background: color }}
                          />
                        ))}
                      {track.id === "papers" &&
                        papers.map((p) => {
                          const isActive = active.id === p.id;
                          const common = {
                            onPointerEnter: () => focus(p),
                            onFocus: () => focus(p),
                            "aria-label": `${p.label}, ${p.detail}`,
                            className:
                              "absolute block -translate-x-1/2 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring",
                            style: { left: `${p.headX}%`, top: `${p.headY}px` },
                          };
                          const inner = (
                            <span
                              data-visual={p.id}
                              data-head
                              data-t={p.start}
                              className="flex items-center gap-1.5 whitespace-nowrap rounded-full border bg-background py-0.5 pl-1 pr-2 font-mono text-[10px] leading-none"
                              style={{
                                borderColor: color,
                                color: isActive ? "var(--foreground)" : "var(--muted-foreground)",
                                opacity: 0.85,
                                boxShadow: isActive ? `0 0 0 2px ${color}` : undefined,
                              }}
                            >
                              <span
                                className="h-2.5 w-2.5 rounded-full border"
                                style={{
                                  borderColor: color,
                                  background: p.lead ? color : "transparent",
                                }}
                              />
                              {p.tag}
                            </span>
                          );
                          return p.href ? (
                            <Link key={p.id} href={p.href} {...common}>
                              {inner}
                            </Link>
                          ) : (
                            <button key={p.id} type="button" {...common}>
                              {inner}
                            </button>
                          );
                        })}
                      {track.id !== "papers" && track.packed.map((f) => {
                        const point = f.end - f.start < 0.02;
                        const isActive = active.id === f.id;
                        const box = {
                          left: point ? `calc(${f.left}% - 3px)` : `${f.left}%`,
                          width: point ? "6px" : `${Math.max(f.width, 0.5)}%`,
                          top: `${11 + f.lane * LANE}px`,
                        };
                        const inner = (
                          <span
                            data-visual={f.id}
                            {...(point
                              ? { "data-point": "" }
                              : { "data-bar": "" })}
                            data-t={f.start}
                            className="block h-full w-full rounded-[2px]"
                            style={{
                              background: color,
                              opacity: 0.8,
                              boxShadow: isActive
                                ? `0 0 0 1.5px var(--background), 0 0 0 3px ${color}`
                                : undefined,
                            }}
                          />
                        );
                        const common = {
                          onPointerEnter: () => focus(f),
                          onFocus: () => focus(f),
                          "aria-label": `${f.label}, ${fmt(f.start)}${point ? "" : `–${fmt(f.end)}`}`,
                          className:
                            "absolute block h-3.5 outline-none focus-visible:ring-2 focus-visible:ring-ring",
                          style: box,
                        };
                        return f.href ? (
                          <Link key={f.id} href={f.href} {...common}>
                            {inner}
                          </Link>
                        ) : (
                          <button key={f.id} type="button" {...common}>
                            {inner}
                          </button>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* inspector: the record under the cursor */}
        <div
          data-inspector
          className="mt-6 border-l-2 pl-4 transition-[border-color] duration-500"
          style={{ borderColor: TRACK_STYLE[active.track].color }}
          aria-live="polite"
        >
          <div
            data-inspector-body
            className="grid gap-1 sm:grid-cols-[8.5rem_1fr] sm:gap-x-6"
          >
            <span className="font-mono text-xs text-muted-foreground sm:pt-1.5">
              {fmt(active.start)}
              {active.end - active.start >= 0.02
                ? ` – ${active.end >= now - 0.01 ? (zh ? "至今" : "now") : fmt(active.end)}`
                : ""}
            </span>
            <div className="min-w-0">
              <p className="text-lg font-semibold leading-snug">
                {active.href ? (
                  <Link href={active.href} className="link-wipe">
                    {active.label}
                  </Link>
                ) : (
                  active.label
                )}
              </p>
              <p className="mt-0.5 text-[15px] text-muted-foreground">
                {active.detail}
              </p>
            </div>
          </div>
        </div>
        <p className="mt-4 font-mono text-[11px] text-muted-foreground/80">
          {zh
            ? "悬停或用 Tab 键查看每一段；点击打开详情。"
            : "Hover or tab through a feature to inspect it; click to open."}
        </p>
      </div>
    </section>
  );
}

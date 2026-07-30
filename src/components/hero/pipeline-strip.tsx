"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";

/**
 * The hero's signature graphic: Xinyu's actual research pipeline, drawn as four
 * legible micro-visualisations with a pulse of light travelling left to right.
 *
 * The point is comprehension, not spectacle — a visitor should understand the
 * shape of the work (variant -> expression -> tissue -> trait) in one glance,
 * without reading a caption. Hovering a stage pins it and explains it.
 *
 * Deliberately 2D canvas: four ~200x96 surfaces cost a fraction of a WebGL
 * context and run at 60fps on a phone.
 */

type StageId = "variant" | "expression" | "tissue" | "trait";

const STAGES: {
  id: StageId;
  label: string;
  caption: string;
}[] = [
  {
    id: "variant",
    label: "Variant",
    caption:
      "GWAS points at thousands of loci — most of them non-coding, few of them obviously causal.",
  },
  {
    id: "expression",
    label: "Expression",
    caption:
      "eQTL reference panels turn those loci into predicted gene expression, tissue by tissue.",
  },
  {
    id: "tissue",
    label: "Tissue",
    caption:
      "CSTWAS recovers the subset of tissues where a gene is actually active — not just an average.",
  },
  {
    id: "trait",
    label: "Trait",
    caption:
      "What comes out is a ranked, interpretable set of genes with the tissue context attached.",
  },
];

/** Deterministic PRNG so the figure is identical on server and client. */
function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

type Palette = { dim: string; mid: string; signal: string; glow: string };

const PALETTES: Record<"dark" | "light", Palette> = {
  dark: {
    dim: "rgba(190, 205, 220, 0.20)",
    mid: "rgba(190, 205, 220, 0.45)",
    signal: "rgb(96, 226, 233)",
    glow: "rgba(96, 226, 233, 0.35)",
  },
  light: {
    dim: "rgba(30, 50, 70, 0.18)",
    mid: "rgba(30, 50, 70, 0.42)",
    signal: "rgb(14, 124, 148)",
    glow: "rgba(14, 124, 148, 0.28)",
  },
};

/** `energy` is 0..1 — how strongly this stage is currently lit. */
type DrawFn = (
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  energy: number,
  p: Palette,
  t: number,
) => void;

const mix = (a: number, b: number, k: number) => a + (b - a) * k;

const drawVariant: DrawFn = (ctx, w, h, energy, p) => {
  const rand = seeded(7);
  const y = h * 0.5;
  // chromosome ideogram
  ctx.strokeStyle = p.dim;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(4, y);
  ctx.lineTo(w - 4, y);
  ctx.stroke();

  for (let i = 0; i < 34; i++) {
    const x = 6 + rand() * (w - 12);
    const strong = rand() > 0.82;
    const tick = strong ? mix(6, 13, energy) : 4;
    ctx.strokeStyle = strong ? p.signal : p.mid;
    ctx.globalAlpha = strong ? mix(0.35, 1, energy) : 0.5;
    ctx.lineWidth = strong ? 1.6 : 1;
    ctx.beginPath();
    ctx.moveTo(x, y - tick);
    ctx.lineTo(x, y + tick);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
};

const drawExpression: DrawFn = (ctx, w, h, energy, p) => {
  const rand = seeded(19);
  const cols = 14;
  const rows = 5;
  const gap = 2;
  const cw = (w - 8 - gap * (cols - 1)) / cols;
  const ch = (h - 8 - gap * (rows - 1)) / rows;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const v = rand();
      const x = 4 + c * (cw + gap);
      const yy = 4 + r * (ch + gap);
      // Hot cells resolve toward signal as the stage lights up.
      ctx.fillStyle = v > 0.74 ? p.signal : p.mid;
      ctx.globalAlpha = v > 0.74 ? mix(0.18, 0.95, energy) * v : 0.1 + v * 0.22;
      ctx.fillRect(x, yy, cw, ch);
    }
  }
  ctx.globalAlpha = 1;
};

const drawTissue: DrawFn = (ctx, w, h, energy, p) => {
  // Eight tissues; three are in the "active subset" — the CSTWAS idea, drawn.
  const active = new Set([1, 4, 5]);
  const n = 8;
  const r = Math.min(h * 0.19, 11);
  const stepX = (w - 16) / (n - 1);

  for (let i = 0; i < n; i++) {
    const x = 8 + i * stepX;
    const y = h * 0.5 + Math.sin(i * 1.1) * h * 0.14;
    const on = active.has(i);

    if (on && energy > 0.02) {
      ctx.beginPath();
      ctx.fillStyle = p.glow;
      ctx.globalAlpha = energy * 0.9;
      ctx.arc(x, y, r * mix(1.2, 2.1, energy), 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalAlpha = 1;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    if (on) {
      ctx.fillStyle = p.signal;
      ctx.globalAlpha = mix(0.4, 1, energy);
      ctx.fill();
    } else {
      ctx.strokeStyle = p.mid;
      ctx.globalAlpha = 0.55;
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }
  }
  ctx.globalAlpha = 1;
};

const drawTrait: DrawFn = (ctx, w, h, energy, p) => {
  const rand = seeded(43);
  // significance threshold
  const thresh = h * 0.32;
  ctx.strokeStyle = p.dim;
  ctx.setLineDash([3, 4]);
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(4, thresh);
  ctx.lineTo(w - 4, thresh);
  ctx.stroke();
  ctx.setLineDash([]);

  for (let i = 0; i < 90; i++) {
    const x = 5 + rand() * (w - 10);
    // A Manhattan plot: mostly noise near the baseline, one real peak.
    const peak = Math.exp(-Math.pow((x - w * 0.62) / (w * 0.055), 2));
    const noise = rand() * 0.35;
    const v = Math.min(1, noise + peak * (0.7 + rand() * 0.3));
    const y = h - 6 - v * (h - 14);
    const hit = y < thresh;

    ctx.beginPath();
    ctx.fillStyle = hit ? p.signal : p.mid;
    ctx.globalAlpha = hit ? mix(0.3, 1, energy) : 0.4;
    ctx.arc(x, y, hit ? mix(1.5, 2.4, energy) : 1.3, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
};

const DRAWERS: Record<StageId, DrawFn> = {
  variant: drawVariant,
  expression: drawExpression,
  tissue: drawTissue,
  trait: drawTrait,
};

function StageCanvas({
  id,
  energyRef,
}: {
  id: StageId;
  energyRef: React.RefObject<number>;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const palette = PALETTES[resolvedTheme === "light" ? "light" : "dark"];
    const draw = DRAWERS[id];
    let frame = 0;
    let start: number | null = null;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const { width, height } = canvas.getBoundingClientRect();
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const loop = (ts: number) => {
      if (start === null) start = ts;
      const { width, height } = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, width, height);
      draw(ctx, width, height, energyRef.current, palette, (ts - start) / 1000);
      frame = requestAnimationFrame(loop);
    };

    resize();
    frame = requestAnimationFrame(loop);
    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
    };
  }, [id, resolvedTheme, energyRef]);

  return (
    <canvas ref={canvasRef} className="h-full w-full" aria-hidden="true" />
  );
}

export function PipelineStrip({ className = "" }: { className?: string }) {
  const [hovered, setHovered] = useState<number | null>(null);
  const [pulse, setPulse] = useState(0);
  // Energy lives in refs so the canvas RAF loop never triggers React renders.
  const energies = useRef(STAGES.map(() => 0));
  const refs = useRef(
    STAGES.map((_, i) => ({
      get current() {
        return energies.current[i];
      },
    })),
  );

  // The travelling pulse. Pauses while the visitor is inspecting a stage.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      energies.current = STAGES.map(() => 0.65);
      return;
    }
    if (hovered !== null) return;
    const t = setInterval(() => setPulse((p) => (p + 1) % STAGES.length), 1500);
    return () => clearInterval(t);
  }, [hovered]);

  // Ease each stage's energy toward its target every frame.
  useEffect(() => {
    let frame = 0;
    const tick = () => {
      for (let i = 0; i < STAGES.length; i++) {
        const target =
          hovered !== null
            ? hovered === i
              ? 1
              : 0.08
            : pulse === i
              ? 1
              : 0.12;
        energies.current[i] += (target - energies.current[i]) * 0.08;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [hovered, pulse]);

  const active = hovered ?? pulse;

  return (
    <div className={className}>
      <div
        className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-4"
        onMouseLeave={() => setHovered(null)}
      >
        {STAGES.map((stage, i) => (
          <div
            key={stage.id}
            className="group relative bg-surface px-3 pb-3 pt-2.5 transition-colors duration-300 hover:bg-surface-raised"
            onMouseEnter={() => setHovered(i)}
          >
            <div className="mb-1.5 flex items-baseline justify-between">
              <span
                className={`label-mono transition-colors duration-300 ${
                  active === i ? "text-signal" : ""
                }`}
              >
                {stage.label}
              </span>
              <span className="font-mono text-[10px] text-muted-foreground/50">
                {String(i + 1).padStart(2, "0")}
              </span>
            </div>

            <div className="h-[68px]">
              <StageCanvas
                id={stage.id}
                energyRef={refs.current[i] as React.RefObject<number>}
              />
            </div>

            {/* Direction-of-flow arrow between cells. */}
            {i < STAGES.length - 1 && (
              <div className="pointer-events-none absolute -right-px top-1/2 z-10 hidden -translate-y-1/2 translate-x-1/2 sm:block">
                <div
                  className={`h-1.5 w-1.5 rotate-45 border-r border-t transition-colors duration-500 ${
                    active === i ? "border-signal" : "border-border"
                  }`}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* One caption slot, so the layout never reflows as stages change. */}
      <div className="relative mt-3 min-h-[2.5rem]">
        {STAGES.map((stage, i) => (
          <p
            key={stage.id}
            className={`absolute inset-x-0 top-0 max-w-xl text-sm leading-relaxed text-muted-foreground transition-all duration-500 ${
              active === i
                ? "translate-y-0 opacity-100"
                : "pointer-events-none translate-y-1 opacity-0"
            }`}
          >
            {stage.caption}
          </p>
        ))}
      </div>
    </div>
  );
}

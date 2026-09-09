import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

/**
 * Social-card images, one per page.
 *
 * Every page used to share the headshot as its og:image, so a link to a
 * project looked identical to a link to the homepage in Slack, X and
 * LinkedIn. This renders a 1200×630 card from the page's own title, so the
 * preview says what the page is about before anyone clicks.
 *
 * Query: ?title=…&kicker=…&sub=…   Text is clamped so a long title cannot
 * overflow the card. Lives at /og rather than /api/og because robots.txt
 * disallows /api and some crawlers respect it for images.
 */

export const runtime = "edge";

const clamp = (s: string | null, n: number, fallback = "") =>
  (s ?? fallback).slice(0, n);

/**
 * Satori's built-in font has no CJK glyphs, so Chinese titles would render as
 * boxes. For text containing CJK, fetch a subsetted Noto Sans SC from Google
 * Fonts for exactly those characters; the response is cached at the edge.
 */
async function cjkFont(text: string) {
  if (!/[\u3000-\u9fff\uf900-\ufaff]/.test(text)) return undefined;
  try {
    const css = await fetch(
      `https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@700&text=${encodeURIComponent(text)}`,
      { headers: { "User-Agent": "Mozilla/5.0" } },
    ).then((r) => r.text());
    const url = css.match(/src: url\((.+?)\) format\('(?:woff|truetype|opentype)'\)/)?.[1];
    if (!url) return undefined;
    const data = await fetch(url).then((r) => r.arrayBuffer());
    return [{ name: "Noto Sans SC", data, weight: 700 as const, style: "normal" as const }];
  } catch {
    return undefined;
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const title = clamp(searchParams.get("title"), 110, "Xinyu (Brian) Guo");
  const kicker = clamp(searchParams.get("kicker"), 60, "xinyuguo.com");
  const sub = clamp(searchParams.get("sub"), 140, "AI for biology · Yale · builder of AI products");
  const big = title.length < 40;
  const fonts = await cjkFont(title + kicker + sub);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          background: "linear-gradient(135deg, #0B0B0D 0%, #15130E 100%)",
          color: "#F4F1EA",
          fontFamily: fonts ? "Noto Sans SC, sans-serif" : "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            fontSize: 22,
            letterSpacing: 4,
            textTransform: "uppercase",
            color: "#D8B36A",
          }}
        >
          <div style={{ width: 40, height: 2, background: "#D8B36A" }} />
          {kicker}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              fontSize: big ? 84 : 60,
              fontWeight: 700,
              lineHeight: 1.08,
              letterSpacing: -1.5,
              maxWidth: 1000,
            }}
          >
            {title}
          </div>
          <div style={{ fontSize: 28, color: "#B8B2A6", maxWidth: 960, lineHeight: 1.4 }}>
            {sub}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 24,
            color: "#B8B2A6",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div
              style={{
                width: 14,
                height: 14,
                borderRadius: 999,
                background: "#D8B36A",
              }}
            />
            Xinyu (Brian) Guo
          </div>
          <div>xinyuguo.com</div>
        </div>
      </div>
    ),
    { width: 1200, height: 630, ...(fonts && { fonts }) },
  );
}

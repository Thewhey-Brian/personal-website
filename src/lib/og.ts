import { SITE_URL } from "./schema";

/** Builds the og:image URL for a page; see src/app/og/route.tsx. */
export function ogImage(opts: { title: string; kicker?: string; sub?: string }) {
  const q = new URLSearchParams();
  q.set("title", opts.title);
  if (opts.kicker) q.set("kicker", opts.kicker);
  if (opts.sub) q.set("sub", opts.sub);
  return `${SITE_URL}/og?${q.toString()}`;
}

/** Complete openGraph.images + twitter blocks for Next metadata. */
export function ogMeta(opts: { title: string; kicker?: string; sub?: string }) {
  const url = ogImage(opts);
  return {
    images: [{ url, width: 1200, height: 630, alt: opts.title }],
    twitter: {
      card: "summary_large_image" as const,
      images: [url],
    },
  };
}

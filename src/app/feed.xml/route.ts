import { allProjects, allPublications } from "contentlayer/generated";

import { SITE_URL } from "@/lib/schema";

/**
 * RSS 2.0 feed over publications and projects.
 *
 * Static — there is no server state to consult, so it is generated at build
 * time and served from the edge like any other route.
 */
export const dynamic = "force-static";

/** XML has five reserved characters and no tolerance for the rest. */
function esc(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

interface Entry {
  title: string;
  url: string;
  description: string;
  date: Date;
  category: string;
  tags: string[];
}

export function GET() {
  const entries: Entry[] = [
    ...allPublications.map((p) => ({
      title: p.title,
      url: p.url,
      description: p.abstract,
      // Only the year is recorded, so anchor to 1 January UTC. Guessing a
      // finer date would be fabrication, and readers sort by year anyway.
      date: new Date(Date.UTC(p.year, 0, 1)),
      category: "Publication",
      tags: p.tags,
    })),
    ...allProjects.map((p) => ({
      title: p.title,
      url: p.url,
      description: p.summary,
      date: new Date(p.endDate ?? p.startDate ?? Date.UTC(1970, 0, 1)),
      category: "Project",
      tags: p.tags ?? [],
    })),
  ].sort((a, b) => b.date.getTime() - a.date.getTime());

  const items = entries
    .map(
      (entry) => `    <item>
      <title>${esc(entry.title)}</title>
      <link>${SITE_URL}${entry.url}</link>
      <guid isPermaLink="true">${SITE_URL}${entry.url}</guid>
      <description>${esc(entry.description)}</description>
      <pubDate>${entry.date.toUTCString()}</pubDate>
      <category>${esc(entry.category)}</category>
${entry.tags.map((t) => `      <category>${esc(t)}</category>`).join("\n")}
    </item>`,
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Xinyu Guo — Research</title>
    <link>${SITE_URL}</link>
    <description>Publications and projects in computational biology, genomics and scientific AI.</description>
    <language>en-us</language>
    <managingEditor>xyguo1202@gmail.com (Xinyu Guo)</managingEditor>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}

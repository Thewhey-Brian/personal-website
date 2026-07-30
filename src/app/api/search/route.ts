import { NextRequest, NextResponse } from "next/server";

import { searchContent, type DocType } from "@/lib/search";

/**
 * Content search.
 *
 * Backed by the local index in `lib/search.ts` — no database, no network, no
 * API key. The previous implementation queried Supabase + pgvector; that
 * project no longer exists, so every request had been returning nothing.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim() ?? "";
  const typeParam = searchParams.get("type");
  const limit = Math.min(Number(searchParams.get("limit")) || 10, 25);

  if (!query) {
    return NextResponse.json({ query: "", results: [], total: 0 });
  }

  const type: DocType | undefined =
    typeParam === "publication" || typeParam === "project"
      ? typeParam
      : undefined;

  const hits = searchContent(query, { type, limit });

  return NextResponse.json({
    query,
    total: hits.length,
    results: hits.map(({ doc, relevance }) => ({
      type: doc.type,
      slug: doc.slug,
      title: doc.title,
      url: doc.url,
      snippet: doc.snippet,
      meta: doc.meta,
      tags: doc.tags.slice(0, 4),
      relevance,
    })),
  });
}

"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowUpRight,
  FileText,
  FolderOpen,
  Loader2,
  Search,
} from "lucide-react";

interface SearchResult {
  type: "publication" | "project";
  slug: string;
  title: string;
  url: string;
  snippet: string;
  meta: string[];
  tags: string[];
  relevance: number;
}

type TypeFilter = "all" | "publication" | "project";

function SearchContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams?.get("q") ?? "";

  const [query, setQuery] = useState(initialQuery);
  const [type, setType] = useState<TypeFilter>("all");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  const runSearch = useCallback(async (q: string, t: TypeFilter) => {
    if (!q.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ q });
      if (t !== "all") params.set("type", t);

      const res = await fetch(`/api/search?${params}`);
      if (!res.ok) throw new Error("Search failed. Please try again.");

      const data = await res.json();
      setResults(data.results ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed.");
      setResults([]);
    } finally {
      setLoading(false);
      setSearched(true);
    }
  }, []);

  // Run once for a ?q= deep link.
  useEffect(() => {
    if (initialQuery) runSearch(initialQuery, "all");
  }, [initialQuery, runSearch]);

  // Re-run when the type filter changes, so the toggle feels live.
  useEffect(() => {
    if (searched && query.trim()) runSearch(query, type);
  }, [type]);

  return (
    <div className="container mx-auto max-w-4xl px-6 pb-24 pt-28 md:pt-32">
      <h1 className="mb-10 text-4xl sm:text-5xl">Search</h1>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          runSearch(query, type);
          window.history.pushState(
            null,
            "",
            `/search?q=${encodeURIComponent(query)}`,
          );
        }}
        className="mb-10"
      >
        <div className="flex items-center gap-3 border-b border-border pb-3">
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search publications and projects…"
            aria-label="Search publications and projects"
            className="min-w-0 flex-1 bg-transparent text-lg outline-none placeholder:text-muted-foreground/50"
          />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="inline-flex shrink-0 items-center gap-2 rounded-full bg-signal px-5 py-2 text-sm font-semibold text-signal-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Search
          </button>
        </div>

        <div className="mt-5 flex items-center gap-2">
          <span className="label-mono !text-[10px]">Type</span>
          {(["all", "publication", "project"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              aria-pressed={type === t}
              className={`rounded-full border px-3 py-1 font-mono text-[11px] capitalize transition-colors ${
                type === t
                  ? "border-signal bg-signal text-signal-foreground"
                  : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </form>

      {error && (
        <div className="mb-8 rounded-xl border border-destructive/30 bg-destructive/10 p-5">
          <p className="text-destructive">{error}</p>
        </div>
      )}

      {results.length > 0 && (
        <>
          <p className="mb-5 font-mono text-xs text-muted-foreground">
            {results.length} {results.length === 1 ? "result" : "results"}
          </p>
          <ul className="border-t border-border">
            {results.map((result) => (
              <li key={`${result.type}-${result.slug}`}>
                <Link
                  href={result.url}
                  className="group relative block border-b border-border py-6 transition-colors duration-500 hover:bg-signal-soft"
                >
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 top-0 h-px origin-left scale-x-0 bg-signal transition-transform duration-500 ease-out group-hover:scale-x-100"
                  />

                  <div className="flex items-start gap-4 px-1 sm:px-3">
                    {result.type === "publication" ? (
                      <FileText className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" />
                    ) : (
                      <FolderOpen className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" />
                    )}

                    <div className="min-w-0 flex-1">
                      <div className="mb-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                        {result.meta.map((m, i) => (
                          <span key={i} className="label-mono !text-[10px]">
                            {i > 0 && (
                              <span className="mr-3 opacity-40">/</span>
                            )}
                            {m}
                          </span>
                        ))}
                      </div>

                      <h2 className="text-lg leading-snug transition-transform duration-500 ease-out group-hover:translate-x-1.5">
                        {result.title}
                      </h2>

                      <p className="mt-2 line-clamp-2 text-[15px] leading-relaxed text-muted-foreground">
                        {result.snippet}
                      </p>

                      {result.tags.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {result.tags.map((tag) => (
                            <span
                              key={tag}
                              className="rounded-full border border-border px-2.5 py-0.5 font-mono text-[10px] text-muted-foreground"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <span className="shrink-0 font-mono text-[10px] text-signal">
                      {result.relevance}%
                    </span>
                    <ArrowUpRight className="h-4 w-4 shrink-0 -translate-x-1 translate-y-1 text-muted-foreground opacity-0 transition-all duration-500 ease-out group-hover:translate-x-0 group-hover:translate-y-0 group-hover:text-signal group-hover:opacity-100" />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}

      {searched && !loading && !error && results.length === 0 && (
        <div className="border-y border-border py-20 text-center">
          <p className="text-lg text-muted-foreground">No results found.</p>
          <p className="mt-1 font-mono text-xs text-muted-foreground/70">
            Try different keywords, or widen the type filter
          </p>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto max-w-4xl px-6 py-32">
          <p className="font-mono text-xs text-muted-foreground">Loading…</p>
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}

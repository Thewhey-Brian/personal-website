"use client";

import { useMemo, useState } from "react";
import { allPublications } from "contentlayer/generated";

import { FilterBar } from "@/components/sections/filter-bar";
import { PublicationCard } from "@/components/publication-card";

export default function PublicationsPage() {
  const [query, setQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    allPublications.forEach((pub) => pub.tags.forEach((t) => tags.add(t)));
    return Array.from(tags).sort();
  }, []);

  const items = useMemo(() => {
    const q = query.trim().toLowerCase();

    return allPublications
      .filter((pub) => {
        const matchesQuery =
          !q ||
          pub.title.toLowerCase().includes(q) ||
          pub.abstract.toLowerCase().includes(q) ||
          pub.venue.toLowerCase().includes(q);

        const matchesTags =
          selectedTags.length === 0 ||
          selectedTags.some((tag) => pub.tags.includes(tag));

        return matchesQuery && matchesTags;
      })
      .sort((a, b) => b.year - a.year);
  }, [query, selectedTags]);

  const toggleTag = (tag: string) =>
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );

  return (
    <div className="container mx-auto max-w-6xl px-6 pb-24 pt-28 md:pt-32">
      <header className="mb-10 flex flex-wrap items-baseline justify-between gap-3">
        <h1 className="text-4xl sm:text-5xl">Publications</h1>
        <span className="font-mono text-xs text-muted-foreground">
          {allPublications.length} total
        </span>
      </header>

        <FilterBar
          query={query}
          onQueryChange={setQuery}
          placeholder="Search titles, abstracts, venues…"
          tags={allTags}
          selectedTags={selectedTags}
          onToggleTag={toggleTag}
          resultCount={items.length}
          totalCount={allPublications.length}
          noun="publications"
        />

        {items.length === 0 ? (
          <div className="border-y border-border py-20 text-center">
            <p className="text-lg text-muted-foreground">Nothing matches that.</p>
            <p className="mt-1 font-mono text-xs text-muted-foreground/70">
              Try clearing a filter
            </p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2">
            {items.map((pub) => (
              <PublicationCard key={pub.url} publication={pub} />
            ))}
          </div>
        )}
    </div>
  );
}

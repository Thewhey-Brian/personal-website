"use client";

import { useMemo, useState } from "react";
import { allProjects } from "contentlayer/generated";

import { FilterBar } from "@/components/sections/filter-bar";
import { ProjectCard } from "@/components/project-card";

const STATUS_ORDER: Record<string, number> = {
  "in-progress": 0,
  planned: 1,
  completed: 2,
};

export default function ProjectsPage() {
  const [query, setQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Tags and stack share one filter list: a visitor looking for "PyTorch"
  // doesn't care which frontmatter field it happens to live in.
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    allProjects.forEach((project) => {
      project.tags.forEach((t) => tags.add(t));
      project.stack.forEach((t) => tags.add(t));
    });
    return Array.from(tags).sort();
  }, []);

  const items = useMemo(() => {
    const q = query.trim().toLowerCase();

    return allProjects
      .filter((project) => {
        const matchesQuery =
          !q ||
          project.title.toLowerCase().includes(q) ||
          project.summary.toLowerCase().includes(q) ||
          (project.role?.toLowerCase().includes(q) ?? false);

        const matchesTags =
          selectedTags.length === 0 ||
          selectedTags.some(
            (tag) => project.tags.includes(tag) || project.stack.includes(tag),
          );

        return matchesQuery && matchesTags;
      })
      .sort((a, b) => {
        // Explicit `order` wins, so evergreen work (this site) can be pinned
        // last no matter how recently it was touched.
        const byOrder = a.order - b.order;
        if (byOrder !== 0) return byOrder;

        // Then active work first — what someone is building now is more
        // interesting than what they finished two years ago.
        const byStatus =
          (STATUS_ORDER[a.status] ?? 9) - (STATUS_ORDER[b.status] ?? 9);
        if (byStatus !== 0) return byStatus;

        const aDate = a.startDate ? new Date(a.startDate).getTime() : 0;
        const bDate = b.startDate ? new Date(b.startDate).getTime() : 0;
        return bDate - aDate;
      });
  }, [query, selectedTags]);

  const toggleTag = (tag: string) =>
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );

  return (
    <div className="container mx-auto max-w-6xl px-6 pb-24 pt-28 md:pt-32">
      <header className="mb-10 flex flex-wrap items-baseline justify-between gap-3">
        <h1 className="text-4xl sm:text-5xl">Projects</h1>
        <span className="font-mono text-xs text-muted-foreground">
          {allProjects.length} total
        </span>
      </header>

        <FilterBar
          query={query}
          onQueryChange={setQuery}
          placeholder="Search projects, roles, stack…"
          tags={allTags}
          selectedTags={selectedTags}
          onToggleTag={toggleTag}
          resultCount={items.length}
          totalCount={allProjects.length}
          noun="projects"
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
            {items.map((project) => (
              <ProjectCard key={project.url} project={project} />
            ))}
          </div>
        )}
    </div>
  );
}

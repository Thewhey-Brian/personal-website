"use client";

import { useState } from "react";
import { ChevronDown, Search, X } from "lucide-react";

/** Tags shown before the list is folded. Tags arrive most-used first. */
const COLLAPSED_COUNT = 10;

/**
 * Search + tag filtering for the index pages.
 *
 * Styled as an instrument strip rather than a form: a ruled input and mono tag
 * toggles, so filtering feels like part of the document instead of a widget
 * bolted onto it. The live result count sits inline, because the most common
 * question after typing is "did that match anything".
 */
export function FilterBar({
  query,
  onQueryChange,
  placeholder,
  tags,
  selectedTags,
  onToggleTag,
  resultCount,
  totalCount,
  noun,
}: {
  query: string;
  onQueryChange: (value: string) => void;
  placeholder: string;
  tags: string[];
  selectedTags: string[];
  onToggleTag: (tag: string) => void;
  resultCount: number;
  totalCount: number;
  noun: string;
}) {
  const filtering = query !== "" || selectedTags.length > 0;
  const [expanded, setExpanded] = useState(false);

  // Folded: the most-used tags, plus any selected one so the active filter is
  // never hidden. Expanded: everything.
  const collapsible = tags.length > COLLAPSED_COUNT;
  const visibleTags =
    expanded || !collapsible
      ? tags
      : tags.filter(
          (t, i) => i < COLLAPSED_COUNT || selectedTags.includes(t),
        );
  const hiddenCount = tags.length - visibleTags.length;

  return (
    <div className="mb-12">
      <div className="flex items-center gap-3 border-b border-border pb-3">
        <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder={placeholder}
          aria-label={placeholder}
          className="min-w-0 flex-1 bg-transparent text-lg outline-none placeholder:text-muted-foreground/50"
        />
        {filtering && (
          <button
            onClick={() => {
              onQueryChange("");
              selectedTags.forEach(onToggleTag);
            }}
            className="flex shrink-0 items-center gap-1 font-mono text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            Clear
            <X className="h-3 w-3" />
          </button>
        )}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        {visibleTags.map((tag) => {
          const active = selectedTags.includes(tag);
          return (
            <button
              key={tag}
              onClick={() => onToggleTag(tag)}
              aria-pressed={active}
              className={`rounded-full border px-3 py-1.5 font-mono text-[11px] transition-colors duration-300 ${
                active
                  ? "border-signal bg-signal text-signal-foreground"
                  : "border-border text-muted-foreground hover:border-signal/50 hover:text-foreground"
              }`}
            >
              {tag}
            </button>
          );
        })}
        {collapsible && (
          <button
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
            className="flex items-center gap-1 rounded-full border border-dashed border-border px-3 py-1.5 font-mono text-[11px] text-muted-foreground transition-colors hover:border-signal/50 hover:text-foreground"
          >
            {expanded ? "Show fewer" : `Show all ${tags.length} (+${hiddenCount})`}
            <ChevronDown
              className={`h-3 w-3 transition-transform ${expanded ? "rotate-180" : ""}`}
            />
          </button>
        )}
      </div>

      <p className="mt-5 font-mono text-xs text-muted-foreground">
        {resultCount} of {totalCount} {noun}
      </p>
    </div>
  );
}

"use client";

import { Search, X } from "lucide-react";

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
        {tags.map((tag) => {
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
      </div>

      <p className="mt-5 font-mono text-xs text-muted-foreground">
        {resultCount} of {totalCount} {noun}
      </p>
    </div>
  );
}

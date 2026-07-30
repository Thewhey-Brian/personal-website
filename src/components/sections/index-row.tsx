"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

/**
 * The site's single list primitive.
 *
 * A numbered contents row beats a card grid here for a concrete reason: a
 * visitor scanning a researcher's site wants to know *how much* there is and
 * *what it covers*, and a list shows six titles in the space three cards show
 * one. Home, publications and projects all use it, so the whole site reads as
 * one index.
 *
 * Deliberately decoupled from Contentlayer — pages map documents into
 * `WorkItem`, so a new content type means writing one mapper, not a new list.
 */

export interface WorkItem {
  href: string;
  title: string;
  blurb?: string;
  /** Short facts shown in mono: year, venue, status, stack. */
  meta: string[];
}

export function IndexRow({ item, index }: { item: WorkItem; index: number }) {
  return (
    <li>
      <Link
        href={item.href}
        className="group relative block border-t border-border py-7 transition-colors duration-500 hover:bg-signal-soft"
      >
        {/* accent rule that wipes in along the top edge on hover */}
        <span
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-px origin-left scale-x-0 bg-signal transition-transform duration-500 ease-out group-hover:scale-x-100"
        />

        <div className="flex items-baseline gap-5 px-1 sm:gap-8 sm:px-3">
          <span className="font-mono text-xs tabular-nums text-muted-foreground/70">
            {String(index + 1).padStart(2, "0")}
          </span>

          <div className="min-w-0 flex-1">
            {/* translate-x on hover gives the row a direction of travel */}
            <h3 className="text-xl leading-snug transition-transform duration-500 ease-out group-hover:translate-x-1.5 sm:text-2xl">
              {item.title}
            </h3>

            {item.blurb && (
              <p className="mt-2 line-clamp-2 max-w-2xl text-[15px] leading-relaxed text-muted-foreground">
                {item.blurb}
              </p>
            )}

            {item.meta.length > 0 && (
              <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1">
                {item.meta.map((m, i) => (
                  <span key={i} className="label-mono !text-[10px]">
                    {i > 0 && <span className="mr-3 opacity-40">/</span>}
                    {m}
                  </span>
                ))}
              </div>
            )}
          </div>

          <ArrowUpRight className="h-5 w-5 shrink-0 -translate-x-1 translate-y-1 text-muted-foreground opacity-0 transition-all duration-500 ease-out group-hover:translate-x-0 group-hover:translate-y-0 group-hover:text-signal group-hover:opacity-100" />
        </div>
      </Link>
    </li>
  );
}

export function IndexList({ items }: { items: WorkItem[] }) {
  if (items.length === 0) {
    return (
      <div className="border-y border-border py-20 text-center">
        <p className="text-lg text-muted-foreground">Nothing matches that.</p>
        <p className="mt-1 font-mono text-xs text-muted-foreground/70">
          Try clearing a filter
        </p>
      </div>
    );
  }

  return (
    <ul className="border-b border-border">
      {items.map((item, i) => (
        <IndexRow key={item.href} item={item} index={i} />
      ))}
    </ul>
  );
}

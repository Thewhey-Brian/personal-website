"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { Reveal, RevealWords } from "@/components/motion/reveal";
import { IndexRow, type WorkItem } from "./index-row";

/**
 * The homepage's editorial index of recent work: two groups sharing the same
 * IndexRow the /publications and /projects pages use, so the whole site reads
 * as one continuous document.
 */

function Group({
  eyebrow,
  items,
  viewAllHref,
  viewAllLabel,
}: {
  eyebrow: string;
  items: WorkItem[];
  viewAllHref: string;
  viewAllLabel: string;
}) {
  if (items.length === 0) return null;

  return (
    <div className="mt-20 first:mt-0">
      <Reveal className="mb-2 flex items-baseline justify-between gap-4">
        <span className="label-mono">{eyebrow}</span>
        <Link
          href={viewAllHref}
          className="link-wipe font-mono text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          {viewAllLabel}
        </Link>
      </Reveal>

      <ul className="border-b border-border">
        {items.map((item, i) => (
          <IndexRow key={item.href} item={item} index={i} />
        ))}
      </ul>
    </div>
  );
}

export type { WorkItem };

export function SelectedWork({
  publications,
  projects,
}: {
  publications: WorkItem[];
  projects: WorkItem[];
}) {
  return (
    <section className="border-t border-border">
      <div className="container mx-auto max-w-4xl px-6 py-24 md:py-32">
        <RevealWords
          as="h2"
          text="Selected research and things I have built."
          highlight={["research", "built"]}
          className="mb-16 max-w-2xl text-4xl leading-[1.12] sm:text-5xl"
        />

        <Group
          eyebrow="Publications"
          items={publications}
          viewAllHref="/publications"
          viewAllLabel="All publications →"
        />

        <Group
          eyebrow="Projects"
          items={projects}
          viewAllHref="/projects"
          viewAllLabel="All projects →"
        />

        {/* Closing invitation — the whole point of the page is that someone
            gets in touch, so it should not be buried in the footer. */}
        <Reveal className="mt-24 border-t border-border pt-12">
          <p className="max-w-xl font-display text-3xl font-bold leading-snug sm:text-4xl">
            I&apos;m always glad to talk about genomics, models, or a problem
            you&apos;re stuck on.
          </p>
          <Link
            href="/contact"
            className="group mt-7 inline-flex items-center gap-2 rounded-full bg-signal px-8 py-4 text-base font-semibold text-signal-foreground transition-opacity hover:opacity-90"
          >
            Get in touch
            <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

import Link from "next/link";
import {
  ArrowUpRight,
  Code,
  ExternalLink,
  FileText,
  Video,
} from "lucide-react";
import type { Publication } from "contentlayer/generated";

/**
 * Publication card.
 *
 * The whole surface is clickable, but nested <a> is invalid HTML, so the title
 * uses a stretched pseudo-element link instead of wrapping the card. The
 * resource links then sit above it on their own stacking level, which keeps
 * "click anywhere" behaviour without breaking the markup or the tab order.
 */
export function PublicationCard({ publication }: { publication: Publication }) {
  const links = [
    publication.pdfUrl && {
      label: "PDF",
      href: publication.pdfUrl,
      icon: FileText,
    },
    publication.codeUrl && {
      label: "Code",
      href: publication.codeUrl,
      icon: Code,
    },
    publication.videoUrl && {
      label: "Video",
      href: publication.videoUrl,
      icon: Video,
    },
    publication.doi && {
      label: "DOI",
      // Frontmatter stores a full URL on some entries and a bare DOI on others.
      href: publication.doi.startsWith("http")
        ? publication.doi
        : `https://doi.org/${publication.doi}`,
      icon: ExternalLink,
    },
  ].filter(Boolean) as { label: string; href: string; icon: typeof FileText }[];

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-border bg-surface p-6 transition-colors duration-500 hover:border-signal/40 hover:bg-surface-raised">
      {/* accent rule wiping in along the top edge on hover */}
      <span
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-px origin-left scale-x-0 bg-signal transition-transform duration-500 ease-out group-hover:scale-x-100"
      />

      <div className="mb-4 flex items-center justify-between gap-3">
        <span className="label-mono !text-[10px]">{publication.year}</span>
        {publication.featured && (
          <span className="rounded-full bg-signal-soft px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.1em] text-signal">
            Featured
          </span>
        )}
      </div>

      <h3 className="text-xl leading-snug">
        <Link
          href={publication.url}
          className="before:absolute before:inset-0 before:z-0"
        >
          {publication.title}
        </Link>
      </h3>

      <p className="mt-2 font-mono text-xs text-muted-foreground">
        {publication.venue}
      </p>

      <p className="mt-4 line-clamp-3 flex-1 text-[15px] leading-relaxed text-muted-foreground">
        {publication.abstract}
      </p>

      {publication.tags.length > 0 && (
        <div className="mt-5 flex flex-wrap gap-1.5">
          {publication.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-border px-2.5 py-0.5 font-mono text-[10px] text-muted-foreground"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {links.length > 0 && (
        <div className="relative z-10 mt-5 flex flex-wrap gap-2 border-t border-border pt-4">
          {links.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 font-mono text-[11px] text-muted-foreground transition-colors hover:border-signal/50 hover:text-foreground"
            >
              <link.icon className="h-3 w-3" />
              {link.label}
            </Link>
          ))}
        </div>
      )}

      <ArrowUpRight className="pointer-events-none absolute right-5 top-5 h-4 w-4 -translate-x-1 translate-y-1 text-signal opacity-0 transition-all duration-500 ease-out group-hover:translate-x-0 group-hover:translate-y-0 group-hover:opacity-100" />
    </article>
  );
}

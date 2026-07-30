import Link from "next/link";
import { ArrowLeft, type LucideIcon } from "lucide-react";

/**
 * Shared furniture for the publication and project detail pages, so the two
 * open identically: a back link, a mono meta strip, the title at display
 * weight, tags, then resources.
 */

export function BackLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="group inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.12em] text-muted-foreground transition-colors hover:text-foreground"
    >
      <ArrowLeft className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-x-1" />
      {label}
    </Link>
  );
}

export function MetaStrip({ items }: { items: string[] }) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
      {items.map((item, i) => (
        <span key={item} className="label-mono">
          {i > 0 && <span className="mr-3 opacity-40">/</span>}
          {item}
        </span>
      ))}
    </div>
  );
}

export function TagRow({ tags }: { tags: string[] }) {
  if (tags.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {tags.map((tag) => (
        <span
          key={tag}
          className="rounded-full border border-border px-3 py-1 font-mono text-[11px] text-muted-foreground"
        >
          {tag}
        </span>
      ))}
    </div>
  );
}

export interface Resource {
  label: string;
  href: string;
  icon: LucideIcon;
  primary?: boolean;
}

export function ResourceLinks({ resources }: { resources: Resource[] }) {
  if (resources.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2.5">
      {resources.map((r) => (
        <Link
          key={r.label}
          href={r.href}
          target={r.href.startsWith("http") ? "_blank" : undefined}
          rel={r.href.startsWith("http") ? "noreferrer" : undefined}
          className={
            r.primary
              ? "inline-flex items-center gap-2 rounded-full bg-signal px-6 py-3 text-sm font-semibold text-signal-foreground transition-opacity hover:opacity-90"
              : "inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-medium transition-colors hover:border-signal/50 hover:bg-accent"
          }
        >
          <r.icon className="h-4 w-4" />
          {r.label}
        </Link>
      ))}
    </div>
  );
}

/** Bordered aside used for abstracts and summaries. */
export function Callout({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-surface p-7">
      <span className="label-mono">{label}</span>
      <div className="mt-4 text-[1.0625rem] leading-[1.7] text-muted-foreground">
        {children}
      </div>
    </div>
  );
}

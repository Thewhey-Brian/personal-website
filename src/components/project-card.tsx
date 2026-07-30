import Link from "next/link";
import { ArrowUpRight, ExternalLink, Github } from "lucide-react";
import { format } from "date-fns";
import type { Project } from "contentlayer/generated";

const STATUS_LABEL: Record<Project["status"], string> = {
  completed: "Completed",
  "in-progress": "In progress",
  planned: "Planned",
};

/** Only live work gets the accent; finished and planned stay quiet. */
const STATUS_STYLE: Record<Project["status"], string> = {
  "in-progress": "bg-signal-soft text-signal",
  completed: "border border-border text-muted-foreground",
  planned: "border border-dashed border-border text-muted-foreground",
};

function dateRange(project: Project): string | null {
  if (!project.startDate && !project.endDate) return null;
  const fmt = (d: string) => format(new Date(d), "MMM yyyy");

  if (project.startDate && project.endDate) {
    const from = fmt(project.startDate);
    const to = fmt(project.endDate);
    // Single-month work would otherwise read "Jul 2026 — Jul 2026".
    return from === to ? from : `${from} — ${to}`;
  }
  if (project.startDate) {
    return project.status === "in-progress"
      ? `${fmt(project.startDate)} — present`
      : fmt(project.startDate);
  }
  return fmt(project.endDate!);
}

/**
 * Project card. Same construction as the publication card: a stretched link on
 * the title covers the surface, and the repo/demo links sit above it so nested
 * anchors are never produced.
 */
export function ProjectCard({ project }: { project: Project }) {
  const links = [
    project.demoUrl && {
      label: "Demo",
      href: project.demoUrl,
      icon: ExternalLink,
    },
    project.repoUrl && { label: "Code", href: project.repoUrl, icon: Github },
  ].filter(Boolean) as {
    label: string;
    href: string;
    icon: typeof ExternalLink;
  }[];

  const range = dateRange(project);

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-border bg-surface p-6 transition-colors duration-500 hover:border-signal/40 hover:bg-surface-raised">
      <span
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-px origin-left scale-x-0 bg-signal transition-transform duration-500 ease-out group-hover:scale-x-100"
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <span
          className={`rounded-full px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.1em] ${STATUS_STYLE[project.status]}`}
        >
          {STATUS_LABEL[project.status]}
        </span>
        {range && (
          <span className="font-mono text-[10px] text-muted-foreground">
            {range}
          </span>
        )}
        <span className="font-mono text-[10px] text-muted-foreground/70">
          {project.readingTime} min read
        </span>
      </div>

      <h3 className="text-xl leading-snug">
        <Link
          href={project.url}
          className="before:absolute before:inset-0 before:z-0"
        >
          {project.title}
        </Link>
      </h3>

      {project.role && (
        <p className="mt-2 font-mono text-xs text-muted-foreground">
          {project.role}
        </p>
      )}

      <p className="mt-4 line-clamp-3 flex-1 text-[15px] leading-relaxed text-muted-foreground">
        {project.summary}
      </p>

      {project.stack.length > 0 && (
        <div className="mt-5 flex flex-wrap gap-1.5">
          {project.stack.map((tech) => (
            <span
              key={tech}
              className="rounded-full border border-border px-2.5 py-0.5 font-mono text-[10px] text-muted-foreground"
            >
              {tech}
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

import { notFound } from "next/navigation";
import Link from "next/link";
import { Metadata } from "next";
import { format } from "date-fns";
import { allProjects } from "contentlayer/generated";
import { ExternalLink, Github } from "lucide-react";

import { Mdx } from "@/components/mdx-components";
import { RelatedContent } from "@/components/related-content";
import {
  BackLink,
  Callout,
  MetaStrip,
  ResourceLinks,
  TagRow,
  type Resource,
} from "@/components/sections/detail-shell";

interface ProjectPageProps {
  params: Promise<{ slug: string }>;
}

const STATUS_LABEL: Record<string, string> = {
  completed: "Completed",
  "in-progress": "In progress",
  planned: "Planned",
};

export async function generateStaticParams() {
  return allProjects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({
  params,
}: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = allProjects.find((p) => p.slug === slug);
  if (!project) return {};

  return {
    title: project.title,
    description: project.summary,
    // Detail pages are the content worth ranking, and until now they were the
    // only pages with no canonical.
    alternates: { canonical: `https://www.xinyuguo.com${project.url}` },
    openGraph: {
      type: "article",
      title: project.title,
      description: project.summary,
      url: `https://www.xinyuguo.com${project.url}`,
    },
  };
}

function dateRange(project: (typeof allProjects)[number]): string | null {
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

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = allProjects.find((p) => p.slug === slug);

  if (!project) notFound();

  const resources: Resource[] = [
    project.demoUrl && {
      label: "View demo",
      href: project.demoUrl,
      icon: ExternalLink,
      primary: true,
    },
    project.repoUrl && {
      label: "Source code",
      href: project.repoUrl,
      icon: Github,
    },
  ].filter(Boolean) as Resource[];

  const meta = [
    STATUS_LABEL[project.status] ?? project.status,
    dateRange(project),
    project.role,
    `${project.readingTime} min read`,
  ].filter(Boolean) as string[];

  const others = allProjects.filter((p) => p.slug !== project.slug).slice(0, 2);

  return (
    <article>
      <header className="container mx-auto max-w-4xl px-6 pb-12 pt-28 md:pt-32">
        <BackLink href="/projects" label="Projects" />

        <div className="mt-9">
          <MetaStrip items={meta} />
        </div>

        <h1 className="mt-5 max-w-3xl text-[2.25rem] leading-[1.1] sm:text-5xl">
          {project.title}
        </h1>

        {project.tags.length > 0 && (
          <div className="mt-7">
            <TagRow tags={project.tags} />
          </div>
        )}

        {resources.length > 0 && (
          <div className="mt-9">
            <ResourceLinks resources={resources} />
          </div>
        )}
      </header>

      <div className="container mx-auto max-w-4xl px-6 pb-24">
        <Callout label="Summary">
          <p>{project.summary}</p>
        </Callout>

        {project.stack.length > 0 && (
          <div className="mt-12">
            <span className="label-mono">Stack</span>
            <div className="mt-4">
              <TagRow tags={project.stack} />
            </div>
          </div>
        )}

        {project.images.length > 0 && (
          <div className="mt-12 grid gap-4 sm:grid-cols-2">
            {project.images.map((src) => (
              <img
                key={src}
                src={src}
                alt={`${project.title} screenshot`}
                className="w-full rounded-xl border border-border"
                loading="lazy"
              />
            ))}
          </div>
        )}

        <div className="prose prose-neutral mt-14 max-w-none dark:prose-invert prose-headings:font-display prose-a:text-signal">
          <Mdx code={project.body.code} />
        </div>

        <div className="mt-16">
          <RelatedContent contentId={project.slug} contentType="project" />
        </div>

        {others.length > 0 && (
          <div className="mt-20 border-t border-border pt-10">
            <div className="flex items-baseline justify-between gap-4">
              <span className="label-mono">Other projects</span>
              <Link
                href="/projects"
                className="link-wipe font-mono text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                View all →
              </Link>
            </div>

            <ul className="mt-4 border-t border-border">
              {others.map((other) => (
                <li key={other.slug}>
                  <Link
                    href={other.url}
                    className="group block border-b border-border py-6 transition-colors duration-500 hover:bg-signal-soft"
                  >
                    <span className="label-mono !text-[10px]">
                      {STATUS_LABEL[other.status] ?? other.status}
                    </span>
                    <h3 className="mt-2 text-lg leading-snug transition-transform duration-500 ease-out group-hover:translate-x-1.5">
                      {other.title}
                    </h3>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </article>
  );
}

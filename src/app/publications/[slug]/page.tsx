import { notFound } from "next/navigation";
import Link from "next/link";
import { Metadata } from "next";
import { allPublications } from "contentlayer/generated";
import {
  Code,
  ExternalLink,
  FileText,
  Presentation,
  Video,
} from "lucide-react";

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
import { doiUrl, embedUrl } from "@/lib/links";
import { jsonLd, publicationSchema } from "@/lib/schema";

interface PublicationPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return allPublications.map((publication) => ({ slug: publication.slug }));
}

export async function generateMetadata({
  params,
}: PublicationPageProps): Promise<Metadata> {
  const { slug } = await params;
  const publication = allPublications.find((p) => p.slug === slug);
  if (!publication) return {};

  return {
    title: publication.title,
    description: publication.abstract.slice(0, 200),
    alternates: { canonical: `https://www.xinyuguo.com${publication.url}` },
    openGraph: {
      type: "article",
      title: publication.title,
      description: publication.abstract.slice(0, 200),
      url: `https://www.xinyuguo.com${publication.url}`,
    },
  };
}

export default async function PublicationPage({
  params,
}: PublicationPageProps) {
  const { slug } = await params;
  const publication = allPublications.find((p) => p.slug === slug);

  if (!publication) notFound();

  const resources: Resource[] = [
    publication.pdfUrl && {
      label: "Read the PDF",
      href: publication.pdfUrl,
      icon: FileText,
      primary: true,
    },
    // doiUrl handles frontmatter that already stores a full URL; the old code
    // prefixed unconditionally and produced https://doi.org/https://doi.org/…
    publication.doi && {
      label: "DOI",
      href: doiUrl(publication.doi),
      icon: ExternalLink,
    },
    publication.codeUrl && {
      label: "Code",
      href: publication.codeUrl,
      icon: Code,
    },
    publication.slidesUrl && {
      label: "Slides",
      href: publication.slidesUrl,
      icon: Presentation,
    },
    publication.videoUrl && {
      label: "Video",
      href: publication.videoUrl,
      icon: Video,
    },
  ].filter(Boolean) as Resource[];

  // Null when the URL isn't an embeddable host, so we never render a dead
  // frame — the plain video link above still works.
  const video = publication.videoUrl ? embedUrl(publication.videoUrl) : null;

  const others = allPublications
    .filter((p) => p.slug !== publication.slug)
    .sort((a, b) => b.year - a.year)
    .slice(0, 2);

  return (
    <article>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd(publicationSchema(publication)),
        }}
      />

      <header className="container mx-auto max-w-4xl px-6 pb-12 pt-28 md:pt-32">
        <BackLink href="/publications" label="Publications" />

        <div className="mt-9">
          <MetaStrip
            items={[String(publication.year), publication.venue].filter(
              Boolean,
            )}
          />
        </div>

        <h1 className="mt-5 max-w-3xl text-[2.25rem] leading-[1.1] sm:text-5xl">
          {publication.title}
        </h1>

        {publication.tags.length > 0 && (
          <div className="mt-7">
            <TagRow tags={publication.tags} />
          </div>
        )}

        <div className="mt-9">
          <ResourceLinks resources={resources} />
        </div>
      </header>

      <div className="container mx-auto max-w-4xl px-6 pb-24">
        <Callout label="Abstract">
          <p>{publication.abstract}</p>
        </Callout>

        {video && (
          <div className="mt-12">
            <span className="label-mono">Video</span>
            <div className="mt-4 aspect-video overflow-hidden rounded-xl border border-border bg-surface">
              <iframe
                src={video}
                title={`Video: ${publication.title}`}
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        )}

        <div className="prose prose-neutral mt-14 max-w-none dark:prose-invert prose-headings:font-display prose-a:text-signal">
          <Mdx code={publication.body.code} publication={publication} />
        </div>

        <div className="mt-16">
          <RelatedContent
            contentId={publication.slug}
            contentType="publication"
          />
        </div>

        {others.length > 0 && (
          <div className="mt-20 border-t border-border pt-10">
            <div className="flex items-baseline justify-between gap-4">
              <span className="label-mono">Other publications</span>
              <Link
                href="/publications"
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
                      {other.year} <span className="opacity-40">/</span>{" "}
                      {other.venue}
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

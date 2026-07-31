import { Metadata } from "next";
import Link from "next/link";
import { allProjects, allPublications } from "contentlayer/generated";

import { Hero } from "@/components/hero/hero";
import { ZhWorkList, type ZhWorkItem } from "@/components/sections/zh-work-list";
import { getMessages } from "@/i18n/messages";
import { SITE_URL } from "@/i18n/config";

const t = getMessages("zh");

export const metadata: Metadata = {
  alternates: {
    canonical: `${SITE_URL}/zh`,
    languages: {
      "en": SITE_URL,
      "zh-CN": `${SITE_URL}/zh`,
      // English is the fallback for any locale we do not serve.
      "x-default": SITE_URL,
    },
  },
};

export default function ZhHome() {
  const publications: ZhWorkItem[] = [...allPublications]
    .sort((a, b) => b.year - a.year)
    .slice(0, 4)
    .map((pub) => ({
      href: pub.url,
      titleZh: pub.titleZh ?? pub.title,
      titleEn: pub.title,
      summaryZh: pub.summaryZh ?? pub.abstract.slice(0, 160),
      meta: [String(pub.year), pub.venue].filter(Boolean),
    }));

  const projects: ZhWorkItem[] = [...allProjects]
    .sort((a, b) => Number(b.featured) - Number(a.featured))
    .slice(0, 4)
    .map((project) => ({
      href: project.url,
      titleZh: project.titleZh ?? project.title,
      titleEn: project.title,
      summaryZh: project.summaryZh ?? project.summary.slice(0, 160),
      meta: project.stack.slice(0, 3),
    }));

  return (
    <>
      <Hero locale="zh" />

      <section className="container mx-auto max-w-4xl px-6 py-24 md:py-32">
        <p className="text-2xl leading-snug sm:text-3xl">
          {t.home.selectedWork}
        </p>

        <div className="mt-16">
          <div className="mb-2 flex items-baseline justify-between gap-4">
            <span className="label-mono">{t.home.publications}</span>
            <Link
              href="/zh/publications"
              className="link-wipe font-mono text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              {t.home.viewAll} →
            </Link>
          </div>
          <ZhWorkList items={publications} />
        </div>

        <div className="mt-20">
          <div className="mb-2 flex items-baseline justify-between gap-4">
            <span className="label-mono">{t.home.projects}</span>
            <Link
              href="/zh/projects"
              className="link-wipe font-mono text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              {t.home.viewAll} →
            </Link>
          </div>
          <ZhWorkList items={projects} />
        </div>
      </section>
    </>
  );
}

import { Metadata } from "next";
import { allPublications } from "contentlayer/generated";

import { ZhWorkList, type ZhWorkItem } from "@/components/sections/zh-work-list";
import { getMessages } from "@/i18n/messages";
import { SITE_URL } from "@/i18n/config";

const t = getMessages("zh");

export const metadata: Metadata = {
  title: t.publications.title,
  description: t.publications.subtitle,
  alternates: {
    canonical: `${SITE_URL}/zh/publications`,
    languages: {
      "en": `${SITE_URL}/publications`,
      "zh-CN": `${SITE_URL}/zh/publications`,
      "x-default": `${SITE_URL}/publications`,
    },
  },
};

export default function ZhPublicationsPage() {
  const items: ZhWorkItem[] = [...allPublications]
    .sort((a, b) => b.year - a.year)
    .map((pub) => ({
      href: pub.url,
      // Falling back to the English title keeps a newly added paper visible
      // here instead of rendering a blank row.
      titleZh: pub.titleZh ?? pub.title,
      titleEn: pub.title,
      summaryZh: pub.summaryZh ?? pub.abstract.slice(0, 160),
      meta: [String(pub.year), pub.venue].filter(Boolean),
    }));

  return (
    <div className="container mx-auto max-w-4xl px-6 pb-24 pt-28 md:pt-32">
      <h1 className="text-4xl sm:text-5xl">{t.publications.title}</h1>
      <p className="mt-4 max-w-2xl text-[1.0625rem] leading-relaxed text-muted-foreground">
        {t.publications.subtitle}
      </p>
      <p className="mt-3 font-mono text-xs text-muted-foreground/70">
        {t.common.englishBodyNote}
      </p>

      <div className="mt-12">
        <ZhWorkList items={items} />
      </div>
    </div>
  );
}

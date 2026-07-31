import { Metadata } from "next";
import { allProjects } from "contentlayer/generated";

import { ZhWorkList, type ZhWorkItem } from "@/components/sections/zh-work-list";
import { getMessages } from "@/i18n/messages";
import { SITE_URL } from "@/i18n/config";

const t = getMessages("zh");

const STATUS_ZH: Record<string, string> = {
  completed: "已完成",
  "in-progress": "进行中",
  planned: "计划中",
};

export const metadata: Metadata = {
  title: t.projects.title,
  description: t.projects.subtitle,
  alternates: {
    canonical: `${SITE_URL}/zh/projects`,
    languages: {
      "en": `${SITE_URL}/projects`,
      "zh-CN": `${SITE_URL}/zh/projects`,
      "x-default": `${SITE_URL}/projects`,
    },
  },
};

export default function ZhProjectsPage() {
  const items: ZhWorkItem[] = [...allProjects]
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map((project) => {
      const year = project.endDate ?? project.startDate;
      return {
        href: project.url,
        titleZh: project.titleZh ?? project.title,
        titleEn: project.title,
        summaryZh: project.summaryZh ?? project.summary.slice(0, 160),
        meta: [
          year ? String(new Date(year).getFullYear()) : "",
          STATUS_ZH[project.status] ?? project.status,
        ].filter(Boolean),
      };
    });

  return (
    <div className="container mx-auto max-w-4xl px-6 pb-24 pt-28 md:pt-32">
      <h1 className="text-4xl sm:text-5xl">{t.projects.title}</h1>
      <p className="mt-4 max-w-2xl text-[1.0625rem] leading-relaxed text-muted-foreground">
        {t.projects.subtitle}
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

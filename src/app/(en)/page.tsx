import { Metadata } from "next";
import { allProjects, allPublications } from "contentlayer/generated";

import { Hero } from "@/components/hero/hero";
import { type WorkItem } from "@/components/sections/index-row";
import { SelectedWork } from "@/components/sections/selected-work";
import { firstSentence } from "@/lib/text";

export const metadata: Metadata = {
  alternates: {
    canonical: "https://www.xinyuguo.com",
    languages: {
      en: "https://www.xinyuguo.com",
      "zh-CN": "https://www.xinyuguo.com/zh",
      "x-default": "https://www.xinyuguo.com",
    },
  },
};

export default function Home() {
  const publications: WorkItem[] = [...allPublications]
    .sort((a, b) => b.year - a.year)
    .slice(0, 4)
    .map((pub) => ({
      href: pub.url,
      title: pub.title,
      blurb: firstSentence(pub.abstract),
      meta: [String(pub.year), pub.venue].filter(Boolean),
    }));

  const projects: WorkItem[] = [...allProjects]
    // Featured first, then whatever else, so the ordering is editable from
    // frontmatter rather than requiring a code change.
    .sort((a, b) => Number(b.featured) - Number(a.featured))
    .slice(0, 4)
    .map((project) => ({
      href: project.url,
      title: project.title,
      blurb: firstSentence(project.summary),
      meta: [project.status, ...project.stack.slice(0, 3)].filter(Boolean),
    }));

  return (
    <>
      <Hero />
      <SelectedWork publications={publications} projects={projects} />
    </>
  );
}

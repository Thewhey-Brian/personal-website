import { allProjects, allPublications } from "contentlayer/generated";

import type { TrackFeature } from "@/components/sections/career-tracks";

// Papers where Xinyu is first author, by content slug (shown as filled heads).
const FIRST_AUTHOR = new Set(["CSTWAS", "Cell_Cycle"]);

const VENUE_SHORT: Record<string, string> = {
  "Briefings in Bioinformatics": "Brief Bioinform",
  "Human Genetics and Genomics Advances": "HGG Adv",
  "The American Journal of Human Genetics": "AJHG",
  "Cancer Discovery": "Cancer Discov",
  "Cell Reports": "Cell Rep",
  "Cancer Research": "Cancer Res",
};

function shortVenue(venue?: string): string {
  if (!venue) return "Paper";
  return VENUE_SHORT[venue] ?? venue.split(" ").slice(0, 2).join(" ");
}

/** Fractional year from a date, e.g. 2026-07-01 → 2026.5. */
export function yearOf(date: string | Date): number {
  const d = new Date(date);
  return d.getUTCFullYear() + d.getUTCMonth() / 12 + (d.getUTCDate() - 1) / 365;
}

type Locale = "en" | "zh";

// Positions held. Kept in sync with the About page and the CV by hand.
const POSITIONS: Record<Locale, Omit<TrackFeature, "start" | "end">[]> & {
  spans: [number, number][];
} = {
  spans: [
    [2018.6, 2020.4],
    [2020.6, 2022.4],
    [2022.6, 2026.4],
    [2020.42, 2020.67],
    [2020.75, 2022.6],
    [2021.08, 2022.6],
    [2022.6, 2026.4],
    [2026.67, 0],
    [2026.42, 2026.67],
  ],
  en: [
    {
      id: "washu",
      track: "education",
      label: "B.A., Mathematics & Computer Science",
      detail: "Washington University in St. Louis · Cum Laude",
      href: "/about",
    },
    {
      id: "jhu-ms",
      track: "education",
      label: "M.S., Biostatistics",
      detail: "Johns Hopkins University · Delta Omega Honor Society",
      href: "/about",
    },
    {
      id: "usc-phd",
      track: "education",
      label: "Ph.D., Computational Biology & Bioinformatics",
      detail: "University of Southern California · Viterbi Fellow",
      href: "/about",
    },
    {
      id: "washu-ra",
      track: "research",
      label: "Research Assistant, WashU",
      detail:
        "Respiratory-failure prediction models deployed in the Barnes-Jewish Hospital EHR",
      href: "/about",
    },
    {
      id: "jhu-sg",
      track: "research",
      label: "Graduate Researcher, Johns Hopkins",
      detail:
        "Statistical genetics: cross-tissue TWAS (CSTWAS), renal cell carcinoma",
      href: "/about",
    },
    {
      id: "jhu-mo",
      track: "research",
      label: "Graduate Researcher, Johns Hopkins",
      detail: "Multi-omics and cancer therapy resistance (KMT2D)",
      href: "/about",
    },
    {
      id: "usc",
      track: "research",
      label: "Graduate Researcher, USC",
      detail:
        "Cross-modality foundation models, self-supervised GNNs, NMD-QTLs across 48 tissues",
      href: "/about",
    },
    {
      id: "yale",
      track: "research",
      label: "Postdoctoral Associate, Yale University",
      detail: "Foundation and generative models for science",
      href: "/about",
    },
    {
      id: "abbott",
      track: "industry",
      label: "AI Research Scientist Intern, Abbott Cancer Diagnostics",
      detail:
        "Genomic foundation models, OncoS2F agent, FFPE artifact and pathology models",
      href: "/projects",
    },
  ],
  zh: [
    {
      id: "washu",
      track: "education",
      label: "数学与计算机科学学士",
      detail: "圣路易斯华盛顿大学 · 优等毕业",
      href: "/zh/about",
    },
    {
      id: "jhu-ms",
      track: "education",
      label: "生物统计学硕士",
      detail: "约翰斯·霍普金斯大学 · Delta Omega 荣誉学会",
      href: "/zh/about",
    },
    {
      id: "usc-phd",
      track: "education",
      label: "计算生物学与生物信息学博士",
      detail: "南加州大学 · Viterbi Fellow",
      href: "/zh/about",
    },
    {
      id: "washu-ra",
      track: "research",
      label: "研究助理，圣路易斯华盛顿大学",
      detail: "呼吸衰竭预测模型，部署于 Barnes-Jewish 医院电子病历系统",
      href: "/zh/about",
    },
    {
      id: "jhu-sg",
      track: "research",
      label: "研究生研究员，约翰斯·霍普金斯大学",
      detail: "统计遗传学：跨组织 TWAS（CSTWAS）、肾细胞癌",
      href: "/zh/about",
    },
    {
      id: "jhu-mo",
      track: "research",
      label: "研究生研究员，约翰斯·霍普金斯大学",
      detail: "多组学与癌症耐药（KMT2D）",
      href: "/zh/about",
    },
    {
      id: "usc",
      track: "research",
      label: "研究生研究员，南加州大学",
      detail: "跨模态基础模型、自监督图神经网络、48 种组织的 NMD-QTL",
      href: "/zh/about",
    },
    {
      id: "yale",
      track: "research",
      label: "博士后研究员，耶鲁大学",
      detail: "面向科学的基础模型与生成式模型",
      href: "/zh/about",
    },
    {
      id: "abbott",
      track: "industry",
      label: "AI 研究科学家实习生，雅培癌症诊断",
      detail: "基因组基础模型、OncoS2F 智能体、FFPE 伪影与病理模型",
      href: "/zh/projects",
    },
  ],
};

export function careerFeatures(locale: Locale, now: number): TrackFeature[] {
  const positions = POSITIONS[locale].map((p, i) => {
    const [start, end] = POSITIONS.spans[i];
    return { ...p, start, end: end || now };
  });

  // Papers as lollipops: the stem marks the year, the head names the journal.
  const byYear = new Map<number, typeof allPublications>();
  for (const pub of allPublications) {
    byYear.set(pub.year, [...(byYear.get(pub.year) ?? []), pub]);
  }
  const papers: TrackFeature[] = [...byYear.entries()].flatMap(([year, pubs]) =>
    pubs.map((pub, i) => {
      const at = year + 0.15 + (i / Math.max(pubs.length, 1)) * 0.7;
      const slug = pub._raw.flattenedPath.split("/").pop() ?? "";
      return {
        id: `pub-${pub._id}`,
        track: "papers" as const,
        start: at,
        end: at,
        label: locale === "zh" ? (pub.titleZh ?? pub.title) : pub.title,
        detail: [pub.venue, String(pub.year)].filter(Boolean).join(" · "),
        href: pub.url,
        tag: `${shortVenue(pub.venue)} ’${String(year).slice(2)}`,
        lead: FIRST_AUTHOR.has(slug),
      };
    }),
  );

  const products: TrackFeature[] = allProjects
    .filter((p) => p.kind === "product" && p.startDate)
    .map((p) => {
      const start = yearOf(p.startDate!);
      const end = p.endDate ? yearOf(p.endDate) : now;
      return {
        id: `prod-${p._id}`,
        track: "products" as const,
        start,
        end: Math.max(end, start + 0.05),
        label: p.title.split(":")[0],
        detail: locale === "zh" ? (p.summaryZh ?? p.summary) : p.summary,
        href: p.url,
      };
    });

  return [...positions, ...papers, ...products];
}

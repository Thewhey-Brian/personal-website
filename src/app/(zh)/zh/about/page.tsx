import { Download, MapPin } from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";

import { Reveal } from "@/components/motion/reveal";
import { getMessages } from "@/i18n/messages";
import { SITE_URL } from "@/i18n/config";

const t = getMessages("zh");

export const metadata: Metadata = {
  title: t.about.title,
  description:
    "郭昕育（Xinyu Guo）的学术背景、研究方向与技术栈：南加州大学计算生物学与生物信息学博士候选人。",
  alternates: {
    canonical: `${SITE_URL}/zh/about`,
    languages: {
      "en": `${SITE_URL}/about`,
      "zh-CN": `${SITE_URL}/zh/about`,
      "x-default": `${SITE_URL}/about`,
    },
  },
};

// Tool and library names are left as-is: they are how the reader will search
// for them and how they appear in any job description.
const TECHNICAL_SKILLS = [
  "Python · R · C++ · SQL · Bash · TypeScript",
  "PyTorch · PyTorch Geometric · JAX",
  "Hugging Face · scikit-learn · CUDA",
  "GNN / GAT · 状态空间模型 (Mamba)",
  "RNA-seq · ChIP-seq · ATAC-seq · NGS 体细胞变异检测",
  "Nextflow / WDL · DuckDB · Parquet · Docker",
  "AWS SageMaker · Bedrock · HealthOmics",
  "多 GPU 分布式训练 · 高性能计算",
];

interface Entry {
  when: string;
  what: string;
  where: string;
}

function Timeline({ entries }: { entries: readonly Entry[] }) {
  return (
    <ol className="mt-6 space-y-7">
      {entries.map((entry) => (
        <li
          key={`${entry.when}-${entry.what}`}
          className="grid grid-cols-[6.5rem_1fr] gap-4 sm:grid-cols-[8rem_1fr]"
        >
          <span className="pt-1 font-mono text-xs uppercase tracking-[0.1em] text-signal">
            {entry.when}
          </span>
          <div>
            <p className="text-lg font-semibold">{entry.what}</p>
            <p className="mt-0.5 text-[15px] text-muted-foreground">
              {entry.where}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}

export default function ZhAboutPage() {
  return (
    <div className="container mx-auto max-w-5xl px-6 pb-24 pt-28 md:pt-32">
      <div className="grid gap-14 md:grid-cols-[minmax(0,18rem)_minmax(0,1fr)] md:gap-16">
        <Reveal>
          <div className="md:sticky md:top-24">
            <div className="overflow-hidden rounded-xl border border-border bg-surface">
              <img
                src="/headshot.jpg"
                alt="郭昕育 Xinyu Guo"
                className="aspect-[4/5] h-full w-full object-cover"
              />
            </div>

            <h1 className="mt-6 text-2xl">{t.about.name}</h1>
            <p className="mt-1 text-[15px] text-muted-foreground">
              {t.about.role}
            </p>
            <p className="mt-3 flex items-center gap-2 font-mono text-xs text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" />
              {t.about.location}
            </p>

            <Link
              href="/cv.pdf"
              target="_blank"
              className="group mt-6 inline-flex items-center gap-2 rounded-full bg-signal px-6 py-3 text-sm font-semibold text-signal-foreground transition-opacity hover:opacity-90"
            >
              <Download className="h-4 w-4 transition-transform duration-300 group-hover:translate-y-0.5" />
              {t.about.downloadCv}
            </Link>
            <p className="mt-2 font-mono text-[11px] text-muted-foreground/70">
              {t.common.englishBody}
            </p>
          </div>
        </Reveal>

        <div className="min-w-0 space-y-16">
          <Reveal>
            <section>
              <span className="label-mono">{t.about.background}</span>
              <div className="mt-5 space-y-5 text-[1.0625rem] leading-[1.85] text-muted-foreground">
                {t.about.bio.map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </div>
            </section>
          </Reveal>

          <Reveal>
            <section>
              <span className="label-mono">{t.about.researchAreas}</span>
              <div className="mt-5 flex flex-wrap gap-2">
                {t.about.researchAreaList.map((area) => (
                  <span
                    key={area}
                    className="rounded-full border border-border bg-surface px-3.5 py-1.5 text-sm text-muted-foreground"
                  >
                    {area}
                  </span>
                ))}
              </div>
            </section>
          </Reveal>

          <Reveal>
            <section>
              <span className="label-mono">{t.about.technical}</span>
              <div className="mt-5 flex flex-wrap gap-2">
                {TECHNICAL_SKILLS.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full border border-border bg-surface px-3.5 py-1.5 text-sm text-muted-foreground"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </section>
          </Reveal>

          <Reveal>
            <section>
              <span className="label-mono">{t.about.experience}</span>
              <Timeline entries={t.about.experienceList} />
            </section>
          </Reveal>

          <Reveal>
            <section>
              <span className="label-mono">{t.about.education}</span>
              <Timeline entries={t.about.educationList} />
            </section>
          </Reveal>
        </div>
      </div>
    </div>
  );
}

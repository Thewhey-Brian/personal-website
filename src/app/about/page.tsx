import { Download, MapPin } from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";

import { Reveal } from "@/components/motion/reveal";

export const metadata: Metadata = {
  title: "About",
  description:
    "Learn about Xinyu Guo's background in computational biology, education at USC and Johns Hopkins, and research interests in genomics and AI.",
  alternates: {
    canonical: "https://www.xinyuguo.com/about",
  },
};

const RESEARCH_AREAS = [
  "Genomic foundation models",
  "Cancer genomics & precision oncology",
  "Variant-effect prediction (SNV, SV, fusion)",
  "Single-cell & spatial transcriptomics",
  "Self-supervised & contrastive learning",
  "GWAS / TWAS & statistical genetics",
  "Scientific AI agents & tool use",
];

const TECHNICAL_SKILLS = [
  "Python · R · C++ · SQL · Bash · TypeScript",
  "PyTorch · PyTorch Geometric · JAX",
  "Hugging Face · scikit-learn · CUDA",
  "GNN / GAT · state-space models (Mamba)",
  "RNA-seq · ChIP-seq · ATAC-seq · NGS somatic calling",
  "Nextflow / WDL · DuckDB · Parquet · Docker",
  "AWS SageMaker · Bedrock · HealthOmics",
  "Multi-GPU distributed training · HPC",
];

const EXPERIENCE = [
  {
    when: "Summer 2026",
    what: "AI Research Scientist Intern",
    where: "Abbott Cancer Diagnostics — genomic AI & precision oncology",
  },
  {
    when: "2022 — now",
    what: "Graduate Researcher",
    where: "University of Southern California — biological pathology AI/ML",
  },
  {
    when: "2020 — 2022",
    what: "Graduate Researcher",
    where: "Johns Hopkins University — statistical genetics, multi-omics",
  },
  {
    when: "2020",
    what: "Research Assistant",
    where: "Washington University in St. Louis — clinical informatics",
  },
];

const EDUCATION = [
  {
    when: "2022 — 2026",
    what: "Ph.D., Computational Biology & Bioinformatics",
    where: "University of Southern California · Viterbi Fellow",
  },
  {
    when: "2020 — 2022",
    what: "M.S., Biostatistics",
    where: "Johns Hopkins University · Delta Omega Honor Society",
  },
  {
    when: "2018 — 2020",
    what: "B.A., Mathematics & Computer Science",
    where: "Washington University in St. Louis · Cum Laude",
  },
];

interface Entry {
  when: string;
  what: string;
  where: string;
}

/** Dates in mono in their own column, so the sequence scans vertically. */
function Timeline({ entries }: { entries: Entry[] }) {
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

export default function AboutPage() {
  return (
    <div className="container mx-auto max-w-5xl px-6 pb-24 pt-28 md:pt-32">
      <div className="grid gap-14 md:grid-cols-[minmax(0,18rem)_minmax(0,1fr)] md:gap-16">
        {/* portrait rail */}
        <Reveal>
          <div className="md:sticky md:top-24">
            <div className="overflow-hidden rounded-xl border border-border bg-surface">
              <img
                src="/headshot.jpg"
                alt="Xinyu (Brian) Guo"
                className="aspect-[4/5] h-full w-full object-cover"
              />
            </div>

            <h1 className="mt-6 text-2xl">郭昕育 Xinyu Guo</h1>
            <p className="mt-1 text-[15px] text-muted-foreground">
              Researcher &amp; developer
            </p>
            <p className="mt-3 flex items-center gap-2 font-mono text-xs text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" />
              Los Angeles, CA
            </p>

            <Link
              href="/cv.pdf"
              target="_blank"
              className="group mt-6 inline-flex items-center gap-2 rounded-full bg-signal px-6 py-3 text-sm font-semibold text-signal-foreground transition-opacity hover:opacity-90"
            >
              <Download className="h-4 w-4 transition-transform duration-300 group-hover:translate-y-0.5" />
              Download CV
            </Link>
          </div>
        </Reveal>

        <div className="min-w-0 space-y-16">
          <Reveal>
            <section>
              <span className="label-mono">Background</span>
              <div className="mt-5 space-y-5 text-[1.0625rem] leading-[1.7] text-muted-foreground">
                <p>
                  My research focuses on the intersection of genomics,
                  statistical learning and deep learning, where I build tools
                  that make sense of complex biological data and uncover
                  patterns driving disease and therapy insights.
                </p>
                <p>
                  I&apos;m especially drawn to new technology — from LLM-powered
                  systems to computer vision pipelines. Every new algorithm is a
                  chance to experiment and build something that bridges science
                  and real-world impact.
                </p>
                <p>
                  Outside research I stay equally curious: usually behind a
                  camera, chasing moments that say something about the people in
                  them.
                </p>
              </div>
            </section>
          </Reveal>

          <Reveal>
            <section>
              <span className="label-mono">Research areas</span>
              <div className="mt-5 flex flex-wrap gap-2">
                {RESEARCH_AREAS.map((area) => (
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
              <span className="label-mono">Technical</span>
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
              <span className="label-mono">Experience</span>
              <Timeline entries={EXPERIENCE} />
            </section>
          </Reveal>

          <Reveal>
            <section>
              <span className="label-mono">Education</span>
              <Timeline entries={EDUCATION} />
            </section>
          </Reveal>
        </div>
      </div>
    </div>
  );
}

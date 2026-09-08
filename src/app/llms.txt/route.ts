import { allProjects, allPublications } from "contentlayer/generated";

import { SITE_URL } from "@/lib/schema";

/**
 * /llms.txt — the llmstxt.org convention: a plain-Markdown summary an LLM or
 * answer engine can read in one request instead of crawling the site.
 *
 * Generated from the same Contentlayer documents as the pages, so it cannot
 * drift from what a visitor sees. Everything here is already public on the
 * site; nothing is asserted that a person cannot read on a page.
 */

export const dynamic = "force-static";

export function GET() {
  const products = allProjects.filter((p) => p.kind === "product");
  const research = allProjects
    .filter((p) => p.kind !== "product")
    .sort((a, b) => Number(b.featured) - Number(a.featured));
  const publications = [...allPublications].sort((a, b) => b.year - a.year);

  const line = (title: string, url: string, blurb: string) =>
    `- [${title}](${SITE_URL}${url}): ${blurb}`;

  const body = `# Xinyu (Brian) Guo

> AI for biology researcher and builder. Postdoctoral Associate at Yale University (advisor: Dr. Lucila Ohno-Machado) working on biological and genomic foundation models and scientific AI agents. Ph.D. in Computational Biology & Bioinformatics, University of Southern California (2026). Founder who has shipped AI products end to end to the App Store.

Name: Xinyu Guo (also Brian Guo; 郭昕育)
Current role: Postdoctoral Associate, Yale University, New Haven, CT (Sep 2026 – present)
Previous: AI Research Scientist Intern, Abbott Cancer Diagnostics (summer 2026); Graduate Researcher, USC (2022–2026); Graduate Researcher, Johns Hopkins University (2020–2022)
Education: Ph.D. USC (2026) · M.S. Biostatistics, Johns Hopkins (2022) · B.A. Mathematics & Computer Science, Washington University in St. Louis (2020)
Open to: research collaborations; conversations with AI labs, biotech teams and investors working at the intersection of AI and biology.
Contact: ${SITE_URL}/contact · GitHub https://github.com/Thewhey-Brian · LinkedIn https://www.linkedin.com/in/xinyu-guo-5408/
CV (PDF): ${SITE_URL}/cv.pdf

## Expertise

- Biological and genomic foundation models (AlphaGenome, Evo2, Enformer, Borzoi, DNABERT): evaluation on real cohorts, benchmark design, transfer to variant-effect and regulatory tasks
- Scientific AI agents: LLM tool use, governed workflows, provenance, model routing across hosted genomic model endpoints
- Cancer genomics and precision oncology: variant-effect prediction (SNV, SV, fusion), FFPE artifact modeling, digital pathology multiple-instance learning
- Single-cell and spatial transcriptomics; self-supervised and contrastive learning; GNNs; state-space models
- LLM training from scratch (pretraining, SFT, RL) with distributed PyTorch
- Shipping: Swift/SwiftUI and Core ML on-device inference, Next.js/TypeScript, FastAPI, AWS (SageMaker, Bedrock, ECS), App Store launches

## Shipped products

${products.map((p) => line(p.title, p.url, `${p.summary}${p.demoUrl ? ` Website: ${p.demoUrl}.` : ""}${p.appStoreUrl ? ` App Store: ${p.appStoreUrl}.` : ""}`)).join("\n")}

## Research projects and write-ups

${research.map((p) => line(p.title, p.url, p.summary)).join("\n")}

## Publications

${publications.map((p) => line(p.title, p.url, `${p.venue} (${p.year}).`)).join("\n")}

## Pages

- [About](${SITE_URL}/about): background, research areas, technical stack, experience and education
- [Projects](${SITE_URL}/projects): all projects with filters
- [Publications](${SITE_URL}/publications): peer-reviewed papers
- [Contact](${SITE_URL}/contact): email and profiles
- [中文首页](${SITE_URL}/zh): Simplified Chinese front door
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}

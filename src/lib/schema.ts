import type { Project, Publication } from "contentlayer/generated";

import { doiUrl } from "./links";

/**
 * JSON-LD structured data.
 *
 * Invisible to visitors, and the only machine-readable statement on the site
 * that Brian is a researcher and these are his papers. Search engines use it
 * to decide whether a personal site is a blog or a scholar's homepage, and it
 * feeds the knowledge panel.
 *
 * Everything here is derived from content already on the page — nothing is
 * asserted in markup that a visitor cannot also read.
 */

export const SITE_URL = "https://www.xinyuguo.com";

/** Canonical identity, referenced by @id from every other node. */
export const PERSON_ID = `${SITE_URL}/#person`;

export const personSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  "@id": PERSON_ID,
  name: "Xinyu Guo",
  alternateName: "Brian Guo",
  givenName: "Xinyu",
  familyName: "Guo",
  url: SITE_URL,
  image: `${SITE_URL}/headshot.jpg`,
  jobTitle: "Postdoctoral Associate, AI for Biology",
  description:
    "AI for biology researcher and builder. Postdoctoral Associate at Yale University (Ph.D., Computational Biology & Bioinformatics, USC) working on biological and genomic foundation models, cancer genomics and scientific AI agents; founder who has shipped AI products (RallyAI, Doover) to the App Store.",
  hasOccupation: [
    {
      "@type": "Occupation",
      name: "AI Researcher",
      occupationLocation: { "@type": "City", name: "New Haven, Connecticut" },
      skills:
        "Biological foundation models, genomic foundation models, large language models, AI agents, PyTorch, JAX, computer vision, cancer genomics",
    },
    {
      "@type": "Occupation",
      name: "Founder and product engineer",
      skills:
        "iOS (Swift, Core ML), Next.js, TypeScript, AWS, product design, App Store launch",
    },
  ],
  worksFor: {
    "@type": "CollegeOrUniversity",
    name: "Yale University",
    url: "https://www.yale.edu",
  },
  email: "mailto:xyguo1202@gmail.com",
  affiliation: {
    "@type": "CollegeOrUniversity",
    name: "Yale University",
    url: "https://www.yale.edu",
  },
  alumniOf: [
    {
      "@type": "CollegeOrUniversity",
      name: "University of Southern California",
      url: "https://www.usc.edu",
    },
    {
      "@type": "CollegeOrUniversity",
      name: "Johns Hopkins University",
      url: "https://www.jhu.edu",
    },
    {
      "@type": "CollegeOrUniversity",
      name: "Washington University in St. Louis",
      url: "https://wustl.edu",
    },
  ],
  knowsAbout: [
    "Artificial Intelligence",
    "Machine Learning",
    "Biological Foundation Models",
    "Genomic Foundation Models",
    "Large Language Models",
    "AI Agents",
    "Computational Biology",
    "Bioinformatics",
    "Genomics",
    "Cancer Genomics",
    "Precision Oncology",
    "Variant Effect Prediction",
    "Single-Cell Analysis",
    "Spatial Transcriptomics",
    "Transcriptome-Wide Association Studies",
    "Computer Vision",
    "On-Device Machine Learning",
    "iOS Development",
    "Product Development",
  ],
  // sameAs is what links this page to the same person elsewhere; it is the
  // single most useful field here for entity resolution.
  sameAs: [
    "https://github.com/Thewhey-Brian",
    "https://www.linkedin.com/in/xinyu-guo-5408/",
    "https://x.com/BrianXinyu",
  ],
} as const;

export const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE_URL}/#website`,
  url: SITE_URL,
  name: "Xinyu Guo",
  description:
    "Research site of Xinyu (Brian) Guo — computational biology, genomics and scientific AI.",
  publisher: { "@id": PERSON_ID },
  inLanguage: "en-US",
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
} as const;

/**
 * ScholarlyArticle for a publication page.
 *
 * `author` lists Brian only. The co-authors are real and belong here, but they
 * are not recorded in frontmatter, and inventing an author list in metadata is
 * the one mistake in this file that would actually matter.
 */
export function publicationSchema(publication: Publication) {
  return {
    "@context": "https://schema.org",
    "@type": "ScholarlyArticle",
    "@id": `${SITE_URL}${publication.url}#article`,
    headline: publication.title,
    name: publication.title,
    abstract: publication.abstract,
    datePublished: String(publication.year),
    url: `${SITE_URL}${publication.url}`,
    author: { "@id": PERSON_ID },
    isPartOf: {
      "@type": "Periodical",
      name: publication.venue,
    },
    keywords: publication.tags.join(", "),
    inLanguage: "en",
    ...(publication.doi && {
      sameAs: doiUrl(publication.doi),
      identifier: doiUrl(publication.doi),
    }),
    ...(publication.codeUrl && {
      codeRepository: publication.codeUrl,
    }),
    isAccessibleForFree: true,
  };
}

/**
 * A project page. Shipped products are SoftwareApplication (so a crawler
 * learns there is an installable app with a store listing); research
 * write-ups are CreativeWork. Both hang off the same Person node.
 */
export function projectSchema(project: Project) {
  const url = `${SITE_URL}${project.url}`;
  const base = {
    "@context": "https://schema.org",
    "@id": `${url}#work`,
    name: project.title,
    headline: project.title,
    description: project.summary,
    url,
    author: { "@id": PERSON_ID },
    creator: { "@id": PERSON_ID },
    keywords: [...project.tags, ...project.stack].join(", "),
    inLanguage: "en",
    ...(project.startDate && { dateCreated: project.startDate }),
    ...(project.endDate && { datePublished: project.endDate }),
    ...(project.logo && { image: `${SITE_URL}${project.logo}` }),
  };

  if (project.kind === "product") {
    return {
      ...base,
      "@type": "SoftwareApplication",
      applicationCategory: "MobileApplication",
      operatingSystem: "iOS",
      ...(project.demoUrl && { sameAs: project.demoUrl }),
      ...(project.appStoreUrl && {
        installUrl: project.appStoreUrl,
        downloadUrl: project.appStoreUrl,
      }),
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    };
  }

  return {
    ...base,
    "@type": "CreativeWork",
    ...(project.repoUrl && { codeRepository: project.repoUrl }),
  };
}

/** Serialises to a <script type="application/ld+json"> payload. */
export function jsonLd(schema: object) {
  // Escaping `<` closes the door on a `</script>` sequence smuggled in through
  // frontmatter. Nothing in this content does that today; the cost of the
  // guard is one replace.
  return JSON.stringify(schema).replace(/</g, "\\u003c");
}

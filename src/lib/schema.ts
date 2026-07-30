import type { Publication } from "contentlayer/generated";

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
  jobTitle: "Ph.D. Candidate in Computational Biology & Bioinformatics",
  description:
    "Ph.D. candidate in Computational Biology & Bioinformatics at USC working on genomic foundation models, cancer genomics and scientific AI agents.",
  email: "mailto:xyguo1202@gmail.com",
  affiliation: {
    "@type": "CollegeOrUniversity",
    name: "University of Southern California",
    url: "https://www.usc.edu",
  },
  alumniOf: {
    "@type": "CollegeOrUniversity",
    name: "Johns Hopkins University",
    url: "https://www.jhu.edu",
  },
  knowsAbout: [
    "Computational Biology",
    "Bioinformatics",
    "Genomics",
    "Transcriptome-Wide Association Studies",
    "Cancer Genomics",
    "Machine Learning",
    "Genomic Foundation Models",
    "Single-Cell Analysis",
    "Spatial Transcriptomics",
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

/** Serialises to a <script type="application/ld+json"> payload. */
export function jsonLd(schema: object) {
  // Escaping `<` closes the door on a `</script>` sequence smuggled in through
  // frontmatter. Nothing in this content does that today; the cost of the
  // guard is one replace.
  return JSON.stringify(schema).replace(/</g, "\\u003c");
}

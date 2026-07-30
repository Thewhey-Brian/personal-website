import { allProjects, allPublications } from "contentlayer/generated";

/**
 * Local content index for search and "related work".
 *
 * This replaces a Supabase + pgvector setup that had stopped working: the
 * project was deleted (its host returns NXDOMAIN), so every search and every
 * related-content lookup had been silently returning an empty list.
 *
 * A vector database is the wrong shape for this site. There are eighteen
 * documents. The index below is built once at module load from Contentlayer,
 * costs nothing to run, needs no network at query time, and cannot break
 * because an external free tier expired. Semantic embeddings can be layered on
 * later if the corpus grows; at this size, field-weighted lexical scoring is
 * both faster and more predictable.
 */

export type DocType = "publication" | "project";

export interface IndexedDoc {
  type: DocType;
  slug: string;
  title: string;
  url: string;
  /** Short human-readable context: venue and year, or status. */
  meta: string[];
  tags: string[];
  /** Sentence shown under the title in results. */
  snippet: string;
  /** term -> weighted frequency */
  terms: Map<string, number>;
}

export interface SearchHit {
  doc: IndexedDoc;
  score: number;
  /** 0–100, for display. Relative to the best hit in this result set. */
  relevance: number;
}

/* ------------------------------------------------------------- tokenising */

// Words that appear in nearly every document here and carry no signal.
const STOPWORDS = new Set(
  (
    "a an and are as at be but by for from has have in into is it its of on or " +
    "that the this to was were will with we our i using use used can may " +
    "these those which while when where how why than then there their"
  ).split(" "),
);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/[\s-]+/)
    .filter((t) => t.length > 1 && !STOPWORDS.has(t));
}

/**
 * Field weights. A query matching a title should outrank the same word buried
 * in a body paragraph, and tags are curated so they are worth more than prose.
 */
const WEIGHTS = { title: 6, tags: 4, summary: 3, body: 1 } as const;

function addTerms(map: Map<string, number>, text: string, weight: number) {
  for (const term of tokenize(text)) {
    map.set(term, (map.get(term) ?? 0) + weight);
  }
}

/* ---------------------------------------------------------------- corpus  */

function firstSentence(text: string, max = 200): string {
  const trimmed = text.trim();
  const end = trimmed.search(/\.\s/);
  const sentence = end > 40 ? trimmed.slice(0, end + 1) : trimmed;
  return sentence.length <= max
    ? sentence
    : sentence.slice(0, sentence.lastIndexOf(" ", max)) + "…";
}

function buildCorpus(): IndexedDoc[] {
  const docs: IndexedDoc[] = [];

  for (const pub of allPublications) {
    const terms = new Map<string, number>();
    addTerms(terms, pub.title, WEIGHTS.title);
    addTerms(terms, pub.tags.join(" "), WEIGHTS.tags);
    addTerms(terms, `${pub.venue} ${pub.abstract}`, WEIGHTS.summary);
    addTerms(terms, pub.body.raw, WEIGHTS.body);

    docs.push({
      type: "publication",
      slug: pub.slug,
      title: pub.title,
      url: pub.url,
      meta: [String(pub.year), pub.venue].filter(Boolean),
      tags: pub.tags,
      snippet: firstSentence(pub.abstract),
      terms,
    });
  }

  for (const project of allProjects) {
    const terms = new Map<string, number>();
    addTerms(terms, project.title, WEIGHTS.title);
    addTerms(
      terms,
      [...project.tags, ...project.stack].join(" "),
      WEIGHTS.tags,
    );
    addTerms(terms, project.summary, WEIGHTS.summary);
    addTerms(terms, project.body.raw, WEIGHTS.body);

    docs.push({
      type: "project",
      slug: project.slug,
      title: project.title,
      url: project.url,
      meta: [project.status.replace("-", " "), ...project.stack.slice(0, 2)],
      tags: [...project.tags, ...project.stack],
      snippet: firstSentence(project.summary),
      terms,
    });
  }

  return docs;
}

// Built once per server process. Content is static, so there is nothing to
// invalidate — a rebuild ships a new module.
const CORPUS: IndexedDoc[] = buildCorpus();

/** Inverse document frequency, so common words don't dominate the ranking. */
const IDF: Map<string, number> = (() => {
  const df = new Map<string, number>();
  for (const doc of CORPUS) {
    for (const term of doc.terms.keys()) {
      df.set(term, (df.get(term) ?? 0) + 1);
    }
  }
  const idf = new Map<string, number>();
  for (const [term, count] of df) {
    idf.set(term, Math.log(1 + CORPUS.length / count));
  }
  return idf;
})();

/* ---------------------------------------------------------------- search  */

export function searchContent(
  query: string,
  { type, limit = 10 }: { type?: DocType; limit?: number } = {},
): SearchHit[] {
  const terms = tokenize(query);
  if (terms.length === 0) return [];

  const pool = type ? CORPUS.filter((d) => d.type === type) : CORPUS;
  const scored: { doc: IndexedDoc; score: number }[] = [];

  for (const doc of pool) {
    let score = 0;

    for (const term of terms) {
      const exact = doc.terms.get(term);
      if (exact) {
        score += exact * (IDF.get(term) ?? 1);
        continue;
      }
      // Prefix match, so "transcript" finds "transcriptomics". Discounted,
      // because a partial hit is weaker evidence than a whole word.
      for (const [docTerm, weight] of doc.terms) {
        if (docTerm.startsWith(term)) {
          score += weight * (IDF.get(docTerm) ?? 1) * 0.4;
          break;
        }
      }
    }

    // Reward documents matching more of the query, not just one term loudly.
    const covered = terms.filter(
      (t) =>
        doc.terms.has(t) || [...doc.terms.keys()].some((d) => d.startsWith(t)),
    ).length;
    if (covered > 1) score *= 1 + (covered - 1) * 0.35;

    if (score > 0) scored.push({ doc, score });
  }

  scored.sort((a, b) => b.score - a.score);
  const top = scored.slice(0, limit);
  const best = top[0]?.score ?? 1;

  return top.map(({ doc, score }) => ({
    doc,
    score,
    relevance: Math.round((score / best) * 100),
  }));
}

/* --------------------------------------------------------------- related  */

/** Cosine similarity over the weighted term vectors. */
function similarity(a: IndexedDoc, b: IndexedDoc): number {
  let dot = 0;
  // Iterate the smaller vector — the result is symmetric either way.
  const [small, large] = a.terms.size < b.terms.size ? [a, b] : [b, a];
  for (const [term, weight] of small.terms) {
    const other = large.terms.get(term);
    if (other) dot += weight * other * (IDF.get(term) ?? 1);
  }
  if (dot === 0) return 0;

  const norm = (d: IndexedDoc) =>
    Math.sqrt([...d.terms.values()].reduce((sum, w) => sum + w * w, 0));
  return dot / (norm(a) * norm(b));
}

export function relatedTo(slug: string, limit = 3): SearchHit[] {
  const source = CORPUS.find((d) => d.slug === slug);
  if (!source) return [];

  const sourceTags = new Set(source.tags.map((t) => t.toLowerCase()));

  const scored = CORPUS.filter((d) => d.slug !== slug)
    .map((doc) => {
      const shared = doc.tags.filter((t) =>
        sourceTags.has(t.toLowerCase()),
      ).length;
      // An explicit shared tag is a stronger signal than incidental vocabulary
      // overlap, so it multiplies rather than merely adding.
      const score = similarity(source, doc) * (1 + shared * 0.6);
      return { doc, score };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  const best = scored[0]?.score ?? 1;
  return scored.map(({ doc, score }) => ({
    doc,
    score,
    relevance: Math.round((score / best) * 100),
  }));
}

/** Corpus size, for diagnostics. */
export const indexSize = CORPUS.length;

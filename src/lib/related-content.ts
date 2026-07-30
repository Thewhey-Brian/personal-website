import { relatedTo } from "./search";

/**
 * "More like this" for publication and project detail pages.
 *
 * Now computed from the local index rather than a pgvector similarity query,
 * so it works offline and returns instantly. Same shape as before, so the
 * component consuming it is unchanged.
 */

export interface RelatedItem {
  type: string;
  id: string;
  title: string;
  url: string;
  similarity: number;
  tags: string[];
}

export interface RelatedResult {
  related: RelatedItem[];
  error?: string;
}

export function getRelatedContent(
  contentId: string,
  _contentType: "publication" | "project",
  limit = 3,
): RelatedResult {
  const hits = relatedTo(contentId, limit);

  return {
    related: hits.map(({ doc, relevance }) => ({
      type: doc.type,
      id: doc.slug,
      title: doc.title,
      url: doc.url,
      similarity: relevance,
      tags: doc.tags.slice(0, 3),
    })),
  };
}

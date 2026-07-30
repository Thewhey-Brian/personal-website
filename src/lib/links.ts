/**
 * URL normalisation for content frontmatter.
 *
 * Frontmatter is hand-written, so the same field arrives in several shapes.
 * Normalising here — rather than at each call site — is why the DOI on one
 * publication used to resolve to `https://doi.org/https://doi.org/…`.
 */

/** Accepts a bare DOI or an already-qualified URL. */
export function doiUrl(doi: string): string {
  const trimmed = doi.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://doi.org/${trimmed.replace(/^doi:/i, "")}`;
}

/**
 * Converts a YouTube/Vimeo watch or share link into its embeddable form.
 *
 * A `youtu.be/ID` or `watch?v=ID` URL cannot be put in an iframe — YouTube
 * sends X-Frame-Options and the player refuses to load — so the previous
 * embed was always a blank box. Returns null when the URL isn't recognised,
 * so callers can fall back to a plain link rather than render a dead frame.
 */
export function embedUrl(url: string): string | null {
  try {
    const u = new URL(url);

    if (u.hostname.includes("youtu.be")) {
      const id = u.pathname.slice(1);
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }

    if (u.hostname.includes("youtube.com")) {
      if (u.pathname.startsWith("/embed/")) return url;
      const id = u.searchParams.get("v");
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }

    if (u.hostname.includes("vimeo.com")) {
      const id = u.pathname.split("/").filter(Boolean).pop();
      return id ? `https://player.vimeo.com/video/${id}` : null;
    }

    return null;
  } catch {
    return null;
  }
}

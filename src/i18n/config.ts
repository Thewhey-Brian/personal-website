/**
 * Locales.
 *
 * English lives at the root (`/publications/CSTWAS`) and Chinese under `/zh`.
 * The site is already indexed with canonicals pointing at the root paths, so
 * moving English behind an `/en` prefix would break every existing link and
 * every citation of a project page. The asymmetry is deliberate.
 */
export const LOCALES = ["en", "zh"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

/** Value for the `lang` attribute and for hreflang. */
export const HTML_LANG: Record<Locale, string> = {
  en: "en",
  zh: "zh-CN",
};

export const LOCALE_LABEL: Record<Locale, string> = {
  en: "EN",
  zh: "中文",
};

export const SITE_URL = "https://www.xinyuguo.com";

/** Prefix a root-relative path for a locale. `/about` → `/zh/about`. */
export function localePath(path: string, locale: Locale): string {
  const clean = path === "/" ? "" : path;
  return locale === DEFAULT_LOCALE ? clean || "/" : `/zh${clean}`;
}

/**
 * The five pages that exist in both locales.
 *
 * Publication and project *detail* pages are English-only by design, so they
 * are absent here. That matters for correctness elsewhere: hreflang must not
 * advertise a Chinese alternate that does not exist, and the language switcher
 * has to fall back to the nearest page that does.
 */
export const TRANSLATED_ROUTES = [
  "/",
  "/about",
  "/publications",
  "/projects",
  "/contact",
] as const;

export function hasTranslation(path: string): boolean {
  return (TRANSLATED_ROUTES as readonly string[]).includes(path);
}

/**
 * Where the language toggle should point from an arbitrary path.
 *
 * On an English-only detail page there is no Chinese counterpart, so we send
 * the reader to the Chinese index for that section — a useful page in their
 * language beats a 404 or a dead control.
 */
export function switchLocalePath(pathname: string, to: Locale): string {
  const bare = pathname.replace(/^\/zh(?=\/|$)/, "") || "/";

  if (hasTranslation(bare)) return localePath(bare, to);

  if (to === "zh") {
    if (bare.startsWith("/publications")) return "/zh/publications";
    if (bare.startsWith("/projects")) return "/zh/projects";
    return "/zh";
  }
  return bare;
}

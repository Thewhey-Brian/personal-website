import { MetadataRoute } from "next";
import { allProjects, allPublications } from "contentlayer/generated";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://www.xinyuguo.com";

  // Neither document type has a `date` field — Projects carry startDate/endDate
  // and Publications carry a year. Reading `.date` yielded undefined on every
  // entry, so every URL was silently stamped with the build time.
  const projects = allProjects.map((project) => {
    const changed = project.endDate ?? project.startDate;
    return {
      url: `${baseUrl}/projects/${project.slug}`,
      lastModified: changed ? new Date(changed) : new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    };
  });

  const publications = allPublications.map((pub) => ({
    url: `${baseUrl}/publications/${pub.slug}`,
    // Year only, so anchor to 1 January of that year.
    lastModified: new Date(Date.UTC(pub.year, 0, 1)),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  // The five pages that exist in both locales. Each entry declares the other
  // locale as an alternate, which is how a crawler learns the two URLs are the
  // same page rather than duplicate content.
  const bilingual: {
    path: string;
    changeFrequency: "weekly" | "monthly";
    priority: number;
  }[] = [
    { path: "", changeFrequency: "weekly", priority: 1 },
    { path: "/about", changeFrequency: "monthly", priority: 0.9 },
    { path: "/projects", changeFrequency: "weekly", priority: 0.8 },
    { path: "/publications", changeFrequency: "weekly", priority: 0.8 },
    { path: "/contact", changeFrequency: "monthly", priority: 0.7 },
  ];

  const shared = bilingual.flatMap(({ path, changeFrequency, priority }) => {
    const en = `${baseUrl}${path}` || baseUrl;
    const zh = `${baseUrl}/zh${path}`;
    const languages = { en, "zh-CN": zh };

    return [
      {
        url: en,
        lastModified: new Date(),
        changeFrequency,
        priority,
        alternates: { languages },
      },
      {
        url: zh,
        lastModified: new Date(),
        changeFrequency,
        // Slightly below the English equivalent: the Chinese pages summarise,
        // the English ones carry the full text.
        priority: Math.max(0.1, priority - 0.1),
        alternates: { languages },
      },
    ];
  });

  // Detail pages are English-only by design, so they carry no alternates —
  // advertising a Chinese URL that 404s is worse than advertising none.
  return [...shared, ...projects, ...publications];
}

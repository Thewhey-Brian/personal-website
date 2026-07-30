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

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/projects`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/publications`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    ...projects,
    ...publications,
  ];
}

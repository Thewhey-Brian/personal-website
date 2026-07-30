import { defineDocumentType, makeSource } from "contentlayer2/source-files";
import { spawn } from "child_process";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeSlug from "rehype-slug";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";

const Publication = defineDocumentType(() => ({
  name: "Publication",
  filePathPattern: `publications/**/*.mdx`,
  contentType: "mdx",
  fields: {
    title: {
      type: "string",
      required: true,
    },
    abstract: {
      type: "string",
      required: true,
    },
    year: {
      type: "number",
      required: true,
    },
    venue: {
      type: "string",
      required: true,
    },
    doi: {
      type: "string",
      required: false,
    },
    pdfUrl: {
      type: "string",
      required: false,
    },
    codeUrl: {
      type: "string",
      required: false,
    },
    slidesUrl: {
      type: "string",
      required: false,
    },
    videoUrl: {
      type: "string",
      required: false,
    },
    tags: {
      type: "list",
      of: { type: "string" },
      default: [],
    },
    featured: {
      type: "boolean",
      default: false,
    },
  },
  computedFields: {
    url: {
      type: "string",
      resolve: (doc) =>
        `/publications/${doc._raw.flattenedPath.split("/").pop()}`,
    },
    slug: {
      type: "string",
      resolve: (doc) => doc._raw.flattenedPath.split("/").pop(),
    },
  },
}));

const Project = defineDocumentType(() => ({
  name: "Project",
  filePathPattern: `projects/**/*.mdx`,
  contentType: "mdx",
  fields: {
    title: {
      type: "string",
      required: true,
    },
    summary: {
      type: "string",
      required: true,
    },
    status: {
      type: "enum",
      options: ["completed", "in-progress", "planned"],
      required: true,
    },
    role: {
      type: "string",
      required: false,
    },
    stack: {
      type: "list",
      of: { type: "string" },
      default: [],
    },
    repoUrl: {
      type: "string",
      required: false,
    },
    demoUrl: {
      type: "string",
      required: false,
    },
    images: {
      type: "list",
      of: { type: "string" },
      default: [],
    },
    tags: {
      type: "list",
      of: { type: "string" },
      default: [],
    },
    featured: {
      type: "boolean",
      default: false,
    },
    // Manual tiebreak, applied before status and date. Ongoing work with no
    // meaningful end date (the site itself) sets a high value to sit last.
    order: {
      type: "number",
      default: 0,
    },
    startDate: {
      type: "date",
      required: false,
    },
    endDate: {
      type: "date",
      required: false,
    },
  },
  computedFields: {
    url: {
      type: "string",
      resolve: (doc) => `/projects/${doc._raw.flattenedPath.split("/").pop()}`,
    },
    slug: {
      type: "string",
      resolve: (doc) => doc._raw.flattenedPath.split("/").pop(),
    },
    readingTime: {
      type: "number",
      // Several write-ups are long-form; 200 wpm is the usual estimate for
      // technical prose.
      resolve: (doc) =>
        Math.max(1, Math.round(doc.body.raw.split(/\s+/).length / 200)),
    },
  },
}));

export default makeSource({
  contentDirPath: "./content",
  documentTypes: [Publication, Project],
  disableImportAliasWarning: true,
  mdx: {
    remarkPlugins: [remarkGfm, remarkMath],
    rehypePlugins: [
      rehypeSlug,
      rehypeKatex,
      [
        rehypePrettyCode,
        {
          theme: "github-dark",
          onVisitLine(node: any) {
            if (node.children.length === 0) {
              node.children = [{ type: "text", value: " " }];
            }
          },
          onVisitHighlightedLine(node: any) {
            node.properties.className.push("line--highlighted");
          },
          onVisitHighlightedWord(node: any) {
            node.properties.className = ["word--highlighted"];
          },
        },
      ],
      [
        rehypeAutolinkHeadings,
        {
          properties: {
            className: ["anchor"],
          },
        },
      ],
    ],
  },
});

// contentlayer.config.ts
import { defineDocumentType, makeSource } from "contentlayer2/source-files";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
var Publication = defineDocumentType(() => ({
  name: "Publication",
  filePathPattern: `publications/**/*.mdx`,
  contentType: "mdx",
  fields: {
    title: {
      type: "string",
      required: true
    },
    abstract: {
      type: "string",
      required: true
    },
    year: {
      type: "number",
      required: true
    },
    venue: {
      type: "string",
      required: true
    },
    doi: {
      type: "string",
      required: false
    },
    pdfUrl: {
      type: "string",
      required: false
    },
    codeUrl: {
      type: "string",
      required: false
    },
    slidesUrl: {
      type: "string",
      required: false
    },
    videoUrl: {
      type: "string",
      required: false
    },
    tags: {
      type: "list",
      of: { type: "string" },
      default: []
    },
    featured: {
      type: "boolean",
      default: false
    }
  },
  computedFields: {
    url: {
      type: "string",
      resolve: (doc) => `/publications/${doc._raw.flattenedPath.split("/").pop()}`
    },
    slug: {
      type: "string",
      resolve: (doc) => doc._raw.flattenedPath.split("/").pop()
    }
  }
}));
var Project = defineDocumentType(() => ({
  name: "Project",
  filePathPattern: `projects/**/*.mdx`,
  contentType: "mdx",
  fields: {
    title: {
      type: "string",
      required: true
    },
    summary: {
      type: "string",
      required: true
    },
    status: {
      type: "enum",
      options: ["completed", "in-progress", "planned"],
      required: true
    },
    role: {
      type: "string",
      required: false
    },
    stack: {
      type: "list",
      of: { type: "string" },
      default: []
    },
    repoUrl: {
      type: "string",
      required: false
    },
    demoUrl: {
      type: "string",
      required: false
    },
    images: {
      type: "list",
      of: { type: "string" },
      default: []
    },
    tags: {
      type: "list",
      of: { type: "string" },
      default: []
    },
    featured: {
      type: "boolean",
      default: false
    },
    startDate: {
      type: "date",
      required: false
    },
    endDate: {
      type: "date",
      required: false
    }
  },
  computedFields: {
    url: {
      type: "string",
      resolve: (doc) => `/projects/${doc._raw.flattenedPath.split("/").pop()}`
    },
    slug: {
      type: "string",
      resolve: (doc) => doc._raw.flattenedPath.split("/").pop()
    }
  }
}));
var contentlayer_config_default = makeSource({
  contentDirPath: "./content",
  documentTypes: [Publication, Project],
  disableImportAliasWarning: true,
  mdx: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [
      rehypeSlug,
      [
        rehypePrettyCode,
        {
          theme: "github-dark",
          onVisitLine(node) {
            if (node.children.length === 0) {
              node.children = [{ type: "text", value: " " }];
            }
          },
          onVisitHighlightedLine(node) {
            node.properties.className.push("line--highlighted");
          },
          onVisitHighlightedWord(node) {
            node.properties.className = ["word--highlighted"];
          }
        }
      ],
      [
        rehypeAutolinkHeadings,
        {
          properties: {
            className: ["anchor"]
          }
        }
      ]
    ]
  }
});
export {
  contentlayer_config_default as default
};
//# sourceMappingURL=compiled-contentlayer-config-6IDIBZVW.mjs.map

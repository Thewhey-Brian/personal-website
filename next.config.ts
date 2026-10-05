import type { NextConfig } from "next";
import { withContentlayer } from "next-contentlayer2";

const nextConfig: NextConfig = {
  // `eslint.ignoreDuringBuilds` and `typescript.ignoreBuildErrors` used to be
  // set here. They meant a build with real type errors still deployed — which
  // is how four broken `project.date` references in sitemap.ts survived. Both
  // checks now pass, so let the build enforce them.
  // Short, shareable booking links for email signatures: xinyuguo.com/meet
  async redirects() {
    return ["/meet", "/book", "/zh/meet"].map((source) => ({
      source,
      destination: "https://calendly.com/xyguo1202/30min",
      permanent: false,
    }));
  },
  experimental: {
    mdxRs: true,
  },
  turbopack: {
    // Two lockfiles exist above this directory, so Turbopack inferred the
    // wrong workspace root and warned on every build. Pin it.
    root: __dirname,
    rules: {
      "*.svg": {
        loaders: ["@svgr/webpack"],
        as: "*.js",
      },
    },
  },
};

export default withContentlayer(nextConfig);

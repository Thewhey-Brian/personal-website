import type { Metadata } from "next";
import "../globals.css";
import "katex/dist/katex.min.css";

import { SiteShell } from "@/components/layout/site-shell";
import { SITE_URL } from "@/i18n/config";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Xinyu Guo - Computational Biology Researcher & AI Developer",
    template: "%s | Xinyu Guo",
  },
  description:
    "Ph.D. candidate in Computational Biology & Bioinformatics at USC. Specializing in genomics, machine learning, and deep learning applications in biological research.",
  keywords: [
    "computational biology",
    "bioinformatics",
    "machine learning",
    "genomics",
    "AI research",
    "USC PhD",
    "Xinyu Guo",
    "郭昕育",
    "single-cell",
    "spatial transcriptomics",
  ],
  authors: [{ name: "Xinyu Guo" }],
  creator: "Xinyu Guo",
  // No `canonical` here on purpose: child routes inherit it, so any page that
  // forgot to set its own would declare itself the homepage. Each route
  // declares its own. Only the feed link is safe to inherit site-wide.
  alternates: {
    types: { "application/rss+xml": `${SITE_URL}/feed.xml` },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    alternateLocale: ["zh_CN"],
    url: SITE_URL,
    title: "Xinyu Guo - Computational Biology Researcher",
    description:
      "Ph.D. in Computational Biology exploring genomics, AI, and machine learning",
    siteName: "Xinyu Guo",
    images: [
      {
        url: "/headshot.jpg",
        width: 1200,
        height: 630,
        alt: "Xinyu Guo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Xinyu Guo - Computational Biology Researcher",
    description:
      "Ph.D. in Computational Biology exploring genomics, AI, and machine learning",
    images: ["/headshot.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  // src/app/favicon.ico is picked up by file convention; the PNGs below are
  // for Android/PWA and iOS home screen.
  icons: {
    icon: [
      { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
      { url: "/icon-512.png", type: "image/png", sizes: "512x512" },
    ],
    apple: "/apple-touch-icon.png",
  },
};

export default function EnglishRootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <SiteShell locale="en">{children}</SiteShell>;
}

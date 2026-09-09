import type { Metadata } from "next";

import { ogImage } from "@/lib/og";
import "../globals.css";
import "katex/dist/katex.min.css";

import { SiteShell } from "@/components/layout/site-shell";
import { SITE_URL } from "@/i18n/config";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "郭昕育 Xinyu Guo — AI for Biology 研究者与 AI 产品构建者",
    template: "%s | 郭昕育 Xinyu Guo",
  },
  description:
    "耶鲁大学博士后研究员，研究方向为 AI for Biology 与生物基础模型；南加州大学计算生物学与生物信息学博士。",
  keywords: [
    "郭昕育",
    "Xinyu Guo",
    "计算生物学",
    "生物信息学",
    "基因组学",
    "机器学习",
    "单细胞",
    "空间转录组",
    "耶鲁大学",
    "生物基础模型",
    "AI 智能体",
    "大语言模型",
    "AI for Science",
    "RallyAI",
    "Doover",
  ],
  authors: [{ name: "郭昕育 Xinyu Guo" }],
  creator: "郭昕育 Xinyu Guo",
  alternates: {
    types: { "application/rss+xml": `${SITE_URL}/feed.xml` },
  },
  openGraph: {
    type: "website",
    locale: "zh_CN",
    alternateLocale: ["en_US"],
    url: `${SITE_URL}/zh`,
    title: "郭昕育 Xinyu Guo — AI for Biology 研究者与 AI 产品构建者",
    description:
      "耶鲁大学博士后研究员，研究生物基础模型、基因组学与人工智能。",
    siteName: "郭昕育 Xinyu Guo",
    images: [
      {
        url: ogImage({ title: "郭昕育 Xinyu Guo", kicker: "xinyuguo.com", sub: "AI for Biology · 耶鲁大学 · AI 产品构建者" }),
        width: 1200,
        height: 630,
        alt: "郭昕育 Xinyu Guo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "郭昕育 Xinyu Guo — AI for Biology 研究者与 AI 产品构建者",
    description:
      "耶鲁大学博士后研究员，研究生物基础模型、基因组学与人工智能。",
    images: [ogImage({ title: "郭昕育 Xinyu Guo", kicker: "xinyuguo.com", sub: "AI for Biology · 耶鲁大学 · AI 产品构建者" })],
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
  icons: {
    icon: [
      { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
      { url: "/icon-512.png", type: "image/png", sizes: "512x512" },
    ],
    apple: "/apple-touch-icon.png",
  },
};

export default function ChineseRootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <SiteShell locale="zh">{children}</SiteShell>;
}

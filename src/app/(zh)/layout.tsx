import type { Metadata } from "next";
import "../globals.css";
import "katex/dist/katex.min.css";

import { SiteShell } from "@/components/layout/site-shell";
import { SITE_URL } from "@/i18n/config";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "郭昕育 Xinyu Guo — 计算生物学与人工智能研究",
    template: "%s | 郭昕育 Xinyu Guo",
  },
  description:
    "南加州大学计算生物学与生物信息学博士候选人，研究方向为基因组基础模型、癌症基因组学与科研 AI 智能体。",
  keywords: [
    "郭昕育",
    "Xinyu Guo",
    "计算生物学",
    "生物信息学",
    "基因组学",
    "机器学习",
    "单细胞",
    "空间转录组",
    "南加州大学",
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
    title: "郭昕育 Xinyu Guo — 计算生物学与人工智能研究",
    description:
      "南加州大学计算生物学博士候选人，研究基因组学、人工智能与统计建模。",
    siteName: "郭昕育 Xinyu Guo",
    images: [
      {
        url: "/headshot.jpg",
        width: 1200,
        height: 630,
        alt: "郭昕育 Xinyu Guo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "郭昕育 Xinyu Guo — 计算生物学与人工智能研究",
    description:
      "南加州大学计算生物学博士候选人，研究基因组学、人工智能与统计建模。",
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

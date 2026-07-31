import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Explore Xinyu Guo's computational biology and AI projects, including genomics tools, machine learning applications, and computer vision systems.",
  alternates: {
    canonical: "https://www.xinyuguo.com/projects",
    languages: {
      en: "https://www.xinyuguo.com/projects",
      "zh-CN": "https://www.xinyuguo.com/zh/projects",
      "x-default": "https://www.xinyuguo.com/projects",
    },
  },
};

export default function ProjectsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

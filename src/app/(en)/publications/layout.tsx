import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Publications",
  description:
    "Research publications by Xinyu Guo covering computational biology, genomics, machine learning, and bioinformatics.",
  alternates: {
    canonical: "https://www.xinyuguo.com/publications",
    languages: {
      en: "https://www.xinyuguo.com/publications",
      "zh-CN": "https://www.xinyuguo.com/zh/publications",
      "x-default": "https://www.xinyuguo.com/publications",
    },
  },
};

export default function PublicationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

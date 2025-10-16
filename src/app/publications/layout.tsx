import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Publications",
  description: "Research publications by Xinyu Guo covering computational biology, genomics, machine learning, and bioinformatics.",
  alternates: {
    canonical: 'https://www.xinyuguo.com/publications'
  }
}

export default function PublicationsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Photography",
  description: "Personal photography collection by Xinyu Guo featuring landscapes, street photography, and portraits.",
  alternates: {
    canonical: 'https://www.xinyuguo.com/photos'
  }
}

export default function PhotosLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

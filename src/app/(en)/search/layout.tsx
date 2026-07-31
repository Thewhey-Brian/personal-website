import { Metadata } from "next";

/**
 * The search page takes an arbitrary `?q=`, so it can generate unbounded
 * near-duplicate URLs — exactly the shape crawlers waste budget on and
 * sometimes rank ahead of the real pages. It exists for visitors, not for
 * search engines, so keep it out of the index. `follow` stays on so any links
 * in a result list still pass through.
 */
export const metadata: Metadata = {
  title: "Search",
  robots: { index: false, follow: true },
};

export default function SearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

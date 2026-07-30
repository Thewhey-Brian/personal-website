import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import "katex/dist/katex.min.css";

import { ThemeProvider } from "@/components/theme-provider";
import { SmoothScroll } from "@/components/motion/smooth-scroll";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { AssistantChat } from "@/components/assistant/assistant-chat";
import { jsonLd, personSchema, websiteSchema } from "@/lib/schema";
// Cookie-less and no cross-site identifiers, so there is nothing to consent to
// and no banner to add. Inert unless the deployment is on Vercel.
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

// Display face. Geometric with a humanist warmth — the circular bowls and
// generous apertures stay friendly at 800 where a pure grotesk turns severe,
// and the tall x-height keeps it legible when it shrinks to a section heading.
// Variable, so 500–800 costs no extra files.
const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

// Mono carries labels, metadata and anything that reads as instrument output.
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.xinyuguo.com"),
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
    "single-cell",
    "spatial transcriptomics",
  ],
  authors: [{ name: "Xinyu Guo" }],
  creator: "Xinyu Guo",
  // No `canonical` here on purpose: child routes inherit it, so any page that
  // forgot to set its own would declare itself the homepage. Each route
  // declares its own. Only the feed link is safe to inherit site-wide.
  alternates: {
    types: { "application/rss+xml": "https://www.xinyuguo.com/feed.xml" },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.xinyuguo.com",
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
  // for Android/PWA and iOS home screen. apple-touch-icon.png was declared
  // here before the file existed, so that link 404'd.
  icons: {
    icon: [
      // No favicon.ico entry: src/app/favicon.ico already emits its own link,
      // and listing it here produced a duplicate.
      { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
      { url: "/icon-512.png", type: "image/png", sizes: "512x512" },
    ],
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Font variables must live on <html>: the --font-*-stack tokens are declared
  // in :root, so they can only see variables defined at that level. Put them on
  // <body> and they silently resolve to the fallback stack instead.
  return (
    <html
      lang="en"
      className={`${inter.variable} ${plusJakarta.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Person and WebSite identity, site-wide. Detail pages add their own
            ScholarlyArticle node that points back at this Person by @id. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLd(personSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLd(websiteSchema) }}
        />
      </head>
      <body className="font-sans antialiased" suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <SmoothScroll>
            <div className="relative flex min-h-screen flex-col">
              <Navbar />
              <main className="flex-1">{children}</main>
              <Footer />
              <AssistantChat />
            </div>
          </SmoothScroll>
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}

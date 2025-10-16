import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "katex/dist/katex.min.css";

import { ThemeProvider } from "@/components/theme-provider";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ByteBrainChat } from "@/components/bytebrain-chat";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL('https://www.xinyuguo.com'),
  title: {
    default: "Xinyu Guo - Computational Biology Researcher & AI Developer",
    template: "%s | Xinyu Guo"
  },
  description: "Ph.D. candidate in Computational Biology & Bioinformatics at USC. Specializing in genomics, machine learning, and deep learning applications in biological research.",
  keywords: ["computational biology", "bioinformatics", "machine learning", "genomics", "AI research", "USC PhD", "Xinyu Guo", "single-cell", "spatial transcriptomics"],
  authors: [{ name: "Xinyu Guo" }],
  creator: "Xinyu Guo",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.xinyuguo.com",
    title: "Xinyu Guo - Computational Biology Researcher",
    description: "Ph.D. in Computational Biology exploring genomics, AI, and machine learning",
    siteName: "Xinyu Guo",
    images: [{
      url: "/headshot.jpg",
      width: 1200,
      height: 630,
      alt: "Xinyu Guo"
    }]
  },
  twitter: {
    card: "summary_large_image",
    title: "Xinyu Guo - Computational Biology Researcher",
    description: "Ph.D. in Computational Biology exploring genomics, AI, and machine learning",
    images: ["/headshot.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    }
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`} suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="relative flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
            <ByteBrainChat />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}

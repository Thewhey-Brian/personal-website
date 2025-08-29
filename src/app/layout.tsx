import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import { ThemeProvider } from "@/components/theme-provider";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ChatDock } from "@/components/chat-dock";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Xinyu Guo - Personal Website",
  description: "Ph.D. in Computational Biology and Bioinformatics. Showcasing research in genomics, AI projects, machine learning applications, scientific publications, and photography.",
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
            <ChatDock />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}

import { Inter, JetBrains_Mono, Plus_Jakarta_Sans } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

import { ThemeProvider } from "@/components/theme-provider";
import { SmoothScroll } from "@/components/motion/smooth-scroll";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { AssistantChat } from "@/components/assistant/assistant-chat";
import { jsonLd, personSchema, websiteSchema } from "@/lib/schema";
import { HTML_LANG, type Locale } from "@/i18n/config";
import { getMessages } from "@/i18n/messages";

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

/**
 * The whole document, shared by both root layouts.
 *
 * There are two root layouts — one per locale, in route groups — because only
 * a root layout renders <html>, and the `lang` attribute has to differ. Route
 * groups do not appear in the URL, so English keeps its existing paths.
 * Everything inside the document is identical, so it lives here rather than
 * being duplicated and drifting.
 */
export function SiteShell({
  locale,
  children,
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
  const t = getMessages(locale);

  // Font variables must live on <html>: the --font-*-stack tokens are declared
  // in :root, so they can only see variables defined at that level. Put them on
  // <body> and they silently resolve to the fallback stack instead.
  return (
    <html
      lang={HTML_LANG[locale]}
      className={`${inter.variable} ${plusJakarta.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      {/* eslint-disable-next-line @next/next/no-head-element --
          the rule targets the Pages Router. In the App Router a literal <head>
          in a root layout is the documented way to emit raw tags, and
          next/head is not supported here at all. */}
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
              <Navbar locale={locale} />
              <main className="flex-1">{children}</main>
              <Footer locale={locale} />
              <AssistantChat
                tagline={t.assistant.tagline}
                cta={t.assistant.cta}
              />
            </div>
          </SmoothScroll>
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}

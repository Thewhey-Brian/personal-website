"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarClock, Menu, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { BookCall, CALENDLY_URL } from "@/components/booking/book-call";
import { Button } from "@/components/ui/button";
import {
  DEFAULT_LOCALE,
  LOCALE_LABEL,
  localePath,
  switchLocalePath,
  type Locale,
} from "@/i18n/config";
import { getMessages } from "@/i18n/messages";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// The wordmark is read like a sequencing trace: on hover the letters light up
// one after another in a fluorescent glow, left to right.
function SequenceMark({ text }: { text: string }) {
  return (
    <span aria-label={text} className="inline-flex">
      {[...text].map((ch, i) =>
        ch === " " ? (
          <span key={i} className="w-[0.55em]" aria-hidden="true" />
        ) : (
          <span
            key={i}
            aria-hidden="true"
            className="transition-[color,text-shadow] duration-300 ease-out group-hover:text-signal group-hover:[text-shadow:var(--glow)]"
            style={{ transitionDelay: `${i * 35}ms` }}
          >
            {ch}
          </span>
        ),
      )}
    </span>
  );
}

export function Navbar({ locale = DEFAULT_LOCALE }: { locale?: Locale }) {
  const pathname = usePathname();
  const t = getMessages(locale);

  const navigation = [
    { name: t.nav.about, href: localePath("/about", locale) },
    { name: t.nav.publications, href: localePath("/publications", locale) },
    { name: t.nav.projects, href: localePath("/projects", locale) },
    { name: t.nav.contact, href: localePath("/contact", locale) },
  ];

  const other: Locale = locale === "en" ? "zh" : "en";
  // A plain <a>, not next/link: the two locales are separate root layouts, so
  // React cannot client-navigate between them. A full load is what has to
  // happen anyway, and an anchor makes that explicit.
  const otherHref = switchLocalePath(pathname ?? "/", other);

  const { setTheme, resolvedTheme } = useTheme();
  const [scrolled, setScrolled] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  // Bare over the hero, surfaced once you leave it — a permanent bar would cut
  // the full-height hero in half.
  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-500 ${
        scrolled
          ? "border-b border-border bg-background/80 backdrop-blur-md"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <div className="container mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link
          href={localePath("/", locale)}
          className="group font-mark text-[17px] font-bold uppercase tracking-[0.14em]"
        >
          <SequenceMark text={locale === "zh" ? "郭昕育" : "Xinyu Guo"} />
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navigation.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`relative font-nav text-[15.5px] font-semibold tracking-[-0.005em] transition-colors ${
                  active
                    ? "text-foreground"
                    : "text-foreground/70 hover:text-foreground"
                }`}
              >
                {item.name}
                {active && (
                  <span
                    className="absolute -bottom-1.5 left-0 h-px w-full bg-signal"
                    aria-hidden="true"
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-1">
          <BookCall className="font-nav mr-2 hidden items-center gap-1.5 rounded-full border border-signal/50 px-3.5 py-1.5 text-sm font-medium text-signal transition-colors hover:bg-signal hover:text-signal-foreground sm:inline-flex">
            <CalendarClock className="h-3.5 w-3.5" aria-hidden="true" />
            {locale === "zh" ? "预约" : "Book a call"}
          </BookCall>
          <a
            href={otherHref}
            hrefLang={other === "zh" ? "zh-CN" : "en"}
            title={t.nav.toggleLanguage}
            className="rounded-full px-3 py-1.5 font-mono text-xs tracking-[0.08em] text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            {LOCALE_LABEL[other]}
          </a>

          <Button
            variant="ghost"
            size="icon"
            aria-label="Toggle theme"
            className="h-9 w-9 rounded-full"
            onClick={() =>
              setTheme(resolvedTheme === "dark" ? "light" : "dark")
            }
          >
            {/* Rendered only after mount: the server cannot know the resolved
                theme, and guessing produces a hydration mismatch. */}
            {mounted &&
              (resolvedTheme === "dark" ? (
                <Sun className="h-[18px] w-[18px]" />
              ) : (
                <Moon className="h-[18px] w-[18px]" />
              ))}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-full md:hidden"
              >
                <Menu className="h-[18px] w-[18px]" />
                <span className="sr-only">{t.nav.openMenu}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" sideOffset={8} className="w-48">
              <DropdownMenuItem asChild>
                <a
                  href={CALENDLY_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="font-nav flex w-full items-center gap-2 text-[15px] font-medium text-signal"
                >
                  <CalendarClock className="h-3.5 w-3.5" aria-hidden="true" />
                  {locale === "zh" ? "预约通话" : "Book a call"}
                </a>
              </DropdownMenuItem>
              {navigation.map((item) => (
                <DropdownMenuItem key={item.href} asChild>
                  <Link
                    href={item.href}
                    className="font-nav w-full text-[15px] font-medium"
                  >
                    {item.name}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

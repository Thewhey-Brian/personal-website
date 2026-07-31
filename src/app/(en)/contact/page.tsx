import {
  ArrowUpRight,
  Github,
  Linkedin,
  Mail,
  MapPin,
  Twitter,
} from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";

import { Reveal } from "@/components/motion/reveal";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with Xinyu Guo for collaborations, opportunities, or discussions about computational biology and AI projects.",
  alternates: {
    canonical: "https://www.xinyuguo.com/contact",
    languages: {
      en: "https://www.xinyuguo.com/contact",
      "zh-CN": "https://www.xinyuguo.com/zh/contact",
      "x-default": "https://www.xinyuguo.com/contact",
    },
  },
};

const CHANNELS = [
  {
    label: "Email",
    value: "xyguo1202@gmail.com",
    href: "mailto:xyguo1202@gmail.com",
    icon: Mail,
    note: "Best for anything substantive",
  },
  {
    label: "GitHub",
    value: "Thewhey-Brian",
    href: "https://github.com/Thewhey-Brian",
    icon: Github,
    note: "Code and open source",
  },
  {
    label: "LinkedIn",
    value: "xinyu-guo-5408",
    href: "https://www.linkedin.com/in/xinyu-guo-5408/",
    icon: Linkedin,
    note: "Professional network",
  },
  {
    label: "Twitter",
    value: "@BrianXinyu",
    href: "https://x.com/BrianXinyu",
    icon: Twitter,
    note: "Occasional thoughts",
  },
];

export default function ContactPage() {
  return (
    <div className="container mx-auto max-w-4xl px-6 pb-24 pt-28 md:pt-32">
      <h1 className="text-4xl sm:text-5xl">Get in touch</h1>

      {/* A directory, not a grid of cards. Every row shows the actual address,
            so it can be copied without a round-trip through a button. */}
      <Reveal className="mb-14 mt-6 max-w-2xl">
        <p className="text-xl leading-[1.6] text-muted-foreground">
          Collaborations, opportunities, or a problem you&apos;re stuck on —
          computational biology, AI, or turning a rough idea into a real
          prototype. I&apos;d be glad to hear from you.
        </p>
      </Reveal>

      <Reveal>
        <span className="label-mono">Channels</span>
      </Reveal>

      <ul className="mt-6 border-t border-border">
        {CHANNELS.map((channel) => (
          <li key={channel.label}>
            <Link
              href={channel.href}
              target={channel.href.startsWith("http") ? "_blank" : undefined}
              rel={channel.href.startsWith("http") ? "noreferrer" : undefined}
              className="group flex items-center gap-5 border-b border-border py-6 transition-colors duration-500 hover:bg-signal-soft"
            >
              <channel.icon className="h-5 w-5 shrink-0 text-muted-foreground transition-colors duration-300 group-hover:text-signal" />

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline gap-x-3">
                  <span className="text-lg font-semibold transition-transform duration-500 ease-out group-hover:translate-x-1">
                    {channel.label}
                  </span>
                  <span className="truncate font-mono text-sm text-muted-foreground">
                    {channel.value}
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {channel.note}
                </p>
              </div>

              <ArrowUpRight className="h-5 w-5 shrink-0 -translate-x-1 translate-y-1 text-muted-foreground opacity-0 transition-all duration-500 ease-out group-hover:translate-x-0 group-hover:translate-y-0 group-hover:text-signal group-hover:opacity-100" />
            </Link>
          </li>
        ))}
      </ul>

      <Reveal className="mt-16">
        <div className="rounded-xl border border-border bg-surface p-8">
          <p className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.13em] text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" />
            Los Angeles, CA
          </p>
          <p className="mt-4 max-w-xl text-lg leading-relaxed">
            If you have an opportunity, a collaboration idea, or just want to
            talk science, send a note — no introduction necessary.
          </p>
        </div>
      </Reveal>
    </div>
  );
}

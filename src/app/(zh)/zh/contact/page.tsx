import { ArrowUpRight, Github, Linkedin, Mail, MapPin, Twitter } from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";

import { Reveal } from "@/components/motion/reveal";
import { getMessages } from "@/i18n/messages";
import { SITE_URL } from "@/i18n/config";

const t = getMessages("zh");

export const metadata: Metadata = {
  title: t.contact.title,
  description: t.contact.subtitle,
  alternates: {
    canonical: `${SITE_URL}/zh/contact`,
    languages: {
      "en": `${SITE_URL}/contact`,
      "zh-CN": `${SITE_URL}/zh/contact`,
      "x-default": `${SITE_URL}/contact`,
    },
  },
};

const CHANNELS = [
  {
    label: t.contact.email,
    value: "xyguo1202@gmail.com",
    href: "mailto:xyguo1202@gmail.com",
    icon: Mail,
    note: t.contact.emailNote,
  },
  {
    label: t.contact.github,
    value: "Thewhey-Brian",
    href: "https://github.com/Thewhey-Brian",
    icon: Github,
    note: t.contact.githubNote,
  },
  {
    label: t.contact.linkedin,
    value: "xinyu-guo-5408",
    href: "https://www.linkedin.com/in/xinyu-guo-5408/",
    icon: Linkedin,
    note: t.contact.linkedinNote,
  },
  {
    label: t.contact.twitter,
    value: "@BrianXinyu",
    href: "https://x.com/BrianXinyu",
    icon: Twitter,
    note: t.contact.twitterNote,
  },
];

export default function ZhContactPage() {
  return (
    <div className="container mx-auto max-w-4xl px-6 pb-24 pt-28 md:pt-32">
      <h1 className="text-4xl sm:text-5xl">{t.contact.title}</h1>
      <p className="mt-5 max-w-2xl text-[1.0625rem] leading-[1.85] text-muted-foreground">
        {t.contact.subtitle}
      </p>

      <p className="mt-6 flex items-center gap-2 font-mono text-xs text-muted-foreground">
        <MapPin className="h-3.5 w-3.5" />
        {t.about.location}
      </p>

      <div className="mt-14">
        <span className="label-mono">{t.contact.channels}</span>
        <ul className="mt-5 border-t border-border">
          {CHANNELS.map((c) => (
            <li key={c.label}>
              <Link
                href={c.href}
                target={c.href.startsWith("http") ? "_blank" : undefined}
                rel={c.href.startsWith("http") ? "noreferrer" : undefined}
                className="group flex items-center gap-5 border-b border-border py-6 transition-colors duration-500 hover:bg-signal-soft"
              >
                <c.icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <p className="label-mono !text-[10px]">{c.label}</p>
                  <p className="mt-1 break-all text-lg transition-transform duration-500 ease-out group-hover:translate-x-1.5">
                    {c.value}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">{c.note}</p>
                </div>
                <ArrowUpRight className="h-4 w-4 shrink-0 -translate-x-1 translate-y-1 text-muted-foreground opacity-0 transition-all duration-500 ease-out group-hover:translate-x-0 group-hover:translate-y-0 group-hover:text-signal group-hover:opacity-100" />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

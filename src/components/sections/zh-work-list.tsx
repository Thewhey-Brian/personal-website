import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { getMessages } from "@/i18n/messages";

export interface ZhWorkItem {
  /** Always the English detail page — those pages are not translated. */
  href: string;
  titleZh: string;
  /** Kept visible under the translation. */
  titleEn: string;
  summaryZh: string;
  meta: string[];
}

/**
 * List rows for the Chinese index pages.
 *
 * Both titles are shown. The English original is what appears in a citation,
 * a search engine and on the CV, so dropping it would make the work harder to
 * identify, not easier to read. Each row states that the write-up itself is in
 * English before the reader clicks.
 */
export function ZhWorkList({ items }: { items: ZhWorkItem[] }) {
  const t = getMessages("zh");

  if (items.length === 0) {
    return (
      <p className="border-y border-border py-16 text-center text-muted-foreground">
        {t.publications.empty}
      </p>
    );
  }

  return (
    <ul className="border-t border-border">
      {items.map((item) => (
        <li key={item.href}>
          <Link
            href={item.href}
            className="group relative block border-b border-border py-7 transition-colors duration-500 hover:bg-signal-soft"
          >
            <span
              aria-hidden="true"
              className="absolute inset-x-0 top-0 h-px origin-left scale-x-0 bg-signal transition-transform duration-500 ease-out group-hover:scale-x-100"
            />

            <div className="flex items-start gap-4 px-1 sm:px-3">
              <div className="min-w-0 flex-1">
                <div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                  {item.meta.map((m, i) => (
                    <span key={m} className="label-mono !text-[10px]">
                      {i > 0 && <span className="mr-3 opacity-40">/</span>}
                      {m}
                    </span>
                  ))}
                </div>

                <h2 className="text-lg leading-snug transition-transform duration-500 ease-out group-hover:translate-x-1.5">
                  {item.titleZh}
                </h2>

                <p className="mt-1.5 text-[13px] leading-snug text-muted-foreground/80">
                  {item.titleEn}
                </p>

                <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
                  {item.summaryZh}
                </p>

                <span className="mt-3 inline-flex items-center gap-1 font-mono text-[11px] text-signal">
                  {t.common.englishBody}
                  <ArrowUpRight className="h-3 w-3" />
                </span>
              </div>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}

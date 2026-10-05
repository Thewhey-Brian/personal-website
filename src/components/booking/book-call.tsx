"use client";

import { useCallback, useEffect, useRef, type ReactNode } from "react";
import { useTheme } from "next-themes";

/**
 * Public booking page. Only the URL lives in the site; the Calendly API token
 * was used once to look it up and is never shipped to the browser.
 */
export const CALENDLY_URL = "https://calendly.com/xyguo1202/30min";

const WIDGET_JS = "https://assets.calendly.com/assets/external/widget.js";
const WIDGET_CSS = "https://assets.calendly.com/assets/external/widget.css";

declare global {
  interface Window {
    Calendly?: { initPopupWidget: (opts: { url: string }) => void };
  }
}

let loading: Promise<void> | null = null;

/** Loads Calendly's widget once, on first intent, so pages pay nothing up front. */
function loadWidget(): Promise<void> {
  if (window.Calendly) return Promise.resolve();
  if (loading) return loading;

  loading = new Promise<void>((resolve, reject) => {
    const css = document.createElement("link");
    css.rel = "stylesheet";
    css.href = WIDGET_CSS;
    document.head.appendChild(css);

    const js = document.createElement("script");
    js.src = WIDGET_JS;
    js.async = true;
    js.onload = () => resolve();
    js.onerror = () => {
      loading = null;
      reject(new Error("Calendly widget failed to load"));
    };
    document.body.appendChild(js);
  });
  return loading;
}

/** Calendly's own colour params, approximating the site's oklch tokens in hex. */
function themedUrl(dark: boolean) {
  const params = dark
    ? {
        background_color: "1c1916",
        text_color: "f1ece2",
        primary_color: "d8b679",
      }
    : {
        background_color: "fbf9f4",
        text_color: "2a2420",
        primary_color: "93703d",
      };
  const q = new URLSearchParams({ hide_gdpr_banner: "1", ...params });
  return `${CALENDLY_URL}?${q}`;
}

/**
 * A real link to the booking page that upgrades to Calendly's in-page popup
 * when the widget is available. If the script is blocked, the link still works.
 */
export function BookCall({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  const { resolvedTheme } = useTheme();
  const warmed = useRef(false);

  const warm = useCallback(() => {
    if (warmed.current) return;
    warmed.current = true;
    loadWidget().catch(() => {
      warmed.current = false;
    });
  }, []);

  // Close the popup's body scroll lock if the component unmounts mid-booking.
  useEffect(
    () => () => document.body.classList.remove("calendly-popup-open"),
    [],
  );

  const open = useCallback(
    async (e: React.MouseEvent<HTMLAnchorElement>) => {
      // Let modified clicks open the booking page in a new tab as usual.
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
      e.preventDefault();
      try {
        await loadWidget();
        window.Calendly?.initPopupWidget({
          url: themedUrl(resolvedTheme === "dark"),
        });
      } catch {
        window.open(CALENDLY_URL, "_blank", "noopener,noreferrer");
      }
    },
    [resolvedTheme],
  );

  return (
    <a
      href={CALENDLY_URL}
      target="_blank"
      rel="noreferrer"
      onClick={open}
      onPointerEnter={warm}
      onFocus={warm}
      className={className}
    >
      {children}
    </a>
  );
}

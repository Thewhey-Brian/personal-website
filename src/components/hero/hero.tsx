"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Github, Linkedin, Mail, Twitter } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

import { Magnetic } from "@/components/motion/reveal";
import { DEFAULT_LOCALE, localePath, type Locale } from "@/i18n/config";
import { getMessages } from "@/i18n/messages";
import ParticleNetwork from "@/components/particle-network";
import { prefersReducedMotion } from "@/lib/motion";
import { CursorLight } from "./cursor-light";
import { Robot } from "./robot";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const ROLES = [
  "Researcher",
  "Developer",
  "Photographer",
  "Scientist",
  "Entrepreneur",
];

const SOCIALS = [
  { name: "GitHub", href: "https://github.com/Thewhey-Brian", icon: Github },
  { name: "Twitter", href: "https://x.com/BrianXinyu", icon: Twitter },
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/in/xinyu-guo-5408/",
    icon: Linkedin,
  },
  { name: "Email", href: "mailto:xyguo1202@gmail.com", icon: Mail },
];

/**
 * Typewriter driven by a small state machine.
 *
 * The original nested a delete-interval inside a type-interval and cleared only
 * the outer one, so every cycle leaked a timer and the speed compounded. Here
 * each phase schedules exactly one timeout and cleanup always clears it.
 */
function useTypewriter(
  words: string[],
  typeMs = 95,
  deleteMs = 45,
  holdMs = 1900,
) {
  const [text, setText] = useState("");
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<"typing" | "holding" | "deleting">(
    "typing",
  );
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    if (prefersReducedMotion()) {
      setEnabled(false);
      setText(words[0]);
    }
  }, [words]);

  useEffect(() => {
    if (!enabled) return;
    const word = words[index % words.length];

    if (phase === "typing") {
      if (text === word) {
        setPhase("holding");
        return;
      }
      const t = setTimeout(
        () => setText(word.slice(0, text.length + 1)),
        typeMs,
      );
      return () => clearTimeout(t);
    }

    if (phase === "holding") {
      const t = setTimeout(() => setPhase("deleting"), holdMs);
      return () => clearTimeout(t);
    }

    if (text === "") {
      setIndex((i) => (i + 1) % words.length);
      setPhase("typing");
      return;
    }
    const t = setTimeout(
      () => setText(word.slice(0, text.length - 1)),
      deleteMs,
    );
    return () => clearTimeout(t);
  }, [text, phase, index, enabled, words, typeMs, deleteMs, holdMs]);

  return text;
}

export function Hero({ locale = DEFAULT_LOCALE }: { locale?: Locale }) {
  const t = getMessages(locale);
  const typed = useTypewriter([...t.hero.roles]);
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {

      const q = gsap.utils.selector(root);

      // Everything in this hero renders visible. Nothing is hidden by a CSS
      // class or an inline style, so a failed tween, a paused ticker, or no JS
      // at all degrades to readable content rather than a blank column.
      //
      // The from-states are therefore applied HERE, and useGSAP runs inside
      // useLayoutEffect — before paint — so arming them costs no flash.
      if (prefersReducedMotion()) return;

      const words = q("[data-hero-word]");
      const bloom = q("[data-hero-bloom]");
      const fadeUp = q("[data-hero]");
      const robot = q("[data-hero-robot]");
      const cue = q("[data-hero-cue]");

      gsap.set(words, { yPercent: 118 });
      gsap.set(bloom, { opacity: 0 });
      gsap.set(fadeUp, { opacity: 0, y: 16 });
      gsap.set(robot, { opacity: 0, scale: 0.92, x: 70 });
      gsap.set(cue, { opacity: 0 });

      // One master timeline rather than a dozen independent tweens. Overlapping
      // the segments is what turns a sequence of pops into a single arrival.
      const tl = gsap.timeline({ defaults: { ease: "expo.out" } });

      tl.to(robot, { opacity: 1, scale: 1, x: 0, duration: 1.7 }, 0)
        .to(q("[data-hero-eyebrow]"), { opacity: 1, y: 0, duration: 1 }, 0.2)
        .to(words, { yPercent: 0, duration: 1.3, stagger: 0.09 }, 0.3)
        // Bloom trails the words slightly, so the light reads as cast by the
        // name arriving rather than sitting there waiting for it.
        .to(bloom, { opacity: 0.32, duration: 1.6, ease: "sine.out" }, 0.7)
        .to(q("[data-hero-role]"), { opacity: 1, y: 0, duration: 1 }, 0.95)
        .to(q("[data-hero-copy]"), { opacity: 1, y: 0, duration: 1 }, 1.08)
        .to(
          q("[data-hero-cta]"),
          { opacity: 1, y: 0, duration: 0.9, stagger: 0.09 },
          1.22,
        )
        .to(
          q("[data-hero-social]"),
          { opacity: 1, y: 0, duration: 0.7, stagger: 0.06 },
          1.4,
        )
        .to(cue, { opacity: 1, duration: 0.8 }, 1.6);

      // Slow drift across the name so the gradient catches light as it moves.
      gsap.to(q("[data-hero-gradient]"), {
        backgroundPosition: "100% 50%",
        duration: 7,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
      });

      // The bloom breathes on the inner layer, leaving the wrapper's opacity
      // free for the entrance fade and the scroll parallax to own. Two tweens
      // fighting over one opacity is how these end up flickering.
      gsap.to(q("[data-hero-bloom-inner]"), {
        scale: 1.09,
        opacity: 0.72,
        duration: 5.5,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        transformOrigin: "34% 62%",
      });

      // Parallax. Three different rates is what gives the section depth as you
      // leave it, rather than everything sliding away as one plane.
      const scrub = {
        trigger: root.current,
        start: "top top",
        end: "bottom top",
        scrub: 0.6,
      };

      gsap.to(q("[data-hero-copy-col]"), {
        yPercent: -16,
        opacity: 0.1,
        ease: "none",
        scrollTrigger: scrub,
      });
      gsap.to(q("[data-hero-robot]"), {
        yPercent: -30,
        ease: "none",
        scrollTrigger: scrub,
      });
      gsap.to(q("[data-hero-cue]"), {
        opacity: 0,
        ease: "none",
        scrollTrigger: scrub,
      });
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      className="relative isolate flex min-h-[100svh] items-center overflow-hidden"
    >
      <ParticleNetwork className="z-0" />
      <CursorLight className="z-0" />

      {/* The character sits in the composition rather than beside it: oversized,
          bleeding off the right edge, and behind the type. Scaled up and pushed
          out so it reads as a presence, not an illustration in a box. */}
      <div
        data-hero-robot
        className="pointer-events-none absolute -right-[20%] top-1/2 z-10 w-[30rem] -translate-y-1/2 sm:-right-[12%] sm:w-[34rem] lg:-right-[4%] lg:w-[38rem] xl:right-[1%] xl:w-[44rem]"
      >
        {/* pointer-events restored on the figure itself so it stays pokeable */}
        <Robot size={832} className="pointer-events-auto h-auto w-full" />
      </div>

      {/* Legibility scrim. Where the type crosses the figure it must win, and a
          left-to-right wash does that without dimming the character globally. */}
      <div
        className="pointer-events-none absolute inset-y-0 left-0 z-[15] w-full bg-gradient-to-r from-background via-background/92 to-transparent sm:w-[85%] lg:w-[72%]"
        aria-hidden="true"
      />

      {/* Grounds the section so it has a horizon. */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[15] h-48 bg-gradient-to-b from-transparent to-background"
        aria-hidden="true"
      />

      <div className="container relative z-20 mx-auto max-w-6xl px-6 py-28">
        <div data-hero-copy-col className="max-w-2xl text-left">
          {/* rule + eyebrow, the classic editorial opener */}
          <div
            data-hero
            data-hero-eyebrow
            className="mb-9 flex items-center gap-4"
          >
            <span className="h-px w-10 bg-signal" aria-hidden="true" />
            <span className="label-mono">
              {t.hero.eyebrow}
            </span>
          </div>

          {/* Two lines, left-aligned, set tight. "Xinyu Guo" shares one mask so
              the gradient runs continuously instead of restarting per word.

              No `data-reveal-line` here and no inline transform: the words are
              plain visible markup, and the timeline arms them pre-paint. That
              is the whole reason the name can no longer vanish. */}
          <div className="relative">
            {/* Ambient bloom behind the name.

                Deliberately a separate blurred layer rather than a text-shadow:
                the gradient relies on background-clip:text, so the glyphs
                themselves are transparent and a text-shadow would show *through*
                the letterforms instead of haloing them. A composited radial
                layer also stays on the GPU, where a large-radius drop-shadow
                filter would re-rasterise on every frame of the entrance. */}
            <div
              data-hero-bloom
              aria-hidden="true"
              className="pointer-events-none absolute -inset-x-12 -inset-y-10 -z-10"
            >
              <div
                data-hero-bloom-inner
                className="h-full w-full"
                style={{
                  background:
                    "radial-gradient(58% 52% at 34% 62%, var(--signal), transparent 72%)",
                  filter: "blur(52px)",
                }}
              />
            </div>

            <h1
              className="text-[3.5rem] leading-[0.98] sm:text-[5rem] lg:text-[6.5rem] xl:text-[7.5rem]"
              aria-label={t.hero.ariaName}
            >
              <span className="reveal-mask block" aria-hidden="true">
                <span data-hero-word className="block">
                  {t.hero.greeting}
                </span>
              </span>
              <span className="reveal-mask block" aria-hidden="true">
                <span data-hero-word className="block">
                  <span data-hero-gradient className="text-gradient-signal">
                    {t.hero.name}
                  </span>
                </span>
              </span>
            </h1>
          </div>

          {/* Fixed height so nothing shifts as characters are typed. */}
          <div data-hero data-hero-role className="mt-8 flex h-12 items-center">
            <span className="mr-3 font-mono text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground/70">
              {t.hero.currently}
            </span>
            <p className="font-mono text-xl font-semibold text-foreground sm:text-2xl">
              {typed}
              <span
                className="ml-1 inline-block w-[3px] animate-pulse bg-signal align-middle"
                style={{ height: "1.05em" }}
              />
            </p>
          </div>

          {/* Key terms carry the weight so the sentence can be skimmed in one
              pass — you read the three fields before you read the sentence. */}
          <div data-hero data-hero-copy className="mt-8 max-w-xl">
            <p className="text-[1.375rem] leading-[1.55] text-muted-foreground">
              {t.hero.copyLead}{" "}
              <span className="font-semibold text-foreground">
                {t.hero.copyFields[0]}
              </span>
              {locale === "zh" ? "、" : ", "}
              <span className="font-semibold text-foreground">
                {t.hero.copyFields[1]}
              </span>
              {locale === "zh" ? "与" : " and "}
              <span className="font-semibold text-foreground">
                {t.hero.copyFields[2]}
              </span>{" "}
              {t.hero.copyTail}
            </p>
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-3">
            <div data-hero data-hero-cta>
              <Magnetic>
                <Link
                  href={localePath("/about", locale)}
                  className="group inline-flex items-center gap-2 rounded-full bg-signal px-8 py-4 text-base font-semibold text-signal-foreground transition-opacity hover:opacity-90"
                >
                  {t.hero.ctaPrimary}
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </Magnetic>
            </div>
            <div data-hero data-hero-cta>
              <Magnetic>
                <Link
                  href={localePath("/publications", locale)}
                  className="inline-flex items-center rounded-full border border-border px-8 py-4 text-base font-semibold transition-colors hover:bg-accent"
                >
                  {t.hero.ctaSecondary}
                </Link>
              </Magnetic>
            </div>
          </div>

          <div className="mt-11 flex items-center gap-1">
            {SOCIALS.map((s) => (
              <div key={s.name} data-hero data-hero-social>
                <Magnetic radius={46} strength={0.4}>
                  <Link
                    href={s.href}
                    target={s.href.startsWith("http") ? "_blank" : undefined}
                    rel={s.href.startsWith("http") ? "noreferrer" : undefined}
                    aria-label={s.name}
                    className="flex h-11 w-11 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                  >
                    <s.icon className="h-[18px] w-[18px]" />
                  </Link>
                </Magnetic>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div
        data-hero-cue
        className="absolute bottom-9 left-6 z-20 flex items-center gap-3 md:left-[max(1.5rem,calc((100vw-72rem)/2+1.5rem))]"
        aria-hidden="true"
      >
        <span className="label-mono !text-[10px]">Scroll</span>
        <span className="h-px w-12 overflow-hidden bg-border">
          <span className="block h-px w-4 animate-[slide_2.2s_ease-in-out_infinite] bg-signal" />
        </span>
      </div>
    </section>
  );
}

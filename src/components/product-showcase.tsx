import Link from "next/link";

/**
 * Showcase blocks for shipped products, used from MDX.
 *
 * Research write-ups are prose with figures. A product needs to be *seen*:
 * the icon, the store badge, a row of phone screens, a short clip. These are
 * plain server components — no motion, no client JS — so the MDX stays
 * cheap and the screenshots are real <img> elements a crawler can index.
 */

export function AppStoreBadge({ href }: { href: string }) {
  return (
    <Link
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label="Download on the App Store"
      className="inline-block transition-opacity hover:opacity-80"
    >
      {/* Apple's official badge; black works on both themes. */}
      <img
        src="/badges/app-store-black.svg"
        alt="Download on the App Store"
        width={160}
        height={53}
        className="h-[46px] w-auto"
      />
    </Link>
  );
}

export function ProductHeader({
  logo,
  name,
  tagline,
  website,
  appStore,
  children,
}: {
  logo: string;
  name: string;
  tagline: string;
  website?: string;
  appStore?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="not-prose my-10 flex flex-col gap-6 rounded-2xl border border-border bg-surface p-7 sm:flex-row sm:items-center">
      <img
        src={logo}
        alt={`${name} app icon`}
        width={112}
        height={112}
        className="h-24 w-24 shrink-0 rounded-[22%] border border-border shadow-md sm:h-28 sm:w-28"
      />
      <div className="min-w-0 flex-1">
        <p className="font-display text-2xl font-semibold leading-tight">
          {name}
        </p>
        <p className="mt-1 text-[15px] text-muted-foreground">{tagline}</p>
        {children && (
          <div className="mt-3 text-sm text-muted-foreground">{children}</div>
        )}
        <div className="mt-4 flex flex-wrap items-center gap-3">
          {appStore && <AppStoreBadge href={appStore} />}
          {website && (
            <Link
              href={website}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-[46px] items-center rounded-lg border border-border px-4 font-mono text-xs transition-colors hover:border-signal/50 hover:bg-accent"
            >
              {website.replace(/^https?:\/\//, "").replace(/\/$/, "")} ↗
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

/** A row of phone screenshots, sized so 3–4 fit on desktop and scroll on mobile. */
export function PhoneRail({
  screens,
  caption,
}: {
  screens: { src: string; alt: string }[];
  caption?: string;
}) {
  return (
    <figure className="not-prose my-10">
      <div className="-mx-6 flex gap-4 overflow-x-auto px-6 pb-3 sm:mx-0 sm:px-0 [scrollbar-width:thin]">
        {screens.map((s) => (
          <img
            key={s.src}
            src={s.src}
            alt={s.alt}
            loading="lazy"
            className="h-[520px] w-auto shrink-0 rounded-[28px] border border-border bg-surface shadow-lg sm:h-[560px]"
          />
        ))}
      </div>
      {caption && (
        <figcaption className="mt-3 font-mono text-xs text-muted-foreground">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

/** A muted, looping clip with a poster frame; never autoplays with sound. */
export function Clip({
  src,
  poster,
  caption,
  aspect = "16/9",
  portrait = false,
}: {
  src: string;
  poster?: string;
  caption?: string;
  aspect?: string;
  /** Phone-shaped clips sit in a narrow centred column instead of stretching. */
  portrait?: boolean;
}) {
  return (
    <figure className={`not-prose my-10 ${portrait ? "mx-auto max-w-[320px]" : ""}`}>
      <video
        src={src}
        poster={poster}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        style={{ aspectRatio: aspect }}
        className={`w-full border border-border bg-black object-cover ${portrait ? "rounded-[32px]" : "rounded-2xl"}`}
      />
      {caption && (
        <figcaption className="mt-3 font-mono text-xs text-muted-foreground">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

/** Three or four facts a reader should leave with. */
export function Facts({ items }: { items: { label: string; value: string }[] }) {
  return (
    <dl className="not-prose my-10 grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
      {items.map((f) => (
        <div key={f.label} className="bg-surface p-5">
          <dt className="label-mono !text-[10px]">{f.label}</dt>
          <dd className="mt-2 font-display text-xl font-semibold leading-tight">
            {f.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

/** A grid of full-width visuals (banners, iPad frames, look samples). */
export function Gallery({
  images,
  cols = 2,
  caption,
}: {
  images: { src: string; alt: string }[];
  cols?: 2 | 3 | 4;
  caption?: string;
}) {
  const colClass = { 2: "sm:grid-cols-2", 3: "sm:grid-cols-3", 4: "sm:grid-cols-2 lg:grid-cols-4" }[cols];
  return (
    <figure className="not-prose my-10">
      <div className={`grid gap-4 ${colClass}`}>
        {images.map((im) => (
          <img
            key={im.src}
            src={im.src}
            alt={im.alt}
            loading="lazy"
            className="w-full rounded-xl border border-border"
          />
        ))}
      </div>
      {caption && (
        <figcaption className="mt-3 font-mono text-xs text-muted-foreground">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

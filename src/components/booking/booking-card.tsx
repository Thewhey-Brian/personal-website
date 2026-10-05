import { ArrowUpRight, CalendarClock } from "lucide-react";

import { BookCall } from "./book-call";

/** The contact page's lead option: a 30-minute call booked straight from the site. */
export function BookingCard({ locale = "en" }: { locale?: "en" | "zh" }) {
  const zh = locale === "zh";
  return (
    <BookCall className="group mb-14 flex items-center gap-5 rounded-xl border border-border bg-surface p-6 transition-colors duration-500 hover:border-signal/60 hover:bg-signal-soft sm:p-8">
      <CalendarClock className="h-6 w-6 shrink-0 text-signal" aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <p className="text-xl font-semibold">
          {zh ? "预约 30 分钟通话" : "Book a 30-minute call"}
        </p>
        <p className="mt-1 text-[15px] text-muted-foreground">
          {zh
            ? "在我的日历上直接选一个时间，会自动换算成你的时区。"
            : "Pick a time on my calendar. Times show in your own time zone."}
        </p>
      </div>
      <ArrowUpRight className="h-5 w-5 shrink-0 text-muted-foreground transition-all duration-500 ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-signal" />
    </BookCall>
  );
}

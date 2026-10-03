"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  CalendarDays,
  MapPin,
  Clock,
  Layers,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { EventService } from "@/services/event.service";
import { IEvent } from "@/types/event";
import { cn } from "@/lib/utils";

export function EventsSection() {
  const [events, setEvents] = useState<IEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    EventService.getAllEvents({ limit: 4, isActive: true })
      .then((res) => {
        if (isMounted) {
          setEvents(res.data);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ONGOING":
        return "bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-500/30";
      case "UPCOMING":
        return "bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/30";
      case "COMPLETED":
        return "bg-gray-500/15 text-gray-800 dark:text-gray-300 border-gray-500/30";
      default:
        return "bg-red-500/15 text-red-800 dark:text-red-300 border-red-500/30";
    }
  };

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 sm:mb-10">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-[#C78700]/15 px-3 py-1 text-xs font-bold text-[#C78700] dark:text-amber-400 border border-[#C78700]/30 mb-2">
            <Sparkles className="h-3.5 w-3.5" />
            <span>আসন্ন ও চলমান ইভেন্টস</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
            Seminars, Circles & Events
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-xl">
            পাঠচক্রের নতুন সেশন, বই প্রদর্শনী ও দ্বীনি আলোচনায় অংশগ্রহণ করুন। উপস্থিতি ও সেশন ভিত্তিক মতামত প্রদানের সুযোগ।
          </p>
        </div>

        <Link
          href="/events"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#004F32] dark:text-emerald-400 hover:text-[#C78700] dark:hover:text-amber-400 transition-colors shrink-0 group"
        >
          <span>সকল ইভেন্ট দেখুন</span>
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="h-64 rounded-3xl bg-muted/50 border border-border animate-pulse p-6"
            />
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-3xl border border-dashed border-border p-8">
          <CalendarDays className="h-10 w-10 mx-auto text-muted-foreground/60 mb-3" />
          <h3 className="text-base font-bold text-foreground">বর্তমানে কোনো সক্রিয় ইভেন্ট নেই</h3>
          <p className="text-xs text-muted-foreground mt-1">শীঘ্রই নতুন ইভেন্টের সময়সূচি প্রকাশ করা হবে।</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {events.map((event) => (
            <div
              key={event.id}
              className="group relative overflow-hidden rounded-3xl bg-card border border-border hover:border-emerald-600/40 transition-all duration-300 hover:shadow-xl p-5 sm:p-6 flex flex-col justify-between"
            >
              <div className="space-y-4">
                {/* Header Row: Badges */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-0.5 text-[10px] font-bold border",
                        getStatusBadge(event.status)
                      )}
                    >
                      {event.status}
                    </span>
                    {event.category && (
                      <span className="rounded-full bg-muted px-2.5 py-0.5 text-[10px] font-medium text-foreground">
                        {event.category}
                      </span>
                    )}
                  </div>
                  {event.activity && (
                    <span className="text-[11px] font-medium text-primary">
                      {event.activity.title}
                    </span>
                  )}
                </div>

                {/* Event Title */}
                <div>
                  <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                    <Link href={`/events/${event.slug}`}>{event.title}</Link>
                  </h3>
                  {event.currentChapter && (
                    <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold mt-1">
                      বর্তমান বিষয়: {event.currentChapter}
                    </p>
                  )}
                </div>

                {/* Details Pills */}
                <div className="space-y-1.5 text-xs text-muted-foreground">
                  {event.scheduleText && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                      <span>{event.scheduleText}</span>
                    </div>
                  )}
                  {event.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-rose-500 shrink-0" />
                      <span>{event.location}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Layers className="h-3.5 w-3.5 text-[#C78700] shrink-0" />
                    <span>
                      {event._count?.sessions || 0} টি সম্পন্ন সেশন • {event._count?.memberRecords || 0} জন অংশগ্রহণকারী
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom CTA */}
              <div className="mt-5 pt-4 border-t border-border/60 flex items-center justify-between">
                <span className="text-[11px] text-muted-foreground font-mono">
                  {event.startDate
                    ? new Date(event.startDate).toLocaleDateString("bn-BD", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "তারিখ নির্ধারিত নয়"}
                </span>
                <Link
                  href={`/events/${event.slug}`}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors text-xs font-bold"
                >
                  <span>অংশগ্রহণ ও সেশন</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default EventsSection;

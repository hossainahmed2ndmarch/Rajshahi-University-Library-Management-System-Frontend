"use client";

import React, { useEffect, useState, useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  CalendarDays,
  MapPin,
  Clock,
  Layers,
  Sparkles,
  Search,
  Filter,
  ArrowRight,
} from "lucide-react";
import { EventService, ActivityService } from "@/services/event.service";
import { IEvent, IActivity } from "@/types/event";
import { cn } from "@/lib/utils";

export default function EventsCatalogPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl px-4 py-16 text-center">
          <div className="h-8 w-48 bg-muted rounded-full mx-auto animate-pulse mb-4" />
          <div className="h-4 w-72 bg-muted rounded-full mx-auto animate-pulse" />
        </div>
      }
    >
      <EventsCatalogPageContent />
    </Suspense>
  );
}

function EventsCatalogPageContent() {
  const searchParams = useSearchParams();
  const initialActivityId = searchParams.get("activityId");

  const [events, setEvents] = useState<IEvent[]>([]);
  const [activities, setActivities] = useState<IActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [activityFilter, setActivityFilter] = useState<string>(
    initialActivityId || "ALL"
  );
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    let isMounted = true;
    Promise.all([
      EventService.getAllEvents({ limit: 50, isActive: true }),
      ActivityService.getAllActivities({ limit: 50 }),
    ])
      .then(([eventsRes, activitiesRes]) => {
        if (isMounted) {
          setEvents(eventsRes.data);
          setActivities(activitiesRes.data);
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

  const filteredEvents = useMemo(() => {
    return events.filter((ev) => {
      const matchSearch =
        ev.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (ev.location && ev.location.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (ev.currentChapter &&
          ev.currentChapter.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchStatus = statusFilter === "ALL" || ev.status === statusFilter;
      const matchActivity =
        activityFilter === "ALL" || String(ev.activityId) === activityFilter;

      return matchSearch && matchStatus && matchActivity;
    });
  }, [events, searchQuery, statusFilter, activityFilter]);

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
    <div className="space-y-12 py-8 sm:py-12">
      {/* Hero Header */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-[#004F32] via-[#003824] to-[#040D09] p-8 sm:p-12 text-white shadow-xl relative overflow-hidden">
          <div className="max-w-2xl space-y-4 relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#C78700]/20 px-3.5 py-1 text-xs font-bold text-amber-300 border border-[#C78700]/30">
              <Sparkles className="h-3.5 w-3.5" />
              <span>সেমিনার, পাঠচক্র ও লাইব্রেরি ইভেন্টস</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              Library Events & Study Circles
            </h1>
            <p className="text-sm sm:text-base text-emerald-100/90 leading-relaxed font-light">
              সাপ্তাহিক পাঠচক্রের সেশনসমূহ অনুসরণ করুন, নিজের উপস্থিতি রেকর্ড করুন এবং সেশনের মূল সারসংক্ষেপ ও আলোচনা পর্যালোচনায় আপনার মতামত প্রদান করুন।
            </p>
          </div>
        </div>
      </section>

      {/* Filter and Search Bar */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 space-y-3 shadow-xs">
          {/* Top Row: Search + Status Tabs */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="ইভেন্ট বা বিষয় খুঁজুন..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-foreground"
              />
            </div>

            {/* Status Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto">
              {(["ALL", "UPCOMING", "ONGOING", "COMPLETED"] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={cn(
                    "px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all shrink-0 cursor-pointer",
                    statusFilter === st
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                      : "bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground border-border/80"
                  )}
                >
                  {st === "ALL"
                    ? "সকল"
                    : st === "UPCOMING"
                    ? "আসন্ন"
                    : st === "ONGOING"
                    ? "চলমান"
                    : "সম্পন্ন"}
                </button>
              ))}
            </div>
          </div>

          {/* Activity Filter Chips Row */}
          {activities.length > 0 && (
            <div className="flex items-center gap-1.5 overflow-x-auto border-t border-border/60 pt-3">
              <div className="flex items-center gap-1 text-[11px] font-semibold text-muted-foreground mr-1 shrink-0">
                <Filter className="h-3.5 w-3.5 text-emerald-600" />
                <span>কার্যক্রম:</span>
              </div>

              <button
                type="button"
                onClick={() => setActivityFilter("ALL")}
                className={cn(
                  "px-3 py-1 rounded-xl text-xs font-medium transition-all shrink-0 border cursor-pointer",
                  activityFilter === "ALL"
                    ? "bg-[#003824] text-white border-[#003824] shadow-xs"
                    : "bg-muted/30 hover:bg-muted text-muted-foreground hover:text-foreground border-border/70"
                )}
              >
                সকল কার্যক্রম
              </button>

              {activities.map((act) => {
                const isActive = activityFilter === String(act.id);
                return (
                  <button
                    key={act.id}
                    type="button"
                    onClick={() => setActivityFilter(String(act.id))}
                    className={cn(
                      "px-3 py-1 rounded-xl text-xs font-medium transition-all shrink-0 border cursor-pointer whitespace-nowrap",
                      isActive
                        ? "bg-[#003824] text-white border-[#003824] shadow-xs"
                        : "bg-muted/30 hover:bg-muted text-muted-foreground hover:text-foreground border-border/70"
                    )}
                  >
                    {act.title}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Events Grid */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-80 rounded-3xl bg-muted/40 animate-pulse border border-border"
              />
            ))}
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-16 bg-card rounded-3xl border border-dashed border-border p-8 space-y-3">
            <CalendarDays className="h-12 w-12 mx-auto text-muted-foreground/50" />
            <h3 className="text-base font-bold text-foreground">কোনো ইভেন্ট খুঁজে পাওয়া যায়নি</h3>
            <p className="text-xs text-muted-foreground">ফিল্টারের মান পরিবর্তন করে পুনরায় চেষ্টা করুন।</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <div
                key={event.id}
                className="group relative overflow-hidden rounded-3xl bg-card border border-border hover:border-emerald-600/40 hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Banner */}
                  <div className="relative h-44 w-full overflow-hidden bg-gradient-to-tr from-[#003824] via-[#004F32] to-[#041a10]">
                    {event.bannerImage ? (
                      <img
                        src={event.bannerImage}
                        alt={event.title}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center opacity-20">
                        <CalendarDays className="h-20 w-20 text-white" />
                      </div>
                    )}
                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      <span
                        className={cn(
                          "rounded-full px-2.5 py-0.5 text-[10px] font-bold border backdrop-blur-md",
                          getStatusBadge(event.status)
                        )}
                      >
                        {event.status}
                      </span>
                      <span className="rounded-full bg-black/50 text-white px-2 py-0.5 text-[10px] font-mono backdrop-blur-md">
                        {event.org}
                      </span>
                    </div>

                    {event.category && (
                      <div className="absolute bottom-3 right-3">
                        <span className="rounded-md bg-[#C78700] text-white px-2 py-0.5 text-[10px] font-semibold backdrop-blur-md">
                          {event.category}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="p-5 space-y-3">
                    {event.activity && (
                      <span className="text-[11px] font-bold text-primary block">
                        {event.activity.title}
                      </span>
                    )}

                    <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                      <Link href={`/events/${event.slug}`}>{event.title}</Link>
                    </h3>

                    {event.currentChapter && (
                      <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold line-clamp-1">
                        বিষয়: {event.currentChapter}
                      </p>
                    )}

                    <div className="space-y-1.5 text-xs text-muted-foreground pt-1">
                      {event.scheduleText && (
                        <div className="flex items-center gap-2">
                          <Clock className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                          <span className="truncate">{event.scheduleText}</span>
                        </div>
                      )}
                      {event.location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3.5 w-3.5 text-rose-500 shrink-0" />
                          <span className="truncate">{event.location}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Layers className="h-3.5 w-3.5 text-[#C78700] shrink-0" />
                        <span>
                          {event._count?.sessions || 0} টি সেশন • {event._count?.memberRecords || 0} জন নথিভুক্ত
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="p-5 pt-0 border-t border-border/50 flex items-center justify-between text-xs mt-3">
                  <span className="text-muted-foreground font-mono text-[11px]">
                    {event.startDate
                      ? new Date(event.startDate).toLocaleDateString("bn-BD", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "তারিখ নির্ধারিত নয়"}
                  </span>

                  <Link
                    href={`/events/${event.slug}`}
                    className="inline-flex items-center gap-1.5 font-bold text-primary hover:text-amber-500 transition-colors"
                  >
                    <span>সেশন ও ফিডব্যাক</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

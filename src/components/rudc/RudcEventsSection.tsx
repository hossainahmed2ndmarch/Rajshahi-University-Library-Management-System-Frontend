"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  Calendar,
  Clock,
  Compass,
  MapPin,
  Sparkles,
  Users,
} from "lucide-react";
import { useGetEvents } from "@/hooks/useEvents";
import { IEvent } from "@/types/event";

export function RudcEventsSection() {
  const { data, isLoading } = useGetEvents({ org: "RUDC", limit: 4 });
  const events: IEvent[] = data?.data || [];

  return (
    <section className="py-16 lg:py-24 bg-muted/30 border-y border-border/70">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-500/10 text-[#004F32] dark:text-emerald-400 mb-2">
              <Calendar className="h-3.5 w-3.5" />
              <span>আসন্ন ও নিয়মিত ইভেন্ট</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-foreground">
              Events of RUDC (আমাদের আয়োজিত ইভেন্টসমূহ)
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-2xl">
              ক্যাম্পাসে শিক্ষার্থীদের মেধা ও মননশীলতা বিকাশ, দ্বীনি সেমিনার, কর্মশালা ও আলোচনা সভা।
            </p>
          </div>

          <Link
            href="/rudc/events"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#004F32] dark:text-emerald-400 hover:underline shrink-0"
          >
            <span>সকল ইভেন্ট দেখুন</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="h-56 rounded-3xl bg-muted animate-pulse border border-border/60"
              />
            ))}
          </div>
        ) : events.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {events.map((evt) => {
              const formattedDate = evt.startDate
                ? new Date(evt.startDate).toLocaleDateString("bn-BD", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : "তারিখ নির্ধারিত হবে";

              return (
                <div
                  key={evt.id}
                  className="group rounded-3xl border border-border/80 bg-card overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                >
                  <div className="flex flex-col sm:flex-row">
                    {/* Event Banner / Visual */}
                    {evt.bannerImage ? (
                      <div className="sm:w-2/5 h-44 sm:h-auto overflow-hidden relative bg-muted shrink-0">
                        <img
                          src={evt.bannerImage}
                          alt={evt.title}
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <span className="absolute top-3 left-3 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-black/60 backdrop-blur-md text-amber-300">
                          {evt.status}
                        </span>
                      </div>
                    ) : (
                      <div className="sm:w-2/5 h-36 sm:h-auto bg-gradient-to-br from-emerald-900 to-[#004F32] p-5 flex flex-col justify-between text-white shrink-0">
                        <span className="self-start px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-black/40 backdrop-blur-md text-amber-300">
                          {evt.status}
                        </span>
                        <div className="p-2.5 rounded-xl bg-white/10 backdrop-blur-md w-fit">
                          <Compass className="h-5 w-5 text-amber-300" />
                        </div>
                      </div>
                    )}

                    {/* Event Content */}
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        {evt.category && (
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-[#C78700] dark:text-amber-400 mb-2">
                            {evt.category}
                          </span>
                        )}
                        <h3 className="text-base font-bold text-foreground group-hover:text-[#004F32] dark:group-hover:text-emerald-400 transition-colors line-clamp-2">
                          {evt.title}
                        </h3>
                      </div>

                      <div className="space-y-1.5 text-xs text-muted-foreground pt-1">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                          <span>{formattedDate}</span>
                        </div>
                        {evt.scheduleText && (
                          <div className="flex items-center gap-2">
                            <Clock className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                            <span>{evt.scheduleText}</span>
                          </div>
                        )}
                        {evt.location && (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-3.5 w-3.5 text-[#004F32] dark:text-emerald-400 shrink-0" />
                            <span className="truncate">{evt.location}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="p-4 px-5 border-t border-border/50 flex items-center justify-between bg-muted/20">
                    <span className="text-[11px] text-muted-foreground font-semibold">
                      {evt.activity?.title ? `কার্যক্রম: ${evt.activity.title}` : "RUDC ক্যাম্পাস প্রোগ্রাম"}
                    </span>
                    <Link
                      href={evt.slug ? `/events/${evt.slug}` : `/rudc/events`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#004F32] dark:text-emerald-400 hover:underline"
                    >
                      <span>বিস্তারিত দেখুন</span>
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-border p-12 text-center bg-card">
            <Calendar className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <h4 className="text-sm font-bold text-foreground">বর্তমানে কোনো আসন্ন ইভেন্ট তালিকাভুক্ত নেই</h4>
            <p className="text-xs text-muted-foreground mt-1">
              শিঘ্রই নতুন ক্যাম্পাস সেমিনার ও কর্মশালার সময়সূচি প্রকাশ করা হবে।
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

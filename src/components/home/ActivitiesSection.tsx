"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Sparkles, Calendar, ArrowRight, Layers, Bookmark } from "lucide-react";
import { ActivityService } from "@/services/event.service";
import { IActivity } from "@/types/event";
import { cn } from "@/lib/utils";

export function ActivitiesSection() {
  const [activities, setActivities] = useState<IActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    ActivityService.getAllActivities({ limit: 6 })
      .then((res) => {
        if (isMounted) {
          setActivities(res.data);
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
        return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30";
      case "UPCOMING":
        return "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30";
      case "COMPLETED":
        return "bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/30";
      default:
        return "bg-primary/10 text-primary border-primary/20";
    }
  };

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 sm:mb-10">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-800 dark:text-emerald-400 border border-emerald-500/20 mb-2">
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            <span>আমাদের চলমান ও বিশেষ কার্যক্রম</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
            Library & Dawah Activities
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-xl">
            নিয়মিত সাপ্তাহিক পাঠচক্র, ফজর ক্যাম্পেইন, বইমেলা ও গবেষণা কার্যক্রম যা আমাদের শিক্ষার্থীদের দ্বীনি ও অ্যাকাডেমিক মানোন্নয়নে ভূমিকা রাখছে।
          </p>
        </div>

        <Link
          href="/about#activities"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#004F32] dark:text-emerald-400 hover:text-[#C78700] dark:hover:text-amber-400 transition-colors shrink-0 group"
        >
          <span>সকল কার্যক্রম দেখুন</span>
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-64 rounded-3xl bg-muted/50 border border-border animate-pulse p-6"
            />
          ))}
        </div>
      ) : activities.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-3xl border border-dashed border-border p-8">
          <Layers className="h-10 w-10 mx-auto text-muted-foreground/60 mb-3" />
          <h3 className="text-base font-bold text-foreground">কোনো কার্যক্রম পাওয়া যায়নি</h3>
          <p className="text-xs text-muted-foreground mt-1">শীঘ্রই নতুন কার্যক্রম যুক্ত করা হবে।</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="group relative overflow-hidden rounded-3xl bg-card border border-border hover:border-emerald-600/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl flex flex-col justify-between"
            >
              <div>
                {/* Banner or Gradient fallback */}
                <div className="relative h-40 w-full overflow-hidden bg-gradient-to-tr from-[#003824] via-[#004F32] to-[#0a2318]">
                  {activity.bannerImage ? (
                    <img
                      src={activity.bannerImage}
                      alt={activity.title}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center opacity-20">
                      <Bookmark className="h-20 w-20 text-white" />
                    </div>
                  )}

                  {/* Badges Over Image */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-0.5 text-[10px] font-bold border backdrop-blur-md shadow-xs",
                        getStatusBadge(activity.status)
                      )}
                    >
                      {activity.status}
                    </span>
                    <span className="rounded-full bg-black/40 text-white px-2 py-0.5 text-[10px] font-mono backdrop-blur-md">
                      {activity.org}
                    </span>
                  </div>

                  {activity.category && (
                    <div className="absolute bottom-3 right-3">
                      <span className="rounded-md bg-[#C78700]/90 text-white px-2 py-0.5 text-[10px] font-semibold backdrop-blur-md">
                        {activity.category}
                      </span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-5 space-y-2.5">
                  <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                    {activity.title}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {activity.description || "এই কার্যক্রমটির বিস্তারিত বিবরণ দেখতে সম্পর্কিত ইভেন্টগুলো দেখুন।"}
                  </p>
                </div>
              </div>

              {/* Card Footer */}
              <div className="p-5 pt-0 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground mt-2">
                <span className="flex items-center gap-1 font-medium">
                  <Calendar className="h-3.5 w-3.5 text-primary" />
                  {activity._count?.events || 0} টি ইভেন্ট
                </span>
                <Link
                  href={`/events?activityId=${activity.id}`}
                  className="font-bold text-primary hover:text-amber-500 transition-colors inline-flex items-center gap-1"
                >
                  ইভেন্টস দেখুন
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

export default ActivitiesSection;

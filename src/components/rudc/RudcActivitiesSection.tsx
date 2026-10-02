"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Calendar, Compass, Layers, Sparkles } from "lucide-react";
import { useGetActivities } from "@/hooks/useEvents";

export function RudcActivitiesSection() {
  const { data, isLoading } = useGetActivities({ org: "RUDC", limit: 6 });
  const activities = data?.data || [];

  return (
    <section className="py-16 lg:py-24 bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-500/10 text-[#C78700] dark:text-amber-400 mb-2">
              <Sparkles className="h-3.5 w-3.5" />
              <span>নিয়মিত কর্মতৎপরতা</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-foreground">
              Activities of RUDC (আমাদের দাওয়াহ কার্যক্রম)
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-2xl">
              ক্যাম্পাসে দ্বীনের সঠিক দাওয়াহ, নীতি-নৈতিকতার প্রচার ও শিক্ষার্থীদের আত্মশুদ্ধির লক্ষ্যে পরিচালিত কার্যক্রম।
            </p>
          </div>

          <Link
            href="/rudc/activities"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#004F32] dark:text-emerald-400 hover:underline shrink-0"
          >
            <span>সকল কার্যক্রম দেখুন</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-64 rounded-3xl bg-muted animate-pulse border border-border/60"
              />
            ))}
          </div>
        ) : activities.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {activities.map((act) => (
              <div
                key={act.id}
                className="group rounded-3xl border border-border/80 bg-card overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {act.bannerImage ? (
                    <div className="h-44 w-full overflow-hidden relative bg-muted">
                      <img
                        src={act.bannerImage}
                        alt={act.title}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-black/60 backdrop-blur-md text-emerald-300 border border-white/10">
                        {act.status}
                      </span>
                    </div>
                  ) : (
                    <div className="h-28 w-full bg-gradient-to-br from-emerald-900 to-[#004F32] p-5 flex items-center justify-between text-white relative">
                      <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md">
                        <Compass className="h-6 w-6 text-amber-300" />
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-black/40 backdrop-blur-md text-emerald-300">
                        {act.status}
                      </span>
                    </div>
                  )}

                  <div className="p-5 space-y-2.5">
                    {act.category && (
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-[#004F32] dark:text-emerald-400 border border-emerald-600/20">
                        {act.category}
                      </span>
                    )}
                    <h3 className="text-base font-bold text-foreground group-hover:text-[#004F32] dark:group-hover:text-emerald-400 transition-colors line-clamp-1">
                      {act.title}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                      {act.description || "ক্যাম্পাসে শিক্ষার্থীদের দ্বীনি দিকনির্দেশনা ও সার্বিক চরিত্র গঠনের লক্ষ্যে পরিচালিত আয়োজন।"}
                    </p>
                  </div>
                </div>

                <div className="p-5 pt-0 border-t border-border/50 flex items-center justify-between mt-2">
                  <span className="text-[11px] text-muted-foreground font-medium flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-amber-500" />
                    <span>{act.events?.length ? `${act.events.length} Events` : "নিয়মিত সেশন"}</span>
                  </span>

                  <Link
                    href={`/rudc/activities`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#004F32] dark:text-emerald-400 hover:underline"
                  >
                    <span>বিস্তারিত</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-border p-12 text-center bg-card">
            <Layers className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <h4 className="text-sm font-bold text-foreground">কোনো কার্যক্রম পাওয়া যায়নি</h4>
            <p className="text-xs text-muted-foreground mt-1">
              ডাটাবেজে RUDC-এর নতুন কার্যক্রম শীঘ্রই যুক্ত করা হবে।
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

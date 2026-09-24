"use client";

import React from "react";
import Link from "next/link";
import { ShieldCheck, Sparkles, Building } from "lucide-react";
import { ServicesGrid } from "@/components/home/ServicesGrid";
import { DonationBanner } from "@/components/shared/DonationBanner";

export default function AboutPage() {
  return (
    <div className="space-y-16 py-8 sm:py-12">
      {/* Hero Header */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-[#004F32] via-[#003824] to-[#040D09] p-8 sm:p-14 text-white shadow-xl relative overflow-hidden">
          <div className="max-w-2xl space-y-4 relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#C78700]/20 px-3.5 py-1 text-xs font-bold text-amber-300 border border-[#C78700]/30">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Established at Rajshahi University</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              About RU Islamic Library
            </h1>
            <p className="text-sm sm:text-base text-emerald-100/90 leading-relaxed font-light">
              Dedicated to collecting, preserving, and providing free and affordable access to authentic classical Islamic literature, Quranic exegesis, Hadith collections, and academic research treatises.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-card rounded-3xl border border-border p-8 space-y-4">
            <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
              <Building className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-bold text-foreground">Our Institutional Mission</h2>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              To empower the students, researchers, and faculty of Rajshahi University with verified and scholarly Islamic knowledge, facilitating academic excellence, ethical grounding, and rigorous thesis documentation.
            </p>
          </div>

          <div className="bg-card rounded-3xl border border-border p-8 space-y-4">
            <div className="h-12 w-12 rounded-2xl bg-[#C78700]/10 text-[#C78700] flex items-center justify-center">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-bold text-foreground">Our Circulation Standard</h2>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Every copy admitted into our stacks undergoes rigorous condition inspection, authenticity review, and barcode cell allocation to ensure dependable student borrowing.
            </p>
          </div>
        </div>
      </section>

      {/* All Activities Section */}
      <section id="activities" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8 scroll-mt-24">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-800 dark:text-emerald-400 border border-emerald-500/20 mb-2">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              <span>আমাদের সকল কার্যক্রম ও কর্মসূচি</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-foreground">
              All Library Programs & Activities
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-xl">
              রাজশাহী বিশ্ববিদ্যালয় ক্যাম্পাসে শিক্ষার্থীদের দ্বীনি জ্ঞানার্জন, গবেষণা ও নৈতিক পুনর্জাগরণের লক্ষ্যে পরিচালিত সকল নিয়মিত ও বিশেষ কার্যক্রম।
            </p>
          </div>
        </div>

        <AboutActivitiesGrid />
      </section>

      {/* Services Grid */}
      <ServicesGrid />

      {/* Donation Banner */}
      <DonationBanner />
    </div>
  );
}

function AboutActivitiesGrid() {
  const [activities, setActivities] = React.useState<import("@/types/event").IActivity[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [selectedCategory, setSelectedCategory] = React.useState("ALL");

  React.useEffect(() => {
    let isMounted = true;
    import("@/services/event.service").then(({ ActivityService }) => {
      ActivityService.getAllActivities({ limit: 50 })
        .then((res) => {
          if (isMounted) setActivities(res.data);
        })
        .finally(() => {
          if (isMounted) setIsLoading(false);
        });
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const categories = React.useMemo(() => {
    const set = new Set<string>();
    activities.forEach((a) => {
      if (a.category) set.add(a.category);
    });
    return ["ALL", ...Array.from(set)];
  }, [activities]);

  const filtered = React.useMemo(() => {
    if (selectedCategory === "ALL") return activities;
    return activities.filter((a) => a.category === selectedCategory);
  }, [activities, selectedCategory]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-72 rounded-3xl bg-muted/40 animate-pulse border border-border" />
        ))}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-12 bg-card rounded-3xl border border-dashed border-border p-8">
        <p className="text-sm font-semibold text-muted-foreground">কোনো কার্যক্রম পাওয়া যায়নি</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Category Pills */}
      {categories.length > 2 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {cat === "ALL" ? "সকল ক্যাটাগরি" : cat}
            </button>
          ))}
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((activity) => (
          <div
            key={activity.id}
            className="group relative overflow-hidden rounded-3xl bg-card border border-border hover:border-emerald-600/40 hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              {/* Image / Header */}
              <div className="relative h-44 w-full overflow-hidden bg-gradient-to-tr from-[#003824] via-[#004F32] to-[#041a10]">
                {activity.bannerImage ? (
                  <img
                    src={activity.bannerImage}
                    alt={activity.title}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center opacity-20">
                    <Building className="h-16 w-16 text-white" />
                  </div>
                )}
                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                  <span className="rounded-full bg-emerald-500/90 text-white px-2.5 py-0.5 text-[10px] font-bold">
                    {activity.status}
                  </span>
                  <span className="rounded-full bg-black/50 text-white px-2 py-0.5 text-[10px] font-mono">
                    {activity.org}
                  </span>
                </div>
                {activity.category && (
                  <div className="absolute bottom-3 right-3">
                    <span className="rounded-md bg-[#C78700] text-white px-2 py-0.5 text-[10px] font-semibold">
                      {activity.category}
                    </span>
                  </div>
                )}
              </div>

              {/* Body */}
              <div className="p-6 space-y-3">
                <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                  {activity.title}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {activity.description || "এই কার্যক্রমে নিয়মিত সেশন এবং জ্ঞানগর্ভ দ্বীনি আলোচনা পরিচালিত হয়।"}
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 pt-0 border-t border-border/40 flex items-center justify-between mt-3 text-xs">
              <span className="text-muted-foreground font-medium">
                {activity._count?.events || 0} টি সংযুক্ত ইভেন্ট
              </span>
              <Link
                href={`/events?activityId=${activity.id}`}
                className="font-bold text-primary hover:text-amber-500 transition-colors"
              >
                ইভেন্টগুলো দেখুন →
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

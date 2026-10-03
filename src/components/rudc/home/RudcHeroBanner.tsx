"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Facebook,
  Sparkles,
  Users,
  ShieldCheck,
  Layers,
  HeartHandshake,
} from "lucide-react";
import { useRudcStats } from "@/hooks/useRudc";
import rudcBanner from "@/assets/banner/banner.png";
import rudcLogo from "@/assets/logo/rudc_logo.jpg";

/**
 * 1. Redesigned Hero Banner (Without Stat Cards)
 */
export function RudcHeroBanner() {
  return (
    <section className="relative overflow-hidden bg-[#FAF7F2] -top-3 dark:bg-slate-950 text-slate-900 dark:text-slate-100 border-b border-amber-200/60 dark:border-slate-800 transition-colors">
      {/* Background Islamic Arch / Decorative Accent (Left) */}
      <div className="absolute top-0 left-0 bottom-0 w-64 pointer-events-none opacity-20 dark:opacity-10 bg-[radial-gradient(#C78700_1px,transparent_1px)] [background-size:16px_16px]" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Brand, Mission Statement & CTAs */}
          <div className="lg:col-span-7 space-y-6 text-left">
            
            {/* Header Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-amber-500/30 bg-amber-100/60 dark:bg-amber-950/40 text-[#004F32] dark:text-emerald-300 text-xs font-bold shadow-xs">
              <Sparkles className="h-3.5 w-3.5 text-[#C78700] dark:text-amber-400" />
              <span>Campus-based Dawah Community</span>
            </div>

            {/* Brand Logo & Name */}
            <div className="flex items-center gap-3.5">
              <div className="relative h-14 w-14 sm:h-16 sm:w-16 shrink-0 overflow-hidden rounded-2xl border-2 border-emerald-600/30 bg-white p-1 shadow-md">
                <Image
                  src={rudcLogo}
                  alt="RUDC Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <div>
                <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-[#004F32] dark:text-emerald-400 leading-tight">
                  RUDC
                </h1>
                <p className="text-xs sm:text-sm font-bold text-[#C78700] dark:text-amber-400 tracking-wider uppercase">
                  Rajshahi University Dawah Community
                </p>
              </div>
            </div>

            {/* Primary Mission Statement (Bengali Text) */}
            <p className="text-base sm:text-lg lg:text-xl font-medium text-slate-800 dark:text-slate-200 leading-relaxed font-bangla">
              জামায়াতবদ্ধ জীবন ও উত্তম সংস্রবে ইসলামের তাহযিব-তামাদ্দুন ধারণ করে,
              আত্মশুদ্ধি ও ওহীর আলোয় একটি ফিতনামুক্ত সমাজ গঠন এবং দাওয়াতি কাজ করাই আমাদের লক্ষ্য।
            </p>

            {/* Subtitle (English Context) */}
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              A campus-rooted, non-political, and social service movement dedicated to authentic Quran & Sunnah, fostering Islamic brotherhood and character across Rajshahi University.
            </p>

            {/* Action CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/rudc/activities"
                className="inline-flex items-center gap-2 rounded-xl bg-[#004F32] hover:bg-[#003e27] dark:bg-emerald-600 dark:hover:bg-emerald-700 px-5 py-3 text-xs sm:text-sm font-bold text-white shadow-md hover:shadow-lg transition-all"
              >
                <span>আমাদের কার্যক্রম দেখুন</span>
                <ArrowRight className="h-4 w-4" />
              </Link>

              <a
                href="https://www.facebook.com/RajshahiUniversityDawahCommunity"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-[#004F32]/90 hover:bg-[#004F32] dark:bg-emerald-800 dark:hover:bg-emerald-700 px-5 py-3 text-xs sm:text-sm font-bold text-white shadow-md transition-all"
              >
                <Facebook className="h-4 w-4 fill-current" />
                <span>Facebook Page</span>
              </a>

              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-xl border border-emerald-700/30 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 px-4 py-3 text-xs sm:text-sm font-bold text-[#004F32] dark:text-emerald-300 transition-colors"
              >
                <BookOpen className="h-4 w-4 text-[#C78700] dark:text-amber-400" />
                <span>RU Islamic Library</span>
              </Link>
            </div>
          </div>

          {/* Right Column: Decorative Curved Visual Frame */}
          <div className="lg:col-span-5 relative flex justify-center lg:justify-end">
            <div className="relative w-full max-w-lg aspect-[4/3] sm:aspect-[16/10] lg:aspect-[4/3] rounded-3xl lg:rounded-l-[100px] overflow-hidden border-4 border-amber-400/60 shadow-2xl bg-amber-100 dark:bg-slate-900">
              <Image
                src={rudcBanner}
                alt="RUDC Activities & Community"
                fill
                priority
                className="object-cover object-center hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />
            </div>

           
          </div>

        </div>
      </div>
    </section>
  );
}

/**
 * 2. Separate Standalone Statistics Section
 */
export function RudcStatsSection() {
  const { data: stats } = useRudcStats();

  const statItems = [
    {
      label: "Active Volunteers",
      value: stats?.volunteersCount ? `${stats.volunteersCount}+` : "120+",
      icon: Users,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/40",
    },
    {
      label: "Supervised Members",
      value: stats?.permanentMembersCount ? `${stats.permanentMembersCount}+` : "45+",
      icon: ShieldCheck,
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/40",
    },
    {
      label: "Specialized Teams",
      value: stats?.teamsCount ? `${stats.teamsCount}` : "6",
      icon: Layers,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/40",
    },
    {
      label: "Monthly Iyanot (Fee)",
      value: "50 ৳",
      icon: HeartHandshake,
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/40",
    },
  ];

  return (
    <section className="py-10 bg-white dark:bg-slate-900 border-b border-border/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {statItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className={`p-5 rounded-2xl border ${item.bg} shadow-xs transition-transform hover:-translate-y-1`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-white dark:bg-slate-900 shadow-xs">
                    <Icon className={`h-5 w-5 ${item.color}`} />
                  </div>
                  <div>
                    <p className={`text-2xl sm:text-3xl font-black ${item.color}`}>
                      {item.value}
                    </p>
                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mt-0.5">
                      {item.label}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
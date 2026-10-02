"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  FileCheck,
  MapPin,
  Sparkles,
  UserPlus,
} from "lucide-react";
import { useRudcStats } from "@/hooks/useRudc";
import rudcBanner from "@/assets/banner/rudc_banner.webp";

export function RudcHeroBanner() {
  const { data: stats } = useRudcStats();

  return (
    <div className="relative overflow-hidden bg-slate-950 text-white">
      {/* Background Banner Image with Gradient Overlays */}
      <div className="absolute inset-0 z-0">
        <Image
          src={rudcBanner}
          alt="RUDC Community Banner"
          fill
          priority
          className="object-cover object-center opacity-40 brightness-75 scale-105 transition-transform duration-1000"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-emerald-950/80" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-transparent to-slate-950/90" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-16 pb-14 lg:pt-24 lg:pb-20">
        <div className="text-center max-w-3xl mx-auto space-y-6">
          {/* Pill Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-400/30 bg-emerald-900/60 backdrop-blur-md text-emerald-200 text-xs font-bold shadow-lg">
            <Sparkles className="h-3.5 w-3.5 text-amber-300" />
            <span>Rajshahi University Campus-based Dawah Community</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.12]">
            Spreading the Light of{" "}
            <span className="text-emerald-400 underline decoration-amber-400 decoration-wavy decoration-2">
              Sunnah & Goodness
            </span>{" "}
            Across Campus
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
            The <strong>Rajshahi University Dawah Community (RUDC)</strong> is a campus-rooted,
            non-political, and social service movement dedicated to the authentic Quran & Sunnah,
            fostering Islamic brotherhood, character, and lifelong learning.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 pt-2">
            <Link
              href="/rudc/join"
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 px-6 py-3.5 text-sm font-bold text-white shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-0.5"
            >
              <UserPlus className="h-4 w-4 text-amber-300" />
              <span>Join RUDC as Volunteer</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              href="/rudc/terms"
              className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 hover:bg-white/20 backdrop-blur-md px-5 py-3.5 text-sm font-bold text-white shadow-sm transition-all"
            >
              <FileCheck className="h-4 w-4 text-amber-300" />
              <span>Membership Rules & Terms</span>
            </Link>

            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-2xl border border-emerald-400/40 bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-200 px-4 py-3.5 text-sm font-bold transition-all"
            >
              <BookOpen className="h-4 w-4 text-amber-400" />
              <span>Visit RU Islamic Library</span>
            </Link>
          </div>

          {/* Location Tag */}
          <div className="flex items-center justify-center gap-2 text-xs text-slate-400 pt-3">
            <MapPin className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
            <span>Headquarters: RU Islamic Library, Shop No. 44, Stadium Market, RU</span>
          </div>
        </div>

        {/* Live Statistics Counter Bar */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 text-center max-w-4xl mx-auto">
          <div className="p-4 rounded-2xl bg-slate-900/80 backdrop-blur-md border border-white/10 shadow-lg">
            <p className="text-2xl sm:text-3xl font-black text-emerald-400">
              {stats?.volunteersCount ? `${stats.volunteersCount}+` : "120+"}
            </p>
            <p className="text-xs font-semibold text-slate-400 mt-1">Active Volunteers</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/80 backdrop-blur-md border border-white/10 shadow-lg">
            <p className="text-2xl sm:text-3xl font-black text-amber-400">
              {stats?.permanentMembersCount ? `${stats.permanentMembersCount}+` : "45+"}
            </p>
            <p className="text-xs font-semibold text-slate-400 mt-1">Supervised Members</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/80 backdrop-blur-md border border-white/10 shadow-lg">
            <p className="text-2xl sm:text-3xl font-black text-emerald-400">
              {stats?.teamsCount ? stats.teamsCount : "6"}
            </p>
            <p className="text-xs font-semibold text-slate-400 mt-1">Specialized Teams</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/80 backdrop-blur-md border border-white/10 shadow-lg">
            <p className="text-2xl sm:text-3xl font-black text-amber-400">
              50 ৳
            </p>
            <p className="text-xs font-semibold text-slate-400 mt-1">Monthly Iyanot (Fee)</p>
          </div>
        </div>
      </div>
    </div>
  );
}

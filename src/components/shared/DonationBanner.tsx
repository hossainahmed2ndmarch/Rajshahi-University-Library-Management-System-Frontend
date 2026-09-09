"use client";

import React from "react";
import Link from "next/link";
import { HeartHandshake, ArrowRight } from "lucide-react";

interface DonationBannerProps {
  className?: string;
}

export function DonationBanner({ className = "" }: DonationBannerProps) {
  return (
    <section className={`mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 ${className}`}>
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#004F32] via-[#003824] to-[#040D09] p-8 sm:p-12 text-white border border-emerald-800/60 shadow-xl">
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#C78700]/20 px-3.5 py-1 text-xs font-bold text-amber-300 border border-[#C78700]/30">
            <HeartHandshake className="h-3.5 w-3.5" />
            <span>Sadaqah Jariyah Programme</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
            Donate Books & Build Eternal Knowledge for Future Scholars
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed font-light">
            Your donated Islamic books, academic manuscripts, and textbooks will be verified, cataloged, and made accessible to thousands of Rajshahi University students.
          </p>
          <div className="pt-2 flex flex-wrap gap-4">
            <Link
              href="/donate"
              className="inline-flex items-center gap-2 rounded-xl bg-[#C78700] hover:bg-amber-600 px-6 py-3.5 text-xs sm:text-sm font-bold text-white shadow-md transition-all hover:gap-3"
            >
              <span>Submit Book Donation</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/about"
              className="inline-flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 px-5 py-3.5 text-xs sm:text-sm font-semibold text-white transition-colors"
            >
              <span>How Donation Works</span>
            </Link>
          </div>
        </div>

        <div className="absolute right-0 bottom-0 top-0 hidden lg:flex items-center justify-center p-12 opacity-15 pointer-events-none">
          <HeartHandshake className="h-64 w-64 text-amber-400" />
        </div>
      </div>
    </section>
  );
}

export default DonationBanner;

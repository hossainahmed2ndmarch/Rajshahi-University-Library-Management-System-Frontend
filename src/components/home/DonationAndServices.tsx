"use client";

import React from "react";
import Link from "next/link";
import { HeartHandshake, ArrowRight, GraduationCap, ShieldCheck } from "lucide-react";

export function DonationAndServices() {
  return (
    <div className="space-y-16 py-5">
      {/* 1. SADAQAH JARIYAH DONATION BANNER */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
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

      {/* 2. SERVICES GRID */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-card rounded-2xl border border-border p-6 space-y-3">
            <GraduationCap className="h-8 w-8 text-primary" />
            <h3 className="font-bold text-base text-foreground">Academic Research Support</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Assisting graduate theses, Arabic manuscript decoding, and bibliography references with expert library consultation.
            </p>
          </div>

          <div className="bg-card rounded-2xl border border-border p-6 space-y-3">
            <ShieldCheck className="h-8 w-8 text-[#C78700]" />
            <h3 className="font-bold text-base text-foreground">Authentic Editorial Curation</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Every volume on our shelves is verified for authentic chain of transmission, scholarly commentary, and high quality bindings.
            </p>
          </div>

          <div className="bg-card rounded-2xl border border-border p-6 space-y-3">
            <HeartHandshake className="h-8 w-8 text-emerald-600" />
            <h3 className="font-bold text-base text-foreground">Inter-Hall Book Circulation</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Request books online and have them delivered to your residential hall counter with automated SMS alerts.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default DonationAndServices;

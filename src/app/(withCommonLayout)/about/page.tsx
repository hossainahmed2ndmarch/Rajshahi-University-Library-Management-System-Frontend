"use client";

import React from "react";
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

      {/* Services Grid */}
      <ServicesGrid />

      {/* Donation Banner */}
      <DonationBanner />
    </div>
  );
}

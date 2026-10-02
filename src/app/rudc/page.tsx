"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Compass,
  FileCheck,
  HeartHandshake,
  Layers,
  MapPin,
  Shield,
  Sparkles,
  UserCheck,
  UserPlus,
  Users,
} from "lucide-react";
import { RudcHeroBanner } from "@/components/rudc/RudcHeroBanner";
import { RudcMarquee } from "@/components/rudc/RudcMarquee";
import { RudcActivitiesSection } from "@/components/rudc/RudcActivitiesSection";
import { RudcEventsSection } from "@/components/rudc/RudcEventsSection";
import { RudcArticlesSection } from "@/components/rudc/RudcArticlesSection";
import { RudcGallerySection } from "@/components/rudc/RudcGallerySection";
import { RudcReviewsSection } from "@/components/rudc/RudcReviewsSection";

export default function RudcLandingPage() {
  const corePrinciples = [
    {
      title: "Five Daily Salah & Ramadan Siyam",
      desc: "Mandatory regular attendance in congregational prayer at the mosque and complete observance of Ramadan fasting.",
      icon: Compass,
    },
    {
      title: "Sunnah Appearance & Modesty",
      desc: "Maintaining Islamic beard, modest apparel adhering to the Sunnah, and keeping trousers strictly above ankles.",
      icon: Shield,
    },
    {
      title: "Strictly Non-Political & Independent",
      desc: "Zero affiliation with any partisan political party or clandestine faction. Solely dedicated to the Deen and social service.",
      icon: HeartHandshake,
    },
    {
      title: "Moral Purity & Guarding of Sins",
      desc: "Abstaining from unlawful relationships, inappropriate jokes, interacting with Ghayr-Mahram, music, and vices.",
      icon: CheckCircle2,
    },
    {
      title: "Supervised Growth & Small Groups",
      desc: "Each volunteer is guided in small groups by an assigned supervisor for personal mentorship and spiritual development.",
      icon: Users,
    },
    {
      title: "Unity of Ahlus Sunnah wal Jama'ah",
      desc: "Flexibility and broad-mindedness regarding all recognized Madhhabs, Manhaj, and scholarly opinions without fanaticism.",
      icon: Sparkles,
    },
  ];

  const specializedTeams = [
    {
      name: "Dawah & Outreach Team",
      desc: "Organizing weekly halqahs, campus leafleting, student counseling, and book exhibitions.",
      tag: "Outreach",
    },
    {
      name: "Graphics & Media Production",
      desc: "Digital posters, Islamic reminders, event photography, social media visual designs.",
      tag: "Creative",
    },
    {
      name: "Food & Hospitality Team",
      desc: "Arranging iftar gatherings, campus refreshment corners, and gathering hospitality.",
      tag: "Service",
    },
    {
      name: "Logistics & Event Setup",
      desc: "Sound management, hall booking, venue layout, seating arrangements, and inventory.",
      tag: "Operations",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* ─── 1. Hero Banner with Background Image & Live Stats ─────── */}
      <RudcHeroBanner />

      {/* ─── 2. Running Marquee Bulletin (Location, Time, etc) ──────── */}
      <RudcMarquee />

      {/* ─── 3. Activities of RUDC from Database ───────────────────── */}
      <RudcActivitiesSection />

      {/* ─── 4. Events of RUDC from Database ────────────────────────── */}
      <RudcEventsSection />

      {/* ─── 5. Articles & Publications of RUDC from Database ───────── */}
      <RudcArticlesSection />

      {/* ─── 6. Gallery of RUDC from Database ───────────────────────── */}
      <RudcGallerySection />

      {/* ─── 7. Core Principles & Code of Conduct Preview ──────────── */}
      <section className="py-16 lg:py-24 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-xs font-black uppercase tracking-wider text-[#C78700] dark:text-amber-400 mb-2">
              Foundations of Brotherhood
            </h2>
            <h3 className="text-2xl sm:text-3xl font-black text-foreground">
              Core Principles & Conditions of RUDC
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground mt-2">
              All members and volunteers commit to high ethical standards, Quranic virtues, and
              unwavering devotion to Sunnah.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {corePrinciples.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-border/80 bg-card p-6 shadow-xs hover:shadow-md transition-shadow relative group"
                >
                  <div className="h-10 w-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 flex items-center justify-center text-[#004F32] dark:text-emerald-400 mb-4 group-hover:scale-105 transition-transform">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h4 className="text-base font-bold text-foreground mb-1.5">{item.title}</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/rudc/terms"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#004F32] dark:text-emerald-400 hover:underline"
            >
              <span>Read all 10 official terms & conditions in detail</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── 8. Specialized Working Teams ──────────────────────────── */}
      <section className="py-16 bg-muted/40 border-y border-border/70">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <h2 className="text-xs font-black uppercase tracking-wider text-[#C78700] dark:text-amber-400 mb-1">
                Collaborative Action
              </h2>
              <h3 className="text-2xl sm:text-3xl font-black text-foreground">
                Skill-Based Teams for Campus Khidmah
              </h3>
            </div>
            <Link
              href="/rudc/join"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#004F32] dark:text-emerald-400 hover:underline shrink-0"
            >
              <span>Join a team with your skills</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {specializedTeams.map((team, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-border bg-card p-5 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-[#C78700] dark:text-amber-400 mb-3">
                    {team.tag}
                  </span>
                  <h4 className="text-sm font-bold text-foreground mb-1">{team.name}</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">{team.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 9. Reviews of RUDC from Database ──────────────────────── */}
      <div id="reviews">
        <RudcReviewsSection />
      </div>

      {/* ─── 10. Supervised Growth & Final CTA ─────────────────────── */}
      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-gradient-to-br from-[#004F32] to-[#013522] p-8 lg:p-12 text-white shadow-xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <span className="inline-block px-3 py-1 rounded-full text-xs font-black bg-amber-400 text-emerald-950 uppercase tracking-wider">
                  Member Journey
                </span>
                <h3 className="text-2xl sm:text-3xl font-black leading-tight">
                  Supervised Mentorship: From Volunteer to Permanent Member
                </h3>
                <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
                  Every applicant begins as a <strong>Volunteer</strong> and is assigned to a
                  dedicated Supervisor/Team Leader. After active participation, spiritual progress,
                  and consistent adherence to Islamic guidelines, they are promoted to{" "}
                  <strong>Permanent Member</strong>, <strong>Executive Committee</strong>, or{" "}
                  <strong>Shura</strong>.
                </p>
                <div className="space-y-2 pt-2">
                  <div className="flex items-center gap-2 text-xs text-emerald-100">
                    <CheckCircle2 className="h-4 w-4 text-amber-300 shrink-0" />
                    <span>Interview & orientation after application review</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-emerald-100">
                    <CheckCircle2 className="h-4 w-4 text-amber-300 shrink-0" />
                    <span>Monthly 50 BDT Iyanot (fee) to support campus dawah</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-emerald-100">
                    <CheckCircle2 className="h-4 w-4 text-amber-300 shrink-0" />
                    <span>Weekly halqahs, personal counseling, and community service</span>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/15 p-6 space-y-4 text-center">
                <h4 className="text-lg font-bold text-amber-300">Ready to Serve the Deen?</h4>
                <p className="text-xs text-slate-200">
                  Applications are currently open for all students of Rajshahi University.
                </p>
                <div className="flex flex-col gap-2.5 pt-2">
                  <Link
                    href="/rudc/join"
                    className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-[#004F32] font-black text-xs shadow-md transition-colors"
                  >
                    <UserPlus className="h-4 w-4" />
                    <span>Fill Volunteer Application Form</span>
                  </Link>
                  <Link
                    href="/rudc/contact"
                    className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/15 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 transition-colors"
                  >
                    <span>Contact Us at Library Office</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

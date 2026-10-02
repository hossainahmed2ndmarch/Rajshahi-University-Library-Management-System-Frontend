"use client";

import React from "react";
import Link from "next/link";
import {
  BookOpen,
  Calendar,
  CheckCircle2,
  Compass,
  Heart,
  HeartHandshake,
  Layers,
  MapPin,
  Sparkles,
  Users,
} from "lucide-react";
import { useGetActivities } from "@/hooks/useEvents";

export default function RudcActivitiesPage() {
  const { data, isLoading } = useGetActivities({ org: "RUDC" });
  const dbActivities = data?.data || [];

  const defaultActivities = [
    {
      title: "Weekly Campus Dawah Halqah",
      category: "Education & Spirituality",
      desc: "Weekly knowledge circles focusing on Tazkiyah (purification of soul), Sunnah adherence, and contemporary youth challenges on campus.",
      timing: "Every Thursday after Asr",
      venue: "Central Mosque Campus / Library Discussion Room",
      badge: "Ongoing",
    },
    {
      title: "Hall-to-Hall Islamic Book & Flyer Distribution",
      category: "Outreach & Dawah",
      desc: "Distributing authentic Islamic leaflets, daily Du'a cards, and booklets on Salah, fasting, and character building among residential halls.",
      timing: "Bi-weekly",
      venue: "All Men's Residential Halls, RU",
      badge: "Active",
    },
    {
      title: "Ramadan Campus Iftar & Food Dawah Corner",
      category: "Social Khidmah",
      desc: "Arranging wholesome iftar for fasting students, distributing water and dates during Ramadan, and sharing reminders.",
      timing: "Holy Month of Ramadan",
      venue: "Stadium Market & Campus Points",
      badge: "Annual",
    },
    {
      title: "Freshers' Reception & Sunnah Guidance Booth",
      category: "Student Guidance",
      desc: "Welcoming newly enrolled undergraduate students with academic tips, campus navigation guidance, and moral mentoring.",
      timing: "Admission & Semester Start",
      venue: "Main Gate & Faculty Premises",
      badge: "Semester Drive",
    },
    {
      title: "Winter Clothing Drive & Humanitarian Relief",
      category: "Social Welfare",
      desc: "Collecting warm clothing and winter aids from campus students and distribution among underprivileged communities around Rajshahi.",
      timing: "Winter Season",
      venue: "Char Areas of Padma & Slums",
      badge: "Charity",
    },
    {
      title: "Youth Counseling & Spiritual Mentorship",
      category: "Mentorship",
      desc: "Confidential guidance for brothers struggling with addictions, relationship issues, academic depression, or doubts in faith.",
      timing: "Open Daily by Appointment",
      venue: "RU Islamic Library Office",
      badge: "Counseling",
    },
  ];

  return (
    <div className="py-12 lg:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-600/30 text-[#004F32] dark:text-emerald-300 text-xs font-bold">
            <Layers className="h-3.5 w-3.5 text-[#C78700] dark:text-amber-400" />
            <span>Campus Programs & Services</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-foreground">
            RUDC Dawah Activities & Programs
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Rajshahi University Dawah Community organizes year-round educational, spiritual, and
            social initiatives to foster Islamic character and service across the University of
            Rajshahi campus.
          </p>
        </div>

        {/* Activity Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-64 rounded-3xl bg-muted animate-pulse border border-border/60"
              />
            ))}
          </div>
        ) : dbActivities.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dbActivities.map((act) => (
              <div
                key={act.id}
                className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  {act.bannerImage && (
                    <div className="h-44 w-full overflow-hidden bg-muted">
                      <img
                        src={act.bannerImage}
                        alt={act.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}
                  <div className="p-6 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-[#004F32] dark:text-emerald-400 border border-emerald-600/20">
                        {act.category || "General Activity"}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-[#C78700] dark:text-amber-400">
                        {act.status}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-foreground">{act.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {act.description || "ক্যাম্পাসে দ্বীনের দাওয়াহ ও চারিত্রিক গঠনের নিয়মিত কার্যক্রম।"}
                    </p>
                  </div>
                </div>

                <div className="p-6 pt-0 border-t border-border/50 space-y-2 text-xs text-muted-foreground mt-4">
                  <div className="flex items-center gap-2 pt-3">
                    <Calendar className="h-3.5 w-3.5 text-[#004F32] dark:text-emerald-400 shrink-0" />
                    <span>{act.events?.length ? `${act.events.length} Events Scheduled` : "নিয়মিত সেশন"}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {defaultActivities.map((item, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-border/80 bg-card p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-[#004F32] dark:text-emerald-400 border border-emerald-600/20">
                      {item.category}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-[#C78700] dark:text-amber-400">
                      {item.badge}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-foreground">{item.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>

                <div className="mt-6 pt-4 border-t border-border/50 space-y-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5 text-[#004F32] dark:text-emerald-400 shrink-0" />
                    <span>{item.timing}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 text-[#C78700] dark:text-amber-400 shrink-0" />
                    <span className="truncate">{item.venue}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Bottom CTA */}
        <div className="rounded-3xl bg-muted/40 border border-border p-8 text-center max-w-2xl mx-auto space-y-4">
          <h3 className="text-lg font-bold text-foreground">Want to coordinate these activities?</h3>
          <p className="text-xs text-muted-foreground">
            Join the RUDC volunteer corps today and play an active role in campus khidmah.
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <Link
              href="/rudc/join"
              className="px-6 py-2.5 rounded-xl bg-[#004F32] hover:bg-[#003e27] text-white font-bold text-xs shadow-xs"
            >
              Apply as Volunteer
            </Link>
            <Link
              href="/"
              className="px-5 py-2.5 rounded-xl border border-border bg-card hover:bg-muted text-foreground font-bold text-xs shadow-xs inline-flex items-center gap-1.5"
            >
              <BookOpen className="h-3.5 w-3.5 text-amber-500" />
              <span>Library Home</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

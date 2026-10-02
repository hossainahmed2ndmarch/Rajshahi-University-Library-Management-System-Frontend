"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  Calendar,
  Clock,
  HeartHandshake,
  MapPin,
  Sparkles,
  UserPlus,
  Users,
} from "lucide-react";
import { useGetEvents } from "@/hooks/useEvents";

export default function RudcEventsPage() {
  const { data, isLoading } = useGetEvents({ org: "RUDC" });
  const dbEvents = data?.data || [];

  const defaultEvents = [
    {
      title: "RUDC Annual Volunteer Orientation & Leadership Meet",
      date: "October 15, 2026",
      time: "10:00 AM - 01:00 PM",
      location: "RU Senate Bhaban / Library Seminar Room",
      desc: "Orientation for all newly registered volunteers, task assignments, explanation of 10 terms and conditions, and supervisor allocation.",
      status: "Upcoming",
    },
    {
      title: "Campus Seerah Conference: The Prophet's Character & Youth",
      date: "November 05, 2026",
      time: "03:30 PM - 07:00 PM",
      location: "Kazi Nazrul Islam Auditorium, Rajshahi University",
      desc: "A major campus seminar featuring prominent guest scholars discussing the Prophetic methodology in handling modern challenges.",
      status: "Upcoming",
    },
    {
      title: "Quran Recitation & Memorization Halqah for Students",
      date: "Every Friday",
      time: "08:00 AM - 10:00 AM",
      location: "RU Central Mosque Ground Floor",
      desc: "Tajweed correction and memorization circles guided by certified Huffaz and Qaris for campus brothers.",
      status: "Recurring",
    },
    {
      title: "Da'wah Skills Workshop: Effective Communication & Wisdom",
      date: "December 02, 2026",
      time: "04:00 PM - 06:30 PM",
      location: "RU Islamic Library Discussion Corner",
      desc: "Hands-on training session on how to deliver Islamic reminders with hikmah (wisdom), compassion, and adherence to Sunnah.",
      status: "Upcoming",
    },
  ];

  return (
    <div className="py-12 lg:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-600/30 text-[#004F32] dark:text-emerald-300 text-xs font-bold">
            <Calendar className="h-3.5 w-3.5 text-[#C78700] dark:text-amber-400" />
            <span>Community Gatherings</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-foreground">
            RUDC Events & Seminars
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Participate in informative conferences, character development workshops, and spiritual
            gatherings organized by Rajshahi University Dawah Community.
          </p>
        </div>

        {/* Event List */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-56 rounded-3xl bg-muted animate-pulse border border-border/60"
              />
            ))}
          </div>
        ) : dbEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {dbEvents.map((evt) => {
              const formattedDate = evt.startDate
                ? new Date(evt.startDate).toLocaleDateString("bn-BD", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : "তারিখ নির্ধারিত হবে";

              return (
                <div
                  key={evt.id}
                  className="rounded-3xl border border-border/80 bg-card overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-[#004F32] dark:text-emerald-400 border border-emerald-600/20">
                        {evt.category || "RUDC Event"}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-[#C78700] dark:text-amber-400 uppercase">
                        {evt.status}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-foreground">{evt.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {evt.activity?.title ? `কার্যক্রম: ${evt.activity.title}` : "ক্যাম্পাসে দ্বীনি দাওয়াহ ও শিক্ষার্থীদের চরিত্র গঠনের সম্মেলন।"}
                    </p>

                    <div className="space-y-2 text-xs text-muted-foreground pt-2 border-t border-border/50">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5 text-[#004F32] dark:text-emerald-400 shrink-0" />
                        <span>{formattedDate}</span>
                      </div>
                      {evt.scheduleText && (
                        <div className="flex items-center gap-2">
                          <Clock className="h-3.5 w-3.5 text-[#C78700] dark:text-amber-400 shrink-0" />
                          <span>{evt.scheduleText}</span>
                        </div>
                      )}
                      {evt.location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          <span>{evt.location}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-4 px-6 border-t border-border/50 bg-muted/20 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">মুক্ত উন্মুক্ত আয়োজন</span>
                    <Link
                      href={evt.slug ? `/events/${evt.slug}` : `/rudc/events`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#004F32] dark:text-emerald-400 hover:underline"
                    >
                      <span>বিস্তারিত দেখুন</span>
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {defaultEvents.map((evt, idx) => (
              <div
                key={idx}
                className="rounded-3xl border border-border/80 bg-card p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-[#004F32] dark:text-emerald-400 border border-emerald-600/20">
                      {evt.status}
                    </span>
                    <span className="text-xs font-semibold text-muted-foreground">{evt.date}</span>
                  </div>

                  <h3 className="text-base font-bold text-foreground">{evt.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{evt.desc}</p>
                </div>

                <div className="pt-4 border-t border-border/50 space-y-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5 text-[#004F32] dark:text-emerald-400 shrink-0" />
                    <span>{evt.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 text-[#C78700] dark:text-amber-400 shrink-0" />
                    <span>{evt.location}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Volunteer Notice */}
        <div className="rounded-3xl bg-muted/40 border border-border p-8 text-center max-w-2xl mx-auto space-y-4">
          <h3 className="text-lg font-bold text-foreground">Want to help organize these events?</h3>
          <p className="text-xs text-muted-foreground">
            Our specialized teams manage sound, hall setup, guest hospitality, and media coverage.
          </p>
          <div className="pt-2">
            <Link
              href="/rudc/join"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#004F32] hover:bg-[#003e27] text-white font-bold text-xs shadow-xs"
            >
              <UserPlus className="h-4 w-4" />
              <span>Join Logistics & Event Team</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

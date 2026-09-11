"use client";

import React, { useMemo } from "react";
import {
  Phone,
  MessageCircle,
  Facebook,
  Clock,
  Calendar,
  MapPin,
  Radio,
  MoonStar,
  Sun,
} from "lucide-react";
import {
  SHIFT_SCHEDULE,
  LIBRARY_CONTACT,
  JS_DAY_TO_SCHEDULE_INDEX,
  ShifterContact,
} from "@/lib/shifterContacts";
import { useActiveShift } from "@/hooks/useShifts";
import { SectionHeader } from "./SectionHeader";

/* ------------------------------------------------------------------ */
/* ContactChip sub-component (compact mode)                            */
/* ------------------------------------------------------------------ */

function ContactChip({ shifter }: { shifter: ShifterContact }) {
  return (
    <div className="flex items-center justify-between gap-3 bg-background/60 dark:bg-muted/20 rounded-xl px-3 py-2.5 border border-border/50">
      <div className="flex items-center gap-2 min-w-0">
        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 ring-1 ring-primary/20">
          <span className="text-[11px] font-black text-primary">
            {shifter.name.charAt(0)}
          </span>
        </div>
        <div className="min-w-0">
          <p className="text-xs font-bold text-foreground leading-tight truncate">
            {shifter.name}
          </p>
          <p className="text-[10px] text-muted-foreground font-mono tracking-tight">
            {shifter.phone}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        <a
          href={`tel:${shifter.phone}`}
          title={`Call ${shifter.name}`}
          className="h-7 w-7 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center hover:bg-emerald-200 dark:hover:bg-emerald-900 transition-colors"
        >
          <Phone className="h-3.5 w-3.5" />
        </a>
        <a
          href={shifter.whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          title={`WhatsApp ${shifter.name}`}
          className="h-7 w-7 rounded-lg bg-[#25D366]/10 text-[#25D366] flex items-center justify-center hover:bg-[#25D366]/20 transition-colors"
        >
          <MessageCircle className="h-3.5 w-3.5" />
        </a>
        {shifter.facebook && (
          <a
            href={shifter.facebook}
            target="_blank"
            rel="noopener noreferrer"
            title={`Facebook ${shifter.name}`}
            className="h-7 w-7 rounded-lg bg-[#1877F2]/10 text-[#1877F2] flex items-center justify-center hover:bg-[#1877F2]/20 transition-colors"
          >
            <Facebook className="h-3.5 w-3.5" />
          </a>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* ShifterRow sub-component (full schedule table row)                  */
/* ------------------------------------------------------------------ */

function ShifterCell({ shifters }: { shifters: ShifterContact[] }) {
  return (
    <div className="space-y-2">
      {shifters.map((s) => (
        <div
          key={s.phone}
          className="flex items-center justify-between gap-2 group"
        >
          <div className="flex items-center gap-2 min-w-0">
            <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 ring-1 ring-primary/20 group-hover:bg-primary/20 transition-colors">
              <span className="text-[9px] font-black text-primary">
                {s.name.charAt(0)}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-foreground leading-tight truncate">
                {s.name}
              </p>
              <p className="text-[9px] text-muted-foreground font-mono tracking-tight">
                {s.phone}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <a
              href={`tel:${s.phone}`}
              title={`Call ${s.name}`}
              className="h-6 w-6 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center hover:bg-emerald-200 dark:hover:bg-emerald-900 transition-colors"
            >
              <Phone className="h-3 w-3" />
            </a>
            <a
              href={s.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              title={`WhatsApp ${s.name}`}
              className="h-6 w-6 rounded-md bg-[#25D366]/10 text-[#25D366] flex items-center justify-center hover:bg-[#25D366]/20 transition-colors"
            >
              <MessageCircle className="h-3 w-3" />
            </a>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Main Component                                                       */
/* ------------------------------------------------------------------ */

interface ShiftScheduleSectionProps {
  /** Compact = single highlighted card for home page hero use */
  compact?: boolean;
}

export function ShiftScheduleSection({
  compact = false,
}: ShiftScheduleSectionProps) {
  const { data: activeShift } = useActiveShift();

  const todayIndex = useMemo(() => {
    const jsDay = new Date().getDay();
    return JS_DAY_TO_SCHEDULE_INDEX[jsDay] ?? 0;
  }, []);

  const todaySchedule = SHIFT_SCHEDULE[todayIndex];

  if (compact) {
    /* ---- Compact card for home page ---- */
    return (
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-5">
        <div className="relative overflow-hidden bg-card rounded-3xl border border-border p-6 sm:p-10 shadow-sm">
          {/* Subtle decorative background */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-16 -right-16 h-56 w-56 rounded-full bg-primary/5" />
            <div className="absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-secondary/5" />
          </div>

          <div className="relative z-10">
            {/* Header */}
            <SectionHeader
              icon={Calendar}
              subtitleKey="home.scheduleSubtitle"
              titleKey="home.scheduleTitle"
              descriptionKey="home.scheduleDesc"
              className="mb-8"
              action={
                <div
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold border shrink-0 ${
                    activeShift
                      ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300"
                      : "bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300"
                  }`}
                >
                  <Radio className="h-3.5 w-3.5 animate-pulse" />
                  <span>
                    {activeShift
                      ? `${activeShift.shifterName || "ডিউটি শিফটার"} এখন চালু`
                      : "এখন বন্ধ"}
                  </span>
                </div>
              }
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Asr – Maghrib slot */}
              <div className="rounded-2xl border border-amber-200/60 dark:border-amber-900/40 bg-amber-50/50 dark:bg-amber-950/10 p-4 space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-xl bg-amber-100 dark:bg-amber-950/60 flex items-center justify-center">
                    <Sun className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-foreground">
                      আসর – মাগরিব
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      ≈ বিকাল ৩:৩০ – সন্ধ্যা ৬:১৫
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  {todaySchedule.asr_maghrib.map((s) => (
                    <ContactChip key={s.phone} shifter={s} />
                  ))}
                </div>
              </div>

              {/* Maghrib – Isha slot */}
              <div className="rounded-2xl border border-indigo-200/60 dark:border-indigo-900/40 bg-indigo-50/50 dark:bg-indigo-950/10 p-4 space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 flex items-center justify-center">
                    <MoonStar className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-foreground">
                      মাগরিব – এশা
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      ≈ সন্ধ্যা ৬:১৫ – রাত ৮:৩০
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  {todaySchedule.maghrib_isha.map((s) => (
                    <ContactChip key={s.phone} shifter={s} />
                  ))}
                </div>
              </div>
            </div>

            {/* Library general contact strip */}
            <div className="mt-6 pt-5 border-t border-border flex flex-wrap items-center gap-4">
              <span className="text-xs text-muted-foreground font-medium">
                গ্রন্থাগার সাধারণ যোগাযোগ:
              </span>
              <a
                href={`tel:${LIBRARY_CONTACT.phone}`}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
              >
                <Phone className="h-3 w-3" />
                {LIBRARY_CONTACT.phone}
              </a>
              <a
                href={LIBRARY_CONTACT.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#25D366] hover:underline"
              >
                <MessageCircle className="h-3 w-3" />
                WhatsApp
              </a>
              <a
                href={LIBRARY_CONTACT.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1877F2] hover:underline"
              >
                <Facebook className="h-3 w-3" />
                Facebook
              </a>
            </div>
          </div>
        </div>
      </section>
    );
  }

  /* ---- Full schedule for contact page ---- */
  return (
    <div className="space-y-10">
      {/* General Library Info */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href={`tel:${LIBRARY_CONTACT.phone}`}
            className="flex items-center gap-4 bg-card border border-border rounded-2xl p-5 hover:border-primary/50 hover:shadow-md transition-all group"
          >
            <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors shrink-0">
              <Phone className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">ফোন</p>
              <p className="text-sm font-black text-foreground">
                {LIBRARY_CONTACT.phone}
              </p>
              <p className="text-[10px] text-primary font-semibold mt-0.5">
                কল করুন →
              </p>
            </div>
          </a>

          <a
            href={LIBRARY_CONTACT.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 bg-card border border-border rounded-2xl p-5 hover:border-[#25D366]/50 hover:shadow-md transition-all group"
          >
            <div className="h-12 w-12 rounded-2xl bg-[#25D366]/10 flex items-center justify-center group-hover:bg-[#25D366]/20 transition-colors shrink-0">
              <MessageCircle className="h-6 w-6 text-[#25D366]" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">
                WhatsApp
              </p>
              <p className="text-sm font-black text-foreground">
                {LIBRARY_CONTACT.phone}
              </p>
              <p className="text-[10px] text-[#25D366] font-semibold mt-0.5">
                মেসেজ করুন →
              </p>
            </div>
          </a>

          <a
            href={LIBRARY_CONTACT.facebook}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 bg-card border border-border rounded-2xl p-5 hover:border-[#1877F2]/50 hover:shadow-md transition-all group"
          >
            <div className="h-12 w-12 rounded-2xl bg-[#1877F2]/10 flex items-center justify-center group-hover:bg-[#1877F2]/20 transition-colors shrink-0">
              <Facebook className="h-6 w-6 text-[#1877F2]" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">
                Facebook
              </p>
              <p className="text-sm font-black text-foreground">
                RU Islamic Library
              </p>
              <p className="text-[10px] text-[#1877F2] font-semibold mt-0.5">
                পেজ দেখুন →
              </p>
            </div>
          </a>
        </div>
      </section>

      {/* Address */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-start gap-4 bg-card border border-border rounded-2xl p-5">
          <div className="h-12 w-12 rounded-2xl bg-secondary/10 flex items-center justify-center shrink-0">
            <MapPin className="h-6 w-6 text-secondary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium">ঠিকানা</p>
            <p className="text-sm font-black text-foreground">
              {LIBRARY_CONTACT.location}
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              {LIBRARY_CONTACT.locationEn}
            </p>
          </div>
        </div>
      </section>

      {/* Full Weekly Schedule — beautiful table layout */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <SectionHeader
          icon={Calendar}
          subtitleKey="home.weeklyScheduleSubtitle"
          titleKey="home.weeklyScheduleTitle"
          descriptionKey="home.weeklyScheduleDesc"
          className="mb-6"
          action={
            activeShift && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold shrink-0">
                <Radio className="h-3.5 w-3.5 animate-pulse" />
                <span>
                  {activeShift.shifterName || "ডিউটি শিফটার"} — কাউন্টার খোলা
                </span>
              </div>
            )
          }
        />

        {/* Roster Table */}
        <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm">
          {/* Table header */}
          <div className="grid grid-cols-[1fr_2fr_2fr] bg-gradient-to-r from-primary/90 to-primary text-primary-foreground">
            <div className="px-5 py-4 flex items-center gap-2">
              <Calendar className="h-4 w-4 opacity-80" />
              <span className="text-xs font-black uppercase tracking-wider">
                দিন
              </span>
            </div>
            <div className="px-5 py-4 flex items-center gap-2 border-l border-white/10">
              <Sun className="h-4 w-4 opacity-80" />
              <div>
                <p className="text-xs font-black uppercase tracking-wider">
                  আসর – মাগরিব
                </p>
                <p className="text-[10px] opacity-60">≈ বিকাল ৩:৩০ – ৬:১৫</p>
              </div>
            </div>
            <div className="px-5 py-4 flex items-center gap-2 border-l border-white/10">
              <MoonStar className="h-4 w-4 opacity-80" />
              <div>
                <p className="text-xs font-black uppercase tracking-wider">
                  মাগরিব – এশা
                </p>
                <p className="text-[10px] opacity-60">≈ সন্ধ্যা ৬:১৫ – ৮:৩০</p>
              </div>
            </div>
          </div>

          {/* Table rows */}
          <div className="divide-y divide-border">
            {SHIFT_SCHEDULE.map((day, idx) => {
              const isToday = idx === todayIndex;
              return (
                <div
                  key={day.dayEn}
                  className={`grid grid-cols-[1fr_2fr_2fr] transition-colors ${
                    isToday
                      ? "bg-primary/5 dark:bg-primary/10"
                      : "hover:bg-muted/30"
                  }`}
                >
                  {/* Day label */}
                  <div className="px-5 py-4 flex flex-col justify-center gap-1.5">
                    <div
                      className={`inline-flex items-center justify-center rounded-xl px-3 py-1.5 font-black text-sm leading-tight text-center max-w-[7rem] ${
                        isToday
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {day.day}
                    </div>
                    {isToday && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-primary">
                        <Radio className="h-2.5 w-2.5 animate-pulse" />
                        আজ
                      </span>
                    )}
                  </div>

                  {/* Asr – Maghrib */}
                  <div
                    className={`px-5 py-4 border-l border-border ${
                      isToday ? "border-primary/20" : ""
                    }`}
                  >
                    <ShifterCell shifters={day.asr_maghrib} />
                  </div>

                  {/* Maghrib – Isha */}
                  <div
                    className={`px-5 py-4 border-l border-border ${
                      isToday ? "border-primary/20" : ""
                    }`}
                  >
                    <ShifterCell shifters={day.maghrib_isha} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Table footer with slot legend */}
          <div className="px-5 py-4 bg-muted/30 border-t border-border flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-[11px] text-muted-foreground font-medium">
                সময়সূচি আনুমানিক — প্রার্থনার সময়ের উপর নির্ভরশীল
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default ShiftScheduleSection;

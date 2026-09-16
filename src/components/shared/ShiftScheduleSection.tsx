"use client";

import React, { useMemo } from "react";
import {
  Phone,
  MessageCircle,
  Clock,
  Calendar,
  MapPin,
  Radio,
  MoonStar,
  Sun,
  UserX,
} from "lucide-react";
import { LIBRARY_CONTACT } from "@/lib/shifterContacts";
import { usePublicActiveShift, useWeeklyRoster } from "@/hooks/useShifts";
import { SectionHeader } from "./SectionHeader";

const wa = (phone: string) => `https://wa.me/88${phone.replace(/-/g, "")}`;

/* ------------------------------------------------------------------ */
/* ContactChip sub-component                                          */
/* ------------------------------------------------------------------ */

function ContactChip({
  shifter,
  isActive = false,
}: {
  shifter: { name: string; phone?: string; time?: string };
  isActive?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 border transition-all ${
        isActive
          ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-400 dark:border-emerald-700"
          : "bg-background/60 dark:bg-muted/20 border-border/50"
      }`}
    >
      <div className="flex items-center gap-2 min-w-0">
        <div
          className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ring-1 ${
            isActive
              ? "bg-emerald-600 text-white ring-emerald-500"
              : "bg-primary/10 text-primary ring-primary/20"
          }`}
        >
          <span className="text-[11px] font-black">{shifter.name.charAt(0)}</span>
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="text-xs font-bold text-foreground leading-tight truncate">
              {shifter.name}
            </p>
            {isActive && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-500 text-white text-[9px] font-bold shrink-0">
                <span className="h-1.5 w-1.5 rounded-full bg-white animate-ping" />
                Active
              </span>
            )}
          </div>
          <p className="text-[10px] text-muted-foreground font-mono tracking-tight">
            {shifter.time ? `${shifter.time} · ` : ""}
            {shifter.phone || ""}
          </p>
        </div>
      </div>
      {shifter.phone && (
        <div className="flex items-center gap-1.5 shrink-0">
          <a
            href={`tel:${shifter.phone}`}
            title={`Call ${shifter.name}`}
            className="h-7 w-7 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center hover:bg-emerald-200 dark:hover:bg-emerald-900 transition-colors"
          >
            <Phone className="h-3.5 w-3.5" />
          </a>
          <a
            href={wa(shifter.phone)}
            target="_blank"
            rel="noopener noreferrer"
            title={`WhatsApp ${shifter.name}`}
            className="h-7 w-7 rounded-lg bg-[#25D366]/10 text-[#25D366] flex items-center justify-center hover:bg-[#25D366]/20 transition-colors"
          >
            <MessageCircle className="h-3.5 w-3.5" />
          </a>
        </div>
      )}
    </div>
  );
}

function EmptySlot() {
  return (
    <div className="flex items-center gap-2 text-[11px] text-muted-foreground italic py-1">
      <UserX className="h-3.5 w-3.5 shrink-0" />
      <span>কোনো শিফটার নির্ধারিত নেই</span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Main Component                                                     */
/* ------------------------------------------------------------------ */

const DAYS_ORDER = [
  { dayOfWeek: 6, day: "শনিবার", dayEn: "Saturday" },
  { dayOfWeek: 0, day: "রবিবার", dayEn: "Sunday" },
  { dayOfWeek: 1, day: "সোমবার", dayEn: "Monday" },
  { dayOfWeek: 2, day: "মঙ্গলবার", dayEn: "Tuesday" },
  { dayOfWeek: 3, day: "বুধবার", dayEn: "Wednesday" },
  { dayOfWeek: 4, day: "বৃহস্পতিবার", dayEn: "Thursday" },
  { dayOfWeek: 5, day: "শুক্রবার", dayEn: "Friday" },
];

interface ShiftScheduleSectionProps {
  compact?: boolean;
}

export function ShiftScheduleSection({
  compact = false,
}: ShiftScheduleSectionProps) {
  const { data: activeShift } = usePublicActiveShift();
  const { data: dbRoster = [], isLoading: rosterLoading } = useWeeklyRoster();

  const isCounterOpen = Boolean(activeShift && activeShift.status === "ACTIVE");
  const todayDayOfWeek = useMemo(() => new Date().getDay(), []);

  // Today's DB slots only
  const todayDbSlots = useMemo(() => {
    return dbRoster.filter(
      (s) => s.isActive && Number(s.dayOfWeek) === todayDayOfWeek
    );
  }, [dbRoster, todayDayOfWeek]);

  // Today's Asr-Maghrib shifters
  const asrMaghribList = useMemo(() => {
    return todayDbSlots
      .filter((s) => s.slot === "asr_maghrib" || s.slotName.includes("আসর"))
      .map((s) => ({
        name: s.shifter?.name || "শিফটার",
        phone: s.shifter?.phone,
        time: `${s.startTime} – ${s.endTime}`,
        isActive:
          isCounterOpen &&
          (activeShift?.shifter?.id === s.shifterId ||
            activeShift?.shifterId === s.shifterId),
      }));
  }, [todayDbSlots, isCounterOpen, activeShift]);

  // Today's Maghrib-Isha shifters
  const maghribIshaList = useMemo(() => {
    return todayDbSlots
      .filter((s) => s.slot === "maghrib_isha" || s.slotName.includes("মাগরিব"))
      .map((s) => ({
        name: s.shifter?.name || "শিফটার",
        phone: s.shifter?.phone,
        time: `${s.startTime} – ${s.endTime}`,
        isActive:
          isCounterOpen &&
          (activeShift?.shifter?.id === s.shifterId ||
            activeShift?.shifterId === s.shifterId),
      }));
  }, [todayDbSlots, isCounterOpen, activeShift]);

  // Weekly 7 days roster list from database
  const weekDays = useMemo(() => {
    return DAYS_ORDER.map((cfg) => {
      const dbDaySlots = dbRoster.filter(
        (s) => s.isActive && Number(s.dayOfWeek) === cfg.dayOfWeek
      );

      const asr = dbDaySlots.filter(
        (s) => s.slot === "asr_maghrib" || s.slotName.includes("আসর")
      );
      const isha = dbDaySlots.filter(
        (s) => s.slot === "maghrib_isha" || s.slotName.includes("মাগরিব")
      );

      return {
        ...cfg,
        isToday: cfg.dayOfWeek === todayDayOfWeek,
        asrList: asr.map((s) => ({
          name: s.shifter?.name || "শিফটার",
          phone: s.shifter?.phone,
          time: `${s.startTime} – ${s.endTime}`,
          isActive:
            isCounterOpen &&
            cfg.dayOfWeek === todayDayOfWeek &&
            (activeShift?.shifter?.id === s.shifterId ||
              activeShift?.shifterId === s.shifterId),
        })),
        ishaList: isha.map((s) => ({
          name: s.shifter?.name || "শিফটার",
          phone: s.shifter?.phone,
          time: `${s.startTime} – ${s.endTime}`,
          isActive:
            isCounterOpen &&
            cfg.dayOfWeek === todayDayOfWeek &&
            (activeShift?.shifter?.id === s.shifterId ||
              activeShift?.shifterId === s.shifterId),
        })),
      };
    });
  }, [dbRoster, todayDayOfWeek, isCounterOpen, activeShift]);

  const activeShifterDisplayName =
    activeShift?.shifter?.name || activeShift?.shifterName;

  if (compact) {
    return (
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-5">
        <div className="relative overflow-hidden bg-card rounded-3xl border border-border p-6 sm:p-10 shadow-sm">
          <div className="relative z-10">
            <SectionHeader
              icon={Calendar}
              subtitleKey="home.scheduleSubtitle"
              titleKey="home.scheduleTitle"
              descriptionKey="home.scheduleDesc"
              className="mb-8"
              action={
                <div
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold border shrink-0 ${
                    isCounterOpen
                      ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300"
                      : "bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300"
                  }`}
                >
                  <Radio className={`h-3.5 w-3.5 ${isCounterOpen ? "animate-pulse text-emerald-600" : ""}`} />
                  <span>
                    {isCounterOpen
                      ? `${activeShifterDisplayName || "ডিউটি শিফটার"} এখন সক্রিয় (Active)`
                      : "এখন স্ট্যান্ডবাই"}
                  </span>
                </div>
              }
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-amber-200/60 dark:border-amber-900/40 bg-amber-50/50 dark:bg-amber-950/10 p-4 space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-xl bg-amber-100 dark:bg-amber-950/60 flex items-center justify-center">
                    <Sun className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-foreground">আসর – মাগরিব</p>
                    <p className="text-[10px] text-muted-foreground">নামাজের সময় ভিত্তিক</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {rosterLoading ? (
                    <div className="h-10 bg-muted/40 rounded-xl animate-pulse" />
                  ) : asrMaghribList.length > 0 ? (
                    asrMaghribList.map((s, i) => (
                      <ContactChip key={i} shifter={s} isActive={s.isActive} />
                    ))
                  ) : (
                    <EmptySlot />
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-indigo-200/60 dark:border-indigo-900/40 bg-indigo-50/50 dark:bg-indigo-950/10 p-4 space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 flex items-center justify-center">
                    <MoonStar className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-foreground">মাগরিব – এশা</p>
                    <p className="text-[10px] text-muted-foreground">নামাজের সময় ভিত্তিক</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {rosterLoading ? (
                    <div className="h-10 bg-muted/40 rounded-xl animate-pulse" />
                  ) : maghribIshaList.length > 0 ? (
                    maghribIshaList.map((s, i) => (
                      <ContactChip key={i} shifter={s} isActive={s.isActive} />
                    ))
                  ) : (
                    <EmptySlot />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  /* ---- Full Schedule View on Contact Page ---- */
  return (
    <div className="space-y-10">
      {/* General Library Contact Strip */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <a
            href={`tel:${LIBRARY_CONTACT.phone}`}
            className="flex items-center gap-4 bg-card border border-border rounded-2xl p-5 hover:border-primary/50 hover:shadow-md transition-all group"
          >
            <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors shrink-0">
              <Phone className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">হটলাইন / সরাসরি কল</p>
              <p className="text-sm font-black text-foreground">{LIBRARY_CONTACT.phone}</p>
              <p className="text-[10px] text-primary font-semibold mt-0.5">কল করুন →</p>
            </div>
          </a>

          <a
            href={wa(LIBRARY_CONTACT.phone)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 bg-card border border-border rounded-2xl p-5 hover:border-[#25D366]/50 hover:shadow-md transition-all group"
          >
            <div className="h-12 w-12 rounded-2xl bg-[#25D366]/10 flex items-center justify-center group-hover:bg-[#25D366]/20 transition-colors shrink-0">
              <MessageCircle className="h-6 w-6 text-[#25D366]" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">WhatsApp মেসেজ</p>
              <p className="text-sm font-black text-foreground">{LIBRARY_CONTACT.phone}</p>
              <p className="text-[10px] text-[#25D366] font-semibold mt-0.5">মেসেজ পাঠান →</p>
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
            <p className="text-xs text-muted-foreground font-medium">ঠিকানা ও কাউন্টার অবস্থান</p>
            <p className="text-sm font-black text-foreground">{LIBRARY_CONTACT.location}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{LIBRARY_CONTACT.locationEn}</p>
          </div>
        </div>
      </section>

      {/* Today's Duty Shifters & Full Weekly Schedule */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-wider mb-1">
                <Clock className="h-3.5 w-3.5" />
                <span>কাউন্টার ডিউটি রোস্টার</span>
              </div>
              <h2 className="text-2xl font-black text-foreground">
                শিফটার সময়সূচি ও রিয়েল-টাইম স্ট্যাটাস
              </h2>
            </div>

            <div
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold border shrink-0 ${
                isCounterOpen
                  ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300"
                  : "bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300"
              }`}
            >
              <Radio className={`h-3 w-3 ${isCounterOpen ? "animate-pulse text-emerald-600" : ""}`} />
              <span>
                {isCounterOpen
                  ? `${activeShifterDisplayName || "শিফটার"} এখন সক্রিয় (Active)`
                  : "এখন স্ট্যান্ডবাই"}
              </span>
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-xs">
            <div className="hidden md:grid md:grid-cols-[180px_1fr_1fr] bg-primary text-primary-foreground text-xs font-black uppercase tracking-wider">
              <div className="px-5 py-3.5 flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 opacity-80" />
                <span>দিন / Day</span>
              </div>
              <div className="px-5 py-3.5 flex items-center gap-1.5 border-l border-white/10">
                <Sun className="h-3.5 w-3.5 opacity-80" />
                <span>আসর – মাগরিব (Asr – Maghrib)</span>
              </div>
              <div className="px-5 py-3.5 flex items-center gap-1.5 border-l border-white/10">
                <MoonStar className="h-3.5 w-3.5 opacity-80" />
                <span>মাগরিব – এশা (Maghrib – Isha)</span>
              </div>
            </div>

            <div className="divide-y divide-border">
              {weekDays.map((day) => (
                <div
                  key={day.dayEn}
                  className={`grid grid-cols-1 md:grid-cols-[180px_1fr_1fr] p-4 md:p-0 gap-3 md:gap-0 transition-colors ${
                    day.isToday ? "bg-primary/5 dark:bg-primary/10" : "hover:bg-muted/30"
                  }`}
                >
                  {/* Day Label */}
                  <div className="md:px-5 md:py-4 flex md:flex-col items-center md:items-start justify-between md:justify-center gap-1.5 border-b md:border-b-0 pb-2 md:pb-0 border-border/60">
                    <span
                      className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-black ${
                        day.isToday
                          ? "bg-primary text-primary-foreground shadow-2xs"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {day.day}
                    </span>
                    {day.isToday && (
                      <span className="text-[10px] font-bold text-primary flex items-center gap-1">
                        <Radio className="h-2.5 w-2.5 animate-pulse" /> আজ (Today)
                      </span>
                    )}
                  </div>

                  {/* Asr-Maghrib Slot */}
                  <div className="md:px-5 md:py-4 md:border-l md:border-border">
                    <div className="flex md:hidden items-center gap-1.5 text-xs font-bold text-amber-600 mb-2">
                      <Sun className="h-3.5 w-3.5" />
                      <span>আসর – মাগরিব</span>
                    </div>
                    <div className="space-y-2">
                      {rosterLoading ? (
                        <div className="h-8 bg-muted/40 rounded-lg animate-pulse" />
                      ) : day.asrList.length > 0 ? (
                        day.asrList.map((s, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between gap-2 bg-muted/20 rounded-lg p-2"
                          >
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <p className="text-xs font-bold text-foreground truncate">
                                  {s.name}
                                </p>
                                {s.isActive && (
                                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full bg-emerald-500 text-white text-[9px] font-bold">
                                    <span className="h-1.5 w-1.5 rounded-full bg-white animate-ping" />
                                    Live
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] text-muted-foreground font-mono">
                                {s.time} {s.phone ? `· ${s.phone}` : ""}
                              </p>
                            </div>
                            {s.phone && (
                              <div className="flex items-center gap-1 shrink-0">
                                <a
                                  href={`tel:${s.phone}`}
                                  className="h-6 w-6 rounded-md bg-emerald-100 text-emerald-700 flex items-center justify-center hover:bg-emerald-200"
                                >
                                  <Phone className="h-3 w-3" />
                                </a>
                                <a
                                  href={wa(s.phone)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="h-6 w-6 rounded-md bg-[#25D366]/10 text-[#25D366] flex items-center justify-center hover:bg-[#25D366]/20"
                                >
                                  <MessageCircle className="h-3 w-3" />
                                </a>
                              </div>
                            )}
                          </div>
                        ))
                      ) : (
                        <p className="text-[10px] text-muted-foreground italic py-1">নির্ধারিত নেই</p>
                      )}
                    </div>
                  </div>

                  {/* Maghrib-Isha Slot */}
                  <div className="md:px-5 md:py-4 md:border-l md:border-border">
                    <div className="flex md:hidden items-center gap-1.5 text-xs font-bold text-indigo-600 mb-2">
                      <MoonStar className="h-3.5 w-3.5" />
                      <span>মাগরিব – এশা</span>
                    </div>
                    <div className="space-y-2">
                      {rosterLoading ? (
                        <div className="h-8 bg-muted/40 rounded-lg animate-pulse" />
                      ) : day.ishaList.length > 0 ? (
                        day.ishaList.map((s, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between gap-2 bg-muted/20 rounded-lg p-2"
                          >
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <p className="text-xs font-bold text-foreground truncate">
                                  {s.name}
                                </p>
                                {s.isActive && (
                                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full bg-emerald-500 text-white text-[9px] font-bold">
                                    <span className="h-1.5 w-1.5 rounded-full bg-white animate-ping" />
                                    Live
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] text-muted-foreground font-mono">
                                {s.time} {s.phone ? `· ${s.phone}` : ""}
                              </p>
                            </div>
                            {s.phone && (
                              <div className="flex items-center gap-1 shrink-0">
                                <a
                                  href={`tel:${s.phone}`}
                                  className="h-6 w-6 rounded-md bg-emerald-100 text-emerald-700 flex items-center justify-center hover:bg-emerald-200"
                                >
                                  <Phone className="h-3 w-3" />
                                </a>
                                <a
                                  href={wa(s.phone)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="h-6 w-6 rounded-md bg-[#25D366]/10 text-[#25D366] flex items-center justify-center hover:bg-[#25D366]/20"
                                >
                                  <MessageCircle className="h-3 w-3" />
                                </a>
                              </div>
                            )}
                          </div>
                        ))
                      ) : (
                        <p className="text-[10px] text-muted-foreground italic py-1">নির্ধারিত নেই</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3.5 bg-muted/30 border-t border-border flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5 shrink-0" />
              <span>
                ডিউটি শিফট নামাজের সময় ভিত্তিক পরিচালিত হয় — স্থানীয় নামাজের সময়ের পরিবর্তনের সাথে সমন্বয় রাখা হয়।
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default ShiftScheduleSection;

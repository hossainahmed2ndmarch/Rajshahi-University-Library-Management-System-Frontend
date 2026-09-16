"use client";

import React, { useMemo, useState } from "react";
import {
  Building,
  Clock,
  MapPin,
  ShieldCheck,
  Radio,
  ExternalLink,
  Calendar,
  Phone,
  MessageCircle,
  Sun,
  MoonStar,
  ChevronRight,
  UserX,
} from "lucide-react";
import { usePublicActiveShift, useWeeklyRoster } from "@/hooks/useShifts";
import { useLanguageStore } from "@/store/useLanguageStore";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { LIBRARY_CONTACT } from "@/lib/shifterContacts";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { IShifterSchedule } from "@/types/shift";

const wa = (phone: string) => `https://wa.me/88${phone.replace(/-/g, "")}`;

/* ------------------------------------------------------------------ */
/* ShifterCard: Single Shifter Display with Call & WhatsApp           */
/* ------------------------------------------------------------------ */

interface ShifterCardProps {
  name: string;
  phone?: string;
  timeRange?: string;
  isActive?: boolean;
}

function ShifterCard({ name, phone, timeRange, isActive }: ShifterCardProps) {
  return (
    <div
      className={`flex items-center justify-between gap-3 rounded-xl px-3.5 py-2.5 border transition-all shadow-2xs ${
        isActive
          ? "bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-400 dark:border-emerald-700"
          : "bg-background/80 dark:bg-muted/30 border-border/60 hover:border-primary/30"
      }`}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <div
          className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ring-1 ${
            isActive
              ? "bg-emerald-600 text-white ring-emerald-500"
              : "bg-primary/10 text-primary ring-primary/20"
          }`}
        >
          <span className="text-xs font-black">{name.charAt(0)}</span>
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="text-xs font-bold text-foreground leading-tight truncate">
              {name}
            </p>
            {isActive && (
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-emerald-500 text-white text-[9px] font-bold shrink-0">
                <span className="h-1.5 w-1.5 rounded-full bg-white animate-ping" />
                Live
              </span>
            )}
          </div>
          <p className="text-[10px] text-muted-foreground font-mono tracking-tight">
            {timeRange ? `${timeRange} · ` : ""}
            {phone || ""}
          </p>
        </div>
      </div>
      {phone && (
        <div className="flex items-center gap-1.5 shrink-0">
          <a
            href={`tel:${phone}`}
            title={`Call ${name}`}
            className="h-7 w-7 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center hover:bg-emerald-200 dark:hover:bg-emerald-900 transition-colors"
          >
            <Phone className="h-3.5 w-3.5" />
          </a>
          <a
            href={wa(phone)}
            target="_blank"
            rel="noopener noreferrer"
            title={`WhatsApp ${name}`}
            className="h-7 w-7 rounded-lg bg-[#25D366]/10 text-[#25D366] flex items-center justify-center hover:bg-[#25D366]/20 transition-colors"
          >
            <MessageCircle className="h-3.5 w-3.5" />
          </a>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* EmptySlot: Shown when no DB entry exists for a slot                */
/* ------------------------------------------------------------------ */

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

export function LiveMapAndScheduleSection() {
  const { data: activeShift } = usePublicActiveShift();
  const { data: dbRoster = [], isLoading: rosterLoading } = useWeeklyRoster();
  const { t, language } = useLanguageStore();
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);

  const isCounterOpen = Boolean(activeShift && activeShift.status === "ACTIVE");

  const todayDayOfWeek = useMemo(() => new Date().getDay(), []);

  // Today's DB slots only — no fallback
  const todayDbSlots = useMemo(() => {
    return dbRoster.filter(
      (s) => s.isActive && Number(s.dayOfWeek) === todayDayOfWeek
    );
  }, [dbRoster, todayDayOfWeek]);

  const toCard = (s: IShifterSchedule) => ({
    name: s.shifter?.name || "শিফটার",
    phone: s.shifter?.phone,
    timeRange: `${s.startTime} – ${s.endTime}`,
    isActive:
      isCounterOpen &&
      (activeShift?.shifter?.id === s.shifterId ||
        activeShift?.shifterId === s.shifterId),
  });

  const asrMaghribList = useMemo(
    () =>
      todayDbSlots
        .filter((s) => s.slot === "asr_maghrib" || s.slotName.includes("আসর"))
        .map(toCard),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [todayDbSlots, isCounterOpen, activeShift]
  );

  const maghribIshaList = useMemo(
    () =>
      todayDbSlots
        .filter(
          (s) => s.slot === "maghrib_isha" || s.slotName.includes("মাগরিব")
        )
        .map(toCard),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [todayDbSlots, isCounterOpen, activeShift]
  );

  // Full 7-day schedule (DB only)
  const weekDays = useMemo(() => {
    return DAYS_ORDER.map((cfg) => {
      const daySlots = dbRoster.filter(
        (s) => s.isActive && Number(s.dayOfWeek) === cfg.dayOfWeek
      );
      const asr = daySlots.filter(
        (s) => s.slot === "asr_maghrib" || s.slotName.includes("আসর")
      );
      const isha = daySlots.filter(
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

  const todayLabel =
    DAYS_ORDER.find((d) => d.dayOfWeek === todayDayOfWeek)?.day ?? "";

  const activeShifterDisplayName =
    activeShift?.shifter?.name || activeShift?.shifterName;

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-5">
      {/* ─── Unified Section Header ─── */}
      <SectionHeader
        icon={Building}
        subtitleKey="home.liveScheduleSubtitle"
        titleKey="home.liveScheduleTitle"
        descriptionKey="home.liveScheduleDesc"
        className="mb-8"
        action={
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Live Status Badge */}
            <div
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold border transition-colors shrink-0 ${
                isCounterOpen
                  ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300"
                  : "bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300"
              }`}
            >
              <Radio className={`h-3 w-3 ${isCounterOpen ? "animate-pulse text-emerald-600" : ""}`} />
              <span>
                {isCounterOpen
                  ? activeShifterDisplayName
                    ? `${activeShifterDisplayName} (${t("home.activeDesk")})`
                    : t("home.activeDesk")
                  : t("home.standbyDesk")}
              </span>
            </div>

            {/* Weekly Schedule Modal Trigger */}
            <button
              onClick={() => setScheduleModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-card hover:bg-muted border border-border text-xs font-bold text-foreground transition-colors cursor-pointer shadow-2xs"
            >
              <Calendar className="h-3.5 w-3.5 text-primary" />
              <span>{t("home.viewFullSchedule")}</span>
              <ChevronRight className="h-3 w-3 text-muted-foreground" />
            </button>
          </div>
        }
      />

      {/* ─── Bento Grid Card ─── */}
      <div className="relative overflow-hidden bg-card rounded-3xl border border-border p-6 sm:p-8 lg:p-10">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-secondary/5 blur-3xl" />
        </div>

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* ── LEFT COLUMN: Today's Shifter Schedule & Contacts ── */}
          <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
            <div>
              {/* Today's Day Indicator */}
              <div className="flex items-center justify-between gap-3 pb-3 border-b border-border/80 mb-5">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Calendar className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-foreground">
                      {language === "bn"
                        ? `আজকের ডিউটি: ${todayLabel}`
                        : `Today's Duty: ${DAYS_ORDER.find((d) => d.dayOfWeek === todayDayOfWeek)?.dayEn ?? ""}`}
                    </h3>
                    <p className="text-[11px] text-muted-foreground">
                      {language === "bn"
                        ? "বই গ্রহণ ও জমাদানে দায়িত্বপ্রাপ্ত শিফটারের সাথে যোগাযোগ করুন"
                        : "Connect with assigned duty shifters for circulation"}
                    </p>
                  </div>
                </div>

                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider">
                  <Radio className="h-2.5 w-2.5 animate-pulse" />
                  {language === "bn" ? "আজকের সূচি" : "Today"}
                </span>
              </div>

              {/* Shift Timing Slots */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Asr – Maghrib Slot */}
                <div className="rounded-2xl border border-amber-200/70 dark:border-amber-900/40 bg-amber-50/40 dark:bg-amber-950/10 p-4 space-y-3">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-xl bg-amber-100 dark:bg-amber-950/60 flex items-center justify-center shrink-0">
                      <Sun className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-foreground">
                        {language === "bn" ? "আসর – মাগরিব" : language === "ar" ? "العصر – المغرب" : "Asr – Maghrib"}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        নামাজের সময় ভিত্তিক
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {rosterLoading ? (
                      <div className="h-10 bg-muted/40 rounded-xl animate-pulse" />
                    ) : asrMaghribList.length > 0 ? (
                      asrMaghribList.map((s, i) => (
                        <ShifterCard key={`asr_${i}`} {...s} />
                      ))
                    ) : (
                      <EmptySlot />
                    )}
                  </div>
                </div>

                {/* Maghrib – Isha Slot */}
                <div className="rounded-2xl border border-indigo-200/70 dark:border-indigo-900/40 bg-indigo-50/40 dark:bg-indigo-950/10 p-4 space-y-3">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 flex items-center justify-center shrink-0">
                      <MoonStar className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-foreground">
                        {language === "bn" ? "মাগরিব – এশা" : language === "ar" ? "المغرب – العشاء" : "Maghrib – Isha"}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        নামাজের সময় ভিত্তিক
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {rosterLoading ? (
                      <div className="h-10 bg-muted/40 rounded-xl animate-pulse" />
                    ) : maghribIshaList.length > 0 ? (
                      maghribIshaList.map((s, i) => (
                        <ShifterCard key={`isha_${i}`} {...s} />
                      ))
                    ) : (
                      <EmptySlot />
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* General Library Hotline */}
            <div className="pt-4 border-t border-border/80 flex flex-wrap items-center justify-between gap-3 text-xs">
              <span className="text-muted-foreground font-medium">
                {language === "bn" ? "গ্রন্থাগার সাধারণ যোগাযোগ:" : "General Library Helpline:"}
              </span>
              <div className="flex items-center gap-3">
                <a
                  href={`tel:${LIBRARY_CONTACT.phone}`}
                  className="inline-flex items-center gap-1.5 font-bold text-primary hover:underline"
                >
                  <Phone className="h-3 w-3" />
                  {LIBRARY_CONTACT.phone}
                </a>
                <a
                  href={wa(LIBRARY_CONTACT.phone)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 font-bold text-[#25D366] hover:underline"
                >
                  <MessageCircle className="h-3 w-3" />
                  WhatsApp
                </a>
              </div>
            </div>
          </div>

          {/* ── RIGHT COLUMN: Campus Map & Counter Spot ── */}
          <div className="lg:col-span-6 flex flex-col justify-between space-y-4">
            <div className="relative rounded-2xl overflow-hidden border border-border shadow-xs bg-muted h-64 sm:h-72 lg:h-[290px]">
              <iframe
                title="RU Stadium Market Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3634.341517406322!2d88.6253488!3d24.3690989!2m3!1f0!2f0!3f0!3m2!1i1024!2f768!4f13.1!3m3!1m2!1s0x39fbefd767ebedbd%3A0xbca88d2bfecfa49b!2sRajshahi%20University%20Stadium!5e0!3m2!1sen!2sbd!4v1700000000000!5m2!1sen!2sbd"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-full grayscale hover:grayscale-0 transition-all duration-500"
              />

              <div className="absolute top-3 left-3 bg-card/95 backdrop-blur-md border border-border/80 rounded-xl px-3 py-1.5 shadow-md flex items-center gap-2">
                <div className="h-5 w-5 rounded-md bg-primary/10 flex items-center justify-center">
                  <MapPin className="h-3 w-3 text-primary" />
                </div>
                <span className="text-[11px] font-bold text-foreground">
                  {language === "bn"
                    ? "রাবি স্টেডিয়াম মার্কেট, দোকান নং ৪৪"
                    : "RU Stadium Market, Store No. 44"}
                </span>
              </div>

              <a
                href="https://maps.google.com/?q=Rajshahi+University+Stadium+Market"
                target="_blank"
                rel="noopener noreferrer"
                className="absolute bottom-3 right-3 bg-card/95 hover:bg-card backdrop-blur-md border border-border/80 rounded-xl px-3 py-1.5 shadow-md flex items-center gap-1.5 text-[11px] font-bold text-primary hover:underline transition-all"
              >
                <span>{t("home.openInMaps")}</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-background/80 dark:bg-muted/20 border border-border/60">
                <Clock className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-foreground leading-tight">
                    {language === "bn" ? "কাউন্টার সময়সূচি" : "Circulation Hours"}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {language === "bn"
                      ? "প্রতিদিন আসর থেকে এশা (নামাজের সময় ভিত্তিক)"
                      : "Daily Asr to Isha (Prayer-time Based)"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-background/80 dark:bg-muted/20 border border-border/60">
                <ShieldCheck className="h-4 w-4 text-[#C78700] shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-foreground leading-tight">
                    {language === "bn" ? "কাউন্টার ও সেলফ অবস্থান" : "Circulation Desk Spot"}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    দোকান নং ৪৪, স্টেডিয়াম মার্কেট, রাবি
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── FULL 7-DAY SCHEDULE MODAL ─── */}
      <Dialog open={scheduleModalOpen} onOpenChange={setScheduleModalOpen}>
        <DialogContent className="w-[95vw] md:max-w-4xl lg:max-w-5xl max-h-[90vh] flex flex-col p-4 sm:p-6 rounded-2xl sm:rounded-3xl border-border bg-card">
          <DialogHeader className="space-y-1 pb-2 shrink-0">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary mb-1">
              <Calendar className="h-3.5 w-3.5" />
              <span>{t("home.weeklyScheduleSubtitle")}</span>
            </div>
            <DialogTitle className="text-lg sm:text-2xl font-black text-foreground">
              {t("home.weeklyScheduleTitle")}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              নামাজের সময় ভিত্তিক লাইব্রেরি কাউন্টার ডিউটি রোস্টার (সাপ্তাহিক)
            </DialogDescription>
          </DialogHeader>

          {/* Scrollable Container */}
          <div className="mt-2 overflow-y-auto pr-1 space-y-3 md:space-y-0 md:bg-card md:border md:border-border md:rounded-2xl md:shadow-2xs">
            {/* Table Header */}
            <div className="hidden md:grid md:grid-cols-[160px_1fr_1fr] lg:grid-cols-[180px_1fr_1fr] bg-gradient-to-r from-primary/90 to-primary text-primary-foreground text-xs font-black uppercase tracking-wider sticky top-0 z-10 shadow-xs">
              <div className="px-4 py-3.5 flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 opacity-80" />
                <span>দিন / Day</span>
              </div>
              <div className="px-4 py-3.5 flex items-center gap-1.5 border-l border-white/10">
                <Sun className="h-3.5 w-3.5 opacity-80" />
                <span>আসর – মাগরিব (Asr – Maghrib)</span>
              </div>
              <div className="px-4 py-3.5 flex items-center gap-1.5 border-l border-white/10">
                <MoonStar className="h-3.5 w-3.5 opacity-80" />
                <span>মাগরিব – এশা (Maghrib – Isha)</span>
              </div>
            </div>

            {/* Roster Rows */}
            <div className="space-y-3 md:space-y-0 md:divide-y md:divide-border">
              {weekDays.map((day) => (
                <div
                  key={day.dayEn}
                  className={`rounded-xl md:rounded-none border md:border-none p-3.5 md:p-0 grid grid-cols-1 md:grid-cols-[160px_1fr_1fr] lg:grid-cols-[180px_1fr_1fr] gap-3 md:gap-0 transition-colors ${
                    day.isToday
                      ? "bg-primary/5 dark:bg-primary/10 border-primary/40"
                      : "bg-card md:bg-transparent border-border hover:bg-muted/30"
                  }`}
                >
                  {/* Day Label */}
                  <div className="md:px-4 md:py-4 flex md:flex-col items-center md:items-start justify-between md:justify-center gap-1.5 border-b md:border-b-0 pb-2.5 md:pb-0 border-border/60">
                    <div
                      className={`inline-flex items-center justify-center rounded-lg px-2.5 py-1 font-black text-xs text-center ${
                        day.isToday
                          ? "bg-primary text-primary-foreground shadow-2xs"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {day.day}
                    </div>
                    {day.isToday && (
                      <span className="inline-flex items-center gap-1 text-[10px] md:text-[9px] font-bold text-primary">
                        <Radio className="h-2.5 w-2.5 md:h-2 md:w-2 animate-pulse" />
                        আজ / Today
                      </span>
                    )}
                  </div>

                  {/* Asr – Maghrib Slot */}
                  <div className={`md:px-4 md:py-4 md:border-l md:border-border ${day.isToday ? "md:border-primary/20" : ""}`}>
                    <div className="flex md:hidden items-center gap-1.5 text-[11px] font-bold text-amber-600 dark:text-amber-400 mb-2">
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
                                <p className="text-xs font-bold truncate">{s.name}</p>
                                {s.isActive && (
                                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full bg-emerald-500 text-white text-[9px] font-bold">
                                    <span className="h-1.5 w-1.5 rounded-full bg-white animate-ping" />
                                    Live
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] text-muted-foreground font-mono">
                                {s.time}{s.phone ? ` · ${s.phone}` : ""}
                              </p>
                            </div>
                            {s.phone && (
                              <div className="flex items-center gap-1 shrink-0">
                                <a href={`tel:${s.phone}`} className="h-6 w-6 rounded-md bg-emerald-100 text-emerald-700 flex items-center justify-center hover:bg-emerald-200">
                                  <Phone className="h-3 w-3" />
                                </a>
                                <a href={wa(s.phone)} target="_blank" rel="noopener noreferrer" className="h-6 w-6 rounded-md bg-[#25D366]/10 text-[#25D366] flex items-center justify-center hover:bg-[#25D366]/20">
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

                  {/* Maghrib – Isha Slot */}
                  <div className={`md:px-4 md:py-4 md:border-l md:border-border ${day.isToday ? "md:border-primary/20" : ""}`}>
                    <div className="flex md:hidden items-center gap-1.5 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 mb-2">
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
                                <p className="text-xs font-bold truncate">{s.name}</p>
                                {s.isActive && (
                                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full bg-emerald-500 text-white text-[9px] font-bold">
                                    <span className="h-1.5 w-1.5 rounded-full bg-white animate-ping" />
                                    Live
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] text-muted-foreground font-mono">
                                {s.time}{s.phone ? ` · ${s.phone}` : ""}
                              </p>
                            </div>
                            {s.phone && (
                              <div className="flex items-center gap-1 shrink-0">
                                <a href={`tel:${s.phone}`} className="h-6 w-6 rounded-md bg-emerald-100 text-emerald-700 flex items-center justify-center hover:bg-emerald-200">
                                  <Phone className="h-3 w-3" />
                                </a>
                                <a href={wa(s.phone)} target="_blank" rel="noopener noreferrer" className="h-6 w-6 rounded-md bg-[#25D366]/10 text-[#25D366] flex items-center justify-center hover:bg-[#25D366]/20">
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

            {/* Footer Note */}
            <div className="px-4 py-3 bg-muted/30 border-t border-border rounded-xl md:rounded-none flex items-center gap-2 text-[11px] text-muted-foreground sticky bottom-0 backdrop-blur-md">
              <Clock className="h-3.5 w-3.5 shrink-0" />
              <span>
                সময়সূচি নামাজের সময় ভিত্তিক — আসর ও মাগরিবের জামাতের সাথে সমন্বয় করে পরিচালিত হয়।
              </span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}

export default LiveMapAndScheduleSection;

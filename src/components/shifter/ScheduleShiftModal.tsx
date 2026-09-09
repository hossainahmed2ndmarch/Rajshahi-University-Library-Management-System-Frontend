"use client";

import React, { useState } from "react";
import {
  Calendar,
  Clock,
  X,
  Bell,
  Mail,
  Smartphone,
  Share2,
  Users,
  Sparkles,
  Send,
  MessageSquare,
} from "lucide-react";
import { useScheduleShift } from "@/hooks/useShifts";
import { useGetMe } from "@/hooks/useAuth";
import { NotificationChannel, SocialPlatform } from "@/types/shift";
import { format } from "date-fns";

const FIXED_SLOTS = [
  { id: "MORNING", name: "Morning Shift", time: "09:00 AM – 01:00 PM", startHour: 9, endHour: 13 },
  { id: "AFTERNOON", name: "Afternoon Shift", time: "01:00 PM – 05:00 PM", startHour: 13, endHour: 17 },
  { id: "EVENING", name: "Evening Shift", time: "05:00 PM – 09:00 PM", startHour: 17, endHour: 21 },
  { id: "CUSTOM", name: "Custom Time Slot", time: "Select custom hours", startHour: 10, endHour: 14 },
];

export function ScheduleShiftModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { data: user } = useGetMe();
  const { mutate: scheduleShift, isPending } = useScheduleShift();

  const [date, setDate] = useState<string>(format(new Date(), "yyyy-MM-dd"));
  const [selectedSlot, setSelectedSlot] = useState<string>("MORNING");
  const [customStart, setCustomStart] = useState<string>("09:00");
  const [customEnd, setCustomEnd] = useState<string>("13:00");
  const [notifyRecipients, setNotifyRecipients] = useState<"ALL" | "SHIFTER" | "ADMIN" | "SUPER_ADMIN">("ALL");
  const [notificationMethod, setNotificationMethod] = useState<NotificationChannel>("EMAIL");
  const [socialPlatform, setSocialPlatform] = useState<SocialPlatform>("WHATSAPP");
  const [notes, setNotes] = useState<string>("");

  if (!isOpen) return null;

  const getShiftDateTimes = () => {
    const slotObj = FIXED_SLOTS.find((s) => s.id === selectedSlot);
    let startIso: string;
    let endIso: string;

    if (selectedSlot === "CUSTOM") {
      startIso = new Date(`${date}T${customStart}:00`).toISOString();
      endIso = new Date(`${date}T${customEnd}:00`).toISOString();
    } else if (slotObj) {
      const s = new Date(date);
      s.setHours(slotObj.startHour, 0, 0, 0);
      const e = new Date(date);
      e.setHours(slotObj.endHour, 0, 0, 0);
      startIso = s.toISOString();
      endIso = e.toISOString();
    } else {
      startIso = new Date(date).toISOString();
      endIso = new Date(date).toISOString();
    }

    return { startIso, endIso };
  };

  const generateSocialShareText = () => {
    const slotObj = FIXED_SLOTS.find((s) => s.id === selectedSlot);
    const slotText = slotObj ? `${slotObj.name} (${slotObj.time})` : `${customStart} - ${customEnd}`;
    return `📢 *RU Islamic Library - Duty Shift Schedule*\n\nAssalamu Alaikum,\nShifter *${user?.name || "Duty Shifter"}* has scheduled counter duty shift in advance:\n\n📅 Date: ${date}\n⏰ Duty Slot: ${slotText}\n📝 Notes: ${notes || "Scheduled in advance"}\n\nCoordinating library counter coverage among staff.`;
  };

  const handleSocialShare = () => {
    const text = encodeURIComponent(generateSocialShareText());
    if (socialPlatform === "WHATSAPP") {
      window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
    } else if (socialPlatform === "TELEGRAM") {
      window.open(`https://t.me/share/url?url=${encodeURIComponent("https://ru-islamic-library.ac.bd")}&text=${text}`, "_blank");
    } else {
      // Messenger / default share fallback
      navigator.clipboard?.writeText(generateSocialShareText());
      window.open(`https://www.facebook.com/dialog/send?link=${encodeURIComponent("https://ru-islamic-library.ac.bd")}&app_id=12345&redirect_uri=${encodeURIComponent(window.location.href)}`, "_blank");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { startIso, endIso } = getShiftDateTimes();
    const slotObj = FIXED_SLOTS.find((s) => s.id === selectedSlot);
    const slotName = slotObj ? `${slotObj.name} (${slotObj.time})` : `Custom (${customStart}-${customEnd})`;

    scheduleShift(
      {
        startTime: startIso,
        endTime: endIso,
        shiftSlotName: slotName,
        notifyRecipients,
        notificationMethod,
        socialPlatform,
        notes,
      },
      {
        onSuccess: () => {
          if (notificationMethod === "SOCIAL_MEDIA") {
            handleSocialShare();
          }
          onClose();
        },
      }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in-50 overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-3xl border border-border bg-card p-6 shadow-2xl text-card-foreground my-8 space-y-4">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-muted-foreground hover:text-foreground cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center space-x-3 pb-4 border-b border-border">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#004F32] text-white">
            <Calendar className="h-6 w-6 text-amber-300" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-foreground">Schedule Duty Shift in Advance</h3>
            <p className="text-xs text-muted-foreground">
              Book fixed duty slot and notify other Shifters, Admins, or Super Admins.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Duty Date Picker */}
          <div className="space-y-1.5">
            <label className="font-bold text-foreground flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-primary" />
              <span>Select Duty Date *</span>
            </label>
            <input
              type="date"
              value={date}
              min={format(new Date(), "yyyy-MM-dd")}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>

          {/* Fixed Duty Time Slots */}
          <div className="space-y-1.5">
            <label className="font-bold text-foreground flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-primary" />
              <span>Fixed Duty Time Slots *</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {FIXED_SLOTS.map((slot) => (
                <button
                  type="button"
                  key={slot.id}
                  onClick={() => setSelectedSlot(slot.id)}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                    selectedSlot === slot.id
                      ? "border-emerald-600 bg-emerald-500/10 text-emerald-950 dark:text-emerald-200 shadow-xs"
                      : "border-border bg-muted/30 text-muted-foreground hover:bg-muted/60"
                  }`}
                >
                  <p className="font-extrabold text-foreground text-xs">{slot.name}</p>
                  <p className="text-[11px] opacity-90 mt-0.5 font-mono">{slot.time}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Time Slot Inputs */}
          {selectedSlot === "CUSTOM" && (
            <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl border border-border bg-muted/20">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-muted-foreground">Start Time</label>
                <input
                  type="time"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  className="w-full rounded-lg border border-input bg-background px-2.5 py-1.5 text-xs font-mono"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-muted-foreground">End Time</label>
                <input
                  type="time"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  className="w-full rounded-lg border border-input bg-background px-2.5 py-1.5 text-xs font-mono"
                />
              </div>
            </div>
          )}

          {/* Target Notification Recipients */}
          <div className="space-y-1.5">
            <label className="font-bold text-foreground flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-primary" />
              <span>Select Notification Recipients *</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: "ALL", label: "All Staff" },
                { id: "SHIFTER", label: "Shifters" },
                { id: "ADMIN", label: "Admins" },
                { id: "SUPER_ADMIN", label: "Super Admin" },
              ].map((rec) => (
                <button
                  type="button"
                  key={rec.id}
                  onClick={() => setNotifyRecipients(rec.id as any)}
                  className={`py-2 px-2.5 rounded-xl border text-center font-bold text-[11px] transition-all cursor-pointer ${
                    notifyRecipients === rec.id
                      ? "bg-[#004F32] text-white border-[#004F32]"
                      : "border-border bg-muted/30 text-muted-foreground hover:bg-muted/60"
                  }`}
                >
                  {rec.label}
                </button>
              ))}
            </div>
          </div>

          {/* Notification Channel Selection */}
          <div className="space-y-1.5">
            <label className="font-bold text-foreground flex items-center gap-1.5">
              <Bell className="h-3.5 w-3.5 text-amber-500" />
              <span>Notification Dispatch Channel *</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "EMAIL", label: "Email (Auto)", icon: <Mail className="h-3.5 w-3.5" /> },
                { id: "SMS", label: "Mobile / SMS", icon: <Smartphone className="h-3.5 w-3.5" /> },
                { id: "SOCIAL_MEDIA", label: "Social Media", icon: <Share2 className="h-3.5 w-3.5" /> },
              ].map((ch) => (
                <button
                  type="button"
                  key={ch.id}
                  onClick={() => setNotificationMethod(ch.id as any)}
                  className={`py-2 px-2 rounded-xl border flex items-center justify-center gap-1.5 font-bold text-[11px] transition-all cursor-pointer ${
                    notificationMethod === ch.id
                      ? "bg-amber-500/15 border-amber-500 text-amber-900 dark:text-amber-200"
                      : "border-border bg-muted/30 text-muted-foreground hover:bg-muted/60"
                  }`}
                >
                  {ch.icon}
                  <span>{ch.label}</span>
                </button>
              ))}
            </div>

            {/* Social Media Platform Selection */}
            {notificationMethod === "SOCIAL_MEDIA" && (
              <div className="rounded-2xl border border-border/80 bg-muted/40 p-3 space-y-2 mt-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-foreground">Select Social Platform:</span>
                  <div className="flex gap-1.5">
                    {[
                      { id: "WHATSAPP", label: "WhatsApp" },
                      { id: "TELEGRAM", label: "Telegram" },
                      { id: "MESSENGER", label: "Messenger" },
                    ].map((sp) => (
                      <button
                        type="button"
                        key={sp.id}
                        onClick={() => setSocialPlatform(sp.id as any)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-colors cursor-pointer ${
                          socialPlatform === sp.id
                            ? "bg-[#004F32] text-white"
                            : "bg-background border border-border text-muted-foreground"
                        }`}
                      >
                        {sp.label}
                      </button>
                    ))}
                  </div>
                </div>
                <p className="text-[10px] text-muted-foreground">
                  A pre-formatted schedule alert will open directly in {socialPlatform} upon confirmation.
                </p>
              </div>
            )}
          </div>

          {/* Schedule Notes */}
          <div className="space-y-1">
            <label className="font-bold text-foreground">Duty Notes / Special Activity (Optional)</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Will manage counter desk and inventory stock audit"
              className="w-full rounded-xl border border-input bg-background p-2.5 text-xs focus:ring-2 focus:ring-primary focus:outline-none resize-none"
            />
          </div>

          <div className="pt-2 flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl border border-input bg-background hover:bg-accent text-foreground cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold rounded-xl bg-[#004F32] hover:bg-emerald-900 text-white shadow-xs disabled:opacity-50 cursor-pointer"
            >
              <Send className="h-3.5 w-3.5 text-amber-300" />
              <span>{isPending ? "Scheduling & Notifying..." : "Confirm Schedule & Notify"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ScheduleShiftModal;

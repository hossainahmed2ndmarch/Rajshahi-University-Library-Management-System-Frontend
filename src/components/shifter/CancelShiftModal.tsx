"use client";

import React, { useState } from "react";
import {
  AlertTriangle,
  X,
  Bell,
  Mail,
  Smartphone,
  Share2,
  Users,
  Send,
} from "lucide-react";
import { useCancelShift } from "@/hooks/useShifts";
import { useGetMe } from "@/hooks/useAuth";
import { IShift, NotificationChannel, SocialPlatform } from "@/types/shift";
import { format } from "date-fns";

export function CancelShiftModal({
  isOpen,
  onClose,
  shift,
}: {
  isOpen: boolean;
  onClose: () => void;
  shift: IShift | null;
}) {
  const { data: user } = useGetMe();
  const { mutate: cancelShift, isPending } = useCancelShift();

  const [reason, setReason] = useState("");
  const [notifyRecipients, setNotifyRecipients] = useState<"ALL" | "SHIFTER" | "ADMIN" | "SUPER_ADMIN">("ALL");
  const [notificationMethod, setNotificationMethod] = useState<NotificationChannel>("EMAIL");
  const [socialPlatform, setSocialPlatform] = useState<SocialPlatform>("WHATSAPP");

  if (!isOpen || !shift) return null;

  const shiftDateText = shift.startTime
    ? format(new Date(shift.startTime), "EEEE, dd MMM yyyy (hh:mm a)")
    : "Scheduled Duty Shift";

  const generateSocialShareText = () => {
    return `🚨 *RU Islamic Library - Shift Cancellation Alert*\n\nAssalamu Alaikum,\nShifter *${user?.name || "Duty Shifter"}* has cancelled scheduled duty shift:\n\n📅 Scheduled: ${shiftDateText}\n⚠️ Reason: ${reason || "Emergency personal commitment"}\n\nPlease arrange alternate counter coverage.`;
  };

  const handleSocialShare = () => {
    const text = encodeURIComponent(generateSocialShareText());
    if (socialPlatform === "WHATSAPP") {
      window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
    } else if (socialPlatform === "TELEGRAM") {
      window.open(`https://t.me/share/url?url=${encodeURIComponent("https://ru-islamic-library.ac.bd")}&text=${text}`, "_blank");
    } else {
      navigator.clipboard?.writeText(generateSocialShareText());
      window.open(`https://www.facebook.com/dialog/send?link=${encodeURIComponent("https://ru-islamic-library.ac.bd")}&app_id=12345&redirect_uri=${encodeURIComponent(window.location.href)}`, "_blank");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;

    cancelShift(
      {
        id: shift.id,
        payload: {
          reason,
          notifyRecipients,
          notificationMethod,
          socialPlatform,
        },
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
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-500/15 text-red-600 dark:text-red-400">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-foreground">Cancel Scheduled Duty Shift</h3>
            <p className="text-xs text-muted-foreground">
              Notify other Shifters, Admins, or Super Admins in advance to arrange desk coverage.
            </p>
          </div>
        </div>

        {/* Selected Shift Information */}
        <div className="rounded-2xl border border-red-500/30 bg-red-500/5 p-3.5 space-y-1 text-xs text-red-950 dark:text-red-200">
          <p className="font-bold">Scheduled Duty Shift:</p>
          <p className="font-mono text-[11px]">{shiftDateText}</p>
          {shift.tasksCompleted && <p className="text-[11px] opacity-90">{shift.tasksCompleted}</p>}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Cancellation Reason */}
          <div className="space-y-1">
            <label className="font-bold text-foreground">Cancellation Reason (Mandatory) *</label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. University midterm exam clash / urgent family emergency. Please arrange alternate coverage."
              required
              className="w-full rounded-xl border border-input bg-background p-2.5 text-xs focus:ring-2 focus:ring-red-400 focus:outline-none resize-none"
            />
          </div>

          {/* Target Notification Recipients */}
          <div className="space-y-1.5">
            <label className="font-bold text-foreground flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-primary" />
              <span>Notify Staff in Advance *</span>
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
                      ? "bg-red-600 text-white border-red-600"
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
              <span>Notification Dispatch Method *</span>
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
                      ? "bg-red-500/15 border-red-500 text-red-900 dark:text-red-200"
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
                            ? "bg-red-600 text-white"
                            : "bg-background border border-border text-muted-foreground"
                        }`}
                      >
                        {sp.label}
                      </button>
                    ))}
                  </div>
                </div>
                <p className="text-[10px] text-muted-foreground">
                  A cancellation warning text will open directly in {socialPlatform} upon confirmation.
                </p>
              </div>
            )}
          </div>

          <div className="pt-2 flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl border border-input bg-background hover:bg-accent text-foreground cursor-pointer"
            >
              Keep Shift
            </button>
            <button
              type="submit"
              disabled={isPending || !reason.trim()}
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold rounded-xl bg-red-600 hover:bg-red-700 text-white shadow-xs disabled:opacity-50 cursor-pointer"
            >
              <Send className="h-3.5 w-3.5" />
              <span>{isPending ? "Cancelling & Notifying..." : "Confirm Cancellation & Notify"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CancelShiftModal;

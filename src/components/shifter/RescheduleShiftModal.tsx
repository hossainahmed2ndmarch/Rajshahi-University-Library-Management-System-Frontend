"use client";

import React, { useState } from "react";
import {
  CalendarClock,
  X,
  Clock,
  Send,
  Loader2,
  Calendar as CalendarIcon,
} from "lucide-react";
import { useRescheduleShift } from "@/hooks/useShifts";
import { IShift } from "@/types/shift";
import { format } from "date-fns";
import { toast } from "sonner";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  shift: IShift | null;
}

export function RescheduleShiftModal({ isOpen, onClose, shift }: Props) {
  const { mutate: rescheduleShift, isPending } = useRescheduleShift();

  const todayStr = new Date().toISOString().split("T")[0];
  const [newDate, setNewDate] = useState(todayStr);
  const [newTime, setNewTime] = useState("16:00");
  const [newEndTime, setNewEndTime] = useState("18:30");
  const [reason, setReason] = useState("");
  const [notifyRecipients, setNotifyRecipients] = useState<
    "ALL" | "SHIFTER" | "ADMIN" | "SUPER_ADMIN"
  >("ALL");

  if (!isOpen || !shift) return null;

  const currentFormatted = shift.startTime
    ? format(new Date(shift.startTime), "EEE, dd MMM yyyy (hh:mm a)")
    : "Current Slot";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDate || !newTime) {
      toast.error("Please select a valid date and time.");
      return;
    }

    const startIso = `${newDate}T${newTime}:00`;
    const endIso = newEndTime ? `${newDate}T${newEndTime}:00` : undefined;

    rescheduleShift(
      {
        id: shift.id,
        payload: {
          newStartTime: startIso,
          newEndTime: endIso,
          reason: reason.trim() || "Shift rescheduled by staff/shifter",
          notifyRecipients,
          notificationMethod: "EMAIL",
        },
      },
      {
        onSuccess: () => {
          toast.success("Duty shift rescheduled successfully! Staff notified.");
          onClose();
        },
        onError: (err: any) => {
          toast.error(
            err?.response?.data?.message || err?.message || "Failed to reschedule shift."
          );
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
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
            <CalendarClock className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-foreground">
              Reschedule Duty Shift
            </h3>
            <p className="text-xs text-muted-foreground">
              Update duty date or start time and alert desk coordinators.
            </p>
          </div>
        </div>

        {/* Current Shift Summary */}
        <div className="rounded-xl border border-border bg-muted/40 p-3.5 space-y-1">
          <span className="text-[10px] uppercase font-bold text-muted-foreground">
            Current Scheduled Time
          </span>
          <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-primary" />
            <span>{currentFormatted}</span>
          </p>
          <p className="text-[11px] text-muted-foreground">
            Shifter: {shift.shifter?.name || shift.shifterName || "Duty Staff"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* New Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-foreground flex items-center gap-1">
                <CalendarIcon className="h-3 w-3 text-muted-foreground" />
                <span>New Date *</span>
              </label>
              <input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                required
                className="w-full h-10 px-3 rounded-xl border border-input bg-background text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-foreground flex items-center gap-1">
                <Clock className="h-3 w-3 text-muted-foreground" />
                <span>New Start Time *</span>
              </label>
              <input
                type="time"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                required
                className="w-full h-10 px-3 rounded-xl border border-input bg-background text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-foreground flex items-center gap-1">
              <Clock className="h-3 w-3 text-muted-foreground" />
              <span>Expected End Time (Optional)</span>
            </label>
            <input
              type="time"
              value={newEndTime}
              onChange={(e) => setNewEndTime(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-input bg-background text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Reason */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-foreground">
              Reason for Rescheduling
            </label>
            <textarea
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Class schedule change, prayer time adjustment..."
              className="w-full p-2.5 rounded-xl border border-input bg-background text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Notify Recipient */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground">
              Notify Desk Staff
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                { id: "ALL", label: "All Staff & Shifters" },
                { id: "ADMIN", label: "Admins & Supervisors" },
              ].map((rec) => (
                <button
                  key={rec.id}
                  type="button"
                  onClick={() => setNotifyRecipients(rec.id as any)}
                  className={`py-2 px-3 rounded-xl border font-bold text-left transition-all cursor-pointer ${
                    notifyRecipients === rec.id
                      ? "border-primary bg-primary/10 text-primary shadow-2xs"
                      : "border-border bg-background text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {rec.label}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold rounded-xl border border-border bg-background hover:bg-accent text-foreground transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-600 text-white shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Rescheduling...</span>
                </>
              ) : (
                <>
                  <Send className="h-3.5 w-3.5" />
                  <span>Confirm Reschedule</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

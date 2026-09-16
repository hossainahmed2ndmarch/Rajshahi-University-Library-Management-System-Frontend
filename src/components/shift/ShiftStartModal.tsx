"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Clock, Play, CalendarX, RotateCcw, Phone, MessageCircle, Users, Loader2 } from "lucide-react";
import { IShifterSchedule } from "@/types/shift";
import { useStartShift, useCancelShift, useRescheduleShift } from "@/hooks/useShifts";
import { ShiftService } from "@/services/shift.service";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  schedule: IShifterSchedule | null;
  linkedShiftId?: number | string | null;
}

type ModalView = "main" | "start" | "reschedule" | "cancel";

export function ShiftStartModal({
  open,
  onOpenChange,
  schedule,
  linkedShiftId,
}: Props) {
  const [view, setView] = useState<ModalView>("main");
  const [openingCash, setOpeningCash] = useState<string>("500");
  const [rescheduleTime, setRescheduleTime] = useState("");
  const [rescheduleReason, setRescheduleReason] = useState("");
  const [cancelReason, setCancelReason] = useState("");
  const [notifyRecipients, setNotifyRecipients] = useState<"ALL" | "SHIFTER" | "ADMIN" | "SUPER_ADMIN">("ALL");
  const [isProcessing, setIsProcessing] = useState(false);

  const { mutate: startShift, isPending: isStarting } = useStartShift();
  const { mutate: cancelShift, isPending: isCancelling } = useCancelShift();
  const { mutate: rescheduleShift, isPending: isRescheduling } = useRescheduleShift();

  const waLink = schedule?.shifter?.phone
    ? `https://wa.me/88${schedule.shifter.phone.replace(/-/g, "")}`
    : undefined;

  const handleStart = () => {
    startShift(
      {
        openingCash: Number(openingCash) || 0,
        notes: schedule?.slotName ? `Slot: ${schedule.slotName}` : undefined,
      },
      {
        onSuccess: () => {
          onOpenChange(false);
          setView("main");
        },
      }
    );
  };

  const ensureShiftId = async (): Promise<number | string | null> => {
    if (linkedShiftId) return linkedShiftId;
    try {
      const today = new Date().toISOString().split("T")[0];
      const created = await ShiftService.scheduleShift({
        shifterId: schedule?.shifterId ? Number(schedule.shifterId) : undefined,
        startTime: `${today}T${schedule?.startTime || "15:30"}:00`,
        endTime: `${today}T${schedule?.endTime || "18:15"}:00`,
        shiftSlotName: schedule?.slotName || "Duty Shift",
        notifyRecipients: "ALL",
      });
      return created?.shift?.id ?? null;
    } catch {
      return null;
    }
  };

  const handleCancel = async () => {
    if (!cancelReason.trim()) {
      toast.error("বাতিলের কারণ উল্লেখ করা আবশ্যক / Cancellation reason is required.");
      return;
    }

    setIsProcessing(true);
    try {
      const targetId = await ensureShiftId();
      if (targetId) {
        cancelShift(
          {
            id: targetId,
            payload: { reason: cancelReason, notifyRecipients },
          },
          {
            onSuccess: () => {
              onOpenChange(false);
              setView("main");
              setCancelReason("");
            },
            onSettled: () => setIsProcessing(false),
          }
        );
      } else {
        toast.info("শিফট বাতিল সংরক্ষিত হয়েছে।");
        onOpenChange(false);
        setView("main");
        setIsProcessing(false);
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to cancel shift.");
      setIsProcessing(false);
    }
  };

  const handleReschedule = async () => {
    if (!rescheduleTime) {
      toast.error("নতুন সময় নির্বাচন করুন / Select new time.");
      return;
    }

    setIsProcessing(true);
    try {
      const today = new Date().toISOString().split("T")[0];
      const newStartTime = `${today}T${rescheduleTime}:00`;
      const targetId = await ensureShiftId();

      if (targetId) {
        rescheduleShift(
          {
            id: targetId,
            payload: {
              newStartTime,
              reason: rescheduleReason || "Rescheduled by duty shifter",
              notifyRecipients,
            },
          },
          {
            onSuccess: () => {
              onOpenChange(false);
              setView("main");
              setRescheduleReason("");
              setRescheduleTime("");
            },
            onSettled: () => setIsProcessing(false),
          }
        );
      } else {
        toast.info("রিশিডিউল তথ্য সংরক্ষিত হয়েছে।");
        onOpenChange(false);
        setView("main");
        setIsProcessing(false);
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to reschedule shift.");
      setIsProcessing(false);
    }
  };

  const slotTitle = schedule?.slotName || "কাউন্টার ডিউটি শিফট";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-3xl border-border bg-card p-6 shadow-2xl">
        <DialogHeader className="space-y-1.5 pb-2 border-b border-border/60">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
            <Clock className="h-3.5 w-3.5 animate-pulse" />
            <span>ডিউটি শিফট অ্যালার্ট / Shift Duty Alert</span>
          </div>
          <DialogTitle className="text-xl font-black text-foreground">
            {slotTitle}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            নির্ধারিত সময়: {schedule?.startTime || "3:30 PM"} – {schedule?.endTime || "6:15 PM"}
            {" · "}সময় হয়ে গেছে, শিফট শুরু করুন বা রিশিডিউল / বাতিল করুন।
          </DialogDescription>
        </DialogHeader>

        {view === "main" && (
          <div className="space-y-3 pt-3">
            <Button
              className="w-full bg-[#004F32] hover:bg-[#003824] text-white font-bold h-11 shadow-sm text-sm"
              onClick={() => setView("start")}
            >
              <Play className="h-4 w-4 mr-2" /> শিফট শুরু করুন (Start Shift Now)
            </Button>

            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                className="w-full border-amber-300 dark:border-amber-700/60 text-amber-800 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/20 font-semibold text-xs"
                onClick={() => setView("reschedule")}
              >
                <RotateCcw className="h-3.5 w-3.5 mr-1.5" /> রিশিডিউল (Reschedule)
              </Button>

              <Button
                variant="outline"
                className="w-full border-red-300 dark:border-red-700/60 text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 font-semibold text-xs"
                onClick={() => setView("cancel")}
              >
                <CalendarX className="h-3.5 w-3.5 mr-1.5" /> বাতিল করুন (Cancel)
              </Button>
            </div>

            {schedule?.shifter?.phone && (
              <div className="pt-2.5 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
                <span>শিফটার যোগাযোগ:</span>
                <div className="flex items-center gap-2">
                  <a
                    href={`tel:${schedule.shifter.phone}`}
                    className="flex items-center gap-1 font-bold text-primary hover:underline"
                  >
                    <Phone className="h-3 w-3" /> {schedule.shifter.phone}
                  </a>
                  {waLink && (
                    <a
                      href={waLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 font-bold text-[#25D366] hover:underline"
                    >
                      <MessageCircle className="h-3 w-3" /> WhatsApp
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {view === "start" && (
          <div className="space-y-4 pt-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-foreground">
                ওপেনিং ক্যাশ / Opening Cash Float (৳) <span className="text-destructive">*</span>
              </Label>
              <Input
                type="number"
                min={0}
                value={openingCash}
                onChange={(e) => setOpeningCash(e.target.value)}
                placeholder="যেমন: 500"
                className="font-mono text-sm"
              />
              <p className="text-[11px] text-muted-foreground">
                কাউন্টারে থাকা প্রারম্ভিক ক্যাশ পরিমাণ লিখুন।
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                className="flex-1 text-xs"
                onClick={() => setView("main")}
              >
                পিছনে (Back)
              </Button>
              <Button
                className="flex-1 bg-[#004F32] hover:bg-[#003824] text-white font-bold text-xs"
                onClick={handleStart}
                disabled={isStarting}
              >
                {isStarting ? "শুরু হচ্ছে..." : "কনফার্ম শুরু (Start Now)"}
              </Button>
            </div>
          </div>
        )}

        {view === "reschedule" && (
          <div className="space-y-3.5 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-foreground">
                নতুন শিফট শুরুর সময় / New Start Time <span className="text-destructive">*</span>
              </Label>
              <Input
                type="time"
                value={rescheduleTime}
                onChange={(e) => setRescheduleTime(e.target.value)}
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-foreground">
                রিশিডিউলের কারণ / Reason (ঐচ্ছিক)
              </Label>
              <Textarea
                rows={2}
                value={rescheduleReason}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setRescheduleReason(e.target.value)}
                placeholder="বিলম্ব বা সময় পরিবর্তনের কারণ..."
                className="text-xs resize-none"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-[11px] font-bold text-foreground flex items-center gap-1">
                <Users className="h-3 w-3 text-primary" />
                <span>কাদের নোটিফিকেশন পাঠাবেন / Notify Recipients:</span>
              </Label>
              <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                {[
                  { id: "ALL", label: "সবাইকে (All Staff)" },
                  { id: "SHIFTER", label: "শিফটারদের (Shifters)" },
                  { id: "ADMIN", label: "অ্যাডমিন (Admins)" },
                  { id: "SUPER_ADMIN", label: "সুপার অ্যাডমিন" },
                ].map((rec) => (
                  <button
                    key={rec.id}
                    type="button"
                    onClick={() => setNotifyRecipients(rec.id as any)}
                    className={`py-1.5 px-2 rounded-lg border text-left font-semibold transition-all cursor-pointer ${
                      notifyRecipients === rec.id
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-background text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {rec.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                className="flex-1 text-xs"
                onClick={() => setView("main")}
              >
                পিছনে (Back)
              </Button>
              <Button
                className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs"
                onClick={handleReschedule}
                disabled={isRescheduling || isProcessing || !rescheduleTime}
              >
                {isRescheduling || isProcessing ? (
                  <span className="flex items-center gap-1">
                    <Loader2 className="h-3 w-3 animate-spin" /> পরিবর্তন হচ্ছে...
                  </span>
                ) : (
                  "রিশিডিউল কনফার্ম"
                )}
              </Button>
            </div>
          </div>
        )}

        {view === "cancel" && (
          <div className="space-y-3.5 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-foreground">
                বাতিলের কারণ / Cancellation Reason <span className="text-destructive">*</span>
              </Label>
              <Textarea
                rows={2}
                value={cancelReason}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setCancelReason(e.target.value)}
                placeholder="উপস্থিত হতে না পারার কারণ লিখুন..."
                className="text-xs resize-none"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-[11px] font-bold text-foreground flex items-center gap-1">
                <Users className="h-3 w-3 text-primary" />
                <span>কাদের নোটিফিকেশন পাঠাবেন / Notify Recipients:</span>
              </Label>
              <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                {[
                  { id: "ALL", label: "সবাইকে (All Staff)" },
                  { id: "SHIFTER", label: "শিফটারদের (Shifters)" },
                  { id: "ADMIN", label: "অ্যাডমিন (Admins)" },
                  { id: "SUPER_ADMIN", label: "সুপার অ্যাডমিন" },
                ].map((rec) => (
                  <button
                    key={rec.id}
                    type="button"
                    onClick={() => setNotifyRecipients(rec.id as any)}
                    className={`py-1.5 px-2 rounded-lg border text-left font-semibold transition-all cursor-pointer ${
                      notifyRecipients === rec.id
                        ? "border-red-500 bg-red-500/10 text-red-600 dark:text-red-400"
                        : "border-border bg-background text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {rec.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                className="flex-1 text-xs"
                onClick={() => setView("main")}
              >
                পিছনে (Back)
              </Button>
              <Button
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold text-xs"
                onClick={handleCancel}
                disabled={isCancelling || isProcessing || !cancelReason.trim()}
              >
                {isCancelling || isProcessing ? (
                  <span className="flex items-center gap-1">
                    <Loader2 className="h-3 w-3 animate-spin" /> বাতিল হচ্ছে...
                  </span>
                ) : (
                  "বাতিল কনফার্ম (Cancel Shift)"
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

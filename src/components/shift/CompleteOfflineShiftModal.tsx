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
import { WifiOff, CheckCircle2 } from "lucide-react";
import { useCompleteOfflineShift } from "@/hooks/useShifts";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shiftId: number | string;
  shifterName?: string;
}

export function CompleteOfflineShiftModal({
  open,
  onOpenChange,
  shiftId,
  shifterName,
}: Props) {
  const [openingCash, setOpeningCash] = useState<string>("500");
  const [closingCash, setClosingCash] = useState<string>("");
  const [cashCollected, setCashCollected] = useState<string>("0");
  const [tasksCompleted, setTasksCompleted] = useState<string>("");
  const [handoverNotes, setHandoverNotes] = useState<string>("");

  const { mutate: completeOffline, isPending } = useCompleteOfflineShift();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (openingCash === "" || closingCash === "" || cashCollected === "") return;

    completeOffline(
      {
        id: shiftId,
        payload: {
          openingCash: Number(openingCash),
          closingCash: Number(closingCash),
          cashCollected: Number(cashCollected),
          tasksCompleted: tasksCompleted || undefined,
          handoverNotes: handoverNotes || undefined,
          isOfflineRecord: true,
        },
      },
      {
        onSuccess: () => {
          onOpenChange(false);
        },
      }
    );
  };

  const isFormValid =
    openingCash !== "" &&
    closingCash !== "" &&
    cashCollected !== "" &&
    !isNaN(Number(openingCash)) &&
    !isNaN(Number(closingCash)) &&
    !isNaN(Number(cashCollected));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-2xl border-border bg-card p-6 shadow-xl">
        <DialogHeader className="space-y-1 pb-2 border-b border-border/60">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
            <WifiOff className="h-3.5 w-3.5" />
            <span>অফলাইন / বিলম্বিত শিফট সম্পন্নের রেকর্ড</span>
          </div>
          <DialogTitle className="text-lg font-black text-foreground">
            শিফট সম্পন্ন করুন (Complete Shift)
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {shifterName ? `শিফটার: ${shifterName}। ` : ""}
            ইন্টারনেট না থাকায় লাইভ শুরু করা সম্ভব না হলে ক্যাশ হিসেব প্রদান করে শিফট সম্পূর্ণ করুন।
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="grid grid-cols-3 gap-2.5">
            <div className="space-y-1">
              <Label className="text-[11px] font-bold text-foreground">
                ওপেনিং ক্যাশ (৳) *
              </Label>
              <Input
                type="number"
                min={0}
                value={openingCash}
                onChange={(e) => setOpeningCash(e.target.value)}
                placeholder="500"
                className="font-mono text-xs"
                required
              />
            </div>

            <div className="space-y-1">
              <Label className="text-[11px] font-bold text-foreground">
                আদায়কৃত ক্যাশ (৳) *
              </Label>
              <Input
                type="number"
                min={0}
                value={cashCollected}
                onChange={(e) => setCashCollected(e.target.value)}
                placeholder="0"
                className="font-mono text-xs"
                required
              />
            </div>

            <div className="space-y-1">
              <Label className="text-[11px] font-bold text-foreground">
                ক্লোজিং ক্যাশ (৳) *
              </Label>
              <Input
                type="number"
                min={0}
                value={closingCash}
                onChange={(e) => setClosingCash(e.target.value)}
                placeholder="500"
                className="font-mono text-xs"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-[11px] font-bold text-foreground">
              সম্পন্ন কাজসমূহ / Tasks Completed
            </Label>
            <Input
              value={tasksCompleted}
              onChange={(e) => setTasksCompleted(e.target.value)}
              placeholder="উদা: ৩টি বই ইস্যু, ২টি ফেরত জমা..."
              className="text-xs"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-[11px] font-bold text-foreground">
              হস্তান্তর নোট / Handover Notes
            </Label>
            <Textarea
              rows={2}
              value={handoverNotes}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setHandoverNotes(e.target.value)}
              placeholder="পরবর্তী শিফটারের জন্য বিশেষ কোনো নোট বা বার্তা..."
              className="text-xs"
            />
          </div>

          <div className="flex gap-2 pt-2 border-t border-border/60">
            <Button
              type="button"
              variant="outline"
              className="flex-1 text-xs"
              onClick={() => onOpenChange(false)}
            >
              বাতিল (Cancel)
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs"
              disabled={isPending || !isFormValid}
            >
              <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
              {isPending ? "রেকর্ড হচ্ছে..." : "সম্পন্ন কনফার্ম করুন"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

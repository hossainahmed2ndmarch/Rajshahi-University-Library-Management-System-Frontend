"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle2, XCircle, Clock, AlertTriangle, Loader2, Play, CalendarX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useEmailActionShift } from "@/hooks/useShifts";
import Link from "next/link";

function ShiftActionContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const token = searchParams.get("token") || "";
  const initialAction = (searchParams.get("action") || "").toUpperCase() as "START" | "CANCEL" | "";

  const [action, setAction] = useState<"START" | "CANCEL">(initialAction === "CANCEL" ? "CANCEL" : "START");
  const [openingCash, setOpeningCash] = useState<string>("500");
  const [cancelReason, setCancelReason] = useState<string>("");
  const [executed, setExecuted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { mutate: executeAction, isPending } = useEmailActionShift();

  useEffect(() => {
    if (initialAction === "START" || initialAction === "CANCEL") {
      setAction(initialAction);
    }
  }, [initialAction]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setErrorMessage("No authorization token provided in link.");
      return;
    }

    setErrorMessage(null);

    executeAction(
      {
        token,
        action,
        openingCash: action === "START" ? Number(openingCash) || 0 : undefined,
        cancelReason: action === "CANCEL" ? cancelReason.trim() || "Cancelled via email link" : undefined,
      },
      {
        onSuccess: () => {
          setExecuted(true);
        },
        onError: (err: any) => {
          setErrorMessage(err?.response?.data?.message || err?.message || "Failed to process email action.");
        },
      }
    );
  };

  if (!token) {
    return (
      <div className="mx-auto max-w-md my-16 p-8 rounded-3xl border border-border bg-card shadow-lg text-center space-y-4">
        <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-950/50 text-red-600 flex items-center justify-center mx-auto">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <h1 className="text-xl font-black text-foreground">অকার্যকর লিংক / Invalid Action Link</h1>
        <p className="text-xs text-muted-foreground">
          এই লিংকে কোনো বৈধ সিকিউরিটি টোকেন পাওয়া যায়নি। দয়া করে আপনার ইমেইলের মূল লিংকটি আবার চেক করুন অথবা ওয়েবসাইটে লগইন করুন।
        </p>
        <div className="pt-4">
          <Link href="/">
            <Button variant="outline" className="w-full text-xs font-bold">হোমে ফিরে যান (Back to Home)</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (executed) {
    return (
      <div className="mx-auto max-w-md my-16 p-8 rounded-3xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20 shadow-xl text-center space-y-5">
        <div className="h-14 w-14 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-md">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <div>
          <h1 className="text-xl font-black text-foreground">
            {action === "START" ? "শিফট সক্রিয় হয়েছে! (Shift Started)" : "শিফট বাতিল সম্পন্ন হয়েছে (Shift Cancelled)"}
          </h1>
          <p className="text-xs text-muted-foreground mt-1.5">
            {action === "START"
              ? "লাইব্রেরি কাউন্টার ডিউটি লাইভ রেকর্ড হিসেবে যুক্ত হয়েছে। হোমপেজ ও ড্যাশবোর্ডে আপনার স্ট্যাটাস এখন ACTIVE।"
              : "আপনার আজকের শিফট বাতিলের তথ্য সংরক্ষিত হয়েছে এবং স্টাফ সদস্যদের নোটিফিকেশন পাঠানো হয়েছে।"}
          </p>
        </div>

        <div className="flex flex-col gap-2.5 pt-2">
          <Link href="/">
            <Button className="w-full bg-[#004F32] hover:bg-[#003824] text-white text-xs font-bold h-10">
              হোমপেজে লাইভ স্ট্যাটাস দেখুন (View on Home)
            </Button>
          </Link>
          <Link href="/dashboard/shifter">
            <Button variant="outline" className="w-full text-xs font-bold h-10">
              শিফটার ড্যাশবোর্ডে যান (Go to Dashboard)
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md my-12 p-6 sm:p-8 rounded-3xl border border-border bg-card shadow-xl space-y-6">
      <div className="text-center space-y-1.5 border-b border-border/70 pb-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-[11px] font-bold">
          <Clock className="h-3 w-3" />
          <span>ইমেইল কুইক অ্যাকশন (One-Click Duty Action)</span>
        </div>
        <h1 className="text-xl font-black text-foreground">
          {action === "START" ? "কাউন্টার শিফট শুরু করুন" : "কাউন্টার শিফট বাতিল করুন"}
        </h1>
        <p className="text-xs text-muted-foreground">
          লগইন ছাড়াই আপনার ইমেইল অনুমোদনের মাধ্যমে শিফট নিয়ন্ত্রণ করুন।
        </p>
      </div>

      {errorMessage && (
        <div className="rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20 p-3.5 flex items-start gap-2.5 text-xs text-red-700 dark:text-red-300">
          <XCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Mode Selector */}
      <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-muted/60 border border-border/80">
        <button
          type="button"
          onClick={() => setAction("START")}
          className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            action === "START" ? "bg-[#004F32] text-white shadow-xs" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Play className="h-3.5 w-3.5" />
          <span>শুরু (Start)</span>
        </button>

        <button
          type="button"
          onClick={() => setAction("CANCEL")}
          className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            action === "CANCEL" ? "bg-red-600 text-white shadow-xs" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <CalendarX className="h-3.5 w-3.5" />
          <span>বাতিল (Cancel)</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {action === "START" ? (
          <div className="space-y-2">
            <Label className="text-xs font-bold text-foreground">
              ওপেনিং ক্যাশ ফ্লোট / Opening Cash Float (৳) *
            </Label>
            <Input
              type="number"
              min={0}
              value={openingCash}
              onChange={(e) => setOpeningCash(e.target.value)}
              placeholder="500"
              className="font-mono text-sm"
              required
            />
            <p className="text-[11px] text-muted-foreground">
              কাউন্টারে থাকা প্রারম্ভিক ক্যাশ উল্লেখ করুন।
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <Label className="text-xs font-bold text-foreground">
              বাতিলের কারণ / Cancellation Reason *
            </Label>
            <Textarea
              rows={3}
              value={cancelReason}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setCancelReason(e.target.value)}
              placeholder="কেন উপস্থিত হতে পারছেন না সংক্ষেপে লিখুন..."
              className="text-xs"
              required
            />
            <p className="text-[11px] text-muted-foreground">
              এডমিন ও পরবর্তী শিফটারের কাছে নোটিফিকেশন পৌঁছে যাবে।
            </p>
          </div>
        )}

        <Button
          type="submit"
          disabled={isPending}
          className={`w-full font-bold h-11 text-white shadow-sm cursor-pointer transition-all ${
            action === "START" ? "bg-[#004F32] hover:bg-[#003824]" : "bg-red-600 hover:bg-red-700"
          }`}
        >
          {isPending ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" /> প্রক্রিয়াকরণ হচ্ছে...
            </span>
          ) : action === "START" ? (
            "✅ শিফট শুরু নিশ্চিত করুন (Confirm Start)"
          ) : (
            "❌ শিফট বাতিল নিশ্চিত করুন (Confirm Cancel)"
          )}
        </Button>
      </form>
    </div>
  );
}

export default function ShiftActionPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<div className="p-12 text-center text-xs text-muted-foreground">Loading action portal...</div>}>
        <ShiftActionContent />
      </Suspense>
    </div>
  );
}

"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Package,
  Search,
  Mail,
  ArrowRight,
  ShieldCheck,
  Building,
  CheckCircle2,
  Clock,
  Sparkles,
  BookOpen,
} from "lucide-react";
import { toast } from "sonner";
import { useGetMe } from "@/hooks/useAuth";

function TrackOrderContent() {
  const router = useRouter();
  const { data: user, isLoading: isAuthLoading } = useGetMe();
  const [transactionId, setTransactionId] = useState("");
  const [email, setEmail] = useState("");

  React.useEffect(() => {
    if (!isAuthLoading && user) {
      if (user.role === "MEMBER") {
        toast.info("Logged-in members can track and view purchases in their Member Dashboard.");
        router.replace("/dashboard/member/purchases");
      } else if (user.role === "ADMIN") {
        router.replace("/dashboard/admin/purchases");
      } else if (user.role === "SHIFTER") {
        router.replace("/dashboard/shifter/purchases");
      } else if (user.role === "SUPER_ADMIN") {
        router.replace("/dashboard/super-admin/purchases");
      }
    }
  }, [user, isAuthLoading, router]);

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transactionId && !email) {
      toast.error("Please enter a Transaction ID or your Guest Email Address.");
      return;
    }

    if (email) {
      if (typeof window !== "undefined") {
        localStorage.setItem("ruil_guest_email", email.trim());
      }
      router.push(
        `/guest/dashboard?email=${encodeURIComponent(email.trim())}${
          transactionId ? `&txn=${encodeURIComponent(transactionId.trim())}` : ""
        }`
      );
    } else {
      router.push(`/guest/dashboard?txn=${encodeURIComponent(transactionId.trim())}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-zinc-950 py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-center">
      <div className="w-full max-w-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-[#004F32] text-white shadow-lg">
            <Package className="h-8 w-8 text-amber-300" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
            Track Order & Delivery Status
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
            Check the live preparation, collection readiness, and delivery milestones for your Islamic book purchases.
          </p>
        </div>

        <div className="bg-card rounded-3xl border border-border p-6 sm:p-8 shadow-xl space-y-6">
          <form onSubmit={handleTrack} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-foreground block mb-1.5">
                Guest Account Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. abdullah@example.com"
                  className="w-full rounded-xl border border-input bg-background pl-10 pr-4 py-3 text-xs sm:text-sm focus:ring-2 focus:ring-[#004F32] focus:outline-none"
                />
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">
                Recommended: Shows all your past and active guest book purchases.
              </p>
            </div>

            <div className="relative flex items-center justify-center my-2">
              <div className="border-t border-border w-full" />
              <span className="bg-card px-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                Or by Order Code
              </span>
              <div className="border-t border-border w-full" />
            </div>

            <div>
              <label className="text-xs font-bold text-foreground block mb-1.5">
                Order Tracking Code (#TXN-...)
              </label>
              <div className="relative">
                <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  placeholder="e.g. TXN-1718000000000-1234"
                  className="w-full rounded-xl border border-input bg-background pl-10 pr-4 py-3 text-xs sm:text-sm font-mono focus:ring-2 focus:ring-[#004F32] focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-[#004F32] hover:bg-emerald-900 text-white py-3.5 px-6 text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              <span>Track Delivery Progress</span>
              <ArrowRight className="h-4 w-4 text-amber-300" />
            </button>
          </form>

          <div className="pt-4 border-t border-border/60 grid grid-cols-2 gap-3 text-center text-xs">
            <div className="rounded-xl border border-border/60 bg-muted/20 p-3 space-y-1">
              <Building className="h-4 w-4 text-primary mx-auto" />
              <p className="font-bold text-[11px] text-foreground">Counter Collection</p>
              <p className="text-[10px] text-muted-foreground">Desk 3, 2nd Floor Central Library</p>
            </div>

            <div className="rounded-xl border border-border/60 bg-muted/20 p-3 space-y-1">
              <ShieldCheck className="h-4 w-4 text-emerald-600 mx-auto" />
              <p className="font-bold text-[11px] text-foreground">Authentic Editions</p>
              <p className="text-[10px] text-muted-foreground">Verified Islamic scholarly stock</p>
            </div>
          </div>
        </div>

        <div className="text-center text-xs text-muted-foreground">
          Need to buy books or explore our research catalog?{" "}
          <Link href="/books" className="font-bold text-primary hover:underline">
            Browse Library Catalog
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#004F32] border-t-transparent" />
        </div>
      }
    >
      <TrackOrderContent />
    </Suspense>
  );
}

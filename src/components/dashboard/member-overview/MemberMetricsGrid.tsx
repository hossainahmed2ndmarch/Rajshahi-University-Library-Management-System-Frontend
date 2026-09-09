"use client";

import React from "react";
import {
  BookMarked,
  Clock,
  Receipt,
  HeartHandshake,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  ShieldCheck,
} from "lucide-react";
import { format } from "date-fns";
import { IPurchase } from "@/types/purchase";

export interface MemberMetricsSummary {
  activeBorrowsCount: number;
  maxBorrowQuota: number;
  upcomingDeadlinesCount: number;
  totalPurchasesCount: number;
  totalPurchasesAmount: number;
  lastPurchaseDate?: string | null;
  totalDonationsSubmitted: number;
  approvedDonationsCount: number;
  pendingDonationsCount: number;
}

interface MemberMetricsGridProps {
  metrics: MemberMetricsSummary;
}

export function MemberMetricsGrid({ metrics }: MemberMetricsGridProps) {
  const {
    activeBorrowsCount,
    maxBorrowQuota,
    upcomingDeadlinesCount,
    totalPurchasesCount,
    totalPurchasesAmount,
    lastPurchaseDate,
    totalDonationsSubmitted,
    approvedDonationsCount,
    pendingDonationsCount,
  } = metrics;

  const quotaProgress = Math.min(100, (activeBorrowsCount / maxBorrowQuota) * 100);
  const remainingSlots = Math.max(0, maxBorrowQuota - activeBorrowsCount);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {/* Metric 1: Active Borrows */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-2xs hover:shadow-md transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Active Borrows
          </span>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <BookMarked className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline space-x-2">
          <span className="text-3xl font-extrabold text-foreground">{activeBorrowsCount}</span>
          <span className="text-xs text-muted-foreground font-mono">/ {maxBorrowQuota} max quota</span>
        </div>
        <div className="mt-3 w-full bg-muted rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-[#004F32] h-full rounded-full transition-all duration-500"
            style={{ width: `${quotaProgress}%` }}
          />
        </div>
        <p className="mt-2 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
          <ShieldCheck className="h-3.5 w-3.5" /> {remainingSlots} borrow slots available
        </p>
      </div>

      {/* Metric 2: Upcoming Deadlines */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-2xs hover:shadow-md transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Upcoming Deadlines
          </span>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <Clock className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline space-x-2">
          <span className="text-3xl font-extrabold text-amber-600 dark:text-amber-400">
            {upcomingDeadlinesCount}
          </span>
          <span className="text-xs text-muted-foreground">due within 3 days</span>
        </div>
        <div className="mt-3 flex items-center space-x-1.5">
          {upcomingDeadlinesCount > 0 ? (
            <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold text-amber-800 dark:text-amber-300">
              <AlertTriangle className="h-3 w-3" /> Return required soon
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:text-emerald-300">
              <CheckCircle2 className="h-3 w-3" /> No urgent deadlines
            </span>
          )}
        </div>
        <p className="mt-2 text-[11px] text-muted-foreground">Standard fine: ৳5/day after due date</p>
      </div>

      {/* Metric 3: Purchases Count & Volume */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-2xs hover:shadow-md transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Book Purchases
          </span>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <Receipt className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline space-x-2">
          <span className="text-3xl font-extrabold text-foreground">{totalPurchasesCount}</span>
          <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
            (৳{totalPurchasesAmount})
          </span>
        </div>
        <div className="mt-3 flex items-center space-x-1">
          <TrendingUp className="h-3.5 w-3.5 text-blue-500" />
          <span className="text-[11px] text-muted-foreground">Personal Islamic library collection</span>
        </div>
        <p className="mt-2 text-[11px] text-muted-foreground">
          {lastPurchaseDate
            ? `Last purchase: ${format(new Date(lastPurchaseDate), "dd MMM yyyy")}`
            : "No purchases yet"}
        </p>
      </div>

      {/* Metric 4: Book Donations */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-2xs hover:shadow-md transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Book Donations
          </span>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
            <HeartHandshake className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline space-x-2">
          <span className="text-3xl font-extrabold text-foreground">
            {totalDonationsSubmitted}
          </span>
          <span className="text-xs text-muted-foreground">books donated</span>
        </div>
        <div className="mt-3 flex items-center space-x-2">
          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
            {approvedDonationsCount} Approved
          </span>
          <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-300">
            {pendingDonationsCount} Pending
          </span>
        </div>
        <p className="mt-2 text-[11px] text-purple-600 dark:text-purple-400 font-medium">
          Sadaqah Jariyah Contribution
        </p>
      </div>
    </div>
  );
}

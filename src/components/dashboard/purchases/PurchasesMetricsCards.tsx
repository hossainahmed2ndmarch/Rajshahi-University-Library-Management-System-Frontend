"use client";

import React from "react";
import { CheckCircle2, Clock, ShoppingBag } from "lucide-react";

export interface PurchasesMetricsData {
  total: number;
  pending: number;
  delivered: number;
  memberPurchases: number;
  guestPurchases: number;
  totalRevenue: number;
}

interface PurchasesMetricsCardsProps {
  metrics: PurchasesMetricsData;
}

export function PurchasesMetricsCards({ metrics }: PurchasesMetricsCardsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Metric 1: Total Purchases */}
      <div className="bg-card rounded-2xl border border-border p-5 shadow-2xs space-y-1">
        <div className="flex items-center justify-between text-muted-foreground">
          <span className="text-xs font-semibold uppercase tracking-wider">Total Purchases</span>
          <ShoppingBag className="h-4 w-4 text-primary" />
        </div>
        <p className="text-2xl font-black text-foreground">{metrics.total}</p>
        <p className="text-[11px] text-muted-foreground">
          {metrics.memberPurchases} Member • {metrics.guestPurchases} Guest
        </p>
      </div>

      {/* Metric 2: Awaiting Fulfill */}
      <div className="bg-card rounded-2xl border border-border p-5 shadow-2xs space-y-1">
        <div className="flex items-center justify-between text-muted-foreground">
          <span className="text-xs font-semibold uppercase tracking-wider">Awaiting Fulfill</span>
          <Clock className="h-4 w-4 text-amber-500" />
        </div>
        <p className="text-2xl font-black text-amber-600 dark:text-amber-400">{metrics.pending}</p>
        <p className="text-[11px] text-muted-foreground">Pending counter collection / dispatch</p>
      </div>

      {/* Metric 3: Handed Over */}
      <div className="bg-card rounded-2xl border border-border p-5 shadow-2xs space-y-1">
        <div className="flex items-center justify-between text-muted-foreground">
          <span className="text-xs font-semibold uppercase tracking-wider">Handed Over</span>
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
        </div>
        <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{metrics.delivered}</p>
        <p className="text-[11px] text-muted-foreground">Completed &amp; verified</p>
      </div>

      {/* Metric 4: Total Revenue */}
      <div className="bg-card rounded-2xl border border-border p-5 shadow-2xs space-y-1">
        <div className="flex items-center justify-between text-muted-foreground">
          <span className="text-xs font-semibold uppercase tracking-wider">Total Revenue</span>
          <span className="text-sm font-bold text-[#C78700]">৳</span>
        </div>
        <p className="text-2xl font-black text-foreground">৳{metrics.totalRevenue.toLocaleString()}</p>
        <p className="text-[11px] text-muted-foreground">Verified non-cancelled book sales</p>
      </div>
    </div>
  );
}

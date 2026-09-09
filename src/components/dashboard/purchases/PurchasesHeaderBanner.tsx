"use client";

import React from "react";
import { RefreshCw, ShoppingBag } from "lucide-react";

interface PurchasesHeaderBannerProps {
  roleBadge: string;
  roleTitle: string;
  isRefetching: boolean;
  onRefresh: () => void;
}

export function PurchasesHeaderBanner({
  roleBadge,
  roleTitle,
  isRefetching,
  onRefresh,
}: PurchasesHeaderBannerProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
      <div>
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-[10px] font-mono font-bold uppercase bg-amber-500/10 text-[#C78700] px-2.5 py-0.5 rounded-full border border-amber-300/30">
            {roleBadge}
          </span>
          <span className="text-xs text-muted-foreground">• Universal Circulation Registry</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground flex items-center gap-2.5">
          <ShoppingBag className="h-7 w-7 text-[#004F32] dark:text-emerald-400" />
          <span>{roleTitle}</span>
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
          Manage, verify, and fulfill purchases placed by registered library members and guest campus buyers.
        </p>
      </div>

      <button
        type="button"
        onClick={onRefresh}
        disabled={isRefetching}
        className="inline-flex items-center gap-2 rounded-xl border border-input bg-card px-4 py-2.5 text-xs font-semibold hover:bg-muted shadow-2xs self-start sm:self-auto transition-colors cursor-pointer disabled:opacity-50"
      >
        <RefreshCw className={`h-4 w-4 text-primary ${isRefetching ? "animate-spin" : ""}`} />
        <span>Refresh Records</span>
      </button>
    </div>
  );
}

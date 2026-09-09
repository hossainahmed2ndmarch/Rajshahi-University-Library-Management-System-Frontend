"use client";

import React from "react";
import Link from "next/link";
import { format } from "date-fns";
import { ArrowUpRight, Loader2, Receipt } from "lucide-react";
import { IPurchase } from "@/types/purchase";

interface MemberRecentPurchasesSectionProps {
  purchases: IPurchase[];
  isLoading: boolean;
  purchasesHref: string;
}

export function MemberRecentPurchasesSection({
  purchases,
  isLoading,
  purchasesHref,
}: MemberRecentPurchasesSectionProps) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-2xs space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-border">
        <div className="flex items-center space-x-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#C78700] text-white">
            <Receipt className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-foreground">Recent Book Purchases</h2>
            <p className="text-xs text-muted-foreground">
              Books ordered online or acquired directly at the counter.
            </p>
          </div>
        </div>
        <Link
          href={purchasesHref}
          className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
        >
          <span>View All ({purchases.length})</span>
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {isLoading ? (
        <div className="py-8 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin text-primary" /> Loading purchases...
        </div>
      ) : purchases.length === 0 ? (
        <div className="py-8 text-center text-muted-foreground text-xs space-y-2">
          <Receipt className="h-8 w-8 mx-auto text-muted" />
          <p>No purchase records yet.</p>
          <Link
            href="/books"
            className="inline-block text-primary font-bold hover:underline"
          >
            Explore Buyable Islamic Books
          </Link>
        </div>
      ) : (
        <div className="divide-y divide-border/60">
          {purchases.slice(0, 5).map((item) => (
            <div key={item.id} className="py-3 flex items-center justify-between text-xs">
              <div className="space-y-0.5">
                <div className="flex items-center space-x-2">
                  <span className="font-mono font-bold text-foreground">
                    {item.transactionId || `#PUR-${item.id}`}
                  </span>
                  <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                    {item.orderStatus || item.paymentStatus || "COMPLETED"}
                  </span>
                </div>
                <p className="font-semibold text-foreground">
                  {item.book?.title || `Book #${item.bookId}`}
                </p>
                <p className="text-muted-foreground text-[11px]">
                  Qty: {item.quantity || 1} • {item.paymentMethod || "CASH"} •{" "}
                  {item.createdAt ? format(new Date(item.createdAt), "dd MMM yyyy") : ""}
                </p>
              </div>
              <div className="text-right">
                <span className="font-mono font-extrabold text-sm text-foreground">
                  ৳{item.totalAmount || item.unitPrice || 0}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Receipt,
  ArrowLeft,
  Search,
  ShoppingBag,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
  PackageCheck,
  Loader2,
} from "lucide-react";
import { useGetMyPurchases } from "@/hooks/usePurchases";
import { IPurchase, OrderStatus } from "@/types/purchase";

const statusConfig: Record<OrderStatus, { label: string; icon: React.ReactNode; className: string }> = {
  PENDING: {
    label: "Pending",
    icon: <Clock className="h-3 w-3" />,
    className: "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300",
  },
  PROCESSING: {
    label: "Processing",
    icon: <Loader2 className="h-3 w-3 animate-spin" />,
    className: "bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300",
  },
  SHIPPED: {
    label: "Shipped",
    icon: <Truck className="h-3 w-3" />,
    className: "bg-indigo-100 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300",
  },
  DELIVERED: {
    label: "Delivered",
    icon: <PackageCheck className="h-3 w-3" />,
    className: "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300",
  },
  CANCELLED: {
    label: "Cancelled",
    icon: <XCircle className="h-3 w-3" />,
    className: "bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300",
  },
};

interface MyPurchasesContentProps {
  backHref?: string;
  backLabel?: string;
}

export function MyPurchasesContent({
  backHref = "/dashboard/member",
  backLabel = "Back to Overview",
}: MyPurchasesContentProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const { data: purchases, isLoading, isError } = useGetMyPurchases();

  const filteredPurchases = (purchases ?? []).filter((p: IPurchase) => {
    const term = searchTerm.toLowerCase();
    return (
      (p.transactionId?.toLowerCase().includes(term) ?? false) ||
      (p.book?.title?.toLowerCase().includes(term) ?? false) ||
      (p.customerName?.toLowerCase().includes(term) ?? false)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link
            href={backHref}
            className="inline-flex items-center text-xs text-muted-foreground hover:text-foreground mb-2"
          >
            <ArrowLeft className="h-3.5 w-3.5 mr-1" /> {backLabel}
          </Link>
          <h1 className="text-2xl font-extrabold text-foreground flex items-center gap-2">
            <Receipt className="h-6 w-6 text-[#C78700]" />
            <span>My Book Purchase History</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Complete list of books purchased for your personal collection.
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search order # or title..."
            className="w-full rounded-xl border border-input bg-card pl-9 pr-3 py-2 text-xs focus:ring-2 focus:ring-primary focus:outline-none"
          />
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-2xs space-y-4">
        {isLoading ? (
          <div className="py-16 flex flex-col items-center justify-center text-muted-foreground gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-xs">Loading your purchase history...</p>
          </div>
        ) : isError ? (
          <div className="py-12 text-center text-muted-foreground text-xs space-y-2">
            <XCircle className="h-8 w-8 mx-auto text-destructive" />
            <p className="font-semibold text-destructive">Failed to load purchases.</p>
            <p>Please check your connection and try again.</p>
          </div>
        ) : filteredPurchases.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground text-xs space-y-2">
            <ShoppingBag className="h-8 w-8 mx-auto text-muted" />
            <p className="font-semibold">
              {searchTerm ? "No purchase records match your search." : "You have no purchase records yet."}
            </p>
            {!searchTerm && (
              <Link
                href="/books"
                className="inline-block mt-2 text-xs font-semibold text-primary hover:underline"
              >
                Browse Books to Purchase
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border text-muted-foreground font-semibold">
                  <th className="pb-3 pr-4">Order ID</th>
                  <th className="pb-3 pr-4">Book Details</th>
                  <th className="pb-3 pr-4">Date</th>
                  <th className="pb-3 pr-4">Payment</th>
                  <th className="pb-3 pr-4 text-center">Status</th>
                  <th className="pb-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredPurchases.map((p: IPurchase) => {
                  const status = p.orderStatus ?? "PENDING";
                  const statusInfo = statusConfig[status];
                  return (
                    <tr key={String(p.id)} className="hover:bg-muted/40 transition-colors">
                      <td className="py-4 pr-4 font-mono font-bold text-foreground text-[11px] whitespace-nowrap">
                        {p.transactionId ?? `#${p.id}`}
                      </td>
                      <td className="py-4 pr-4 space-y-0.5 max-w-[220px]">
                        <div className="font-bold text-foreground line-clamp-1">
                          {p.book?.title ?? p.customerName ?? "—"}
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          {p.book?.author && <span>{p.book.author}</span>}
                          {p.book?.category && (
                            <span className="text-primary ml-1">• {p.book.category}</span>
                          )}
                        </div>
                        {p.quantity && p.quantity > 1 && (
                          <div className="text-[10px] text-muted-foreground">Qty: {p.quantity}</div>
                        )}
                      </td>
                      <td className="py-4 pr-4 text-muted-foreground whitespace-nowrap">
                        {p.createdAt
                          ? new Date(p.createdAt).toLocaleDateString("en-BD", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })
                          : "—"}
                      </td>
                      <td className="py-4 pr-4">
                        <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-[11px] font-medium text-foreground capitalize">
                          {p.paymentMethod?.toLowerCase() ?? "—"}
                        </span>
                      </td>
                      <td className="py-4 pr-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold ${statusInfo?.className ?? ""}`}
                        >
                          {statusInfo?.icon}
                          {statusInfo?.label ?? status}
                        </span>
                      </td>
                      <td className="py-4 text-right font-mono font-extrabold text-sm text-foreground whitespace-nowrap">
                        ৳{Number(p.totalAmount ?? 0).toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

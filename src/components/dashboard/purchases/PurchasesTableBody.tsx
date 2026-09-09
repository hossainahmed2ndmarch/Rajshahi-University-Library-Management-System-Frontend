"use client";

import React from "react";
import { Copy, Edit, Printer, Trash2 } from "lucide-react";
import { IPurchase } from "@/types/purchase";

interface PurchasesTableBodyProps {
  purchases: IPurchase[];
  allowDelete: boolean;
  onCopy: (text: string) => void;
  onOpenStatusModal: (purchase: IPurchase) => void;
  onOpenReceiptModal: (purchase: IPurchase) => void;
  onOpenDeleteModal: (purchase: IPurchase) => void;
}

export function PurchasesTableBody({
  purchases,
  allowDelete,
  onCopy,
  onOpenStatusModal,
  onOpenReceiptModal,
  onOpenDeleteModal,
}: PurchasesTableBodyProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs">
        <thead>
          <tr className="border-b border-border text-muted-foreground font-semibold">
            <th className="pb-3 pr-4">Order Code / Date</th>
            <th className="pb-3 pr-4">Buyer Details</th>
            <th className="pb-3 pr-4">Book Details</th>
            <th className="pb-3 pr-4">Payment</th>
            <th className="pb-3 pr-4 text-center">Status</th>
            <th className="pb-3 pr-4 text-right">Total</th>
            <th className="pb-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/60">
          {purchases.map((purchase) => {
            const isMember = Boolean(purchase.userId);
            const orderCode = purchase.transactionId || `#${purchase.id}`;

            return (
              <tr key={String(purchase.id)} className="hover:bg-muted/40 transition-colors">
                {/* Order Code & Date */}
                <td className="py-4 pr-4 whitespace-nowrap">
                  <div className="flex items-center gap-1.5 font-mono font-bold text-foreground">
                    <span>{orderCode}</span>
                    <button
                      type="button"
                      onClick={() => onCopy(orderCode)}
                      title="Copy code"
                      className="p-1 rounded text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                    >
                      <Copy className="h-3 w-3" />
                    </button>
                  </div>
                  <span className="text-[10px] text-muted-foreground block mt-0.5">
                    {purchase.createdAt
                      ? new Date(purchase.createdAt).toLocaleDateString("en-BD", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "—"}
                  </span>
                </td>

                {/* Buyer Details */}
                <td className="py-4 pr-4 max-w-[200px] space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-foreground truncate">
                      {purchase.customerName || purchase.user?.name || "Customer"}
                    </span>
                    {isMember ? (
                      <span className="font-mono text-[9px] uppercase bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold px-1.5 py-0.2 rounded shrink-0">
                        Member
                      </span>
                    ) : (
                      <span className="font-mono text-[9px] uppercase bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-bold px-1.5 py-0.2 rounded shrink-0">
                        Guest
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-muted-foreground truncate">
                    {purchase.customerEmail || purchase.user?.email || "—"}
                  </div>
                  <div className="text-[10px] text-muted-foreground font-mono">
                    {purchase.customerPhone || "No Phone"}
                  </div>
                </td>

                {/* Book Details */}
                <td className="py-4 pr-4 max-w-[220px] space-y-0.5">
                  <div className="font-bold text-foreground line-clamp-1">
                    {purchase.book?.title || "Book Title"}
                  </div>
                  <div className="text-[11px] text-muted-foreground line-clamp-1">
                    By {purchase.book?.author || "Author"} •{" "}
                    <span className="text-primary font-semibold">
                      Qty: {purchase.quantity || 1}
                    </span>
                  </div>
                </td>

                {/* Payment Details */}
                <td className="py-4 pr-4">
                  <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium text-foreground capitalize">
                    {purchase.paymentMethod?.toLowerCase()}
                  </span>
                  <span className="block text-[10px] text-muted-foreground mt-0.5 capitalize">
                    {purchase.paymentStatus?.toLowerCase()}
                  </span>
                </td>

                {/* Order Status */}
                <td className="py-4 pr-4 text-center whitespace-nowrap">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                      purchase.orderStatus === "CANCELLED"
                        ? "bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400"
                        : purchase.orderStatus === "DELIVERED"
                        ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400"
                        : "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300"
                    }`}
                  >
                    {purchase.orderStatus}
                  </span>
                </td>

                {/* Total Amount */}
                <td className="py-4 pr-4 text-right font-mono font-extrabold text-sm text-foreground whitespace-nowrap">
                  ৳{purchase.totalAmount?.toLocaleString()}
                </td>

                {/* Action Buttons */}
                <td className="py-4 text-right whitespace-nowrap">
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      type="button"
                      onClick={() => onOpenStatusModal(purchase)}
                      title="Update Order / Payment Status"
                      className="inline-flex items-center gap-1 p-1.5 rounded-lg border border-input bg-background hover:bg-muted text-xs font-semibold text-foreground transition-colors shadow-2xs cursor-pointer"
                    >
                      <Edit className="h-3.5 w-3.5 text-primary" />
                      <span className="hidden sm:inline">Update</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onOpenReceiptModal(purchase)}
                      title="Print Verification Slip / Receipt"
                      className="p-1.5 rounded-lg border border-input bg-background hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    >
                      <Printer className="h-3.5 w-3.5" />
                    </button>
                    {allowDelete && (
                      <button
                        type="button"
                        onClick={() => onOpenDeleteModal(purchase)}
                        title="Delete Purchase Record"
                        className="p-1.5 rounded-lg border border-input bg-background hover:bg-red-500/10 text-destructive transition-colors cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

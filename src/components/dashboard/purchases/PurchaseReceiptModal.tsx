"use client";

import React from "react";
import { Printer, X } from "lucide-react";
import { IPurchase } from "@/types/purchase";

interface PurchaseReceiptModalProps {
  order: IPurchase | null;
  onClose: () => void;
}

export function PurchaseReceiptModal({ order, onClose }: PurchaseReceiptModalProps) {
  if (!order) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in-50">
      <div className="relative w-full max-w-lg rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-2xl space-y-5 animate-in zoom-in-95 text-card-foreground">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-[#C78700] text-white flex items-center justify-center font-bold text-xs shadow-xs">
              RU
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-foreground">
                Rajshahi University Islamic Library
              </h3>
              <p className="text-[10px] font-mono text-muted-foreground">
                Circulation Handover Verification Slip
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="bg-muted/30 rounded-2xl p-4 border border-border space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Transaction ID:</span>
            <span className="font-mono font-bold text-foreground">
              {order.transactionId || `#${order.id}`}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Buyer Type:</span>
            <span className="font-bold text-primary">
              {order.userId ? "Registered University Member" : "Guest Buyer"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Customer Name:</span>
            <span className="font-bold text-foreground">
              {order.customerName || order.user?.name || "Customer"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Contact Phone:</span>
            <span className="font-mono text-foreground">{order.customerPhone || "N/A"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Book Edition:</span>
            <span className="font-bold text-foreground text-right">{order.book?.title || "N/A"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Quantity:</span>
            <span className="font-bold text-foreground">{order.quantity || 1} copy</span>
          </div>
          <div className="flex justify-between border-t border-border pt-2">
            <span className="font-bold text-foreground">Total Paid / Due:</span>
            <span className="font-mono font-black text-base text-foreground">
              ৳{order.totalAmount?.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#004F32] hover:bg-emerald-900 text-white px-5 py-2 text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            <Printer className="h-3.5 w-3.5 text-amber-300" />
            <span>Print Verification Slip</span>
          </button>
        </div>
      </div>
    </div>
  );
}

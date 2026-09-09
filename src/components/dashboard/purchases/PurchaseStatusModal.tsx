"use client";

import React from "react";
import { CheckCircle2, Edit, RefreshCw, X } from "lucide-react";
import { IPurchase, OrderStatus } from "@/types/purchase";

interface PurchaseStatusModalProps {
  order: IPurchase | null;
  newOrderStatus: OrderStatus;
  newPaymentStatus: string;
  onOrderStatusChange: (status: OrderStatus) => void;
  onPaymentStatusChange: (status: string) => void;
  onClose: () => void;
  onConfirm: () => void;
  isUpdating: boolean;
}

export function PurchaseStatusModal({
  order,
  newOrderStatus,
  newPaymentStatus,
  onOrderStatusChange,
  onPaymentStatusChange,
  onClose,
  onConfirm,
  isUpdating,
}: PurchaseStatusModalProps) {
  if (!order) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in-50">
      <div className="relative w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-4 animate-in zoom-in-95 text-card-foreground">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <Edit className="h-5 w-5 text-primary" />
            <h3 className="font-bold text-base text-foreground">Update Purchase Status</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-1 text-xs">
          <p className="text-muted-foreground">
            Order: <strong className="font-mono text-foreground">{order.transactionId || `#${order.id}`}</strong>
          </p>
          <p className="text-muted-foreground">
            Customer: <strong className="text-foreground">{order.customerName || order.user?.name || "Customer"}</strong>
          </p>
          <p className="text-muted-foreground">
            Book: <strong className="text-foreground">{order.book?.title || "N/A"}</strong>
          </p>
        </div>

        <div className="space-y-3 pt-1">
          <div>
            <label className="text-xs font-bold text-foreground block mb-1">
              Order Delivery Status
            </label>
            <select
              value={newOrderStatus}
              onChange={(e) => onOrderStatusChange(e.target.value as OrderStatus)}
              className="w-full rounded-xl border border-input bg-background p-2.5 text-xs font-semibold focus:ring-2 focus:ring-primary focus:outline-none cursor-pointer"
            >
              <option value="PENDING">PENDING (Order Logged)</option>
              <option value="PROCESSING">PROCESSING (Packed &amp; Ready)</option>
              <option value="SHIPPED">SHIPPED (Dispatched)</option>
              <option value="DELIVERED">DELIVERED (Handed Over)</option>
              <option value="CANCELLED">CANCELLED (Restock Catalog)</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-foreground block mb-1">
              Payment Status
            </label>
            <select
              value={newPaymentStatus}
              onChange={(e) => onPaymentStatusChange(e.target.value)}
              className="w-full rounded-xl border border-input bg-background p-2.5 text-xs font-semibold focus:ring-2 focus:ring-primary focus:outline-none cursor-pointer"
            >
              <option value="PENDING">PENDING</option>
              <option value="PAID">PAID</option>
              <option value="COMPLETED">COMPLETED</option>
              <option value="FAILED">FAILED</option>
              <option value="CANCELLED">CANCELLED</option>
              <option value="REFUNDED">REFUNDED</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-border px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted cursor-pointer transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isUpdating}
            className="rounded-xl bg-[#004F32] hover:bg-emerald-900 text-white px-5 py-2 text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {isUpdating ? (
              <>
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                <span>Updating...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="h-3.5 w-3.5 text-amber-300" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

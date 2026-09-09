"use client";

import React from "react";
import {
  ShieldCheck,
  CreditCard,
  Banknote,
  BookOpen,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { CartItem } from "@/store/useCartStore";

interface OrderSummaryProps {
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  grandTotal: number;
  paymentMethod: "CASH" | "ONLINE";
  onPaymentMethodChange: (method: "CASH" | "ONLINE") => void;
  isPending: boolean;
}

export function OrderSummary({
  items,
  subtotal,
  deliveryFee,
  grandTotal,
  paymentMethod,
  onPaymentMethodChange,
  isPending,
}: OrderSummaryProps) {
  const hasBorrowItems = items.some((i) => i.type === "BORROW");
  const hasSellItems = items.some((i) => i.type === "SELL");

  return (
    <div className="space-y-6">
      {/* Items Breakdown */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-xs">
        <div className="p-4 border-b border-border bg-muted/20 flex justify-between items-center text-xs font-bold text-muted-foreground uppercase tracking-wider">
          <span>Review Items ({items.reduce((sum, i) => sum + i.quantity, 0)})</span>
          <span>Amount</span>
        </div>

        <div className="divide-y divide-border/60 max-h-72 overflow-y-auto">
          {items.map((item) => {
            const unitPrice = item.type === "BORROW" ? item.borrowFee || 0 : item.price;
            const itemTotal = unitPrice * item.quantity;

            return (
              <div key={`${item.bookId}-${item.type}`} className="p-4 flex items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-12 w-10 flex-shrink-0 rounded bg-muted flex items-center justify-center overflow-hidden border border-border/50">
                    {item.coverImage ? (
                      <img src={item.coverImage} alt={item.title} className="h-full w-full object-cover" />
                    ) : (
                      <BookOpen className="h-5 w-5 text-muted-foreground/50" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground truncate">{item.title}</p>
                    <p className="text-[11px] text-muted-foreground">
                      Qty: {item.quantity} × ৳{unitPrice} •{" "}
                      <span className={item.type === "BORROW" ? "text-amber-600 dark:text-amber-400 font-medium" : "text-emerald-600 dark:text-emerald-400 font-medium"}>
                        {item.type === "BORROW" ? "Borrow" : "Purchase"}
                      </span>
                    </p>
                  </div>
                </div>
                <span className="font-bold text-foreground shrink-0">৳{itemTotal.toLocaleString()}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Payment Method Selection */}
      <div className="space-y-3">
        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Choose Payment Method
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => onPaymentMethodChange("CASH")}
            className={`p-4 rounded-xl border text-left transition-all flex items-start gap-3 ${
              paymentMethod === "CASH"
                ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                : "border-border bg-card hover:border-primary/40"
            }`}
          >
            <div className={`p-2 rounded-lg ${paymentMethod === "CASH" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
              <Banknote className="h-5 w-5" />
            </div>
            <div>
              <p className="font-bold text-sm text-foreground">Cash on Counter / Delivery</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Pay directly at the library counter upon collecting your books.
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => onPaymentMethodChange("ONLINE")}
            className={`p-4 rounded-xl border text-left transition-all flex items-start gap-3 ${
              paymentMethod === "ONLINE"
                ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                : "border-border bg-card hover:border-primary/40"
            }`}
          >
            <div className={`p-2 rounded-lg ${paymentMethod === "ONLINE" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <p className="font-bold text-sm text-foreground">Online Payment (SSLCommerz)</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                bKash, Nagad, Rocket, or Visa/Mastercard instant checkout.
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* Price Summary Calculations */}
      <div className="rounded-2xl border border-border bg-card p-5 space-y-3 text-xs">
        <div className="flex justify-between text-muted-foreground">
          <span>Items Total</span>
          <span className="font-semibold text-foreground">৳{subtotal.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <span>Delivery / Processing Fee</span>
          <span className="font-semibold text-foreground">৳{deliveryFee}</span>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <span>Payment Gateway Charges</span>
          <span className="text-emerald-600 dark:text-emerald-400 font-semibold">৳0 (Free)</span>
        </div>
        <div className="pt-3 border-t border-border flex justify-between items-center text-base">
          <span className="font-bold text-foreground">Total Payable Amount</span>
          <span className="font-black text-xl text-primary">৳{grandTotal.toLocaleString()}</span>
        </div>
      </div>

      {/* Terms Notice */}
      <div className="flex items-start gap-2.5 text-[11px] text-muted-foreground bg-muted/40 p-3.5 rounded-xl border border-border/50">
        <ShieldCheck className="h-4 w-4 text-primary shrink-0 mt-0.5" />
        <p>
          By clicking Place Order, you agree to RU Islamic Library’s circulation rules. Borrowed
          copies must be returned within 14 days of issue.
        </p>
      </div>
    </div>
  );
}

export default OrderSummary;

"use client";

import React, { useState } from "react";
import {
  X,
  CreditCard,
  Banknote,
  CheckCircle2,
  Calendar,
  Sparkles,
  ShieldCheck,
  Loader2,
  Clock,
} from "lucide-react";
import { IUser } from "@/types/auth";
import { useRenewMembership } from "@/hooks/useUsers";
import { format, addMonths } from "date-fns";

interface MembershipRenewalModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: IUser | null | undefined;
}

// Membership plans: 3 months = 100tk, 6 months = 200tk, 12 months = 400tk
const MEMBERSHIP_PLANS = [
  { months: 3, amount: 100, label: "3 Months", sub: "Short-term plan" },
  { months: 6, amount: 200, label: "6 Months", sub: "Popular choice", popular: true },
  { months: 12, amount: 400, label: "12 Months", sub: "Best value" },
];

export function MembershipRenewalModal({
  isOpen,
  onClose,
  user,
}: MembershipRenewalModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "ONLINE">("CASH");
  const [selectedPlan, setSelectedPlan] = useState(MEMBERSHIP_PLANS[1]); // default 6 months
  const { mutate: renew, isPending } = useRenewMembership();

  if (!isOpen) return null;

  const now = new Date();
  let baseDate = now;
  if (user?.membershipExpiresAt && new Date(user.membershipExpiresAt) > now) {
    baseDate = new Date(user.membershipExpiresAt);
  }
  const projectedExpiry = addMonths(baseDate, selectedPlan.months);

  const handleRenew = () => {
    renew(
      { paymentMethod, amount: selectedPlan.amount, months: selectedPlan.months },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in-50 overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-2xl text-card-foreground my-8">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3.5 pb-4 border-b border-border mb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#004F32] to-[#003320] text-amber-300 shadow-md">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-extrabold text-lg sm:text-xl text-foreground">
              Renew Library Membership
            </h3>
            <p className="text-xs text-muted-foreground">
              Extend your Rajshahi University Islamic Library borrowing privileges.
            </p>
          </div>
        </div>

        {/* Plan Selector */}
        <div className="space-y-3 mb-5">
          <h4 className="text-xs font-bold text-foreground">Choose a Membership Plan:</h4>
          <div className="grid grid-cols-3 gap-2">
            {MEMBERSHIP_PLANS.map((plan) => (
              <button
                key={plan.months}
                type="button"
                onClick={() => setSelectedPlan(plan)}
                className={`relative flex flex-col items-center justify-center gap-1 rounded-2xl border p-3 text-center text-xs font-bold transition-all cursor-pointer ${
                  selectedPlan.months === plan.months
                    ? "border-[#004F32] bg-[#004F32]/10 text-[#004F32] dark:text-emerald-300 dark:border-emerald-400 shadow-sm"
                    : "border-border bg-card text-muted-foreground hover:border-input hover:text-foreground"
                }`}
              >
                {plan.popular && (
                  <span className="absolute -top-2 left-1/2 -translate-x-1/2 rounded-full bg-amber-500 text-white text-[9px] font-bold px-2 py-0.5">
                    Popular
                  </span>
                )}
                <span className="text-base font-extrabold">৳{plan.amount}</span>
                <span className="font-semibold">{plan.label}</span>
                <span className="text-[10px] font-normal opacity-70">{plan.sub}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Validity Preview Card */}
        <div className="rounded-2xl border border-amber-300/40 bg-gradient-to-br from-amber-500/10 via-emerald-500/5 to-transparent p-4 space-y-3 mb-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#C78700] dark:text-amber-400">
              {selectedPlan.label} Plan
            </span>
            <div className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-mono font-extrabold text-emerald-700 dark:text-emerald-300">
              ৳{selectedPlan.amount} BDT
            </div>
          </div>

          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-foreground font-mono">৳{selectedPlan.amount}</span>
            <span className="text-xs text-muted-foreground font-medium">for {selectedPlan.months} months</span>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2 text-xs border-t border-border/60">
            <div className="space-y-0.5">
              <span className="text-muted-foreground flex items-center gap-1 text-[11px]">
                <Clock className="h-3 w-3" /> Current Validity
              </span>
              <p className="font-semibold text-foreground font-mono text-xs">
                {user?.membershipExpiresAt
                  ? format(new Date(user.membershipExpiresAt), "dd MMM yyyy")
                  : "Inactive / Expired"}
              </p>
            </div>

            <div className="space-y-0.5">
              <span className="text-muted-foreground flex items-center gap-1 text-[11px]">
                <Calendar className="h-3 w-3 text-emerald-600 dark:text-emerald-400" /> New Expiry Date
              </span>
              <p className="font-bold text-emerald-600 dark:text-emerald-400 font-mono text-xs">
                {format(projectedExpiry, "dd MMM yyyy")}
              </p>
            </div>
          </div>
        </div>

        {/* Membership Privileges */}
        <div className="pb-4 space-y-2">
          <h4 className="text-xs font-bold text-foreground">Included Privileges:</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
              <span>Borrow up to 5 books at once</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
              <span>14-day loan + online renewals</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
              <span>Full study counter access</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
              <span>Express catalog reservations</span>
            </div>
          </div>
        </div>

        {/* Payment Method Selector */}
        <div className="space-y-2.5 pb-6">
          <label className="text-xs font-bold text-foreground block">
            Select Payment Method:
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setPaymentMethod("CASH")}
              className={`flex items-center justify-center gap-2 rounded-xl p-3.5 text-xs font-bold border transition-all cursor-pointer ${
                paymentMethod === "CASH"
                  ? "border-[#004F32] bg-[#004F32]/10 text-[#004F32] dark:text-emerald-300 dark:border-emerald-400 shadow-2xs"
                  : "border-border bg-card text-muted-foreground hover:border-input hover:text-foreground"
              }`}
            >
              <Banknote className="h-4 w-4" />
              <span>Cash at Desk</span>
            </button>

            <button
              type="button"
              onClick={() => setPaymentMethod("ONLINE")}
              className={`flex items-center justify-center gap-2 rounded-xl p-3.5 text-xs font-bold border transition-all cursor-pointer ${
                paymentMethod === "ONLINE"
                  ? "border-[#004F32] bg-[#004F32]/10 text-[#004F32] dark:text-emerald-300 dark:border-emerald-400 shadow-2xs"
                  : "border-border bg-card text-muted-foreground hover:border-input hover:text-foreground"
              }`}
            >
              <CreditCard className="h-4 w-4" />
              <span>Online Gateway</span>
            </button>
          </div>
          <p className="text-[11px] text-muted-foreground pt-1">
            {paymentMethod === "CASH"
              ? `Confirm your request and pay ৳${selectedPlan.amount} at the library reception desk.`
              : `Pay instantly via digital gateway (bKash / Nagad / Card) to activate immediately.`}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="px-4 py-2.5 text-xs font-semibold rounded-xl border border-input bg-background hover:bg-accent text-foreground transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleRenew}
            disabled={isPending}
            className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold rounded-xl bg-[#004F32] hover:bg-emerald-900 text-white shadow-md transition-all disabled:opacity-50 cursor-pointer"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Processing Renewal...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="h-4 w-4 text-amber-300" />
                <span>Confirm & Renew (৳{selectedPlan.amount})</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

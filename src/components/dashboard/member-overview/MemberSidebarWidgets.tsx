"use client";

import React from "react";
import Link from "next/link";
import { format } from "date-fns";
import { ArrowUpRight, CreditCard, HeartHandshake, Loader2, ShieldCheck, Sparkles } from "lucide-react";
import { IUser } from "@/types/auth";
import { IDonation } from "@/types/donation";

interface MemberSidebarWidgetsProps {
  user: IUser | null | undefined;
  myDonations: IDonation[];
  isDonationsLoading: boolean;
  donationsHref: string;
  onOpenRenewalModal: () => void;
  onOpenDonationModal: () => void;
}

export function MemberSidebarWidgets({
  user,
  myDonations,
  isDonationsLoading,
  donationsHref,
  onOpenRenewalModal,
  onOpenDonationModal,
}: MemberSidebarWidgetsProps) {
  const membershipExpiryText = user?.membershipExpiresAt
    ? format(new Date(user.membershipExpiresAt), "dd MMM yyyy")
    : "Not Configured";

  return (
    <div className="space-y-6">
      {/* ── Membership Renewal Widget ── */}
      <div className="rounded-2xl border border-amber-300/40 bg-gradient-to-br from-amber-500/10 via-emerald-500/5 to-transparent p-5 space-y-3 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-extrabold text-[#C78700] dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
            <CreditCard className="h-4 w-4" /> Membership Status
          </span>
          <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 uppercase">
            {user?.status || "ACTIVE"}
          </span>
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed">
          Renew or extend your active borrowing privileges for <strong>৳100 (6 Months)</strong>.
        </p>

        <div className="rounded-xl bg-card border border-border/80 p-3 text-xs space-y-1">
          <div className="flex justify-between text-muted-foreground">
            <span>Expires:</span>
            <strong className="text-foreground font-mono">{membershipExpiryText}</strong>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Plan:</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">100৳ / 6 Months</span>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenRenewalModal}
          className="w-full flex items-center justify-center space-x-2 rounded-xl bg-[#004F32] hover:bg-emerald-900 py-2.5 text-xs font-bold text-white shadow-xs transition-all cursor-pointer"
        >
          <Sparkles className="h-4 w-4 text-amber-300" />
          <span>Renew Membership Now</span>
        </button>
      </div>

      {/* ── Submitted Donations Tracker ── */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
            <HeartHandshake className="h-4 w-4 text-primary" />
            <span>My Book Donations</span>
          </h3>
          <Link
            href={donationsHref}
            className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
          >
            <span>Details ({myDonations.length})</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {isDonationsLoading ? (
          <div className="py-6 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-primary" /> Loading donations...
          </div>
        ) : myDonations.length === 0 ? (
          <div className="py-6 text-center text-xs text-muted-foreground space-y-2">
            <p>You have not submitted any book donations yet.</p>
            <button
              type="button"
              onClick={onOpenDonationModal}
              className="text-xs font-bold text-primary hover:underline cursor-pointer"
            >
              + Submit a Book Donation
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {myDonations.slice(0, 3).map((don) => (
              <div
                key={don.id}
                className="rounded-xl border border-border/80 bg-muted/30 p-3 text-xs space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-foreground">#DON-{don.id}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      don.status === "APPROVED" || don.status === "RECEIVED" || don.status === "CATALOGED"
                        ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300"
                        : don.status === "PENDING"
                        ? "bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300"
                        : "bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300"
                    }`}
                  >
                    {don.status}
                  </span>
                </div>
                <h4 className="font-bold text-foreground line-clamp-1">{don.bookTitle}</h4>
                <div className="flex justify-between text-[11px] text-muted-foreground pt-0.5">
                  <span>Condition: {don.condition}</span>
                  <span>{don.createdAt ? format(new Date(don.createdAt), "dd MMM yyyy") : ""}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Library Guidelines Card ── */}
      <div className="rounded-2xl border border-border bg-card p-5 text-xs space-y-3">
        <h4 className="font-bold text-foreground flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          <span>Library Member Rules</span>
        </h4>
        <ul className="space-y-2 text-muted-foreground leading-relaxed list-disc list-inside">
          <li>Maximum 5 borrow items at any single time.</li>
          <li>Standard borrowing duration is 14 days per item.</li>
          <li>Membership renewal fee: ৳100 per 6-month period.</li>
          <li>Late fine of ৳5 per day will be levied on overdue returns.</li>
        </ul>
      </div>
    </div>
  );
}

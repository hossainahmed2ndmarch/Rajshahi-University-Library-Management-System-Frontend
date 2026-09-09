"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  HeartHandshake,
  ArrowLeft,
  Plus,
  CheckCircle2,
  Clock,
  PackageCheck,
  Building2,
  Truck,
  Package,
  Calendar,
  MapPin,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { useGetDonations } from "@/hooks/useDonations";
import { useGetMe } from "@/hooks/useAuth";
import { DonationModal } from "@/components/member/DonationModal";
import { DonationMethod, DonationStatus } from "@/types/donation";

const METHOD_CONFIG: Record<DonationMethod, { label: string; className: string; icon: React.ReactNode }> = {
  LIBRARY_DROP_OFF: {
    label: "Library Drop-Off",
    className: "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300",
    icon: <Building2 className="h-3 w-3" />,
  },
  PICKUP: {
    label: "Campus Pickup",
    className: "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300",
    icon: <Truck className="h-3 w-3" />,
  },
  COURIER: {
    label: "Courier Parcel",
    className: "bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300",
    icon: <Package className="h-3 w-3" />,
  },
};

const STATUS_CONFIG: Record<DonationStatus, { label: string; className: string; icon: React.ReactNode }> = {
  PENDING: { label: "Pending Verification", className: "bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300", icon: <Clock className="h-3 w-3" /> },
  APPROVED: { label: "Approved & Cataloged", className: "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300", icon: <CheckCircle2 className="h-3 w-3" /> },
  SCHEDULED: { label: "Scheduled Pickup", className: "bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300", icon: <Calendar className="h-3 w-3" /> },
  RECEIVED: { label: "In Circulation", className: "bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300", icon: <PackageCheck className="h-3 w-3" /> },
  CATALOGED: { label: "In Catalog", className: "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300", icon: <CheckCircle2 className="h-3 w-3" /> },
  REJECTED: { label: "Rejected", className: "bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300", icon: <XCircle className="h-3 w-3" /> },
  CANCELLED: { label: "Cancelled", className: "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300", icon: <XCircle className="h-3 w-3" /> },
};

interface MyDonationsContentProps {
  backHref?: string;
  backLabel?: string;
}

export function MyDonationsContent({
  backHref = "/dashboard/member",
  backLabel = "Back to Overview",
}: MyDonationsContentProps) {
  const { data: user } = useGetMe();
  const { data: allDonations = [], isLoading } = useGetDonations();
  const [donationModalOpen, setDonationModalOpen] = useState(false);

  // Filter for this user
  const myDonations = allDonations.filter((d) => {
    if (!user) return false;
    if (d.donorId && String(d.donorId) === String(user.id)) return true;
    if (d.donorEmail && user.email && d.donorEmail.toLowerCase() === user.email.toLowerCase()) return true;
    return false;
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
            <HeartHandshake className="h-6 w-6 text-[#004F32] dark:text-emerald-400" />
            <span>My Submitted Book Donations</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Track approval, collection, and catalog integration status of your donated Islamic books.
          </p>
        </div>

        <button
          onClick={() => setDonationModalOpen(true)}
          className="inline-flex items-center justify-center space-x-2 rounded-xl bg-[#004F32] hover:bg-emerald-900 px-4 py-2.5 text-xs font-bold text-white shadow-xs transition-all cursor-pointer"
        >
          <Plus className="h-4 w-4 text-amber-300" />
          <span>New Book Donation</span>
        </button>
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-xs text-muted-foreground">Loading your donations...</div>
      ) : myDonations.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-12 text-center text-xs text-muted-foreground space-y-3">
          <HeartHandshake className="h-10 w-10 mx-auto text-muted" />
          <p className="text-sm font-semibold text-foreground">No book donations found.</p>
          <p>Share Islamic literature and books with the university library community.</p>
          <button
            onClick={() => setDonationModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#004F32] text-white font-bold text-xs cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Submit a Donation</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {myDonations.map((don) => {
            const cfg = STATUS_CONFIG[don.status] ?? STATUS_CONFIG.PENDING;
            const method = don.method || "LIBRARY_DROP_OFF";
            const methodCfg = METHOD_CONFIG[method] || METHOD_CONFIG.LIBRARY_DROP_OFF;

            return (
              <div
                key={don.id}
                className="rounded-2xl border border-border bg-card p-5 shadow-2xs space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs text-primary">
                      {don.donationCode ?? `#DON-${don.id}`}
                    </span>
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${cfg.className}`}>
                      {cfg.icon} {cfg.label}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-foreground line-clamp-2">{don.bookTitle}</h3>
                  <p className="text-xs text-muted-foreground">Author: {don.author || "Unknown"}</p>

                  {/* Method badge */}
                  <div>
                    <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold ${methodCfg.className}`}>
                      {methodCfg.icon} {methodCfg.label}
                    </span>
                  </div>

                  {method === "PICKUP" && (
                    <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-2 text-xs space-y-0.5 text-amber-900 dark:text-amber-200">
                      {don.pickupAddress && (
                        <p className="flex items-start gap-1 text-[11px]">
                          <MapPin className="h-3 w-3 text-amber-600 shrink-0 mt-0.5" />
                          <span>{don.pickupAddress}</span>
                        </p>
                      )}
                      {don.scheduledAt && (
                        <p className="flex items-center gap-1 text-[10px] font-mono">
                          <Calendar className="h-3 w-3 text-amber-600 shrink-0" />
                          <span>Scheduled: {new Date(don.scheduledAt).toLocaleString()}</span>
                        </p>
                      )}
                    </div>
                  )}

                  <div className="pt-2 text-xs space-y-1 text-muted-foreground border-t border-border/60">
                    <div className="flex justify-between">
                      <span>Category:</span>
                      <span className="font-medium text-foreground">{don.category || "General"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Copies:</span>
                      <span className="font-bold text-foreground">{don.quantity} unit{don.quantity > 1 ? "s" : ""}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Submitted:</span>
                      <span className="font-mono text-foreground">
                        {(don.createdAt ?? new Date().toISOString()).split("T")[0]}
                      </span>
                    </div>
                    {don.receivedBy && (
                      <div className="flex justify-between pt-1 border-t border-border/40 text-blue-600 dark:text-blue-400">
                        <span className="text-[11px]">Received by:</span>
                        <span className="font-semibold text-[11px] flex items-center gap-1">
                          <ShieldCheck className="h-3 w-3" /> {don.receivedBy.name}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {(don.donorNote || don.notes) && (
                  <div className="rounded-lg bg-muted/40 p-2.5 text-[11px] text-muted-foreground">
                    <span className="font-semibold text-foreground block">Notes:</span>
                    {don.donorNote || don.notes}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Full Donation Modal */}
      <DonationModal
        isOpen={donationModalOpen}
        onClose={() => setDonationModalOpen(false)}
      />
    </div>
  );
}

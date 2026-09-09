"use client";

import React, { useState } from "react";
import {
  HeartHandshake,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  PackageCheck,
  MapPin,
  AlertCircle,
  BookOpen,
  Building2,
  Truck,
  Package,
  Calendar,
  Phone,
  ShieldCheck,
} from "lucide-react";
import { useGetDonations, useApproveDonation, useRejectDonation } from "@/hooks/useDonations";
import { IDonation, DonationStatus, DonationMethod } from "@/types/donation";
import { toast } from "sonner";

const STATUS_CONFIG: Record<DonationStatus, { label: string; className: string; icon: React.ReactNode }> = {
  PENDING: { label: "Pending Verification", className: "bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300", icon: <Clock className="h-3 w-3" /> },
  APPROVED: { label: "Approved & Cataloged", className: "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300", icon: <CheckCircle2 className="h-3 w-3" /> },
  SCHEDULED: { label: "Scheduled Pickup", className: "bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300", icon: <Calendar className="h-3 w-3" /> },
  RECEIVED: { label: "In Catalog", className: "bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300", icon: <PackageCheck className="h-3 w-3" /> },
  CATALOGED: { label: "Cataloged", className: "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300", icon: <CheckCircle2 className="h-3 w-3" /> },
  REJECTED: { label: "Rejected", className: "bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300", icon: <XCircle className="h-3 w-3" /> },
  CANCELLED: { label: "Cancelled", className: "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300", icon: <XCircle className="h-3 w-3" /> },
};

const METHOD_CONFIG: Record<DonationMethod, { label: string; className: string; icon: React.ReactNode }> = {
  LIBRARY_DROP_OFF: {
    label: "Drop-Off",
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

const CONDITION_COLOR: Record<string, string> = {
  NEW: "text-emerald-600 dark:text-emerald-400",
  LIKE_NEW: "text-emerald-500 dark:text-emerald-500",
  GOOD: "text-amber-600 dark:text-amber-400",
  ACCEPTABLE: "text-orange-600 dark:text-orange-400",
};

export default function ShifterDonationsPage() {
  const { data: donations = [], isLoading } = useGetDonations();
  const { mutate: approveDonation, isPending: isApproving } = useApproveDonation();
  const { mutate: rejectDonation, isPending: isRejecting } = useRejectDonation();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<DonationStatus | "ALL">("ALL");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [locationCell, setLocationCell] = useState("Rack-A1-04");
  const [rejectReason, setRejectReason] = useState("");
  const [rejectModalId, setRejectModalId] = useState<string | null>(null);

  const filtered = donations.filter((d) => {
    const term = search.toLowerCase();
    const match =
      (d.bookTitle ?? "").toLowerCase().includes(term) ||
      (d.donationCode ?? "").toLowerCase().includes(term) ||
      (d.donorName ?? "").toLowerCase().includes(term) ||
      (d.pickupAddress ?? "").toLowerCase().includes(term);
    const statusOk = statusFilter === "ALL" || d.status === statusFilter;
    return match && statusOk;
  });

  const pendingCount = donations.filter((d) => d.status === "PENDING" || d.status === "SCHEDULED").length;
  const approvedCount = donations.filter((d) => d.status === "APPROVED" || d.status === "RECEIVED" || d.status === "CATALOGED").length;
  const totalBooks = donations.reduce((acc, d) => acc + d.quantity, 0);

  const handleApprove = (id: string | number) => {
    approveDonation({
      id,
      locationCell: locationCell.trim() || "DONATION-SHELF",
    });
    setSelectedId(null);
    setLocationCell("Rack-A1-04");
  };

  const handleReject = (id: string | number) => {
    if (!rejectReason.trim()) {
      toast.error("Please provide a rejection reason.");
      return;
    }
    rejectDonation({ id: String(id), rejectionReason: rejectReason });
    setRejectModalId(null);
    setRejectReason("");
  };

  return (
    <div className="space-y-6 pb-10">
      <div>
        <h1 className="text-2xl font-extrabold text-foreground flex items-center gap-2">
          <HeartHandshake className="h-6 w-6 text-[#004F32]" />
          <span>Donations Receiving &amp; Shelving Desk</span>
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Receive drop-offs at counter, coordinate campus pickups, and approve donations to automatically add books as borrowable inventory.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-border bg-card p-4 flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <p className="text-2xl font-extrabold text-amber-600 dark:text-amber-400">{pendingCount}</p>
            <p className="text-[11px] text-muted-foreground">Awaiting Receiving</p>
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4 flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-2xl font-extrabold text-foreground">{approvedCount}</p>
            <p className="text-[11px] text-muted-foreground">Received &amp; Cataloged</p>
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4 flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-[#004F32]/10 flex items-center justify-center text-[#004F32] dark:text-emerald-400 shrink-0">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <p className="text-2xl font-extrabold text-foreground">{totalBooks}</p>
            <p className="text-[11px] text-muted-foreground">Total Book Units</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by book title, donor, address, or code..."
            className="w-full rounded-xl border border-input bg-card pl-9 pr-3 py-2 text-xs focus:ring-2 focus:ring-primary focus:outline-none"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {(["ALL", "PENDING", "APPROVED", "REJECTED"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`rounded-lg px-3 py-2 text-[11px] font-bold transition-colors cursor-pointer ${
                statusFilter === s
                  ? "bg-[#004F32] text-white"
                  : "border border-input bg-card text-muted-foreground hover:bg-accent"
              }`}
            >
              {s === "ALL" ? "All Submissions" : s}
            </button>
          ))}
        </div>
      </div>

      {/* Donation Cards Grid */}
      {isLoading ? (
        <div className="p-12 text-center text-xs text-muted-foreground">Loading donations...</div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center text-muted-foreground text-xs space-y-2">
          <HeartHandshake className="h-8 w-8 mx-auto text-muted" />
          <p>No donation records found matching this view.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((don) => {
            const cfg = STATUS_CONFIG[don.status] ?? STATUS_CONFIG.PENDING;
            const method = don.method || "LIBRARY_DROP_OFF";
            const methodCfg = METHOD_CONFIG[method] || METHOD_CONFIG.LIBRARY_DROP_OFF;
            const condColor = don.condition ? (CONDITION_COLOR[don.condition] ?? "text-foreground") : "text-foreground";
            const isSelected = selectedId === String(don.id);

            return (
              <div
                key={don.id}
                className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-4 flex flex-col justify-between"
              >
                <div>
                  {/* Top row */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <span className="font-mono font-bold text-xs text-primary">{don.donationCode ?? `#DON-${don.id}`}</span>
                      <h3 className="font-bold text-sm text-foreground line-clamp-2 mt-0.5">{don.bookTitle ?? "Untitled Book"}</h3>
                      <p className="text-[11px] text-muted-foreground">by {don.author ?? "Unknown"}</p>
                    </div>
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold whitespace-nowrap ${cfg.className}`}>
                      {cfg.icon} {cfg.label}
                    </span>
                  </div>

                  {/* Method Badge */}
                  <div className="mb-2">
                    <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold ${methodCfg.className}`}>
                      {methodCfg.icon} {methodCfg.label}
                    </span>
                  </div>

                  {/* Handover Specifics */}
                  {method === "PICKUP" && (
                    <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-2.5 mb-2 space-y-1 text-xs">
                      {don.pickupAddress && (
                        <p className="flex items-start gap-1 text-amber-900 dark:text-amber-200 text-[11px]">
                          <MapPin className="h-3.5 w-3.5 text-amber-600 shrink-0 mt-0.5" />
                          <span><strong>Address:</strong> {don.pickupAddress}</span>
                        </p>
                      )}
                      {don.scheduledAt && (
                        <p className="flex items-center gap-1 text-amber-800 dark:text-amber-300 font-mono text-[10px]">
                          <Calendar className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                          <span><strong>Pickup Time:</strong> {new Date(don.scheduledAt).toLocaleString()}</span>
                        </p>
                      )}
                    </div>
                  )}

                  {method === "COURIER" && (don.donorNote || don.notes) && (
                    <div className="rounded-xl border border-blue-500/30 bg-blue-500/5 p-2.5 mb-2 text-xs text-blue-900 dark:text-blue-200">
                      <p className="text-[11px]">
                        <strong>Courier Info:</strong> {don.donorNote || don.notes}
                      </p>
                    </div>
                  )}

                  {/* Details */}
                  <div className="text-xs space-y-1.5 border-t border-border/60 pt-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Category</span>
                      <span className="font-medium text-foreground">{don.category ?? "General"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Quantity</span>
                      <span className="font-bold text-foreground">{don.quantity} copy ({don.quantity}x)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Condition</span>
                      <span className={`font-bold ${condColor}`}>{don.condition ? don.condition.replace("_", " ") : "Standard"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Donor</span>
                      <span className="font-medium text-foreground">{don.donorName ?? "Anonymous"}</span>
                    </div>
                    {don.contactPhone && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Phone</span>
                        <span className="font-mono font-bold text-primary flex items-center gap-1">
                          <Phone className="h-3 w-3" />{don.contactPhone}
                        </span>
                      </div>
                    )}
                    {don.receivedBy && (
                      <div className="flex justify-between pt-1 border-t border-border/40 text-blue-600 dark:text-blue-400">
                        <span className="text-[11px]">Received by:</span>
                        <span className="font-semibold text-[11px]">{don.receivedBy.name}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions for PENDING / SCHEDULED */}
                {(don.status === "PENDING" || don.status === "SCHEDULED") && (
                  <div className="mt-4 space-y-2 border-t border-border/60 pt-3">
                    {isSelected ? (
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-muted-foreground block">
                          Assign Shelf Location Cell:
                        </label>
                        <input
                          type="text"
                          value={locationCell}
                          onChange={(e) => setLocationCell(e.target.value)}
                          placeholder="e.g. Rack-A1-04"
                          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs focus:ring-2 focus:ring-primary focus:outline-none font-mono"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApprove(don.id)}
                            disabled={isApproving}
                            className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-[#004F32] hover:bg-emerald-900 py-2 text-[11px] font-bold text-white transition-all disabled:opacity-60 cursor-pointer"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5 text-amber-300" />
                            {isApproving ? "Receiving..." : "Confirm & Auto-Catalog"}
                          </button>
                          <button
                            onClick={() => { setSelectedId(null); setLocationCell("Rack-A1-04"); }}
                            className="px-3 rounded-lg border border-input bg-background hover:bg-accent text-xs font-semibold text-foreground cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedId(String(don.id))}
                          className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-[#004F32] hover:bg-emerald-900 py-2 text-[11px] font-bold text-white transition-all cursor-pointer"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5 text-amber-300" />
                          Receive &amp; Approve
                        </button>
                        <button
                          onClick={() => setRejectModalId(String(don.id))}
                          className="flex items-center justify-center gap-1 rounded-lg border border-red-200 dark:border-red-900 bg-red-500/10 hover:bg-red-500/20 px-3 py-2 text-[11px] font-bold text-red-700 dark:text-red-400 transition-all cursor-pointer"
                        >
                          <XCircle className="h-3.5 w-3.5" />
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Reject Modal */}
      {rejectModalId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-600">
                <XCircle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-foreground">Reject Donation</h3>
                <p className="text-xs text-muted-foreground">Provide a reason to notify the donor.</p>
              </div>
            </div>
            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Book is too damaged for library use / Category not accepted..."
              className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-xs focus:ring-2 focus:ring-red-400 focus:outline-none resize-none"
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => { setRejectModalId(null); setRejectReason(""); }}
                className="px-4 py-2 text-xs font-semibold rounded-lg border border-input bg-background hover:bg-accent text-foreground"
              >
                Cancel
              </button>
              <button
                onClick={() => handleReject(rejectModalId)}
                disabled={isRejecting}
                className="px-5 py-2 text-xs font-bold rounded-lg bg-red-600 hover:bg-red-700 text-white disabled:opacity-60"
              >
                {isRejecting ? "Rejecting..." : "Confirm Rejection"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

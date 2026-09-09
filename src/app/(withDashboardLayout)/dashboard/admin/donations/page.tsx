"use client";

import React, { useState } from "react";
import { z } from "zod";
import { ColumnDef } from "@tanstack/react-table";
import {
  HeartHandshake,
  CheckCircle2,
  XCircle,
  Clock,
  BookOpen,
  User,
  MapPin,
  X,
  AlertTriangle,
  Sparkles,
  Layers,
  Building2,
  Truck,
  Package,
  Calendar,
  ShieldCheck,
  Phone,
  Trash2,
} from "lucide-react";
import { RUTable } from "@/components/ui/RUTable";
import { RUForm, RUInput, RUSelect } from "@/components/forms";
import { useGetDonations, useApproveDonation, useRejectDonation, useDeleteDonation } from "@/hooks/useDonations";
import { IDonation, DonationStatus, DonationMethod } from "@/types/donation";

// Zod Schema for Approve Modal
const approveSchema = z.object({
  locationCell: z.string().min(1, "Location cell code is required"),
  assignedCategory: z.string().min(1, "Category is required"),
  borrowStock: z.number().min(1, "Borrow stock count required"),
  sellStock: z.number().min(0, "Sell stock count"),
});

type ApproveFormValues = z.infer<typeof approveSchema>;

// Zod Schema for Reject Modal
const rejectSchema = z.object({
  rejectionReason: z.string().min(3, "Please specify a valid rejection reason"),
});

type RejectFormValues = z.infer<typeof rejectSchema>;

const METHOD_CONFIG: Record<DonationMethod, { label: string; className: string; icon: React.ReactNode }> = {
  LIBRARY_DROP_OFF: {
    label: "Library Drop-Off",
    className: "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300/40",
    icon: <Building2 className="h-3 w-3" />,
  },
  PICKUP: {
    label: "Campus Pickup",
    className: "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300/40",
    icon: <Truck className="h-3 w-3" />,
  },
  COURIER: {
    label: "Courier Parcel",
    className: "bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-300/40",
    icon: <Package className="h-3 w-3" />,
  },
};

export default function AdminDonationApprovalsPage() {
  const { data: donationsList = [], isLoading } = useGetDonations();
  const { mutate: approveDonation, isPending: isApproving } = useApproveDonation();
  const { mutate: rejectDonation, isPending: isRejecting } = useRejectDonation();
  const { mutate: deleteDonation, isPending: isDeleting } = useDeleteDonation();

  const [activeTab, setActiveTab] = useState<DonationStatus | "ALL">("PENDING");
  const [selectedDonation, setSelectedDonation] = useState<IDonation | null>(null);
  const [deleteId, setDeleteId] = useState<string | number | null>(null);
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);

  // Filter donations based on active tab
  const filteredDonations = donationsList.filter((d) => {
    if (activeTab === "ALL") return true;
    return d.status === activeTab;
  });

  const handleOpenApprove = (donation: IDonation) => {
    setSelectedDonation(donation);
    setApproveModalOpen(true);
  };

  const handleOpenReject = (donation: IDonation) => {
    setSelectedDonation(donation);
    setRejectModalOpen(true);
  };

  const handleApproveSubmit = (values: ApproveFormValues) => {
    if (!selectedDonation) return;
    approveDonation(
      {
        id: selectedDonation.id,
        ...values,
      },
      {
        onSuccess: () => setApproveModalOpen(false),
      }
    );
  };

  const handleRejectSubmit = (values: RejectFormValues) => {
    if (!selectedDonation) return;
    rejectDonation(
      {
        id: selectedDonation.id,
        rejectionReason: values.rejectionReason,
      },
      {
        onSuccess: () => setRejectModalOpen(false),
      }
    );
  };

  // Table Column Definitions
  const columns: ColumnDef<IDonation>[] = [
    {
      accessorKey: "donationCode",
      header: "Code / ID",
      cell: ({ row }) => (
        <span className="font-mono font-bold text-xs text-primary">
          {row.original.donationCode || `#DON-${row.original.id}`}
        </span>
      ),
    },
    {
      accessorKey: "bookTitle",
      header: "Donated Book Details",
      cell: ({ row }) => {
        const d = row.original;
        return (
          <div className="flex items-center space-x-3 max-w-[200px]">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <BookOpen className="h-4 w-4" />
            </div>
            <div>
              <div className="font-bold text-foreground text-xs leading-tight line-clamp-1">{d.bookTitle}</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">
                by <span className="font-medium text-foreground">{d.author || "Unknown"}</span>
              </div>
              <div className="text-[10px] text-muted-foreground">
                Qty: <strong className="text-primary">{d.quantity} copies</strong> ({d.category || "General"})
              </div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "method",
      header: "Method & Handover Info",
      cell: ({ row }) => {
        const d = row.original;
        const method = d.method || "LIBRARY_DROP_OFF";
        const cfg = METHOD_CONFIG[method] || METHOD_CONFIG.LIBRARY_DROP_OFF;

        return (
          <div className="text-xs space-y-1 max-w-[220px]">
            <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold ${cfg.className}`}>
              {cfg.icon} {cfg.label}
            </span>

            {method === "PICKUP" && (
              <div className="space-y-0.5 text-[11px]">
                {d.pickupAddress && (
                  <p className="flex items-center gap-1 text-muted-foreground line-clamp-1 font-medium">
                    <MapPin className="h-3 w-3 text-amber-600 shrink-0" />
                    <span>{d.pickupAddress}</span>
                  </p>
                )}
                {d.scheduledAt && (
                  <p className="flex items-center gap-1 text-amber-700 dark:text-amber-300 font-mono text-[10px]">
                    <Calendar className="h-3 w-3 shrink-0" />
                    <span>Pickup: {new Date(d.scheduledAt).toLocaleString()}</span>
                  </p>
                )}
              </div>
            )}

            {method === "COURIER" && (d.donorNote || d.notes) && (
              <p className="text-[11px] text-muted-foreground line-clamp-2 bg-muted/40 p-1 rounded">
                <strong>Courier:</strong> {d.donorNote || d.notes}
              </p>
            )}

            {method === "LIBRARY_DROP_OFF" && (
              <p className="text-[10px] text-muted-foreground">Counter drop-off</p>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "donorName",
      header: "Donor & Contact",
      cell: ({ row }) => {
        const d = row.original;
        return (
          <div className="text-xs space-y-0.5 max-w-[180px]">
            <div className="font-semibold text-foreground flex items-center gap-1 truncate">
              <User className="h-3 w-3 text-muted-foreground shrink-0" />
              <span>{d.donorName || "Anonymous Donor"}</span>
            </div>
            {d.contactPhone && (
              <div className="text-[11px] font-mono text-muted-foreground flex items-center gap-1">
                <Phone className="h-3 w-3 shrink-0" />
                <span>{d.contactPhone}</span>
              </div>
            )}
            {d.donorEmail && (
              <div className="text-[10px] text-muted-foreground font-mono truncate">{d.donorEmail}</div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status & Receiver",
      cell: ({ row }) => {
        const d = row.original;
        const status = d.status;

        return (
          <div className="text-xs space-y-1">
            {status === "APPROVED" || status === "RECEIVED" || status === "CATALOGED" ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-950 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 dark:text-emerald-300">
                <CheckCircle2 className="h-3 w-3" /> Approved &amp; Cataloged
              </span>
            ) : status === "REJECTED" ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-red-100 dark:bg-red-950 px-2.5 py-0.5 text-[10px] font-bold text-red-800 dark:text-red-300">
                <XCircle className="h-3 w-3" /> Rejected
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 dark:bg-amber-950 px-2.5 py-0.5 text-[10px] font-bold text-amber-800 dark:text-amber-300">
                <Clock className="h-3 w-3" /> Pending Handover
              </span>
            )}

            {d.receivedBy && (
              <p className="text-[10px] text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1">
                <ShieldCheck className="h-3 w-3" />
                Received by: {d.receivedBy.name} ({d.receivedBy.role?.replace("_", " ") || "Staff"})
              </p>
            )}
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const donation = row.original;
        return (

          <div className="flex items-center space-x-2">
            {donation.status === "PENDING" || donation.status === "SCHEDULED" ? (
              <>
                <button
                  onClick={() => handleOpenApprove(donation)}
                  className="inline-flex items-center space-x-1 rounded-lg bg-[#004F32] hover:bg-emerald-900 px-2.5 py-1 text-xs font-bold text-white shadow-2xs transition-colors cursor-pointer"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Receive &amp; Approve</span>
                </button>
                <button
                  onClick={() => handleOpenReject(donation)}
                  className="inline-flex items-center space-x-1 rounded-lg border border-input bg-background hover:bg-red-500/10 px-2.5 py-1 text-xs font-bold text-destructive transition-colors cursor-pointer"
                >
                  <XCircle className="h-3.5 w-3.5" />
                  <span>Reject</span>
                </button>
              </>
            ) : null}
            <button
              onClick={() => setDeleteId(donation.id)}
              title="Delete donation record"
              className="inline-flex items-center justify-center p-1.5 rounded-lg border border-input bg-background hover:bg-red-500/10 text-destructive transition-colors cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-purple-900 via-[#004F32] to-[#C78700] p-6 text-white shadow-md">
        <h1 className="text-2xl font-extrabold tracking-tight flex items-center gap-2">
          <HeartHandshake className="h-6 w-6 text-amber-300" />
          <span>Donation Approvals &amp; Receiving Desk</span>
        </h1>
        <p className="mt-1 text-xs text-purple-100/90 max-w-xl">
          Coordinate drop-offs, campus pickups, and parcel deliveries. When received and approved, books are automatically registered into the catalog as borrowable inventory.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 border-b border-border pb-2">
        {(["PENDING", "APPROVED", "REJECTED", "ALL"] as const).map((tab) => {
          const isActive = activeTab === tab;
          const count =
            tab === "ALL"
              ? donationsList.length
              : donationsList.filter((d) => d.status === tab).length;

          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center space-x-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                isActive
                  ? "bg-[#004F32] text-white shadow-xs"
                  : "bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <span>{tab === "ALL" ? "All Submissions" : tab}</span>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] ${
                  isActive ? "bg-amber-400 text-slate-900" : "bg-muted-foreground/20"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Datatable */}
      <RUTable
        columns={columns}
        data={filteredDonations}
        isLoading={isLoading}
        searchPlaceholder="Filter donations by book title, donor, code, or category..."
      />

      {/* Modal: Approve Donation & Convert to Stock */}
      {approveModalOpen && selectedDonation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in-50">
          <div className="relative w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl text-card-foreground">
            <button
              onClick={() => setApproveModalOpen(false)}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center space-x-3 pb-4 border-b border-border mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-foreground">Approve Book Donation</h3>
                <p className="text-xs text-muted-foreground">
                  Convert "{selectedDonation.bookTitle}" into catalog stock.
                </p>
              </div>
            </div>

            <RUForm<ApproveFormValues>
              schema={approveSchema}
              defaultValues={{
                locationCell: "Rack-A1-04",
                assignedCategory: selectedDonation.category || "Tafsir",
                borrowStock: selectedDonation.quantity || 1,
                sellStock: 0,
              }}
              onSubmit={handleApproveSubmit}
            >
              <div className="space-y-4">
                <RUInput
                  name="locationCell"
                  label="Assign Shelf Location Cell"
                  placeholder="e.g. Rack-A1-04"
                  prependIcon={<MapPin className="h-4 w-4" />}
                  required
                />

                <RUSelect
                  name="assignedCategory"
                  label="Confirm Catalog Category"
                  options={[
                    { label: "Tafsir", value: "Tafsir" },
                    { label: "Hadith", value: "Hadith" },
                    { label: "Seerah", value: "Seerah" },
                    { label: "Fiqh", value: "Fiqh" },
                    { label: "Spirituality", value: "Spirituality" },
                    { label: "History", value: "History" },
                  ]}
                  required
                />

                <div className="grid grid-cols-2 gap-3 p-3 rounded-xl border border-border/80 bg-muted/40">
                  <RUInput
                    name="borrowStock"
                    label="Borrow Stock Count"
                    type="number"
                  />

                  <RUInput
                    name="sellStock"
                    label="Sell Stock Count"
                    type="number"
                  />
                </div>

                <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3 text-[11px] text-emerald-800 dark:text-emerald-300">
                  <p className="font-semibold flex items-center gap-1 mb-0.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    Automatic Catalog Integration
                  </p>
                  <span>
                    Upon approval, this item is automatically created in the library database as a borrowable book. Additional details (cover image, publisher, sell price) can be edited anytime from Book Management.
                  </span>
                </div>

                <div className="pt-2 flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setApproveModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold rounded-lg border border-input bg-background hover:bg-accent text-foreground"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isApproving}
                    className="px-5 py-2 text-xs font-bold rounded-lg bg-[#004F32] hover:bg-emerald-900 text-white shadow-2xs disabled:opacity-50"
                  >
                    {isApproving ? "Processing..." : "Approve & Add to Inventory"}
                  </button>
                </div>
              </div>
            </RUForm>
          </div>
        </div>
      )}

      {/* Modal: Reject Donation */}
      {rejectModalOpen && selectedDonation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in-50">
          <div className="relative w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl text-card-foreground">
            <button
              onClick={() => setRejectModalOpen(false)}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center space-x-3 pb-4 border-b border-border mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10 text-destructive">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-foreground">Reject Donation Request</h3>
                <p className="text-xs text-muted-foreground">
                  Provide rationale for declining "{selectedDonation.bookTitle}".
                </p>
              </div>
            </div>

            <RUForm<RejectFormValues>
              schema={rejectSchema}
              defaultValues={{ rejectionReason: "Book copy damaged or incomplete volume." }}
              onSubmit={handleRejectSubmit}
            >
              <div className="space-y-4">
                <RUInput
                  name="rejectionReason"
                  label="Reason for Rejection"
                  placeholder="e.g. Pages missing or duplicate copy in inventory"
                  required
                />

                <div className="pt-2 flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setRejectModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold rounded-lg border border-input bg-background hover:bg-accent text-foreground"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isRejecting}
                    className="px-5 py-2 text-xs font-bold rounded-lg bg-destructive hover:bg-red-700 text-destructive-foreground shadow-2xs disabled:opacity-50"
                  >
                    {isRejecting ? "Declining..." : "Confirm Rejection"}
                  </button>
                </div>
              </div>
            </RUForm>
          </div>
        </div>
      )}

      {/* Modal: Delete Confirmation */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in-50">
          <div className="relative w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-2xl text-card-foreground text-center space-y-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-destructive mx-auto">
              <Trash2 className="h-6 w-6" />
            </div>

            <div>
              <h3 className="font-bold text-base text-foreground">Remove Donation Record?</h3>
              <p className="text-xs text-muted-foreground mt-1">
                This administrative action will permanently remove this donation entry from library intake logs.
              </p>
            </div>

            <div className="flex justify-center space-x-2 pt-2">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 text-xs font-semibold rounded-lg border border-input bg-background hover:bg-accent text-foreground cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  deleteDonation(deleteId, {
                    onSuccess: () => setDeleteId(null),
                  });
                }}
                disabled={isDeleting}
                className="px-4 py-2 text-xs font-bold rounded-lg bg-destructive hover:bg-red-700 text-destructive-foreground shadow-2xs disabled:opacity-50 cursor-pointer"
              >
                {isDeleting ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

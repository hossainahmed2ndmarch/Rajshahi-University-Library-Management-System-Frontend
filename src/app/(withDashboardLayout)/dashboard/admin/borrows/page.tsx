"use client";

import React, { useState } from "react";
import {
  BookMarked,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Send,
  PackageCheck,
  Calendar,
  UserCheck,
  RefreshCw,
  SlidersHorizontal,
  Mail,
  Smartphone,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import {
  useGetAllBorrows,
  useApproveBorrow,
  useRejectBorrow,
  useReturnBook,
  useCheckOverdueBorrows,
  useDeleteBorrow,
} from "@/hooks/useBorrows";
import { IBorrow, BorrowStatus } from "@/types/borrow";

const FINE_PER_DAY = 5;

function calcDaysOverdue(dueDate?: string): number {
  if (!dueDate) return 0;
  const due = new Date(dueDate).getTime();
  const now = Date.now();
  const diff = Math.floor((now - due) / 86400000);
  return diff > 0 ? diff : 0;
}

const STATUS_CONFIG: Record<BorrowStatus, { label: string; className: string; icon: React.ReactNode }> = {
  PENDING: {
    label: "Pending Approval",
    className: "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300/40",
    icon: <Clock className="h-3 w-3" />,
  },
  APPROVED: {
    label: "Approved & Active",
    className: "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300/40",
    icon: <BookMarked className="h-3 w-3" />,
  },
  RETURNED: {
    label: "Returned",
    className: "bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-300/40",
    icon: <PackageCheck className="h-3 w-3" />,
  },
  REJECTED: {
    label: "Rejected",
    className: "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300/40",
    icon: <XCircle className="h-3 w-3" />,
  },
  OVERDUE: {
    label: "Overdue",
    className: "bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300 border border-red-300/60 font-bold",
    icon: <AlertTriangle className="h-3 w-3" />,
  },
};

export default function AdminBorrowsPage() {
  const { data: borrows = [], isLoading } = useGetAllBorrows();
  const { mutate: approveBorrow, isPending: isApproving } = useApproveBorrow();
  const { mutate: rejectBorrow, isPending: isRejecting } = useRejectBorrow();
  const { mutate: returnBook, isPending: isReturning } = useReturnBook();
  const { mutate: checkOverdue, isPending: isCheckingOverdue } = useCheckOverdueBorrows();

  const { mutate: deleteBorrow, isPending: isDeleting } = useDeleteBorrow();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<BorrowStatus | "ALL">("ALL");
  const [selectedBorrowForReturn, setSelectedBorrowForReturn] = useState<IBorrow | null>(null);
  const [fineInput, setFineInput] = useState<number>(0);
  const [deleteBorrowId, setDeleteBorrowId] = useState<number | string | null>(null);

  const filtered = borrows.filter((b) => {
    const term = search.toLowerCase();
    const titleMatch = (b.book?.title ?? "").toLowerCase().includes(term);
    const userNameMatch = (b.user?.name ?? "").toLowerCase().includes(term);
    const userEmailMatch = (b.user?.email ?? "").toLowerCase().includes(term);
    const idMatch = String(b.id).toLowerCase().includes(term);
    const statusMatch = statusFilter === "ALL" || b.status === statusFilter;
    return (titleMatch || userNameMatch || userEmailMatch || idMatch) && statusMatch;
  });

  const pendingList = borrows.filter((b) => b.status === "PENDING");
  const activeList = borrows.filter((b) => b.status === "APPROVED");
  const overdueList = borrows.filter((b) => b.status === "OVERDUE");
  const returnedList = borrows.filter((b) => b.status === "RETURNED");

  const handleOpenReturnModal = (borrow: IBorrow) => {
    const overdueDays = calcDaysOverdue(borrow.dueDate);
    setSelectedBorrowForReturn(borrow);
    setFineInput(overdueDays * FINE_PER_DAY);
  };

  const handleConfirmReturn = () => {
    if (!selectedBorrowForReturn) return;
    returnBook(
      { borrowId: selectedBorrowForReturn.id, fineAmount: Number(fineInput) || 0 },
      {
        onSuccess: () => {
          setSelectedBorrowForReturn(null);
        },
      }
    );
  };

  const handleDeleteBorrowConfirm = () => {
    if (deleteBorrowId) {
      deleteBorrow(deleteBorrowId, {
        onSuccess: () => setDeleteBorrowId(null),
      });
    }
  };


  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground flex items-center gap-2">
            <BookMarked className="h-6 w-6 text-[#004F32]" />
            Circulation &amp; Borrow Management
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Review borrow requests, verify membership, issue approvals with auto-calculated due dates, and run overdue audits.
          </p>
        </div>

        {/* Action Button: Audit Overdue */}
        <button
          onClick={() => checkOverdue()}
          disabled={isCheckingOverdue}
          className="flex items-center gap-2 rounded-xl bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 text-xs font-bold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
        >
          <Send className={`h-3.5 w-3.5 ${isCheckingOverdue ? "animate-spin" : ""}`} />
          <span>{isCheckingOverdue ? "Auditing Overdue..." : "Audit Overdue & Dispatch Alerts"}</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-700 dark:text-amber-300">Pending Requests</span>
            <Clock className="h-4 w-4 text-amber-600" />
          </div>
          <p className="text-2xl font-extrabold text-amber-800 dark:text-amber-200 mt-1">{pendingList.length}</p>
        </div>

        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">Active Borrows</span>
            <BookMarked className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-extrabold text-emerald-800 dark:text-emerald-200 mt-1">{activeList.length}</p>
        </div>

        <div className="rounded-2xl border border-red-500/30 bg-red-500/5 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-red-700 dark:text-red-300">Overdue Borrows</span>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </div>
          <p className="text-2xl font-extrabold text-red-800 dark:text-red-200 mt-1">{overdueList.length}</p>
        </div>

        <div className="rounded-2xl border border-blue-500/30 bg-blue-500/5 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-700 dark:text-blue-300">Returned Books</span>
            <PackageCheck className="h-4 w-4 text-blue-600" />
          </div>
          <p className="text-2xl font-extrabold text-blue-800 dark:text-blue-200 mt-1">{returnedList.length}</p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by book title, member name, email or ID..."
            className="w-full rounded-xl border border-input bg-card pl-9 pr-3 py-2 text-xs focus:ring-2 focus:ring-primary focus:outline-none"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {(["ALL", "PENDING", "APPROVED", "OVERDUE", "RETURNED", "REJECTED"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`rounded-lg px-3 py-2 text-[11px] font-bold transition-colors cursor-pointer ${
                statusFilter === s
                  ? "bg-[#004F32] text-white"
                  : "border border-input bg-card text-muted-foreground hover:bg-accent"
              }`}
            >
              {s === "ALL" ? "All" : s === "PENDING" ? "Pending" : s.charAt(0) + s.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-muted-foreground">Loading borrow records...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground text-xs space-y-1">
            <BookMarked className="h-8 w-8 mx-auto text-muted" />
            <p>No borrow records found matching the query.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="px-4 py-3 font-semibold text-muted-foreground">Borrow ID</th>
                  <th className="px-4 py-3 font-semibold text-muted-foreground">Borrower</th>
                  <th className="px-4 py-3 font-semibold text-muted-foreground">Book</th>
                  <th className="px-4 py-3 font-semibold text-muted-foreground">Requested / Due</th>
                  <th className="px-4 py-3 font-semibold text-muted-foreground">Status</th>
                  <th className="px-4 py-3 font-semibold text-muted-foreground text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filtered.map((b) => {
                  const cfg = STATUS_CONFIG[b.status] || STATUS_CONFIG.PENDING;
                  const pages = b.book?.pages || 0;
                  const calculatedDays = Math.max(1, Math.ceil(pages / 15));
                  const overdueDays = calcDaysOverdue(b.dueDate);

                  return (
                    <tr key={b.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-4 font-mono font-bold text-foreground whitespace-nowrap">
                        #{String(b.id)}
                      </td>
                      <td className="px-4 py-4 max-w-[180px]">
                        <p className="font-bold text-foreground truncate">{b.user?.name || `User #${b.userId}`}</p>
                        <p className="text-[11px] text-muted-foreground truncate">{b.user?.email || "—"}</p>
                        <p className="text-[10px] font-mono text-muted-foreground">{b.user?.phone || ""}</p>
                      </td>
                      <td className="px-4 py-4 max-w-[220px]">
                        <p className="font-bold text-foreground line-clamp-1">{b.book?.title ?? `Book #${b.bookId}`}</p>
                        <p className="text-[11px] text-muted-foreground">{pages} Pages ({calculatedDays}d rate)</p>
                        {b.book?.locationCell && (
                          <span className="inline-block mt-1 text-[10px] font-mono bg-muted px-2 py-0.5 rounded text-muted-foreground">
                            {b.book.locationCell}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="space-y-0.5">
                          <p className="text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Req: {b.requestedAt ? new Date(b.requestedAt).toLocaleDateString() : "-"}
                          </p>
                          {b.status === "PENDING" ? (
                            <p className="text-amber-600 dark:text-amber-400 font-medium">
                              Est. Due: +{calculatedDays} days on approve
                            </p>
                          ) : (
                            <p className={`font-mono font-bold flex items-center gap-1 ${
                              b.status === "OVERDUE"
                                ? "text-red-600 dark:text-red-400"
                                : "text-foreground"
                            }`}>
                              <Clock className="h-3 w-3" />
                              Due: {b.dueDate ? new Date(b.dueDate).toLocaleDateString() : "—"}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold ${cfg.className}`}>
                          {cfg.icon} {cfg.label}
                        </span>
                        {b.status === "OVERDUE" && (
                          <p className="text-[10px] text-red-600 font-bold mt-1">
                            {overdueDays}d overdue (Fine: ৳{overdueDays * FINE_PER_DAY})
                          </p>
                        )}
                        {b.status === "RETURNED" && b.returnedBy && (
                          <p className="text-[10px] text-blue-600 dark:text-blue-400 font-medium mt-1 flex items-center gap-1">
                            <ShieldCheck className="h-3 w-3" />
                            By: {b.returnedBy.name} ({b.returnedBy.role.replace("_", " ")})
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {b.status === "PENDING" && (
                            <>
                              <button
                                onClick={() => approveBorrow(b.id)}
                                disabled={isApproving}
                                className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1.5 text-[11px] font-bold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                                title={`Approve and set ${calculatedDays}-day loan`}
                              >
                                <CheckCircle2 className="h-3 w-3" />
                                <span>Approve ({calculatedDays}d)</span>
                              </button>
                              <button
                                onClick={() => rejectBorrow(b.id)}
                                disabled={isRejecting}
                                className="inline-flex items-center gap-1 rounded-lg bg-red-100 dark:bg-red-950/60 hover:bg-red-200 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800 px-2 py-1.5 text-[11px] font-bold transition-colors cursor-pointer disabled:opacity-50"
                                title="Reject request"
                              >
                                <XCircle className="h-3 w-3" />
                                <span>Reject</span>
                              </button>
                            </>
                          )}

                          {(b.status === "APPROVED" || b.status === "OVERDUE") && (
                            <button
                              onClick={() => handleOpenReturnModal(b)}
                              disabled={isReturning}
                              className="inline-flex items-center gap-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 text-[11px] font-bold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                            >
                              <PackageCheck className="h-3 w-3" />
                              <span>Process Return</span>
                            </button>
                          )}

                          <button
                            onClick={() => setDeleteBorrowId(b.id)}
                            title="Delete Borrow Record (Admin / Super Admin)"
                            className="p-1.5 rounded-lg border border-input bg-background hover:bg-red-500/10 text-destructive transition-colors cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Return Modal with Fine input */}
      {selectedBorrowForReturn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in-50">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-bold text-foreground flex items-center gap-2">
                <PackageCheck className="h-5 w-5 text-blue-600" />
                Process Book Return
              </h3>
              <button
                onClick={() => setSelectedBorrowForReturn(null)}
                className="text-muted-foreground hover:text-foreground text-xs cursor-pointer"
              >
                Cancel
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <p><strong>Book:</strong> {selectedBorrowForReturn.book?.title}</p>
              <p><strong>Borrower:</strong> {selectedBorrowForReturn.user?.name} ({selectedBorrowForReturn.user?.email})</p>
              <p><strong>Due Date:</strong> {selectedBorrowForReturn.dueDate ? new Date(selectedBorrowForReturn.dueDate).toLocaleDateString() : "N/A"}</p>
              {calcDaysOverdue(selectedBorrowForReturn.dueDate) > 0 && (
                <p className="text-red-600 font-bold">
                  Overdue by {calcDaysOverdue(selectedBorrowForReturn.dueDate)} days
                </p>
              )}
            </div>

            <div>
              <label className="text-xs font-bold text-foreground block mb-1">
                Fine Amount (৳) - Set to 0 if waived
              </label>
              <input
                type="number"
                min={0}
                value={fineInput}
                onChange={(e) => setFineInput(Number(e.target.value))}
                className="w-full rounded-xl border border-input bg-card p-2.5 text-xs font-medium focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedBorrowForReturn(null)}
                className="rounded-xl border border-border px-4 py-2 text-xs font-semibold hover:bg-muted cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReturn}
                disabled={isReturning}
                className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 text-xs font-bold shadow-md transition-colors cursor-pointer"
              >
                {isReturning ? "Processing..." : "Confirm Return & Restock"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Delete Borrow Record Confirmation */}
      {deleteBorrowId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in-50">
          <div className="relative w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-2xl text-card-foreground text-center space-y-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-destructive mx-auto">
              <Trash2 className="h-6 w-6" />
            </div>

            <div>
              <h3 className="font-bold text-base text-foreground">Delete Borrow Record?</h3>
              <p className="text-xs text-muted-foreground mt-1">
                This administrative action will permanently remove this loan record from the circulation archive.
              </p>
            </div>

            <div className="flex justify-center space-x-2 pt-2">
              <button
                onClick={() => setDeleteBorrowId(null)}
                className="px-4 py-2 text-xs font-semibold rounded-lg border border-input bg-background hover:bg-accent text-foreground cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteBorrowConfirm}
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


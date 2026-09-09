"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  BookMarked,
  ArrowLeft,
  Search,
  Clock,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Calendar,
  BookOpen,
  PackageCheck,
  XCircle,
  ShieldCheck,
  Info,
} from "lucide-react";
import { useGetMyBorrows } from "@/hooks/useBorrows";
import { IBorrow, BorrowStatus } from "@/types/borrow";

const FINE_PER_DAY = 5;

function calcDaysOverdue(dueDate?: string): number {
  if (!dueDate) return 0;
  const due = new Date(dueDate).getTime();
  const now = Date.now();
  const diff = Math.floor((now - due) / 86400000);
  return diff > 0 ? diff : 0;
}

function calcDaysRemaining(dueDate?: string): number {
  if (!dueDate) return 0;
  const due = new Date(dueDate).getTime();
  const now = Date.now();
  return Math.ceil((due - now) / 86400000);
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
    label: "Overdue (Warning)",
    className: "bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300 border border-red-300/60 font-bold animate-pulse",
    icon: <AlertTriangle className="h-3 w-3" />,
  },
};

interface MyBorrowsContentProps {
  backHref?: string;
  backLabel?: string;
}

export function MyBorrowsContent({
  backHref = "/dashboard/member",
  backLabel = "Back to Overview",
}: MyBorrowsContentProps) {
  const { data: apiData, isLoading } = useGetMyBorrows();
  const borrows: IBorrow[] = apiData ?? [];

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<BorrowStatus | "ALL">("ALL");

  const filtered = borrows.filter((b) => {
    const term = search.toLowerCase();
    const titleMatch = (b.book?.title ?? "").toLowerCase().includes(term);
    const idMatch = String(b.id).toLowerCase().includes(term);
    const statusMatch = statusFilter === "ALL" || b.status === statusFilter;
    return (titleMatch || idMatch) && statusMatch;
  });

  const activeBorrows = borrows.filter((b) => b.status === "APPROVED").length;
  const pendingBorrows = borrows.filter((b) => b.status === "PENDING").length;
  const overdueBorrows = borrows.filter((b) => b.status === "OVERDUE").length;
  const totalActiveQuota = activeBorrows + pendingBorrows + overdueBorrows;

  const totalFine = borrows
    .filter((b) => b.status === "OVERDUE")
    .reduce((acc, b) => acc + (b.fineAmount || calcDaysOverdue(b.dueDate) * FINE_PER_DAY), 0);

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href={backHref}
            className="inline-flex items-center text-xs text-muted-foreground hover:text-foreground mb-2 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5 mr-1" /> {backLabel}
          </Link>
          <h1 className="text-2xl font-extrabold text-foreground flex items-center gap-2">
            <BookMarked className="h-6 w-6 text-[#004F32]" />
            My Borrow History
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Track your personal borrow requests, reading deadlines (15 pages/day), and return records.
          </p>
        </div>

        {/* Quota Indicator */}
        <div className="rounded-2xl border border-border bg-card p-3.5 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-mono font-extrabold text-sm">
            {totalActiveQuota}/5
          </div>
          <div>
            <p className="text-xs font-bold text-foreground">Active Borrow Quota</p>
            <p className="text-[11px] text-muted-foreground">
              {5 - totalActiveQuota > 0
                ? `${5 - totalActiveQuota} slot(s) available`
                : "Max limit reached. Return a book to borrow more."}
            </p>
          </div>
        </div>
      </div>

      {/* Overdue Warning Alert Banner */}
      {overdueBorrows > 0 && (
        <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-4 sm:p-5 flex items-start gap-3.5 animate-in fade-in-50">
          <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs text-red-900 dark:text-red-200">
            <p className="font-extrabold text-sm">Action Required: Overdue Book Warning ({overdueBorrows} Item)</p>
            <p className="opacity-95 leading-relaxed">
              You have overdue book(s) that must be returned to the RU Islamic Library counter immediately.
            </p>
          </div>
        </div>
      )}

      {/* Status Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-muted-foreground">Pending Approval</span>
            <Clock className="h-4 w-4 text-amber-500" />
          </div>
          <p className="text-2xl font-extrabold text-foreground mt-1">{pendingBorrows}</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-muted-foreground">Active Borrowed</span>
            <BookMarked className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-extrabold text-foreground mt-1">{activeBorrows}</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-muted-foreground">Overdue Items</span>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </div>
          <p className="text-2xl font-extrabold text-red-600 dark:text-red-400 mt-1">{overdueBorrows}</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-muted-foreground">Outstanding Fine</span>
            <Clock className="h-4 w-4 text-amber-600" />
          </div>
          <p className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 mt-1">৳{totalFine}</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by book title or borrow ID..."
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

      {/* Main Borrow Records Table */}
      <div className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-muted-foreground">Loading borrow records...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground text-xs space-y-2">
            <BookOpen className="h-8 w-8 mx-auto text-muted" />
            <p>No personal borrow records found.</p>
            <Link
              href="/books"
              className="inline-flex items-center gap-1 text-primary font-bold hover:underline mt-2 text-xs"
            >
              Browse Library Catalog →
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="px-4 py-3 font-semibold text-muted-foreground">Borrow ID</th>
                  <th className="px-4 py-3 font-semibold text-muted-foreground">Book</th>
                  <th className="px-4 py-3 font-semibold text-muted-foreground">Requested</th>
                  <th className="px-4 py-3 font-semibold text-muted-foreground">Due Date</th>
                  <th className="px-4 py-3 font-semibold text-muted-foreground">Reading Pace / Status</th>
                  <th className="px-4 py-3 font-semibold text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filtered.map((b) => {
                  const cfg = STATUS_CONFIG[b.status] || STATUS_CONFIG.PENDING;
                  const overdueDays = calcDaysOverdue(b.dueDate);
                  const remaining = calcDaysRemaining(b.dueDate);
                  const pages = b.book?.pages || 0;
                  const estimatedDays = Math.max(1, Math.ceil(pages / 15));

                  return (
                    <tr key={b.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-4 font-mono font-bold text-foreground whitespace-nowrap">#{String(b.id)}</td>
                      <td className="px-4 py-4 max-w-[220px]">
                        <p className="font-bold text-foreground line-clamp-1">{b.book?.title ?? `Book #${b.bookId}`}</p>
                        <p className="text-[11px] text-muted-foreground truncate">{b.book?.author ?? "—"}</p>
                        {b.book?.locationCell && (
                          <span className="inline-block mt-1 text-[10px] font-mono bg-muted px-2 py-0.5 rounded-md text-muted-foreground">
                            {b.book.locationCell}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-muted-foreground whitespace-nowrap">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {b.requestedAt ? new Date(b.requestedAt).toLocaleDateString() : "-"}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        {b.status === "PENDING" ? (
                          <span className="text-amber-700 dark:text-amber-300 text-[11px] font-medium flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Est. {estimatedDays}d upon approval
                          </span>
                        ) : b.returnedAt ? (
                          <span className="text-blue-600 dark:text-blue-400 flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            Returned {new Date(b.returnedAt).toLocaleDateString()}
                          </span>
                        ) : (
                          <span className={`flex items-center gap-1 font-mono font-bold ${
                            b.status === "OVERDUE"
                              ? "text-red-600 dark:text-red-400"
                              : remaining <= 3
                              ? "text-amber-600 dark:text-amber-400"
                              : "text-foreground"
                          }`}>
                            <Clock className="h-3 w-3" />
                            {b.dueDate ? new Date(b.dueDate).toLocaleDateString() : "—"}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        {b.status === "OVERDUE" ? (
                          <div>
                            <p className="font-bold text-red-600 dark:text-red-400 flex items-center gap-1">
                              <AlertTriangle className="h-3 w-3" />
                              {overdueDays} days overdue
                            </p>
                            <p className="text-[11px] font-mono font-bold text-red-500">Fine: ৳{overdueDays * FINE_PER_DAY}</p>
                          </div>
                        ) : b.status === "APPROVED" ? (
                          <span className={`font-mono font-medium ${
                            remaining <= 3 ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400"
                          }`}>
                            {remaining > 0 ? `${remaining}d left (15p/day)` : "Due today"}
                          </span>
                        ) : b.status === "PENDING" ? (
                          <span className="text-amber-600 dark:text-amber-400 text-[11px]">
                            Awaiting Approval
                          </span>
                        ) : b.status === "RETURNED" ? (
                          <div>
                            <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-medium">
                              <RefreshCw className="h-3 w-3" /> Completed
                            </span>
                            {b.returnedBy && (
                              <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                                <ShieldCheck className="h-3 w-3 text-emerald-600" />
                                Received by {b.returnedBy.name}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold ${cfg.className}`}>
                          {cfg.icon} {cfg.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Information Footer */}
      <div className="rounded-2xl border border-border bg-muted/20 p-4 flex items-start gap-3 text-xs text-muted-foreground">
        <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-foreground">Library Borrowing Policy &amp; Rules:</p>
          <ul className="list-disc list-inside space-y-0.5">
            <li>Members can request a maximum of 5 books concurrently.</li>
            <li>Due dates are calculated at 1 day per 15 pages (minimum 1 day).</li>
            <li>All borrow requests are processed by the duty shifter on counter.</li>
            <li>An active membership is required to place and maintain borrow requests.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

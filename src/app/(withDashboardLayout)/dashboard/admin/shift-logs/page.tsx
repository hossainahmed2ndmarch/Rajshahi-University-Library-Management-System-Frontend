"use client";

import React, { useState, useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import {
  ClipboardList,
  Clock,
  Banknote,
  TrendingDown,
  TrendingUp,
  CheckCircle2,
  Calendar,
  FileText,
  X,
  User,
  ShieldCheck,
  Trash2,
  CalendarClock,
  XCircle,
  Radio,
  ListChecks,
  ArrowRightLeft,
  Sparkles,
} from "lucide-react";
import { RUTable } from "@/components/ui/RUTable";
import {
  useGetAllShiftLogs,
  useActiveShift,
  useDeleteShiftLog,
  useVerifyShiftLog,
} from "@/hooks/useShifts";
import { StartShiftModal } from "@/components/shifter/StartShiftModal";
import { ScheduleShiftModal } from "@/components/shifter/ScheduleShiftModal";
import { EndShiftModal } from "@/components/shifter/EndShiftModal";
import { CancelShiftModal } from "@/components/shifter/CancelShiftModal";
import { RescheduleShiftModal } from "@/components/shifter/RescheduleShiftModal";
import { CompleteOfflineShiftModal } from "@/components/shift/CompleteOfflineShiftModal";
import { ShiftAuditModal } from "@/components/shift/ShiftAuditModal";
import { IShift } from "@/types/shift";
import { format } from "date-fns";

/* Helper Methods */

function formatDuration(start?: string, end?: string): string {
  if (!start) return "—";
  const startTime = new Date(start).getTime();
  if (isNaN(startTime)) return "—";
  const endTime = end ? new Date(end).getTime() : Date.now();
  const diff = Math.max(0, endTime - startTime);
  const hours = Math.floor(diff / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  return `${hours}h ${minutes}m`;
}

function formatTime(iso?: string): string {
  if (!iso) return "—";
  try {
    return format(new Date(iso), "hh:mm a");
  } catch {
    return String(iso);
  }
}

function formatDate(iso?: string): string {
  if (!iso) return "—";
  try {
    return format(new Date(iso), "EEE, dd MMM yyyy");
  } catch {
    return String(iso);
  }
}

type StatusFilterType =
  | "ALL"
  | "SCHEDULED"
  | "ACTIVE"
  | "COMPLETED"
  | "UNVERIFIED"
  | "CANCELLED";

export default function AdminShiftLogsPage() {
  const { data: apiLogs = [], isLoading } = useGetAllShiftLogs();
  const { data: activeShift } = useActiveShift();
  const { mutate: deleteShiftLog, isPending: isDeleting } = useDeleteShiftLog();
  const { mutate: verifyShiftLog, isPending: isVerifying } = useVerifyShiftLog();

  const shiftLogs: IShift[] = useMemo(() => apiLogs || [], [apiLogs]);

  const [statusFilter, setStatusFilter] = useState<StatusFilterType>("ALL");
  const [auditModalShift, setAuditModalShift] = useState<IShift | null>(null);
  const [deleteShiftId, setDeleteShiftId] = useState<string | number | null>(null);
  const [cancelModalShift, setCancelModalShift] = useState<IShift | null>(null);
  const [rescheduleModalShift, setRescheduleModalShift] = useState<IShift | null>(null);
  const [offlineModalShift, setOfflineModalShift] = useState<IShift | null>(null);
  
  const [startShiftModalOpen, setStartShiftModalOpen] = useState(false);
  const [scheduleShiftModalOpen, setScheduleShiftModalOpen] = useState(false);
  const [endShiftModalOpen, setEndShiftModalOpen] = useState(false);

  const isShiftActive = Boolean(activeShift && activeShift.status === "ACTIVE");

  const { stats, filterCounts } = useMemo(() => {
    let collected = 0;
    let txns = 0;
    let variance = 0;

    const counts = {
      ALL: shiftLogs.length,
      ACTIVE: 0,
      SCHEDULED: 0,
      COMPLETED: 0,
      UNVERIFIED: 0,
      CANCELLED: 0,
    };

    for (let i = 0; i < shiftLogs.length; i++) {
      const s = shiftLogs[i];
      collected += s.totalCashCollected ?? s.cashCollected ?? 0;
      txns += s.totalTransactions ?? 0;
      variance += s.cashVariance ?? 0;

      if (s.status === "ACTIVE") counts.ACTIVE++;
      else if (s.status === "SCHEDULED") counts.SCHEDULED++;
      else if (s.status === "CANCELLED") counts.CANCELLED++;
      else if (s.status === "COMPLETED") {
        counts.COMPLETED++;
        if (!s.verifiedById && !s.verifiedBy) {
          counts.UNVERIFIED++;
        }
      }
    }

    return {
      stats: {
        totalShifts: shiftLogs.length,
        totalCollected: collected,
        totalTxns: txns,
        netVariance: variance,
      },
      filterCounts: counts,
    };
  }, [shiftLogs]);

  const filteredLogs = useMemo(() => {
    if (statusFilter === "ALL") return shiftLogs;
    if (statusFilter === "UNVERIFIED") {
      return shiftLogs.filter(
        (s) => s.status === "COMPLETED" && !s.verifiedById && !s.verifiedBy
      );
    }
    return shiftLogs.filter((s) => s.status === statusFilter);
  }, [shiftLogs, statusFilter]);

  const handleDeleteConfirm = () => {
    if (deleteShiftId) {
      deleteShiftLog(deleteShiftId, {
        onSuccess: () => setDeleteShiftId(null),
      });
    }
  };

  const columns = useMemo<ColumnDef<IShift>[]>(
    () => [
      {
        accessorKey: "id",
        header: "Shift Ref",
        cell: ({ row }) => (
          <span className="font-mono font-bold text-xs text-primary bg-primary/10 px-2 py-1 rounded-md">
            #{String(row.original.id).slice(-8).toUpperCase()}
          </span>
        ),
      },
      {
        accessorKey: "shifterName",
        header: "Duty Shifter & Date",
        cell: ({ row }) => {
          const s = row.original;
          return (
            <div className="space-y-1 py-1">
              <div className="font-semibold text-foreground text-xs flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <span className="truncate max-w-[140px] sm:max-w-[180px]">
                  {s.shifterName || s.shifter?.name || "Duty Shifter"}
                </span>
              </div>
              <div className="text-[11px] text-muted-foreground font-mono flex items-center gap-1">
                <span>{formatDate(s.startTime)}</span>
                <span>•</span>
                <span>
                  {formatTime(s.startTime)} → {s.endTime ? formatTime(s.endTime) : "Active"}
                </span>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "startTime",
        header: "Duration",
        cell: ({ row }) => {
          const s = row.original;
          return (
            <span className="font-mono text-xs text-foreground font-medium flex items-center gap-1 whitespace-nowrap">
              <Clock className="h-3 w-3 text-muted-foreground" />
              {formatDuration(s.startTime, s.endTime)}
            </span>
          );
        },
      },
      {
        accessorKey: "openingCash",
        header: "Opening Float",
        cell: ({ row }) => (
          <span className="font-mono text-xs text-foreground font-medium whitespace-nowrap">
            ৳{(row.original.openingCash ?? row.original.startingCash ?? 0).toLocaleString()}
          </span>
        ),
      },
      {
        accessorKey: "cashCollected",
        header: "Collected",
        cell: ({ row }) => (
          <span className="font-mono font-bold text-xs text-amber-600 dark:text-amber-400 whitespace-nowrap">
            +৳{(row.original.cashCollected ?? row.original.totalCashCollected ?? 0).toLocaleString()}
          </span>
        ),
      },
      {
        accessorKey: "closingCash",
        header: "Closing Float",
        cell: ({ row }) => {
          const closing = row.original.closingCash ?? row.original.endingCash;
          return (
            <span className="font-mono text-xs text-foreground font-medium whitespace-nowrap">
              {closing != null ? `৳${closing.toLocaleString()}` : "—"}
            </span>
          );
        },
      },
      {
        accessorKey: "cashVariance",
        header: "Variance",
        cell: ({ row }) => {
          const v = row.original.cashVariance ?? 0;
          const color =
            v === 0
              ? "text-muted-foreground"
              : v > 0
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-red-600 dark:text-red-400";

          return (
            <span className={`inline-flex items-center gap-1 font-mono font-bold text-xs ${color} whitespace-nowrap`}>
              {v > 0 ? (
                <TrendingUp className="h-3.5 w-3.5 shrink-0" />
              ) : v < 0 ? (
                <TrendingDown className="h-3.5 w-3.5 shrink-0" />
              ) : (
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
              )}
              {v >= 0 ? `+৳${v}` : `-৳${Math.abs(v)}`}
            </span>
          );
        },
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const status = row.original.status;
          if (status === "ACTIVE") {
            return (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 font-bold text-[10px] tracking-wide uppercase">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                Active
              </span>
            );
          }
          if (status === "SCHEDULED") {
            return (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-300 font-bold text-[10px] tracking-wide uppercase">
                <Calendar className="h-3 w-3" />
                Scheduled
              </span>
            );
          }
          if (status === "CANCELLED") {
            return (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-700 dark:text-rose-300 font-bold text-[10px] tracking-wide uppercase">
                <X className="h-3 w-3" />
                Cancelled
              </span>
            );
          }
          return (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-muted border border-border text-muted-foreground font-bold text-[10px] tracking-wide uppercase">
              <CheckCircle2 className="h-3 w-3 text-emerald-600" />
              Completed
            </span>
          );
        },
      },
      {
        accessorKey: "totalTransactions",
        header: "Txns",
        cell: ({ row }) => (
          <span className="inline-flex items-center justify-center h-6 min-w-6 px-1.5 rounded-full bg-muted border border-border font-mono font-semibold text-xs text-foreground">
            {row.original.totalTransactions ?? 0}
          </span>
        ),
      },
      {
        id: "tasksAndHandover",
        header: "Handover & Tasks",
        cell: ({ row }) => {
          const s = row.original;
          const hasTasks = Boolean(s.tasksCompleted);
          const hasHandover = Boolean(s.handoverNotes || s.notes);

          if (!hasTasks && !hasHandover) {
            return <span className="text-muted-foreground/70 text-xs italic">No notes</span>;
          }

          return (
            <button
              type="button"
              onClick={() => setAuditModalShift(s)}
              className="space-y-1 text-left max-w-[190px] group cursor-pointer focus:outline-none"
              title="Click to view full shift audit details"
            >
              {hasTasks && (
                <div className="flex items-start gap-1 text-[11px] text-foreground font-medium group-hover:text-primary transition-colors">
                  <ListChecks className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="truncate">{s.tasksCompleted}</span>
                </div>
              )}
              {hasHandover && (
                <div className="flex items-start gap-1 text-[11px] text-amber-700 dark:text-amber-400 font-medium">
                  <ArrowRightLeft className="h-3 w-3 text-amber-600 shrink-0 mt-0.5" />
                  <span className="truncate">{s.handoverNotes || s.notes}</span>
                </div>
              )}
            </button>
          );
        },
      },
      {
        id: "supervisorAudit",
        header: "Supervisor Audit",
        cell: ({ row }) => {
          const s = row.original;
          const isAudited = Boolean(s.verifiedById || s.verifiedBy);

          if (isAudited) {
            return (
              <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 whitespace-nowrap">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                <span className="truncate max-w-[100px]">
                  {s.verifiedBy?.name?.split(" ")[0] || "Audited"}
                </span>
              </span>
            );
          }

          if (s.status === "COMPLETED") {
            return (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  verifyShiftLog(s.id);
                }}
                disabled={isVerifying}
                className="inline-flex items-center gap-1 rounded-lg border border-primary/30 bg-primary/10 hover:bg-primary hover:text-primary-foreground px-2.5 py-1 text-[11px] font-semibold text-primary transition-all active:scale-95 disabled:opacity-50 cursor-pointer whitespace-nowrap"
                title="Audit & verify shift record"
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Verify Audit</span>
              </button>
            );
          }

          return (
            <span className="text-[11px] text-muted-foreground/70 font-mono">Pending</span>
          );
        },
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const shift = row.original;
          return (
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => setAuditModalShift(shift)}
                className="inline-flex items-center gap-1 rounded-lg border border-input bg-background hover:bg-accent px-2.5 py-1 text-[11px] font-semibold text-foreground transition-all active:scale-95 cursor-pointer shadow-xs"
                title="Inspect Complete Shift Audit"
              >
                <FileText className="h-3.5 w-3.5 text-primary" />
                <span className="hidden sm:inline">Details</span>
              </button>

              {shift.status === "SCHEDULED" && (
                <>
                  <button
                    type="button"
                    onClick={() => setRescheduleModalShift(shift)}
                    className="inline-flex items-center gap-1 rounded-lg border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 px-2 py-1 text-[11px] font-semibold text-amber-800 dark:text-amber-300 transition-all active:scale-95 cursor-pointer"
                    title="Reschedule Shift"
                  >
                    <CalendarClock className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setCancelModalShift(shift)}
                    className="inline-flex items-center gap-1 rounded-lg border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 px-2 py-1 text-[11px] font-semibold text-red-700 dark:text-red-300 transition-all active:scale-95 cursor-pointer"
                    title="Cancel Shift"
                  >
                    <XCircle className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setOfflineModalShift(shift)}
                    className="inline-flex items-center gap-1 rounded-lg border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 px-2 py-1 text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 transition-all active:scale-95 cursor-pointer"
                    title="Complete Shift"
                  >
                    <CheckCircle2 className="h-3 w-3" />
                  </button>
                </>
              )}

              {shift.status === "ACTIVE" && (
                <button
                  type="button"
                  onClick={() => setEndShiftModalOpen(true)}
                  className="inline-flex items-center gap-1 rounded-lg border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 px-2.5 py-1 text-[11px] font-semibold text-amber-800 dark:text-amber-300 transition-all active:scale-95 cursor-pointer"
                  title="End & Reconcile Active Shift"
                >
                  <Clock className="h-3 w-3" />
                  <span>Reconcile</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setDeleteShiftId(shift.id)}
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-input bg-background hover:bg-destructive/10 hover:border-destructive/30 text-destructive transition-all active:scale-95 cursor-pointer shrink-0"
                title="Delete Shift Log Record"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          );
        },
      },
    ],
    [isVerifying, verifyShiftLog]
  );

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-8">
      {/* Top Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950 via-emerald-900 to-amber-950 p-6 sm:p-8 text-white shadow-xl border border-emerald-800/40">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-amber-300 border border-white/10 backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Shift Float & Register Audit</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-3">
              <ClipboardList className="h-7 w-7 text-amber-400 shrink-0" />
              <span>Shift Logs & Reconciliation</span>
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/80 max-w-2xl leading-relaxed">
              Administrative control desk for monitoring active duty shifts, cash floats, transactions, counter collections, and supervisor audits.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {!isShiftActive ? (
              <button
                type="button"
                onClick={() => setStartShiftModalOpen(true)}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 px-4 py-2.5 text-xs font-bold shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
              >
                <Clock className="h-4 w-4" />
                <span>Start Duty Shift</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setEndShiftModalOpen(true)}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 px-4 py-2.5 text-xs font-bold shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
              >
                <Clock className="h-4 w-4" />
                <span>End Shift & Reconcile</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setScheduleShiftModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-xs px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
            >
              <Calendar className="h-4 w-4 text-amber-300" />
              <span>Schedule Advance Shift</span>
            </button>
          </div>
        </div>
      </div>

      {/* Active Shift Desk Banner */}
      {isShiftActive && activeShift && (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm backdrop-blur-xs">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="h-11 w-11 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
              <Radio className="h-5 w-5 animate-pulse" />
            </div>
            <div className="min-w-0 space-y-0.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-black tracking-wider text-emerald-900 dark:text-emerald-200 uppercase">
                  Current Live Shift
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold">
                  <span className="h-1.5 w-1.5 rounded-full bg-white animate-ping" />
                  LIVE DESK
                </span>
              </div>
              <p className="text-sm font-bold text-foreground truncate">
                {activeShift.shifter?.name || activeShift.shifterName || "Duty Staff"} • Started:{" "}
                {formatTime(activeShift.startTime)} ({formatDuration(activeShift.startTime)})
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setEndShiftModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-sm transition-all active:scale-95 cursor-pointer shrink-0"
          >
            <Clock className="h-4 w-4" />
            <span>End Shift & Reconcile Float</span>
          </button>
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 space-y-2 shadow-xs hover:shadow-md hover:border-primary/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Total Shifts
            </span>
            <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <ClipboardList className="h-5 w-5" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-foreground">
            {stats.totalShifts}
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 space-y-2 shadow-xs hover:shadow-md hover:border-blue-500/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Total Transactions
            </span>
            <div className="h-9 w-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <FileText className="h-5 w-5" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-foreground">
            {stats.totalTxns}
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 space-y-2 shadow-xs hover:shadow-md hover:border-amber-500/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Cash Collected
            </span>
            <div className="h-9 w-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Banknote className="h-5 w-5" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400">
            ৳{stats.totalCollected.toLocaleString()}
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 space-y-2 shadow-xs hover:shadow-md hover:border-emerald-500/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Net Float Variance
            </span>
            <div className="h-9 w-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <p
            className={`text-2xl sm:text-3xl font-black ${
              stats.netVariance >= 0
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-red-600 dark:text-red-400"
            }`}
          >
            {stats.netVariance >= 0
              ? `+৳${stats.netVariance}`
              : `-৳${Math.abs(stats.netVariance)}`}
          </p>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="pt-2">
        <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-muted/70 border border-border overflow-x-auto no-scrollbar">
          {[
            { id: "ALL", label: "All Logs", count: filterCounts.ALL },
            { id: "ACTIVE", label: "Active", count: filterCounts.ACTIVE },
            { id: "SCHEDULED", label: "Scheduled", count: filterCounts.SCHEDULED },
            { id: "COMPLETED", label: "Completed", count: filterCounts.COMPLETED },
            { id: "UNVERIFIED", label: "Pending Audit", count: filterCounts.UNVERIFIED },
            { id: "CANCELLED", label: "Cancelled", count: filterCounts.CANCELLED },
          ].map((tab) => {
            const isActive = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id as StatusFilterType)}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer select-none ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-background/60"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                    isActive
                      ? "bg-primary-foreground/20 text-primary-foreground"
                      : "bg-muted-foreground/15 text-muted-foreground"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Datatable Component */}
      <div className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden">
        <RUTable
          columns={columns}
          data={filteredLogs}
          isLoading={isLoading}
          searchPlaceholder="Filter shift logs by shifter name or reference ID..."
        />
      </div>

      {/* Audit & Action Modals */}
      <ShiftAuditModal
        shift={auditModalShift}
        isOpen={Boolean(auditModalShift)}
        onClose={() => setAuditModalShift(null)}
        canVerify={true}
      />

      {deleteShiftId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in-50">
          <div className="relative w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-2xl text-card-foreground text-center space-y-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-destructive mx-auto">
              <Trash2 className="h-6 w-6" />
            </div>

            <div className="space-y-1">
              <h3 className="font-extrabold text-base text-foreground">
                Delete Shift Audit Record?
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                This administrative action will permanently remove this shift audit log and its reconciliation float record.
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteShiftId(null)}
                className="px-4 py-2 text-xs font-semibold rounded-xl border border-input bg-background hover:bg-accent text-foreground transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-destructive hover:bg-red-700 text-destructive-foreground shadow-sm disabled:opacity-50 transition-all cursor-pointer"
              >
                {isDeleting ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      <StartShiftModal
        isOpen={startShiftModalOpen}
        onClose={() => setStartShiftModalOpen(false)}
      />

      <ScheduleShiftModal
        isOpen={scheduleShiftModalOpen}
        onClose={() => setScheduleShiftModalOpen(false)}
      />

      <EndShiftModal
        isOpen={endShiftModalOpen}
        onClose={() => setEndShiftModalOpen(false)}
        activeShift={activeShift || null}
      />

      <CancelShiftModal
        isOpen={Boolean(cancelModalShift)}
        onClose={() => setCancelModalShift(null)}
        shift={cancelModalShift}
      />

      <RescheduleShiftModal
        isOpen={Boolean(rescheduleModalShift)}
        onClose={() => setRescheduleModalShift(null)}
        shift={rescheduleModalShift}
      />

      {offlineModalShift && (
        <CompleteOfflineShiftModal
          open={Boolean(offlineModalShift)}
          onOpenChange={(open) => {
            if (!open) setOfflineModalShift(null);
          }}
          shiftId={offlineModalShift.id}
          shifterName={
            offlineModalShift.shifter?.name ||
            offlineModalShift.shifterName ||
            "Shifter"
          }
        />
      )}
    </div>
  );
}
"use client";

import React, { useState } from "react";
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
} from "lucide-react";
import { RUTable } from "@/components/ui/RUTable";
import { useGetAllShiftLogs, useActiveShift, useDeleteShiftLog } from "@/hooks/useShifts";
import { StartShiftModal } from "@/components/shifter/StartShiftModal";
import { ScheduleShiftModal } from "@/components/shifter/ScheduleShiftModal";
import { EndShiftModal } from "@/components/shifter/EndShiftModal";
import { CancelShiftModal } from "@/components/shifter/CancelShiftModal";
import { RescheduleShiftModal } from "@/components/shifter/RescheduleShiftModal";
import { CompleteOfflineShiftModal } from "@/components/shift/CompleteOfflineShiftModal";
import { IShift } from "@/types/shift";
import { format } from "date-fns";

function formatDuration(start?: string, end?: string): string {
  if (!start) return "—";
  const s = new Date(start).getTime();
  if (isNaN(s)) return "—";
  const e = end ? new Date(end).getTime() : Date.now();
  const diff = Math.max(0, e - s);
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  return `${h}h ${m}m`;
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

export default function AdminShiftLogsPage() {
  const { data: apiLogs = [], isLoading } = useGetAllShiftLogs();
  const { data: activeShift } = useActiveShift();
  const { mutate: deleteShiftLog, isPending: isDeleting } = useDeleteShiftLog();
  const shiftLogs: IShift[] = apiLogs;

  const [statusFilter, setStatusFilter] = useState<"ALL" | "SCHEDULED" | "ACTIVE" | "COMPLETED" | "CANCELLED">("ALL");
  const [selectedNote, setSelectedNote] = useState<IShift | null>(null);
  const [deleteShiftId, setDeleteShiftId] = useState<string | number | null>(null);
  const [cancelModalShift, setCancelModalShift] = useState<IShift | null>(null);
  const [rescheduleModalShift, setRescheduleModalShift] = useState<IShift | null>(null);
  const [offlineModalShift, setOfflineModalShift] = useState<IShift | null>(null);
  const [startShiftModalOpen, setStartShiftModalOpen] = useState(false);
  const [scheduleShiftModalOpen, setScheduleShiftModalOpen] = useState(false);
  const [endShiftModalOpen, setEndShiftModalOpen] = useState(false);

  const isShiftActive = activeShift && activeShift.status === "ACTIVE";

  const filteredLogs = React.useMemo(() => {
    if (statusFilter === "ALL") return shiftLogs;
    return shiftLogs.filter((s) => s.status === statusFilter);
  }, [shiftLogs, statusFilter]);

  const totalShifts = shiftLogs.length;
  const totalCollected = shiftLogs.reduce((acc, s) => acc + (s.totalCashCollected ?? 0), 0);
  const totalTxns = shiftLogs.reduce((acc, s) => acc + (s.totalTransactions ?? 0), 0);
  const netVariance = shiftLogs.reduce((acc, s) => acc + (s.cashVariance ?? 0), 0);

  const handleDeleteConfirm = () => {
    if (deleteShiftId) {
      deleteShiftLog(deleteShiftId, {
        onSuccess: () => setDeleteShiftId(null),
      });
    }
  };

  const columns: ColumnDef<IShift>[] = [
    {
      accessorKey: "id",
      header: "Shift Reference",
      cell: ({ row }) => (
        <span className="font-mono font-bold text-xs text-primary">
          {String(row.original.id).slice(-10).toUpperCase()}
        </span>
      ),
    },
    {
      accessorKey: "shifterName",
      header: "Duty Shifter & Date",
      cell: ({ row }) => {
        const s = row.original;
        return (
          <div className="space-y-0.5">
            <div className="font-bold text-foreground text-xs flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-muted-foreground" />
              <span>{s.shifterName || "Duty Shifter"}</span>
            </div>
            <div className="text-[11px] text-muted-foreground font-mono">
              {formatDate(s.startTime)} • {formatTime(s.startTime)} → {s.endTime ? formatTime(s.endTime) : "Active"}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "startTime",
      header: "Duty Duration",
      cell: ({ row }) => {
        const s = row.original;
        return (
          <span className="font-mono font-bold text-xs text-foreground flex items-center gap-1">
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
        <span className="font-mono font-bold text-xs text-foreground">
          ৳{(row.original.openingCash ?? row.original.startingCash)?.toLocaleString() ?? 0}
        </span>
      ),
    },
    {
      accessorKey: "cashCollected",
      header: "Collected",
      cell: ({ row }) => (
        <span className="font-mono font-bold text-xs text-amber-600 dark:text-amber-400">
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
          <span className="font-mono font-bold text-xs text-foreground">
            {closing != null ? `৳${closing.toLocaleString()}` : "-"}
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
            ? "text-foreground"
            : v > 0
            ? "text-emerald-600 dark:text-emerald-400"
            : "text-red-600 dark:text-red-400";

        return (
          <span className={`inline-flex items-center gap-1 font-mono font-extrabold text-xs ${color}`}>
            {v > 0 ? (
              <TrendingUp className="h-3.5 w-3.5" />
            ) : v < 0 ? (
              <TrendingDown className="h-3.5 w-3.5" />
            ) : (
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
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
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold text-[10px]">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
              Active
            </span>
          );
        }
        if (status === "SCHEDULED") {
          return (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-bold text-[10px]">
              <Calendar className="h-3 w-3" />
              Scheduled
            </span>
          );
        }
        if (status === "CANCELLED") {
          return (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 font-bold text-[10px]">
              <X className="h-3 w-3" />
              Cancelled
            </span>
          );
        }
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-muted text-muted-foreground font-bold text-[10px]">
            <CheckCircle2 className="h-3 w-3 text-emerald-600" />
            Completed
          </span>
        );
      },
    },
    {
      accessorKey: "totalTransactions",
      header: "Txn Count",
      cell: ({ row }) => (
        <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-muted font-mono font-bold text-xs text-foreground">
          {row.original.totalTransactions ?? 0}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Audit Actions",
      cell: ({ row }) => {
        const shift = row.original;
        const noteContent = shift.handoverNotes || shift.notes;
        return (
          <div className="flex items-center space-x-1.5">
            {shift.status === "SCHEDULED" && (
              <>
                <button
                  onClick={() => setRescheduleModalShift(shift)}
                  className="inline-flex items-center gap-1 rounded-lg border border-amber-300 dark:border-amber-700 bg-amber-500/10 hover:bg-amber-500/20 px-2 py-1 text-[11px] font-bold text-amber-800 dark:text-amber-300 transition-colors cursor-pointer"
                  title="Reschedule Shift"
                >
                  <CalendarClock className="h-3 w-3" />
                  <span>Reschedule</span>
                </button>
                <button
                  onClick={() => setCancelModalShift(shift)}
                  className="inline-flex items-center gap-1 rounded-lg border border-red-200 dark:border-red-900 bg-red-500/10 hover:bg-red-500/20 px-2 py-1 text-[11px] font-bold text-red-700 dark:text-red-300 transition-colors cursor-pointer"
                  title="Cancel Shift"
                >
                  <XCircle className="h-3 w-3" />
                  <span>Cancel</span>
                </button>
                <button
                  onClick={() => setOfflineModalShift(shift)}
                  className="inline-flex items-center gap-1 rounded-lg border border-emerald-300 dark:border-emerald-700 bg-emerald-500/10 hover:bg-emerald-500/20 px-2 py-1 text-[11px] font-bold text-emerald-800 dark:text-emerald-300 transition-colors cursor-pointer"
                  title="Complete Shift on behalf of shifter"
                >
                  <CheckCircle2 className="h-3 w-3" />
                  <span>Complete</span>
                </button>
              </>
            )}
            {shift.status === "ACTIVE" && (
              <button
                onClick={() => setEndShiftModalOpen(true)}
                className="inline-flex items-center gap-1 rounded-lg border border-amber-400 bg-amber-500/10 hover:bg-amber-500/20 px-2 py-1 text-[11px] font-bold text-amber-800 dark:text-amber-300 transition-colors cursor-pointer"
                title="End & Reconcile Active Shift"
              >
                <Clock className="h-3 w-3" />
                <span>Reconcile</span>
              </button>
            )}
            {noteContent ? (
              <button
                onClick={() => setSelectedNote(shift)}
                className="inline-flex items-center space-x-1 rounded-lg border border-input bg-background hover:bg-accent px-2.5 py-1 text-xs font-semibold text-foreground transition-colors cursor-pointer"
                title="View Audit Notes"
              >
                <FileText className="h-3.5 w-3.5 text-primary" />
                <span>Notes</span>
              </button>
            ) : null}
            <button
              onClick={() => setDeleteShiftId(shift.id)}
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-input bg-background hover:bg-red-500/10 text-destructive transition-colors cursor-pointer"
              title="Delete Shift Log Record (Admin Audit)"
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
      <div className="rounded-2xl bg-gradient-to-r from-[#003824] via-[#004F32] to-[#C78700] p-6 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight flex items-center gap-2">
            <ClipboardList className="h-6 w-6 text-amber-300" />
            <span>Shift Float &amp; Counter Audit</span>
          </h1>
          <p className="mt-1 text-xs text-emerald-100/90 max-w-xl">
            Administrative audit log for all shifter counter desks, daily cash floats, collection totals, and reconciliation variances.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {!isShiftActive ? (
            <button
              onClick={() => setStartShiftModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-amber-400 hover:bg-amber-300 px-4 py-2.5 text-xs font-bold text-stone-900 shadow-md transition-all cursor-pointer"
            >
              <Clock className="h-3.5 w-3.5" />
              <span>Start Duty Shift</span>
            </button>
          ) : (
            <button
              onClick={() => setEndShiftModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-amber-400 hover:bg-amber-300 px-4 py-2.5 text-xs font-extrabold text-stone-900 shadow-md transition-all cursor-pointer"
            >
              <Clock className="h-3.5 w-3.5" />
              <span>End Shift &amp; Reconcile</span>
            </button>
          )}

          <button
            onClick={() => setScheduleShiftModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 px-3.5 py-2.5 text-xs font-semibold text-white shadow-xs transition-all cursor-pointer"
          >
            <Calendar className="h-3.5 w-3.5 text-amber-300" />
            <span>Schedule Advance Shift</span>
          </button>
        </div>
      </div>

      {/* Active Shift Desk Banner */}
      {isShiftActive && activeShift && (
        <div className="rounded-2xl border border-emerald-300 dark:border-emerald-800 bg-emerald-500/10 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-10 w-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Radio className="h-5 w-5 animate-pulse" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold text-emerald-900 dark:text-emerald-200">
                  CURRENTLY ACTIVE DUTY DESK
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold">
                  <span className="h-1.5 w-1.5 rounded-full bg-white animate-ping" />
                  LIVE
                </span>
              </div>
              <p className="text-sm font-bold text-foreground truncate mt-0.5">
                {activeShift.shifter?.name || activeShift.shifterName || "Duty Staff"} • Started: {formatTime(activeShift.startTime)} ({formatDuration(activeShift.startTime)})
              </p>
            </div>
          </div>
          <button
            onClick={() => setEndShiftModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-sm transition-colors cursor-pointer shrink-0"
          >
            <Clock className="h-3.5 w-3.5" />
            <span>End Shift &amp; Reconcile Float</span>
          </button>
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-border bg-card p-4 space-y-1 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Completed Shifts</span>
            <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <ClipboardList className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-foreground">{totalShifts}</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 space-y-1 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Total Transactions</span>
            <div className="h-8 w-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <FileText className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-foreground">{totalTxns}</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 space-y-1 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Cash Collected</span>
            <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Banknote className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-amber-600 dark:text-amber-400">৳{totalCollected.toLocaleString()}</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 space-y-1 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Net Float Variance</span>
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <p className={`text-2xl font-extrabold ${netVariance >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
            {netVariance >= 0 ? `+৳${netVariance}` : `-৳${Math.abs(netVariance)}`}
          </p>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-2xl bg-muted/60 border border-border">
          {[
            { id: "ALL", label: "All Records", count: shiftLogs.length },
            { id: "ACTIVE", label: "Active", count: shiftLogs.filter((s) => s.status === "ACTIVE").length },
            { id: "SCHEDULED", label: "Scheduled", count: shiftLogs.filter((s) => s.status === "SCHEDULED").length },
            { id: "COMPLETED", label: "Completed", count: shiftLogs.filter((s) => s.status === "COMPLETED").length },
            { id: "CANCELLED", label: "Cancelled", count: shiftLogs.filter((s) => s.status === "CANCELLED").length },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id as any)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                statusFilter === tab.id
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono ${
                  statusFilter === tab.id
                    ? "bg-white/20 text-white"
                    : "bg-muted-foreground/15 text-muted-foreground"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Datatable */}
      <RUTable
        columns={columns}
        data={filteredLogs}
        isLoading={isLoading}
        searchPlaceholder="Filter shift logs by shifter name or reference ID..."
      />

      {/* Modal: View Shift Audit Notes */}
      {selectedNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in-50">
          <div className="relative w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl text-card-foreground space-y-4">
            <button
              onClick={() => setSelectedNote(null)}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center space-x-3 pb-3 border-b border-border">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-foreground">Shift Audit Log Notes</h3>
                <p className="text-xs text-muted-foreground">
                  {selectedNote.shifterName || "Shifter"} • {formatDate(selectedNote.startTime)}
                </p>
              </div>
            </div>

            <div className="rounded-xl bg-muted/40 p-4 text-xs text-foreground leading-relaxed border border-border">
              {selectedNote.handoverNotes || selectedNote.notes}
            </div>

            <div className="grid grid-cols-3 gap-3 text-xs pt-1">
              <div className="rounded-xl border border-border bg-card p-2.5 text-center">
                <span className="text-[10px] text-muted-foreground block">Opening Float</span>
                <span className="font-mono font-bold text-foreground">৳{selectedNote.openingCash ?? selectedNote.startingCash}</span>
              </div>
              <div className="rounded-xl border border-border bg-card p-2.5 text-center">
                <span className="text-[10px] text-muted-foreground block">Cash Collected</span>
                <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                  ৳{selectedNote.cashCollected ?? selectedNote.totalCashCollected ?? 0}
                </span>
              </div>
              <div className="rounded-xl border border-border bg-card p-2.5 text-center">
                <span className="text-[10px] text-muted-foreground block">Variance</span>
                <span
                  className={`font-mono font-bold ${
                    (selectedNote.cashVariance ?? 0) >= 0
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {(selectedNote.cashVariance ?? 0) >= 0 ? "+" : ""}৳{selectedNote.cashVariance ?? 0}
                </span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedNote(null)}
                className="px-4 py-2 text-xs font-semibold rounded-lg border border-input bg-background hover:bg-accent text-foreground cursor-pointer"
              >
                Close Audit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Delete Shift Log Confirmation */}
      {deleteShiftId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in-50">
          <div className="relative w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-2xl text-card-foreground text-center space-y-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-destructive mx-auto">
              <Trash2 className="h-6 w-6" />
            </div>

            <div>
              <h3 className="font-bold text-base text-foreground">Delete Shift Audit Record?</h3>
              <p className="text-xs text-muted-foreground mt-1">
                This administrative action will permanently remove this shift audit log and its reconciliation float record.
              </p>
            </div>

            <div className="flex justify-center space-x-2 pt-2">
              <button
                onClick={() => setDeleteShiftId(null)}
                className="px-4 py-2 text-xs font-semibold rounded-lg border border-input bg-background hover:bg-accent text-foreground cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="px-4 py-2 text-xs font-bold rounded-lg bg-destructive hover:bg-red-700 text-destructive-foreground shadow-2xs disabled:opacity-50 cursor-pointer"
              >
                {isDeleting ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Shift Action Modals */}
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

      {/* Admin Action: Cancel Shift Modal */}
      <CancelShiftModal
        isOpen={Boolean(cancelModalShift)}
        onClose={() => setCancelModalShift(null)}
        shift={cancelModalShift}
      />

      {/* Admin Action: Reschedule Shift Modal */}
      <RescheduleShiftModal
        isOpen={Boolean(rescheduleModalShift)}
        onClose={() => setRescheduleModalShift(null)}
        shift={rescheduleModalShift}
      />

      {/* Admin Action: Complete Offline Shift Modal */}
      {offlineModalShift && (
        <CompleteOfflineShiftModal
          open={Boolean(offlineModalShift)}
          onOpenChange={(open) => {
            if (!open) setOfflineModalShift(null);
          }}
          shiftId={offlineModalShift.id}
          shifterName={offlineModalShift.shifter?.name || offlineModalShift.shifterName || "Shifter"}
        />
      )}
    </div>
  );
}

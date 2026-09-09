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
} from "lucide-react";
import { RUTable } from "@/components/ui/RUTable";
import { useGetAllShiftLogs, useActiveShift, useDeleteShiftLog } from "@/hooks/useShifts";
import { StartShiftModal } from "@/components/shifter/StartShiftModal";
import { ScheduleShiftModal } from "@/components/shifter/ScheduleShiftModal";
import { EndShiftModal } from "@/components/shifter/EndShiftModal";
import { IShift } from "@/types/shift";

const SEED_ADMIN_SHIFT_LOGS: IShift[] = [
  {
    id: "shift_2026_08_14_001",
    shifterId: "usr_103",
    shifterName: "Hasan Mahmud (Shifter)",
    status: "COMPLETED",
    startTime: "2026-08-14T08:00:00.000Z",
    endTime: "2026-08-14T15:00:00.000Z",
    openingCash: 2000,
    startingCash: 2000,
    closingCash: 3250,
    endingCash: 3250,
    expectedCash: 3200,
    cashVariance: 50,
    totalTransactions: 12,
    cashCollected: 1250,
    totalCashCollected: 1250,
    handoverNotes: "Normal morning-afternoon shift. All book checkouts logged with correct fees. Small surplus from rounded change.",
    notes: "Normal morning-afternoon shift. All book checkouts logged with correct fees. Small surplus from rounded change.",
  },
  {
    id: "shift_2026_08_13_001",
    shifterId: "usr_103",
    shifterName: "Hasan Mahmud (Shifter)",
    status: "COMPLETED",
    startTime: "2026-08-13T08:00:00.000Z",
    endTime: "2026-08-13T16:00:00.000Z",
    openingCash: 2000,
    startingCash: 2000,
    closingCash: 4100,
    endingCash: 4100,
    expectedCash: 4200,
    cashVariance: -100,
    totalTransactions: 18,
    cashCollected: 2200,
    totalCashCollected: 2200,
    handoverNotes: "High footfall during university break. Variance likely due to two manual fee records that were corrected after closing.",
    notes: "High footfall during university break. Variance likely due to two manual fee records that were corrected after closing.",
  },
  {
    id: "shift_2026_08_12_001",
    shifterId: "usr_104",
    shifterName: "Fatima Khanam",
    status: "COMPLETED",
    startTime: "2026-08-12T09:00:00.000Z",
    endTime: "2026-08-12T17:00:00.000Z",
    openingCash: 1500,
    startingCash: 1500,
    closingCash: 2800,
    endingCash: 2800,
    expectedCash: 2800,
    cashVariance: 0,
    totalTransactions: 10,
    cashCollected: 1300,
    totalCashCollected: 1300,
    handoverNotes: "Perfect float reconciliation. No overdue fines or discrepancy noted.",
    notes: "Perfect float reconciliation. No overdue fines or discrepancy noted.",
  },
  {
    id: "shift_2026_08_11_001",
    shifterId: "usr_104",
    shifterName: "Fatima Khanam",
    status: "COMPLETED",
    startTime: "2026-08-11T09:00:00.000Z",
    endTime: "2026-08-11T16:30:00.000Z",
    openingCash: 1500,
    startingCash: 1500,
    closingCash: 2650,
    endingCash: 2650,
    expectedCash: 2600,
    cashVariance: 50,
    totalTransactions: 9,
    cashCollected: 1150,
    totalCashCollected: 1150,
    handoverNotes: "Quiet afternoon session. Library inventory check conducted.",
    notes: "Quiet afternoon session. Library inventory check conducted.",
  },
];

function formatDuration(start: string, end?: string): string {
  const s = new Date(start).getTime();
  const e = end ? new Date(end).getTime() : Date.now();
  const diff = Math.max(0, e - s);
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  return `${h}h ${m}m`;
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-BD", { hour: "2-digit", minute: "2-digit" });
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-BD", { weekday: "short", year: "numeric", month: "short", day: "numeric" });
}

export default function AdminShiftLogsPage() {
  const { data: apiLogs = [], isLoading } = useGetAllShiftLogs();
  const { data: activeShift } = useActiveShift();
  const { mutate: deleteShiftLog, isPending: isDeleting } = useDeleteShiftLog();
  const shiftLogs: IShift[] = apiLogs.length > 0 ? apiLogs : SEED_ADMIN_SHIFT_LOGS;

  const [selectedNote, setSelectedNote] = useState<IShift | null>(null);
  const [deleteShiftId, setDeleteShiftId] = useState<string | number | null>(null);
  const [startShiftModalOpen, setStartShiftModalOpen] = useState(false);
  const [scheduleShiftModalOpen, setScheduleShiftModalOpen] = useState(false);
  const [endShiftModalOpen, setEndShiftModalOpen] = useState(false);

  const isShiftActive = activeShift && activeShift.status === "ACTIVE";

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

      {/* Datatable */}
      <RUTable
        columns={columns}
        data={shiftLogs}
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
    </div>
  );
}

"use client";

import React from "react";
import {
  FileText,
  Clock,
  User,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
  ListChecks,
  ArrowRightLeft,
  X,
  AlertCircle,
  Receipt,
  Mail,
  Phone,
  ShieldAlert,
} from "lucide-react";
import { IShift } from "@/types/shift";
import { format } from "date-fns";
import { useVerifyShiftLog } from "@/hooks/useShifts";

interface ShiftAuditModalProps {
  shift: IShift | null;
  isOpen: boolean;
  onClose: () => void;
  canVerify?: boolean;
}

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

export function ShiftAuditModal({
  shift,
  isOpen,
  onClose,
  canVerify = true,
}: ShiftAuditModalProps) {
  const { mutate: verifyShift, isPending: isVerifying } = useVerifyShiftLog();

  if (!isOpen || !shift) return null;

  const openingCash = shift.openingCash ?? shift.startingCash ?? 0;
  const cashCollected = shift.cashCollected ?? shift.totalCashCollected ?? 0;
  const expectedCash = openingCash + cashCollected;
  const closingCash = shift.closingCash ?? shift.endingCash;
  const variance =
    shift.cashVariance ??
    (closingCash != null ? closingCash - expectedCash : 0);

  const isVerified = Boolean(shift.verifiedById || shift.verifiedBy);

  const handleToggleVerify = () => {
    verifyShift(shift.id);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto animate-in fade-in-50"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl rounded-3xl border border-border bg-card p-5 sm:p-7 shadow-2xl space-y-5 my-6 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-xl p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-start gap-3.5 pb-4 border-b border-border">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#004F32] to-[#003824] text-amber-300 shadow-sm">
            <FileText className="h-6 w-6" />
          </div>
          <div className="min-w-0 flex-1 pr-6">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-extrabold tracking-tight text-foreground">
                Shift Log Audit &amp; Duty Handover Record
              </h2>
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                  shift.status === "ACTIVE"
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                    : shift.status === "SCHEDULED"
                    ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                    : shift.status === "CANCELLED"
                    ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {shift.status === "ACTIVE" && (
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                )}
                {shift.status}
              </span>

              {isVerified ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold border border-emerald-300/40">
                  <ShieldCheck className="h-3 w-3 text-emerald-600" />
                  Supervisor Audited
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 text-[10px] font-bold border border-amber-300/40">
                  <AlertCircle className="h-3 w-3 text-amber-600" />
                  Pending Supervisor Audit
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground font-mono mt-1">
              REF: #{String(shift.id).slice(-8).toUpperCase()} •{" "}
              {formatDate(shift.startTime)}
            </p>
          </div>
        </div>

        {/* Shifter Profile & Time Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-muted/40 border border-border/80 text-xs">
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
              <User className="h-3 w-3" /> Duty Shifter Information
            </span>
            <p className="font-extrabold text-foreground text-sm">
              {shift.shifter?.name || shift.shifterName || "Duty Staff"}
            </p>
            {shift.shifter?.email && (
              <p className="text-muted-foreground flex items-center gap-1 font-mono text-[11px]">
                <Mail className="h-3 w-3 text-muted-foreground" />
                {shift.shifter.email}
              </p>
            )}
            {shift.shifter?.phone && (
              <p className="text-muted-foreground flex items-center gap-1 font-mono text-[11px]">
                <Phone className="h-3 w-3 text-muted-foreground" />
                {shift.shifter.phone}
              </p>
            )}
          </div>

          <div className="space-y-1.5 sm:border-l sm:border-border/80 sm:pl-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" /> Shift Slot &amp; Timing
            </span>
            <p className="font-bold text-foreground">
              {shift.shiftSlotName || "Counter Duty Shift"}
            </p>
            <p className="text-muted-foreground font-mono text-[11px]">
              {formatTime(shift.startTime)} →{" "}
              {shift.endTime ? formatTime(shift.endTime) : "In Progress"}
            </p>
            <p className="text-primary font-mono font-bold text-[11px]">
              Total Duration: {formatDuration(shift.startTime, shift.endTime)}
            </p>
          </div>
        </div>

        {/* ─── 1. Completed Tasks Section ─── */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-foreground flex items-center gap-1.5">
              <ListChecks className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span>Completed Tasks during Duty Shift (সম্পন্ন কাজসমূহ)</span>
            </span>
            <span className="text-[10px] text-muted-foreground">
              Operational Log
            </span>
          </div>

          <div className="rounded-2xl border border-emerald-300/40 bg-emerald-50/50 dark:bg-emerald-950/20 p-4 text-xs text-foreground leading-relaxed">
            {shift.tasksCompleted ? (
              <div className="whitespace-pre-line font-medium space-y-1">
                {shift.tasksCompleted}
              </div>
            ) : (
              <p className="text-muted-foreground italic text-[11px]">
                No specific task breakdown recorded for this shift record.
              </p>
            )}
          </div>
        </div>

        {/* ─── 2. Handover Notes & Remaining Tasks Section ─── */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-foreground flex items-center gap-1.5">
              <ArrowRightLeft className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <span>Remaining Tasks &amp; Handover Notes (হস্তান্তর নোট ও অবশিষ্ট কাজ)</span>
            </span>
            <span className="text-[10px] text-amber-700 dark:text-amber-400 font-bold">
              For Next Shifter / Supervisor
            </span>
          </div>

          <div className="rounded-2xl border border-amber-300/50 bg-amber-50/60 dark:bg-amber-950/20 p-4 text-xs text-amber-950 dark:text-amber-200 leading-relaxed">
            {shift.handoverNotes || shift.notes ? (
              <div className="whitespace-pre-line font-medium space-y-1">
                {shift.handoverNotes || shift.notes}
              </div>
            ) : (
              <p className="text-muted-foreground italic text-[11px]">
                No pending tasks or handover notes left by the shifter.
              </p>
            )}
          </div>
        </div>

        {/* ─── 3. Cash Accountability & Float Audit ─── */}
        <div className="space-y-2">
          <span className="text-xs font-extrabold text-foreground flex items-center gap-1.5">
            <DollarSign className="h-4 w-4 text-primary" />
            <span>Cash Float Accountability &amp; Reconciliation Audit</span>
          </span>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
            <div className="rounded-xl border border-border bg-card p-3 text-center space-y-0.5 shadow-2xs">
              <span className="text-[10px] text-muted-foreground block font-medium">
                Opening Float
              </span>
              <span className="font-mono font-bold text-foreground text-sm">
                ৳{openingCash.toLocaleString()}
              </span>
            </div>

            <div className="rounded-xl border border-border bg-card p-3 text-center space-y-0.5 shadow-2xs">
              <span className="text-[10px] text-muted-foreground block font-medium">
                Cash Collected
              </span>
              <span className="font-mono font-bold text-amber-600 dark:text-amber-400 text-sm">
                +৳{cashCollected.toLocaleString()}
              </span>
            </div>

            <div className="rounded-xl border border-border bg-card p-3 text-center space-y-0.5 shadow-2xs">
              <span className="text-[10px] text-muted-foreground block font-medium">
                Closing Float
              </span>
              <span className="font-mono font-bold text-foreground text-sm">
                {closingCash != null ? `৳${closingCash.toLocaleString()}` : "—"}
              </span>
            </div>

            <div className="rounded-xl border border-border bg-card p-3 text-center space-y-0.5 shadow-2xs">
              <span className="text-[10px] text-muted-foreground block font-medium">
                Float Variance
              </span>
              <span
                className={`font-mono font-extrabold text-sm flex items-center justify-center gap-0.5 ${
                  variance === 0
                    ? "text-foreground"
                    : variance > 0
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                {variance > 0 ? (
                  <TrendingUp className="h-3 w-3" />
                ) : variance < 0 ? (
                  <TrendingDown className="h-3 w-3" />
                ) : (
                  <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                )}
                {variance >= 0 ? `+৳${variance}` : `-৳${Math.abs(variance)}`}
              </span>
            </div>
          </div>
        </div>

        {/* ─── 4. Supervisor Audit Verification Footer ─── */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-border">
          <div className="text-xs text-muted-foreground text-center sm:text-left">
            {isVerified ? (
              <p className="flex items-center gap-1.5 font-bold text-emerald-700 dark:text-emerald-400">
                <ShieldCheck className="h-4 w-4" />
                Audited &amp; Approved by{" "}
                <span className="underline">
                  {shift.verifiedBy?.name || "Supervisor"}
                </span>
              </p>
            ) : (
              <p className="flex items-center gap-1.5 text-muted-foreground">
                <ShieldAlert className="h-4 w-4 text-amber-500" />
                Awaiting administrative audit and verification.
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {canVerify && (
              <button
                type="button"
                onClick={handleToggleVerify}
                disabled={isVerifying}
                className={`px-4 py-2 text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5 ${
                  isVerified
                    ? "border border-red-300 dark:border-red-900 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 hover:bg-red-100"
                    : "bg-[#004F32] hover:bg-emerald-900 text-white"
                }`}
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>
                  {isVerifying
                    ? "Updating..."
                    : isVerified
                    ? "Revoke Verification"
                    : "Verify & Approve Shift Audit"}
                </span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl border border-input bg-background hover:bg-accent text-foreground transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ShiftAuditModal;

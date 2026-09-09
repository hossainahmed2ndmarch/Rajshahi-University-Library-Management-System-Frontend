"use client";

import React, { useState } from "react";
import {
  ClipboardList,
  Play,
  Square,
  Clock,
  Banknote,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  FileText,
  Plus,
  XCircle,
  ListChecks,
  ArrowRightLeft,
  Share2,
} from "lucide-react";
import { useActiveShift, useGetAllShiftLogs } from "@/hooks/useShifts";
import { ScheduleShiftModal } from "@/components/shifter/ScheduleShiftModal";
import { CancelShiftModal } from "@/components/shifter/CancelShiftModal";
import { IShift } from "@/types/shift";
import { format } from "date-fns";

function formatDuration(start: string, end?: string): string {
  const s = new Date(start).getTime();
  const e = end ? new Date(end).getTime() : Date.now();
  const diff = Math.max(0, e - s);
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  return `${h}h ${m}m`;
}

function formatTime(iso: string): string {
  try {
    return format(new Date(iso), "hh:mm a");
  } catch {
    return iso;
  }
}

function formatDate(iso: string): string {
  try {
    return format(new Date(iso), "EEE, dd MMM yyyy");
  } catch {
    return iso;
  }
}

export default function ShifterShiftLogsPage() {
  const { data: activeShift } = useActiveShift();
  const { data: rawLogs = [], isLoading } = useGetAllShiftLogs();

  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [cancelModalShift, setCancelModalShift] = useState<IShift | null>(null);
  const [detailModal, setDetailModal] = useState<IShift | null>(null);

  const shiftLogs = rawLogs;
  const isActive = activeShift && activeShift.status === "ACTIVE";

  const scheduledShifts = shiftLogs.filter((s) => s.status === "SCHEDULED");
  const completedShifts = shiftLogs.filter((s) => s.status === "COMPLETED");
  const cancelledShifts = shiftLogs.filter((s) => s.status === "CANCELLED");

  // Aggregate stats
  const totalCompleted = completedShifts.length;
  const totalCollected = completedShifts.reduce((acc, s) => acc + (s.cashCollected ?? s.totalCashCollected ?? 0), 0);
  const totalVariance = completedShifts.reduce((acc, s) => acc + (s.cashVariance ?? ((s.closingCash ?? 0) - (s.openingCash + (s.cashCollected ?? 0)))), 0);

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground flex items-center gap-2">
            <ClipboardList className="h-6 w-6 text-[#004F32]" />
            Shift Logs &amp; Advance Scheduling
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Manage counter duty scheduling, active shift float, and end-of-shift reconciliation records.
          </p>
        </div>

        <button
          onClick={() => setScheduleModalOpen(true)}
          className="inline-flex items-center space-x-2 rounded-xl bg-[#004F32] hover:bg-emerald-900 px-4 py-2.5 text-xs font-bold text-white shadow-xs transition-all cursor-pointer"
        >
          <Plus className="h-4 w-4 text-amber-300" />
          <span>Schedule Duty in Advance</span>
        </button>
      </div>

      {/* Active shift banner */}
      {isActive && (
        <div className="rounded-2xl border border-emerald-300/40 bg-gradient-to-r from-[#004F32]/10 to-emerald-500/5 p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-[#004F32] flex items-center justify-center text-white shadow-xs">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Active Shift Session</span>
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <p className="font-bold text-foreground text-sm">{activeShift.shifter?.name || activeShift.shifterName || "Current Shifter"}</p>
              <div className="flex gap-4 mt-1 text-xs text-muted-foreground font-mono">
                <span>Start: <strong className="text-foreground">{formatTime(activeShift.startTime)}</strong></span>
                <span>Float: <strong className="text-amber-600 dark:text-amber-400">৳{activeShift.openingCash ?? activeShift.startingCash}</strong></span>
                <span>Duration: <strong className="text-primary">{formatDuration(activeShift.startTime)}</strong></span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950 px-3 py-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-300">
            <Play className="h-3.5 w-3.5" /> Shift in Progress (ACTIVE)
          </div>
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Scheduled Duty Slots", value: scheduledShifts.length, icon: <Calendar className="h-5 w-5" />, color: "text-[#004F32] dark:text-emerald-400", bg: "bg-[#004F32]/10" },
          { label: "Completed Shifts", value: totalCompleted, icon: <CheckCircle2 className="h-5 w-5" />, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-500/10" },
          { label: "Total Cash Collected", value: `৳${totalCollected.toLocaleString()}`, icon: <Banknote className="h-5 w-5" />, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-500/10" },
          {
            label: "Net Cash Variance",
            value: `${totalVariance >= 0 ? "+" : ""}৳${totalVariance}`,
            icon: totalVariance >= 0 ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />,
            color: totalVariance === 0 ? "text-foreground" : totalVariance > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400",
            bg: totalVariance === 0 ? "bg-muted" : totalVariance > 0 ? "bg-emerald-500/10" : "bg-red-500/10",
          },
        ].map(({ label, value, icon, color, bg }) => (
          <div key={label} className="rounded-2xl border border-border bg-card p-4 space-y-2">
            <div className={`h-9 w-9 rounded-xl ${bg} flex items-center justify-center ${color}`}>
              {icon}
            </div>
            <p className={`text-xl font-extrabold ${color}`}>{value}</p>
            <p className="text-[11px] text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>

      {/* Advance Scheduled Shifts Section */}
      {scheduledShifts.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <h2 className="font-bold text-sm text-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              <span>Advance Scheduled Duty Shifts ({scheduledShifts.length})</span>
            </h2>
            <span className="text-[11px] text-muted-foreground">Coordinated with Staff</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {scheduledShifts.map((shift) => (
              <div
                key={String(shift.id)}
                className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4 space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:text-emerald-300 uppercase">
                      Scheduled Duty
                    </span>
                    <span className="font-mono text-[11px] text-muted-foreground">
                      Float: ৳{shift.openingCash}
                    </span>
                  </div>

                  <p className="font-bold text-sm text-foreground">
                    {shift.shifter?.name || shift.shifterName || "Shifter"}
                  </p>
                  <p className="text-xs text-muted-foreground font-mono">
                    📅 {formatDate(shift.startTime)}
                  </p>
                  <p className="text-xs text-emerald-700 dark:text-emerald-300 font-medium">
                    ⏰ {formatTime(shift.startTime)} {shift.endTime ? `– ${formatTime(shift.endTime)}` : ""}
                  </p>
                  {shift.tasksCompleted && (
                    <p className="text-[11px] text-muted-foreground">{shift.tasksCompleted}</p>
                  )}
                  {shift.handoverNotes && (
                    <p className="text-[11px] text-muted-foreground italic">"{shift.handoverNotes}"</p>
                  )}
                </div>

                <div className="pt-2 border-t border-border/60 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setCancelModalShift(shift)}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-lg border border-red-200 dark:border-red-900 bg-red-500/10 hover:bg-red-500/20 text-red-700 dark:text-red-300 text-[11px] font-bold transition-colors cursor-pointer"
                  >
                    <XCircle className="h-3 w-3" />
                    <span>Cancel &amp; Notify</span>
                  </button>
                  <span className="text-[10px] text-muted-foreground">Staff Notified</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Completed Shift Log Table */}
      <div className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="font-bold text-sm text-foreground">Completed Shift Records &amp; Tasks Handover</h2>
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            <span>Audit Trail</span>
          </div>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-xs text-muted-foreground">Loading shift logs...</div>
        ) : completedShifts.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground text-xs">No completed shift records found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="px-4 py-3 font-semibold text-muted-foreground">Shift ID</th>
                  <th className="px-4 py-3 font-semibold text-muted-foreground">Date &amp; Shifter</th>
                  <th className="px-4 py-3 font-semibold text-muted-foreground">Duration</th>
                  <th className="px-4 py-3 font-semibold text-muted-foreground text-right">Opening Float</th>
                  <th className="px-4 py-3 font-semibold text-muted-foreground text-right">Closing Float</th>
                  <th className="px-4 py-3 font-semibold text-muted-foreground text-right">Variance</th>
                  <th className="px-4 py-3 font-semibold text-muted-foreground">Tasks Completed</th>
                  <th className="px-4 py-3 font-semibold text-muted-foreground text-center">Handover</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {completedShifts.map((log) => {
                  const opening = log.openingCash ?? log.startingCash ?? 0;
                  const closing = log.closingCash ?? log.endingCash ?? opening;
                  const collected = log.cashCollected ?? log.totalCashCollected ?? 0;
                  const variance = log.cashVariance ?? (closing - (opening + collected));
                  const varianceColor =
                    variance === 0
                      ? "text-foreground"
                      : variance > 0
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-red-600 dark:text-red-400";

                  return (
                    <tr key={String(log.id)} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-4 font-mono text-[11px] text-muted-foreground whitespace-nowrap">
                        #{String(log.id).slice(-6).toUpperCase()}
                      </td>
                      <td className="px-4 py-4">
                        <p className="font-bold text-foreground">{log.shifter?.name || log.shifterName || "Shifter"}</p>
                        <p className="text-[11px] text-muted-foreground">{formatDate(log.startTime)}</p>
                        <p className="text-[11px] text-muted-foreground font-mono">
                          {formatTime(log.startTime)} → {log.endTime ? formatTime(log.endTime) : "Active"}
                        </p>
                      </td>
                      <td className="px-4 py-4 font-mono font-bold text-foreground whitespace-nowrap">
                        {formatDuration(log.startTime, log.endTime)}
                      </td>
                      <td className="px-4 py-4 text-right font-mono font-bold text-foreground">
                        ৳{opening.toLocaleString()}
                      </td>
                      <td className="px-4 py-4 text-right font-mono font-bold text-foreground">
                        ৳{closing.toLocaleString()}
                      </td>
                      <td className={`px-4 py-4 text-right font-mono font-bold ${varianceColor}`}>
                        <div className="flex items-center justify-end gap-1">
                          {variance > 0 ? <TrendingUp className="h-3 w-3" /> : variance < 0 ? <TrendingDown className="h-3 w-3" /> : <CheckCircle2 className="h-3 w-3 text-emerald-500" />}
                          {variance >= 0 ? "+" : ""}৳{variance}
                        </div>
                      </td>
                      <td className="px-4 py-4 max-w-[200px]">
                        <p className="text-foreground line-clamp-2">{log.tasksCompleted || "Desk operations"}</p>
                      </td>
                      <td className="px-4 py-4 text-center">
                        {log.handoverNotes ? (
                          <button
                            onClick={() => setDetailModal(log)}
                            className="inline-flex items-center gap-1 rounded-lg border border-input bg-background hover:bg-accent px-2 py-1 text-[11px] font-semibold text-foreground transition-colors cursor-pointer"
                          >
                            <ArrowRightLeft className="h-3 w-3 text-amber-600" /> Notes
                          </button>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Cancelled Shifts Section */}
      {cancelledShifts.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
          <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
            <XCircle className="h-4 w-4 text-red-500" />
            <span>Advance Cancelled Shifts ({cancelledShifts.length})</span>
          </h3>
          <div className="divide-y divide-border/60">
            {cancelledShifts.map((c) => (
              <div key={String(c.id)} className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-foreground">{c.shifter?.name || c.shifterName || "Shifter"} — {formatDate(c.startTime)}</p>
                  <p className="text-[11px] text-red-600 dark:text-red-400 mt-0.5">{c.handoverNotes || "Cancelled with advance notification"}</p>
                </div>
                <span className="rounded-full bg-red-100 dark:bg-red-950 px-2.5 py-0.5 text-[10px] font-bold text-red-800 dark:text-red-300">
                  CANCELLED
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Note / Handover Detail Modal */}
      {detailModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
          onClick={() => setDetailModal(null)}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-[#004F32] flex items-center justify-center text-white">
                <FileText className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-bold text-base text-foreground">Shift Tasks &amp; Handover</h3>
                <p className="text-[11px] text-muted-foreground">{detailModal.shifter?.name || detailModal.shifterName} — {formatDate(detailModal.startTime)}</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              {detailModal.tasksCompleted && (
                <div className="space-y-1">
                  <span className="font-bold text-foreground flex items-center gap-1">
                    <ListChecks className="h-3.5 w-3.5 text-emerald-600" /> Completed Tasks:
                  </span>
                  <div className="rounded-xl bg-muted/40 border border-border p-3 leading-relaxed">
                    {detailModal.tasksCompleted}
                  </div>
                </div>
              )}

              {detailModal.handoverNotes && (
                <div className="space-y-1">
                  <span className="font-bold text-foreground flex items-center gap-1">
                    <ArrowRightLeft className="h-3.5 w-3.5 text-amber-600" /> Remaining Tasks / Handover Notes:
                  </span>
                  <div className="rounded-xl bg-amber-500/5 border border-amber-500/30 p-3 leading-relaxed text-amber-950 dark:text-amber-200">
                    {detailModal.handoverNotes}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setDetailModal(null)}
                className="px-4 py-2 text-xs font-semibold rounded-lg border border-input bg-background hover:bg-accent text-foreground cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Duty Modal */}
      <ScheduleShiftModal
        isOpen={scheduleModalOpen}
        onClose={() => setScheduleModalOpen(false)}
      />

      {/* Cancel Duty Modal */}
      <CancelShiftModal
        isOpen={Boolean(cancelModalShift)}
        onClose={() => setCancelModalShift(null)}
        shift={cancelModalShift}
      />
    </div>
  );
}

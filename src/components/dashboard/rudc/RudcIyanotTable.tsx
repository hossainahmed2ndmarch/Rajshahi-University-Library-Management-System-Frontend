"use client";

import React, { useState } from "react";
import {
  Banknote,
  CheckCircle2,
  Filter,
  Plus,
  Receipt,
  Search,
  User,
  X,
  CreditCard,
} from "lucide-react";
import { toast } from "sonner";
import {
  useRudcIyanot,
  useRecordIyanotPayment,
  useRudcMembers,
} from "@/hooks/useRudc";
import { useGetMe } from "@/hooks/useAuth";
import { IRudcIyanot, IyanotPaymentMethod } from "@/types/rudc";

export function RudcIyanotTable() {
  const { data: user } = useGetMe();
  const [searchTerm, setSearchTerm] = useState("");
  const [monthFilter, setMonthFilter] = useState<string>(String(new Date().getMonth() + 1));
  const [yearFilter, setYearFilter] = useState<string>(String(new Date().getFullYear()));

  const { data: iyanotRes, isLoading } = useRudcIyanot({
    searchTerm: searchTerm || undefined,
    month: monthFilter !== "ALL" ? monthFilter : undefined,
    year: yearFilter !== "ALL" ? yearFilter : undefined,
  });

  const { data: allMembersRes } = useRudcMembers({ limit: 1000 });
  const allMembers = allMembersRes?.data || [];

  const { mutateAsync: recordPayment, isPending: isRecording } = useRecordIyanotPayment();

  const [modalOpen, setModalOpen] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    userId: 0,
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    amount: 50,
    paymentMethod: "CASH_OFFLINE" as IyanotPaymentMethod,
    remarks: "Received by supervisor/admin in cash",
  });

  const iyanotList: IRudcIyanot[] = iyanotRes?.data || [];

  const handleRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentForm.userId) {
      toast.error("Please select a volunteer/member!");
      return;
    }

    try {
      await recordPayment(paymentForm);
      setModalOpen(false);
    } catch {
      // toast in hook
    }
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-foreground">
            RUDC Monthly Iyanot (চাঁদা) Management
          </h2>
          <p className="text-xs text-muted-foreground">
            Track 50 BDT monthly dues for volunteers and members with collector accountability.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#004F32] hover:bg-[#003e27] text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
        >
          <Banknote className="h-4 w-4 text-amber-300" />
          <span>Record Offline / Cash Payment</span>
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="h-4 w-4 text-muted-foreground absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by volunteer name, phone, student ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-border bg-card text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        <div>
          <select
            value={monthFilter}
            onChange={(e) => setMonthFilter(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-border bg-card text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="ALL">All Months</option>
            {monthNames.map((m, idx) => (
              <option key={idx} value={idx + 1}>
                {m}
              </option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-border bg-card text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="ALL">All Years</option>
            <option value="2026">2026</option>
            <option value="2027">2027</option>
            <option value="2025">2025</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border/80 bg-muted/40 text-muted-foreground font-semibold">
                <th className="p-3">Volunteer / Member</th>
                <th className="p-3">Month & Year</th>
                <th className="p-3">Amount</th>
                <th className="p-3">Method</th>
                <th className="p-3">Received By (Offline Collector)</th>
                <th className="p-3">Receipt No</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted-foreground">
                    Loading iyanot records...
                  </td>
                </tr>
              ) : iyanotList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted-foreground">
                    No iyanot records found for selected period.
                  </td>
                </tr>
              ) : (
                iyanotList.map((rec) => (
                  <tr key={rec.id} className="hover:bg-muted/40 transition-colors">
                    <td className="p-3">
                      <p className="font-bold text-foreground">{rec.user?.name || `User #${rec.userId}`}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {rec.user?.department || "N/A"} • ID: {rec.user?.studentOrVoterId || "N/A"}
                      </p>
                    </td>

                    <td className="p-3">
                      <span className="font-semibold text-foreground">
                        {monthNames[rec.month - 1]} {rec.year}
                      </span>
                    </td>

                    <td className="p-3">
                      <span className="font-bold text-[#004F32] dark:text-emerald-400">
                        {rec.amount} BDT
                      </span>
                    </td>

                    <td className="p-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          rec.paymentMethod === "ONLINE"
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
                            : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                        }`}
                      >
                        {rec.paymentMethod === "ONLINE" ? "Online" : "Cash (Offline)"}
                      </span>
                    </td>

                    <td className="p-3">
                      {rec.collectedBy ? (
                        <div>
                          <p className="font-semibold text-foreground">{rec.collectedBy.name}</p>
                          <p className="text-[10px] text-muted-foreground">
                            Role: {rec.collectedBy.role}
                          </p>
                        </div>
                      ) : (
                        <span className="text-muted-foreground italic text-[11px]">System Online</span>
                      )}
                    </td>

                    <td className="p-3 font-mono text-[11px] text-muted-foreground">
                      {rec.receiptNo || "—"}
                    </td>

                    <td className="p-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          rec.status === "PAID"
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                            : "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                        }`}
                      >
                        <CheckCircle2 className="h-3 w-3" />
                        <span>{rec.status}</span>
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in-50">
          <div className="bg-card border border-border rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Banknote className="h-5 w-5 text-emerald-600" />
                <h3 className="text-base font-bold text-foreground">
                  Record Offline Iyanot (Cash)
                </h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 text-muted-foreground hover:text-foreground rounded-lg"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleRecord} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-foreground">Select Member / Volunteer *</label>
                <select
                  required
                  value={paymentForm.userId}
                  onChange={(e) =>
                    setPaymentForm({ ...paymentForm, userId: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground"
                >
                  <option value={0}>Choose a volunteer...</option>
                  {allMembers.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.department || "RU"} - {m.studentOrVoterId})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-foreground">Month *</label>
                  <select
                    value={paymentForm.month}
                    onChange={(e) =>
                      setPaymentForm({ ...paymentForm, month: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground"
                  >
                    {monthNames.map((m, idx) => (
                      <option key={idx} value={idx + 1}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-foreground">Year *</label>
                  <input
                    type="number"
                    required
                    value={paymentForm.year}
                    onChange={(e) =>
                      setPaymentForm({ ...paymentForm, year: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">Amount (BDT)</label>
                <input
                  type="number"
                  required
                  value={paymentForm.amount}
                  onChange={(e) =>
                    setPaymentForm({ ...paymentForm, amount: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">Payment Method</label>
                <select
                  value={paymentForm.paymentMethod}
                  onChange={(e) =>
                    setPaymentForm({
                      ...paymentForm,
                      paymentMethod: e.target.value as IyanotPaymentMethod,
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground"
                >
                  <option value="CASH_OFFLINE">Cash (Handed to Supervisor/Admin)</option>
                  <option value="ONLINE">Online Transfer / bKash</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">Remarks</label>
                <input
                  type="text"
                  value={paymentForm.remarks}
                  onChange={(e) => setPaymentForm({ ...paymentForm, remarks: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-border bg-card text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isRecording}
                  className="px-5 py-2 rounded-xl bg-[#004F32] hover:bg-[#003e27] text-white font-bold disabled:opacity-50"
                >
                  {isRecording ? "Recording..." : "Confirm & Generate Receipt"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

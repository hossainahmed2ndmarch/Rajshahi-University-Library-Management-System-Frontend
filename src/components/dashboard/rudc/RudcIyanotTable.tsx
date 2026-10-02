"use client";

import React, { useState, useMemo } from "react";
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
  Calendar,
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
  const currentMonthNum = new Date().getMonth() + 1;
  const currentYearNum = new Date().getFullYear();

  const [searchTerm, setSearchTerm] = useState("");
  const [monthFilter, setMonthFilter] = useState<string>(String(currentMonthNum));
  const [yearFilter, setYearFilter] = useState<string>(String(currentYearNum));
  const [methodFilter, setMethodFilter] = useState<string>("ALL");

  const { data: iyanotRes, isLoading } = useRudcIyanot({
    searchTerm: searchTerm || undefined,
    month: monthFilter !== "ALL" ? monthFilter : undefined,
    year: yearFilter !== "ALL" ? yearFilter : undefined,
  });

  const { data: allMembersRes } = useRudcMembers({ limit: 1000 });
  const allMembers = allMembersRes?.data || [];

  const { mutateAsync: recordPayment, isPending: isRecording } = useRecordIyanotPayment();

  const [modalOpen, setModalOpen] = useState(false);
  const [memberSearchQuery, setMemberSearchQuery] = useState("");
  const [paymentForm, setPaymentForm] = useState({
    userId: 0,
    month: currentMonthNum,
    year: currentYearNum,
    amount: 50,
    paymentMethod: "CASH_OFFLINE" as IyanotPaymentMethod,
    remarks: "Received by supervisor/admin in cash",
  });

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  const rawList: IRudcIyanot[] = iyanotRes?.data || [];

  const filteredIyanotList = useMemo(() => {
    if (methodFilter === "ALL") return rawList;
    return rawList.filter((item) => item.paymentMethod === methodFilter);
  }, [rawList, methodFilter]);

  const filteredMembersForModal = useMemo(() => {
    if (!memberSearchQuery.trim()) return allMembers;
    const q = memberSearchQuery.toLowerCase();
    return allMembers.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        (m.phone && m.phone.includes(q)) ||
        (m.studentOrVoterId && m.studentOrVoterId.toLowerCase().includes(q)) ||
        (m.department && m.department.toLowerCase().includes(q))
    );
  }, [allMembers, memberSearchQuery]);

  const selectedMember = allMembers.find((m) => m.id === paymentForm.userId);

  const handleRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentForm.userId) {
      toast.error("Please select a volunteer/member!");
      return;
    }

    try {
      await recordPayment(paymentForm);
      setModalOpen(false);
      setPaymentForm({
        userId: 0,
        month: currentMonthNum,
        year: currentYearNum,
        amount: 50,
        paymentMethod: "CASH_OFFLINE",
        remarks: "Received by supervisor/admin in cash",
      });
      setMemberSearchQuery("");
    } catch {
      // toast in hook
    }
  };

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
          onClick={() => {
            setModalOpen(true);
            setMemberSearchQuery("");
          }}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#004F32] hover:bg-[#003e27] text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
        >
          <Banknote className="h-4 w-4 text-amber-300" />
          <span>Record Offline / Cash Payment</span>
        </button>
      </div>

      {/* Modern Filter Pill Bar + Search */}
      <div className="space-y-3">
        {/* Row 1: Month Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-muted-foreground mr-1">Period:</span>
          <button
            onClick={() => setMonthFilter("ALL")}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              monthFilter === "ALL"
                ? "bg-[#004F32] text-white shadow-xs"
                : "border border-border bg-card text-muted-foreground hover:bg-accent"
            }`}
          >
            All Months
          </button>
          <button
            onClick={() => setMonthFilter(String(currentMonthNum))}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              monthFilter === String(currentMonthNum)
                ? "bg-[#004F32] text-white shadow-xs"
                : "border border-border bg-card text-muted-foreground hover:bg-accent"
            }`}
          >
            Current ({monthNames[currentMonthNum - 1]})
          </button>
          <button
            onClick={() => {
              const prev = currentMonthNum === 1 ? 12 : currentMonthNum - 1;
              setMonthFilter(String(prev));
            }}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              monthFilter === String(currentMonthNum === 1 ? 12 : currentMonthNum - 1)
                ? "bg-[#004F32] text-white shadow-xs"
                : "border border-border bg-card text-muted-foreground hover:bg-accent"
            }`}
          >
            Previous Month
          </button>

          <select
            value={monthFilter}
            onChange={(e) => setMonthFilter(e.target.value)}
            className="px-2.5 py-1 rounded-xl border border-border bg-card text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
          >
            <option value="ALL">Specific Month...</option>
            {monthNames.map((m, idx) => (
              <option key={idx} value={idx + 1}>
                {m}
              </option>
            ))}
          </select>

          <select
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            className="px-2.5 py-1 rounded-xl border border-border bg-card text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
          >
            <option value="ALL">All Years</option>
            <option value="2026">2026</option>
            <option value="2027">2027</option>
            <option value="2025">2025</option>
          </select>
        </div>

        {/* Row 2: Method Pills & Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-muted/60 border border-border/80">
            {[
              { val: "ALL", label: "All Payment Methods" },
              { val: "CASH_OFFLINE", label: "Cash (Offline)" },
              { val: "ONLINE", label: "Online Transfer" },
            ].map(({ val, label }) => (
              <button
                key={val}
                onClick={() => setMethodFilter(val)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  methodFilter === val
                    ? "bg-card text-foreground shadow-xs border border-border"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="relative sm:w-72">
            <Search className="h-4 w-4 text-muted-foreground absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by volunteer name, phone, ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-border bg-card text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border/80 bg-muted/40 text-muted-foreground font-semibold">
                <th className="p-3">Volunteer / Member</th>
                <th className="p-3">Month &amp; Year</th>
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
              ) : filteredIyanotList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted-foreground">
                    No iyanot records found for selected period and method.
                  </td>
                </tr>
              ) : (
                filteredIyanotList.map((rec) => (
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
                        {rec.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Payment Modal with Modern Searchable Selection */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in-50">
          <div className="bg-card border border-border rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-4 text-card-foreground max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="text-base font-bold text-foreground">Record Offline Cash Iyanot</h3>
                <p className="text-xs text-muted-foreground">
                  Collector accountability: Logged by current user ({user?.name || "Admin"}).
                </p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 text-muted-foreground hover:text-foreground rounded-lg cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleRecord} className="space-y-4 text-xs">
              {/* Member Searchable Selector */}
              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">
                  Select Volunteer / Member *
                </label>

                {selectedMember ? (
                  <div className="flex items-center justify-between p-3 rounded-xl border border-emerald-500/50 bg-emerald-50/50 dark:bg-emerald-950/20">
                    <div>
                      <p className="font-bold text-foreground">{selectedMember.name}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {selectedMember.department || "RU"} • {selectedMember.studentOrVoterId || selectedMember.phone}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPaymentForm({ ...paymentForm, userId: 0 })}
                      className="px-2.5 py-1 rounded-lg border border-border bg-background text-[11px] font-semibold text-foreground hover:bg-muted cursor-pointer"
                    >
                      Change
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="relative">
                      <Search className="h-3.5 w-3.5 text-muted-foreground absolute left-3 top-2.5" />
                      <input
                        type="text"
                        placeholder="Search member by name, phone, or student ID..."
                        value={memberSearchQuery}
                        onChange={(e) => setMemberSearchQuery(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-border bg-background text-foreground text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>

                    <div className="max-h-48 overflow-y-auto space-y-1 border border-border rounded-xl p-1.5 bg-background">
                      {filteredMembersForModal.length === 0 ? (
                        <p className="p-3 text-center text-muted-foreground text-xs">
                          No volunteers or members found matching &quot;{memberSearchQuery}&quot;.
                        </p>
                      ) : (
                        filteredMembersForModal.slice(0, 50).map((m) => (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => {
                              setPaymentForm({ ...paymentForm, userId: m.id });
                              setMemberSearchQuery("");
                            }}
                            className="w-full text-left p-2 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-950/40 flex items-center justify-between transition-colors cursor-pointer"
                          >
                            <div>
                              <p className="font-semibold text-foreground">{m.name}</p>
                              <p className="text-[10px] text-muted-foreground">
                                {m.department || "RU"} • ID: {m.studentOrVoterId || m.phone}
                              </p>
                            </div>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-muted text-muted-foreground">
                              Select
                            </span>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-foreground">Month *</label>
                  <select
                    value={paymentForm.month}
                    onChange={(e) =>
                      setPaymentForm({ ...paymentForm, month: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground cursor-pointer focus:ring-1 focus:ring-emerald-500 focus:outline-none"
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
                    className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground focus:ring-1 focus:ring-emerald-500 focus:outline-none"
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
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground font-bold focus:ring-1 focus:ring-emerald-500 focus:outline-none"
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
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground cursor-pointer focus:ring-1 focus:ring-emerald-500 focus:outline-none"
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
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-border bg-card text-foreground cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isRecording}
                  className="px-5 py-2 rounded-xl bg-[#004F32] hover:bg-[#003e27] text-white font-bold disabled:opacity-50 cursor-pointer"
                >
                  {isRecording ? "Recording..." : "Record Iyanot"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

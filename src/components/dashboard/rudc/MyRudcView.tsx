"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Banknote,
  CheckCircle2,
  Clock,
  HeartHandshake,
  Layers,
  MapPin,
  Phone,
  Shield,
  Sparkles,
  User,
  UserCheck,
  UserPlus,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { useMyRudcProfile, useRecordIyanotPayment } from "@/hooks/useRudc";
import { useGetMe } from "@/hooks/useAuth";

export function MyRudcView() {
  const { data: user } = useGetMe();
  const { data: myProfile, isLoading } = useMyRudcProfile();
  const { mutateAsync: recordIyanot, isPending: isPaying } = useRecordIyanotPayment();

  const [payMonth, setPayMonth] = useState(new Date().getMonth() + 1);
  const [payYear, setPayYear] = useState(new Date().getFullYear());

  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];

  const handleSelfPay = async (m: number, y: number) => {
    if (!myProfile) return;
    try {
      await recordIyanot({
        userId: myProfile.id,
        month: m,
        year: y,
        amount: 50,
        paymentMethod: "ONLINE",
        transactionId: `TXN-ONLINE-${Date.now().toString().slice(-6)}`,
        remarks: "Online self-payment via Member Dashboard",
      });
      toast.success(`Iyanot for ${monthNames[m - 1]} ${y} submitted successfully!`);
    } catch {
      // toast in hook
    }
  };

  if (isLoading) {
    return (
      <div className="p-12 text-center text-xs text-muted-foreground">
        Loading your RUDC status...
      </div>
    );
  }

  // If user is not yet an RUDC member
  if (!myProfile || !myProfile.isRudcMember) {
    return (
      <div className="max-w-2xl mx-auto rounded-3xl border border-dashed border-border p-8 sm:p-12 text-center space-y-5 bg-card">
        <div className="h-16 w-16 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-[#004F32] dark:text-emerald-400 mx-auto">
          <Users className="h-8 w-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl sm:text-2xl font-black text-foreground">
            Join Rajshahi University Dawah Community
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-lg mx-auto">
            You are currently registered on RU Islamic Library, but have not applied to be an RUDC
            volunteer yet. Join our campus brotherhood to participate in Dawah and welfare
            activities!
          </p>
        </div>

        <div className="pt-2 flex flex-wrap justify-center gap-3">
          <Link
            href="/rudc/join"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#004F32] hover:bg-[#003e27] text-white font-bold text-xs shadow-md transition-all"
          >
            <UserPlus className="h-4 w-4 text-amber-300" />
            <span>Apply as RUDC Volunteer Now</span>
          </Link>
          <Link
            href="/rudc"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl border border-border bg-card hover:bg-muted text-foreground font-bold text-xs"
          >
            <span>Visit RUDC Landing Page</span>
          </Link>
        </div>
      </div>
    );
  }

  const paidMonths = new Set(
    myProfile.iyanotPayments
      ?.filter((p) => p.status === "PAID" && p.year === payYear)
      .map((p) => p.month) || []
  );

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Overview Banner */}
      <div className="rounded-3xl bg-gradient-to-br from-[#004F32] to-[#013522] p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-[11px] font-black bg-amber-400 text-emerald-950 uppercase tracking-wider">
                {myProfile.rudcMemberType || "VOLUNTEER"}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-white/20 text-white">
                Status: {myProfile.rudcStatus?.replace("_", " ") || "PENDING"}
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black">{myProfile.name}</h2>
            <p className="text-xs text-emerald-100/90">
              Department of {myProfile.department || "Rajshahi University"} • ID:{" "}
              {myProfile.studentOrVoterId}
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/15 p-4 text-right sm:text-right shrink-0">
            <p className="text-[11px] text-amber-300 font-bold uppercase tracking-wider">
              Monthly Iyanot (Fee)
            </p>
            <p className="text-2xl font-black">50 ৳ / month</p>
            <p className="text-[10px] text-emerald-200 mt-0.5">Dawah & Social Activities</p>
          </div>
        </div>
      </div>

      {/* Grid: Supervisor Info & Assigned Teams */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Supervisor Card */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-border/60 pb-3">
            <UserCheck className="h-5 w-5 text-[#004F32] dark:text-emerald-400" />
            <h3 className="text-sm font-bold text-foreground">My Assigned Supervisor</h3>
          </div>

          {myProfile.supervisor ? (
            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center font-bold text-emerald-700 dark:text-emerald-400 text-sm">
                  {myProfile.supervisor.name.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-foreground text-sm">{myProfile.supervisor.name}</p>
                  <p className="text-muted-foreground text-[11px]">
                    Role: {myProfile.supervisor.rudcMemberType || "Leader"}
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-muted/40 space-y-1.5 text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Phone: {myProfile.supervisor.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <HeartHandshake className="h-3.5 w-3.5 text-amber-500" />
                  <span>Reach out to your supervisor for guidance or offline iyanot.</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 text-center text-xs text-muted-foreground space-y-1">
              <Clock className="h-6 w-6 text-amber-500 mx-auto mb-1" />
              <p className="font-semibold text-foreground">Supervisor Allocation in Progress</p>
              <p>You will be allocated a group supervisor following your interview.</p>
            </div>
          )}
        </div>

        {/* Teams Card */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-border/60 pb-3">
            <Layers className="h-5 w-5 text-[#C78700] dark:text-amber-400" />
            <h3 className="text-sm font-bold text-foreground">My Working Teams</h3>
          </div>

          {myProfile.rudcTeams && myProfile.rudcTeams.length > 0 ? (
            <div className="space-y-2.5">
              {myProfile.rudcTeams.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-muted/40 text-xs"
                >
                  <div>
                    <p className="font-bold text-foreground">{t.team.name}</p>
                    <p className="text-[11px] text-muted-foreground">{t.team.description}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950 text-[#004F32] dark:text-emerald-400">
                    {t.role || "MEMBER"}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center text-xs text-muted-foreground space-y-1">
              <p className="font-semibold text-foreground">No Teams Assigned Yet</p>
              <p>Teams are assigned based on your declared skills after interview.</p>
            </div>
          )}
        </div>
      </div>

      {/* Monthly Iyanot Grid (12 Months of payYear) */}
      <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-4">
          <div>
            <h3 className="text-base font-bold text-foreground">
              Monthly Iyanot Tracker ({payYear})
            </h3>
            <p className="text-xs text-muted-foreground">
              Each active volunteer contributes 50 BDT monthly to support campus Dawah initiatives.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={payYear}
              onChange={(e) => setPayYear(Number(e.target.value))}
              className="px-3 py-1.5 rounded-xl border border-border bg-background text-foreground text-xs"
            >
              <option value={2026}>2026</option>
              <option value={2027}>2027</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          {monthNames.map((m, idx) => {
            const monthNum = idx + 1;
            const isPaid = paidMonths.has(monthNum);
            return (
              <div
                key={idx}
                className={`rounded-2xl border p-3 text-center space-y-2 transition-all ${
                  isPaid
                    ? "bg-emerald-50/60 dark:bg-emerald-950/40 border-emerald-500/40"
                    : "bg-muted/30 border-border"
                }`}
              >
                <p className="text-xs font-bold text-foreground">{m}</p>
                <div>
                  {isPaid ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                      <CheckCircle2 className="h-3 w-3" />
                      <span>PAID (50৳)</span>
                    </span>
                  ) : (
                    <button
                      onClick={() => handleSelfPay(monthNum, payYear)}
                      disabled={isPaying}
                      className="px-2 py-1 rounded-lg bg-[#004F32] hover:bg-[#003e27] text-white text-[10px] font-bold shadow-xs cursor-pointer"
                    >
                      Pay 50৳
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-3.5 rounded-2xl bg-muted/40 text-xs text-muted-foreground space-y-1">
          <p className="font-semibold text-foreground">অফলাইনে চাঁদা পরিশোধ:</p>
          <p>
            আপনি চাইলে আপনার তত্ত্বাবধায়ক (Supervisor)-এর নিকট সরাসরি ৫০ টাকা নগদ প্রদান করতে
            পারেন। তিনি ড্যাশবোর্ডে রিসিট নম্বর এন্ট্রি দিলে আপনার স্টেটাস স্বয়ংক্রিয়ভাবে &quot;PAID&quot;
            হয়ে যাবে।
          </p>
        </div>
      </div>
    </div>
  );
}

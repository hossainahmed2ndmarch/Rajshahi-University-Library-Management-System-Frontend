"use client";

import React, { useState } from "react";
import {
  Users,
  Search,
  CheckCircle2,
  Clock,
  Shield,
  Banknote,
  Phone,
  Mail,
  UserCheck,
  XCircle,
  AlertCircle,
  UserPlus,
  X,
  Hash,
  Building,
  Lock,
  AlertTriangle,
  Calendar,
  Sparkles,
  Edit2,
  Check,
  History,
  GraduationCap,
} from "lucide-react";
import {
  useGetUsers,
  useApproveCashPayment,
  useApproveMembership,
  useRegisterMemberByStaff,
  useUpdateMemberDetails,
} from "@/hooks/useUsers";
import { IUser, UserStatus } from "@/types/auth";
import { format } from "date-fns";

// ─── Status badge config ───────────────────────────────────────────────────────
const STATUS_MAP: Record<UserStatus, { label: string; className: string; icon: React.ReactNode }> = {
  ACTIVE: { label: "Active", className: "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300", icon: <CheckCircle2 className="h-3 w-3" /> },
  PENDING_PAYMENT: { label: "Pending Payment", className: "bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300", icon: <Clock className="h-3 w-3" /> },
  PENDING_APPROVAL: { label: "Pending Approval", className: "bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300", icon: <AlertCircle className="h-3 w-3" /> },
  INACTIVE: { label: "Inactive", className: "bg-muted text-muted-foreground", icon: <XCircle className="h-3 w-3" /> },
  BLOCKED: { label: "Blocked", className: "bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300", icon: <Shield className="h-3 w-3" /> },
};

// ─── Add Member Modal (Supports Walk-in & Offline Legacy Members) ──────────────
function AddMemberModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { mutate: registerMember, isPending } = useRegisterMemberByStaff();

  // Registration Type: "OFFLINE_LEGACY" | "WALKIN_NEW"
  const [regMode, setRegMode] = useState<"OFFLINE_LEGACY" | "WALKIN_NEW">("OFFLINE_LEGACY");

  const todayStr = new Date().toISOString().split("T")[0];
  const oneYearFromNowStr = new Date(new Date().setFullYear(new Date().getFullYear() + 1))
    .toISOString()
    .split("T")[0];

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "Library@123",
    studentOrVoterId: "",
    institution: "University of Rajshahi",
    department: "Islamic Studies",
    session: "2024-2025",
    paymentMethod: "CASH",
    // Offline specific fields
    membershipStartedAt: todayStr,
    membershipExpiresAt: oneYearFromNowStr,
    isPaid: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Full name is required";
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Valid email required";
    if (!form.phone.trim() || form.phone.length < 10) e.phone = "Valid phone number required";
    if (!form.studentOrVoterId.trim()) e.studentOrVoterId = "Student Reg # or Voter ID required";
    if (!form.password || form.password.length < 6) e.password = "Password must be at least 6 characters";
    if (regMode === "OFFLINE_LEGACY") {
      if (!form.membershipStartedAt) e.membershipStartedAt = "Start date is required";
      if (!form.membershipExpiresAt) e.membershipExpiresAt = "Expiry date is required";
    }
    return e;
  };

  const handleQuickDuration = (months: number) => {
    const startDate = form.membershipStartedAt ? new Date(form.membershipStartedAt) : new Date();
    const expiry = new Date(startDate.getTime());
    expiry.setMonth(expiry.getMonth() + months);
    setForm((f) => ({
      ...f,
      membershipExpiresAt: expiry.toISOString().split("T")[0],
    }));
  };

  const handleSetExpiredPreset = () => {
    // Set expiry to 1 month in the past
    const past = new Date();
    past.setMonth(past.getMonth() - 1);
    const pastStart = new Date(past.getTime());
    pastStart.setFullYear(pastStart.getFullYear() - 1);

    setForm((f) => ({
      ...f,
      membershipStartedAt: pastStart.toISOString().split("T")[0],
      membershipExpiresAt: past.toISOString().split("T")[0],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const v = validate();
    if (Object.keys(v).length) {
      setErrors(v);
      return;
    }
    setErrors({});

    const isOffline = regMode === "OFFLINE_LEGACY";
    const payload = {
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      password: form.password,
      studentOrVoterId: form.studentOrVoterId.trim(),
      institution: form.institution.trim() || undefined,
      department: form.department.trim() || undefined,
      session: form.session.trim() || undefined,
      paymentMethod: isOffline ? "CASH" : form.paymentMethod,
      isPaid: isOffline ? form.isPaid : false,
      status: isOffline ? ("ACTIVE" as UserStatus) : undefined,
      membershipStartedAt: isOffline && form.membershipStartedAt ? new Date(form.membershipStartedAt).toISOString() : undefined,
      membershipExpiresAt: isOffline && form.membershipExpiresAt ? new Date(form.membershipExpiresAt).toISOString() : undefined,
    };

    registerMember(payload, {
      onSuccess: () => {
        setForm({
          name: "",
          email: "",
          phone: "",
          password: "Library@123",
          studentOrVoterId: "",
          institution: "University of Rajshahi",
          department: "Islamic Studies",
          session: "2024-2025",
          paymentMethod: "CASH",
          membershipStartedAt: todayStr,
          membershipExpiresAt: oneYearFromNowStr,
          isPaid: true,
        });
        onClose();
      },
    });
  };

  const field = (key: keyof typeof form) => ({
    value: form[key] as string,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value })),
  });

  const isExpiredOffline =
    regMode === "OFFLINE_LEGACY" &&
    form.membershipExpiresAt &&
    new Date(form.membershipExpiresAt) < new Date();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in-50">
      <div className="relative w-full max-w-xl rounded-3xl border border-border bg-card p-6 shadow-2xl my-8 space-y-4 max-h-[92vh] overflow-y-auto">
        <button onClick={onClose} className="absolute right-4 top-4 text-muted-foreground hover:text-foreground cursor-pointer">
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 pb-3 border-b border-border">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#004F32] text-white shrink-0">
            <UserPlus className="h-6 w-6 text-amber-300" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-foreground">Add Member to Directory</h3>
            <p className="text-xs text-muted-foreground">Register a new member or onboard a pre-existing offline registered member.</p>
          </div>
        </div>

        {/* Mode Selector Tabs */}
        <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-muted/60 border border-border/80">
          <button
            type="button"
            onClick={() => setRegMode("OFFLINE_LEGACY")}
            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              regMode === "OFFLINE_LEGACY"
                ? "bg-card text-foreground shadow-xs border border-border"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <History className="h-3.5 w-3.5 text-[#004F32] dark:text-emerald-400" />
            <span>Pre-Existing Offline Member</span>
          </button>
          <button
            type="button"
            onClick={() => setRegMode("WALKIN_NEW")}
            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              regMode === "WALKIN_NEW"
                ? "bg-card text-foreground shadow-xs border border-border"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <UserPlus className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
            <span>New Walk-in Applicant</span>
          </button>
        </div>

        {/* Informational Banner based on mode */}
        {regMode === "OFFLINE_LEGACY" ? (
          <div className="rounded-xl border border-emerald-300/40 bg-emerald-500/10 p-3 text-xs text-emerald-950 dark:text-emerald-200 flex items-start gap-2.5">
            <Sparkles className="h-4 w-4 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
            <div className="space-y-1">
              <p className="font-bold">Offline Members Before Website Launch</p>
              <p className="text-[11px] leading-relaxed text-emerald-900/90 dark:text-emerald-300">
                Members who registered physically in the library before this website do <strong>not</strong> need to re-register. Add them here with their existing start &amp; expiry dates. If their validity is already expired, they can directly log in with their credentials and renew their membership.
              </p>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-blue-300/40 bg-blue-500/10 p-3 text-xs text-blue-900 dark:text-blue-200 flex items-start gap-2.5">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-blue-600 dark:text-blue-400" />
            <p className="text-[11px] leading-relaxed">
              Standard new walk-in member registration. Payment can be marked as Cash (awaits counter verification) or Online (awaits gateway payment).
            </p>
          </div>
        )}

        {/* Role Notice */}
        <div className="rounded-xl border border-border bg-muted/40 px-3 py-2 text-[11px] text-muted-foreground flex items-center gap-2">
          <Lock className="h-3.5 w-3.5 text-amber-500 shrink-0" />
          <span>New members are automatically assigned the <strong>MEMBER</strong> role. Shifters cannot alter user roles.</span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          {/* Full Name */}
          <div className="space-y-1">
            <label className="font-semibold text-foreground">Full Name *</label>
            <div className="relative">
              <UserCheck className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <input {...field("name")} placeholder="e.g. Abdullah Al Mamun" className="w-full rounded-xl border border-input bg-background pl-9 pr-3 py-2 text-xs focus:ring-2 focus:ring-primary focus:outline-none" />
            </div>
            {errors.name && <p className="text-red-500 text-[11px]">{errors.name}</p>}
          </div>

          {/* Email + Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-foreground">Email *</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <input {...field("email")} type="email" placeholder="member@ru.ac.bd" className="w-full rounded-xl border border-input bg-background pl-9 pr-3 py-2 text-xs focus:ring-2 focus:ring-primary focus:outline-none" />
              </div>
              {errors.email && <p className="text-red-500 text-[11px]">{errors.email}</p>}
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-foreground">Phone Number *</label>
              <div className="relative">
                <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <input {...field("phone")} placeholder="017XXXXXXXX" className="w-full rounded-xl border border-input bg-background pl-9 pr-3 py-2 text-xs focus:ring-2 focus:ring-primary focus:outline-none" />
              </div>
              {errors.phone && <p className="text-red-500 text-[11px]">{errors.phone}</p>}
            </div>
          </div>

          {/* Student Reg # + Temporary Password */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-foreground">Student Reg # / Voter ID *</label>
              <div className="relative">
                <Hash className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <input {...field("studentOrVoterId")} placeholder="e.g. RU-2023-4512" className="w-full rounded-xl border border-input bg-background pl-9 pr-3 py-2 text-xs focus:ring-2 focus:ring-primary focus:outline-none" />
              </div>
              {errors.studentOrVoterId && <p className="text-red-500 text-[11px]">{errors.studentOrVoterId}</p>}
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-foreground">Initial Account Password *</label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <input {...field("password")} type="text" className="w-full rounded-xl border border-input bg-background pl-9 pr-3 py-2 text-xs font-mono focus:ring-2 focus:ring-primary focus:outline-none" />
              </div>
              {errors.password && <p className="text-red-500 text-[11px]">{errors.password}</p>}
              <p className="text-[10px] text-muted-foreground">Default: Library@123 (member can change after login).</p>
            </div>
          </div>

          {/* Institution + Department + Session */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-foreground">Institution</label>
              <div className="relative">
                <Building className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <input {...field("institution")} placeholder="University of Rajshahi" className="w-full rounded-xl border border-input bg-background pl-9 pr-3 py-2 text-xs focus:ring-2 focus:ring-primary focus:outline-none" />
              </div>
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-foreground">Department</label>
              <div className="relative">
                <GraduationCap className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <input {...field("department")} placeholder="Islamic Studies" className="w-full rounded-xl border border-input bg-background pl-9 pr-3 py-2 text-xs focus:ring-2 focus:ring-primary focus:outline-none" />
              </div>
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-foreground">Academic Session</label>
              <input {...field("session")} placeholder="2024-2025" className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs focus:ring-2 focus:ring-primary focus:outline-none" />
            </div>
          </div>

          {/* Mode-specific Section: Membership Validity (Offline) OR Payment Method (New Walkin) */}
          {regMode === "OFFLINE_LEGACY" ? (
            <div className="rounded-2xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/40 dark:bg-emerald-950/20 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-foreground flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-[#004F32] dark:text-emerald-400" />
                  Offline Membership Validity Dates
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleQuickDuration(6)}
                    className="px-2 py-1 rounded-lg bg-background border border-border text-[10px] font-semibold hover:bg-muted cursor-pointer"
                  >
                    +6 Months
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickDuration(12)}
                    className="px-2 py-1 rounded-lg bg-background border border-border text-[10px] font-semibold hover:bg-muted cursor-pointer"
                  >
                    +1 Year
                  </button>
                  <button
                    type="button"
                    onClick={handleSetExpiredPreset}
                    className="px-2 py-1 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-300/40 text-[10px] font-semibold hover:bg-amber-500/20 cursor-pointer"
                  >
                    Set Expired
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-foreground text-[11px]">Membership Started At</label>
                  <input
                    type="date"
                    value={form.membershipStartedAt}
                    onChange={(e) => setForm((f) => ({ ...f, membershipStartedAt: e.target.value }))}
                    className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                  {errors.membershipStartedAt && <p className="text-red-500 text-[11px]">{errors.membershipStartedAt}</p>}
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-foreground text-[11px]">Membership Expires At</label>
                  <input
                    type="date"
                    value={form.membershipExpiresAt}
                    onChange={(e) => setForm((f) => ({ ...f, membershipExpiresAt: e.target.value }))}
                    className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                  {errors.membershipExpiresAt && <p className="text-red-500 text-[11px]">{errors.membershipExpiresAt}</p>}
                </div>
              </div>

              {/* Expiry dynamic feedback */}
              <div className="text-[11px] pt-1">
                {isExpiredOffline ? (
                  <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400 font-medium">
                    <Clock className="h-3.5 w-3.5 shrink-0" />
                    <span>This member will be registered with <strong>Expired</strong> status. They can immediately log in and click <strong>"Renew Membership"</strong>.</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-medium">
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                    <span>This member will be activated with <strong>Active</strong> status until <strong>{form.membershipExpiresAt}</strong>.</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-1">
              <label className="font-semibold text-foreground">Membership Fee Payment Method</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { val: "CASH", label: "Cash (At Desk)", sub: "Status → Pending Approval" },
                  { val: "ONLINE", label: "Online (bKash / Nagad)", sub: "Status → Pending Payment" },
                ].map(({ val, label, sub }) => (
                  <button
                    type="button"
                    key={val}
                    onClick={() => setForm((f) => ({ ...f, paymentMethod: val }))}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      form.paymentMethod === val
                        ? "border-emerald-600 bg-emerald-500/10"
                        : "border-border bg-muted/30 hover:bg-muted/60"
                    }`}
                  >
                    <p className="font-bold text-foreground">{label}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{sub}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="pt-2 flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-semibold rounded-xl border border-input bg-background hover:bg-accent text-foreground cursor-pointer">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold rounded-xl bg-[#004F32] hover:bg-emerald-900 text-white shadow-xs disabled:opacity-50 cursor-pointer"
            >
              <UserPlus className="h-3.5 w-3.5 text-amber-300" />
              <span>{isPending ? "Adding..." : regMode === "OFFLINE_LEGACY" ? "Add Offline Member" : "Register Member"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Edit Member Validity Modal ────────────────────────────────────────────────
function EditMemberValidityModal({
  user,
  isOpen,
  onClose,
}: {
  user: IUser | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  const { mutate: updateMember, isPending } = useUpdateMemberDetails();

  const [startedAt, setStartedAt] = useState("");
  const [expiresAt, setExpiresAt] = useState("");

  React.useEffect(() => {
    if (user) {
      if (user.membershipStartedAt) {
        setStartedAt(new Date(user.membershipStartedAt).toISOString().split("T")[0]);
      } else {
        setStartedAt(new Date().toISOString().split("T")[0]);
      }
      if (user.membershipExpiresAt) {
        setExpiresAt(new Date(user.membershipExpiresAt).toISOString().split("T")[0]);
      } else {
        const next = new Date();
        next.setFullYear(next.getFullYear() + 1);
        setExpiresAt(next.toISOString().split("T")[0]);
      }
    }
  }, [user]);

  if (!isOpen || !user) return null;

  const handleQuickAddMonths = (months: number) => {
    const base = expiresAt ? new Date(expiresAt) : new Date();
    base.setMonth(base.getMonth() + months);
    setExpiresAt(base.toISOString().split("T")[0]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMember(
      {
        userId: user.id,
        payload: {
          membershipStartedAt: startedAt ? new Date(startedAt).toISOString() : undefined,
          membershipExpiresAt: expiresAt ? new Date(expiresAt).toISOString() : undefined,
          status: "ACTIVE",
          isPaid: true,
        },
      },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in-50">
      <div className="relative w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-4">
        <button onClick={onClose} className="absolute right-4 top-4 text-muted-foreground hover:text-foreground cursor-pointer">
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3 pb-3 border-b border-border">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#004F32] text-white">
            <Calendar className="h-5 w-5 text-amber-300" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-foreground">Edit Membership Validity</h3>
            <p className="text-xs text-muted-foreground">{user.name} ({user.studentOrVoterId || user.email})</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-[11px]">Quick Extend Expiry:</span>
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => handleQuickAddMonths(6)}
                className="px-2.5 py-1 rounded-lg bg-muted border border-border text-[11px] font-semibold hover:bg-muted/80 cursor-pointer"
              >
                +6 Months
              </button>
              <button
                type="button"
                onClick={() => handleQuickAddMonths(12)}
                className="px-2.5 py-1 rounded-lg bg-muted border border-border text-[11px] font-semibold hover:bg-muted/80 cursor-pointer"
              >
                +1 Year
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-foreground">Membership Start Date</label>
            <input
              type="date"
              value={startedAt}
              onChange={(e) => setStartedAt(e.target.value)}
              className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-foreground">Membership Expiration Date</label>
            <input
              type="date"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl border border-input bg-background hover:bg-accent text-foreground cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold rounded-xl bg-[#004F32] hover:bg-emerald-900 text-white shadow-xs disabled:opacity-50 cursor-pointer"
            >
              <Check className="h-4 w-4 text-amber-300" />
              <span>{isPending ? "Saving..." : "Save Validity Dates"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main Members Page ─────────────────────────────────────────────────────────
export default function ShifterMembersPage() {
  const { data: users = [], isLoading } = useGetUsers();
  const { mutate: approveCash, isPending: isApprovingCash } = useApproveCashPayment();
  const { mutate: approveMembership, isPending: isApprovingMembership } = useApproveMembership();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "PENDING_APPROVAL" | "PENDING_PAYMENT" | "EXPIRED">("ALL");
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [editingValidityUser, setEditingValidityUser] = useState<IUser | null>(null);

  const now = new Date();

  const isUserExpired = (u: IUser) => {
    if (!u.membershipExpiresAt) return false;
    return new Date(u.membershipExpiresAt) < now;
  };

  const filtered: IUser[] = users.filter((u) => {
    const term = search.toLowerCase();
    const nameMatch = (u.name ?? "").toLowerCase().includes(term);
    const emailMatch = (u.email ?? "").toLowerCase().includes(term);
    const idMatch = (u.studentOrVoterId ?? "").toLowerCase().includes(term);
    const phoneMatch = ((u.phone ?? u.phoneNumber) ?? "").toLowerCase().includes(term);

    let statusMatch = true;
    if (statusFilter === "EXPIRED") {
      statusMatch = isUserExpired(u);
    } else if (statusFilter !== "ALL") {
      statusMatch = u.status === statusFilter;
    }

    return (nameMatch || emailMatch || idMatch || phoneMatch) && statusMatch;
  });

  const totalMembers = users.filter((u) => u.role === "MEMBER").length;
  const activeMembers = users.filter((u) => u.status === "ACTIVE" && !isUserExpired(u)).length;
  const pendingPayment = users.filter((u) => u.status === "PENDING_PAYMENT").length;
  const pendingApproval = users.filter((u) => u.status === "PENDING_APPROVAL").length;
  const expiredMembers = users.filter((u) => isUserExpired(u)).length;

  const handleApproveCash = (user: IUser) => {
    setProcessingId(String(user.id));
    approveCash({ userId: user.id }, { onSettled: () => setProcessingId(null) });
  };

  const handleApproveMembership = (user: IUser) => {
    setProcessingId(String(user.id));
    approveMembership(user.id, { onSettled: () => setProcessingId(null) });
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground flex items-center gap-2">
            <Users className="h-6 w-6 text-[#004F32]" />
            Member Directory &amp; Registration
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Register new members, onboard offline-registered members with their validity dates, approve membership requests, and verify cash payments.
          </p>
        </div>

        <button
          onClick={() => setAddMemberOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-[#004F32] hover:bg-emerald-900 px-4 py-2.5 text-xs font-bold text-white shadow-xs transition-all cursor-pointer"
        >
          <UserPlus className="h-4 w-4 text-amber-300" />
          <span>Add Member / Offline Member</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: "Total Members", value: totalMembers, icon: <Users className="h-4 w-4" />, color: "text-[#004F32] dark:text-emerald-400", bg: "bg-[#004F32]/10" },
          { label: "Active Members", value: activeMembers, icon: <CheckCircle2 className="h-4 w-4" />, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/10" },
          { label: "Pending Approval", value: pendingApproval, icon: <AlertCircle className="h-4 w-4" />, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-500/10" },
          { label: "Pending Payment", value: pendingPayment, icon: <Banknote className="h-4 w-4" />, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-500/10" },
          { label: "Expired Validity", value: expiredMembers, icon: <Clock className="h-4 w-4" />, color: "text-rose-600 dark:text-rose-400", bg: "bg-rose-500/10" },
        ].map(({ label, value, icon, color, bg }) => (
          <div key={label} className="rounded-2xl border border-border bg-card p-4 space-y-1.5">
            <div className={`h-8 w-8 rounded-xl ${bg} flex items-center justify-center ${color}`}>{icon}</div>
            <p className={`text-xl font-extrabold ${color}`}>{value}</p>
            <p className="text-[11px] text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>

      {/* Pending Approval Callout Banner */}
      {pendingApproval > 0 && (
        <div className="rounded-2xl border border-blue-300/40 bg-blue-500/10 p-4 flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <div className="text-xs">
              <p className="font-bold text-blue-900 dark:text-blue-200">
                {pendingApproval} Membership {pendingApproval === 1 ? "Request" : "Requests"} Awaiting Desk Approval
              </p>
              <p className="text-blue-800 dark:text-blue-300 mt-0.5">
                Review verified applicants who paid in cash at the counter desk to activate their accounts.
              </p>
            </div>
          </div>
          <button
            onClick={() => setStatusFilter("PENDING_APPROVAL")}
            className="shrink-0 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold cursor-pointer"
          >
            Review Requests
          </button>
        </div>
      )}

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, phone, or student ID..."
            className="w-full rounded-xl border border-input bg-card pl-9 pr-3 py-2 text-xs focus:ring-2 focus:ring-primary focus:outline-none"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {([
            { val: "ALL", label: "All" },
            { val: "ACTIVE", label: "Active" },
            { val: "PENDING_APPROVAL", label: "Pending Approval" },
            { val: "PENDING_PAYMENT", label: "Pending Payment" },
            { val: "EXPIRED", label: "Expired" },
          ] as const).map(({ val, label }) => (
            <button
              key={val}
              onClick={() => setStatusFilter(val)}
              className={`rounded-lg px-3 py-2 text-[11px] font-bold transition-colors cursor-pointer ${
                statusFilter === val
                  ? "bg-[#004F32] text-white"
                  : "border border-input bg-card text-muted-foreground hover:bg-accent"
              }`}
            >
              {label}
              {val === "PENDING_APPROVAL" && pendingApproval > 0 && (
                <span className="ml-1.5 rounded-full bg-blue-500 text-white px-1.5 py-0.5 text-[9px] font-bold">{pendingApproval}</span>
              )}
              {val === "PENDING_PAYMENT" && pendingPayment > 0 && (
                <span className="ml-1.5 rounded-full bg-amber-500 text-white px-1.5 py-0.5 text-[9px] font-bold">{pendingPayment}</span>
              )}
              {val === "EXPIRED" && expiredMembers > 0 && (
                <span className="ml-1.5 rounded-full bg-rose-500 text-white px-1.5 py-0.5 text-[9px] font-bold">{expiredMembers}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Members Directory Table */}
      <div className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-muted-foreground">Loading member directory...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground text-xs space-y-2">
            <Users className="h-8 w-8 mx-auto text-muted" />
            <p>No members match the search or filter criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="px-4 py-3 font-semibold text-muted-foreground">Member &amp; ID</th>
                  <th className="px-4 py-3 font-semibold text-muted-foreground">Contact</th>
                  <th className="px-4 py-3 font-semibold text-muted-foreground">Role</th>
                  <th className="px-4 py-3 font-semibold text-muted-foreground">Membership Validity</th>
                  <th className="px-4 py-3 font-semibold text-muted-foreground">Status</th>
                  <th className="px-4 py-3 font-semibold text-muted-foreground text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filtered.map((u) => {
                  const statusCfg = STATUS_MAP[u.status ?? "ACTIVE"];
                  const isPendingCash = u.status === "PENDING_PAYMENT" && u.paymentMethod === "CASH";
                  const isPendingApproval = u.status === "PENDING_APPROVAL";
                  const isProcessing = (isApprovingCash || isApprovingMembership) && processingId === String(u.id);
                  const expired = isUserExpired(u);

                  return (
                    <tr key={String(u.id)} className="hover:bg-muted/30 transition-colors">
                      {/* Member info */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#004F32] to-emerald-700 flex items-center justify-center text-white font-bold text-xs shrink-0">
                            {u.name ? u.name[0].toUpperCase() : "U"}
                          </div>
                          <div>
                            <p className="font-bold text-foreground">{u.name}</p>
                            <p className="text-[11px] text-muted-foreground font-mono">{u.studentOrVoterId ?? "—"}</p>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="px-4 py-3.5">
                        <div className="space-y-0.5">
                          <p className="flex items-center gap-1 text-muted-foreground">
                            <Mail className="h-3 w-3" /> {u.email}
                          </p>
                          {(u.phone ?? u.phoneNumber) && (
                            <p className="flex items-center gap-1 text-muted-foreground">
                              <Phone className="h-3 w-3" /> {u.phone ?? u.phoneNumber}
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Role (Read-only for Shifter) */}
                      <td className="px-4 py-3.5">
                        <div className="space-y-0.5">
                          <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-[11px] font-bold text-foreground">
                            <Shield className="h-3 w-3 text-primary" />
                            {u.role}
                          </span>
                          <p className="text-[9px] text-muted-foreground flex items-center gap-0.5">
                            <Lock className="h-2.5 w-2.5 text-muted-foreground" /> Non-editable
                          </p>
                        </div>
                      </td>

                      {/* Membership Validity Window */}
                      <td className="px-4 py-3.5">
                        <div className="space-y-1">
                          {u.membershipExpiresAt ? (
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-1 font-mono text-[11px]">
                                {expired ? (
                                  <span className="inline-flex items-center gap-1 text-rose-600 dark:text-rose-400 font-bold">
                                    <Clock className="h-3 w-3" /> Expired {format(new Date(u.membershipExpiresAt), "dd MMM yyyy")}
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-medium">
                                    <CheckCircle2 className="h-3 w-3" /> Valid to {format(new Date(u.membershipExpiresAt), "dd MMM yyyy")}
                                  </span>
                                )}
                              </div>
                              {u.membershipStartedAt && (
                                <p className="text-[10px] text-muted-foreground font-mono">
                                  From {format(new Date(u.membershipStartedAt), "dd MMM yyyy")}
                                </p>
                              )}
                            </div>
                          ) : (
                            <span className="text-[11px] text-muted-foreground italic">Not set</span>
                          )}

                          <button
                            type="button"
                            onClick={() => setEditingValidityUser(u)}
                            className="inline-flex items-center gap-1 text-[10px] font-semibold text-primary hover:underline cursor-pointer"
                          >
                            <Edit2 className="h-2.5 w-2.5" /> Edit Validity
                          </button>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5">
                        <div className="space-y-1">
                          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold ${statusCfg.className}`}>
                            {statusCfg.icon} {statusCfg.label}
                          </span>
                          {expired && (
                            <span className="block text-[10px] font-bold text-amber-600 dark:text-amber-400">
                              Needs Renewal
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Action */}
                      <td className="px-4 py-3.5 text-right">
                        {isPendingApproval ? (
                          <button
                            onClick={() => handleApproveMembership(u)}
                            disabled={isProcessing}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 px-3 py-1.5 text-[11px] font-bold text-white shadow-xs transition-all disabled:opacity-60 cursor-pointer"
                          >
                            <UserCheck className="h-3.5 w-3.5" />
                            {isProcessing ? "Approving..." : "Approve Membership"}
                          </button>
                        ) : isPendingCash ? (
                          <button
                            onClick={() => handleApproveCash(u)}
                            disabled={isProcessing}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-[#C78700] hover:bg-amber-600 px-3 py-1.5 text-[11px] font-bold text-white shadow-xs transition-all disabled:opacity-60 cursor-pointer"
                          >
                            <Banknote className="h-3.5 w-3.5" />
                            {isProcessing ? "Approving..." : "Approve Cash"}
                          </button>
                        ) : u.status === "ACTIVE" ? (
                          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                            <UserCheck className="h-3.5 w-3.5" /> Verified
                          </span>
                        ) : (
                          <span className="text-[11px] text-muted-foreground">—</span>
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

      {/* Permission boundary information notice */}
      <div className="rounded-2xl border border-border bg-card p-5 space-y-3 shadow-xs">
        <div className="flex items-center gap-2 text-foreground font-bold text-xs">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          <span>Shifter Access &amp; Permission Guidelines</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="rounded-xl border border-emerald-300/40 bg-emerald-500/5 p-3 space-y-1">
            <p className="font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              Add &amp; Register Members
            </p>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Register walk-in members or onboard offline-registered members with existing <code className="font-mono text-[10px]">membershipStartedAt</code> &amp; <code className="font-mono text-[10px]">membershipExpiresAt</code>.
            </p>
          </div>
          <div className="rounded-xl border border-blue-300/40 bg-blue-500/5 p-3 space-y-1">
            <p className="font-bold text-blue-900 dark:text-blue-300 flex items-center gap-1.5">
              <UserCheck className="h-3.5 w-3.5 text-blue-600" />
              Approve Requests
            </p>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Verify counter cash fee payments and approve pending membership applications to immediately activate library access.
            </p>
          </div>
          <div className="rounded-xl border border-amber-300/40 bg-amber-500/5 p-3 space-y-1">
            <p className="font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5 text-amber-600" />
              Role Editing Restricted
            </p>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Shifters cannot edit user roles (Member, Shifter, Admin, Super Admin) of any user including their own account. Role promotion is strictly restricted to Admins.
            </p>
          </div>
        </div>
      </div>

      {/* Add Member Modal */}
      <AddMemberModal isOpen={addMemberOpen} onClose={() => setAddMemberOpen(false)} />

      {/* Edit Validity Modal */}
      <EditMemberValidityModal
        user={editingValidityUser}
        isOpen={Boolean(editingValidityUser)}
        onClose={() => setEditingValidityUser(null)}
      />
    </div>
  );
}

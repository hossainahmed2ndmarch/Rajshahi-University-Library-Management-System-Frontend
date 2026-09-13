"use client";

import React, { useState } from "react";
import {
  UserPlus,
  X,
  Mail,
  Phone,
  Hash,
  Building,
  GraduationCap,
  Calendar,
  Lock,
  AlertCircle,
  Sparkles,
  History,
  Clock,
  CheckCircle2,
  UserCheck,
} from "lucide-react";
import { useRegisterMemberByStaff, useGetUserOptions } from "@/hooks/useUsers";
import { UserStatus } from "@/types/auth";
import { SearchableSelect } from "@/components/ui/SearchableSelect";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function todayStr() {
  return new Date().toISOString().split("T")[0];
}

function oneYearFromNowStr() {
  const d = new Date();
  d.setFullYear(d.getFullYear() + 1);
  return d.toISOString().split("T")[0];
}

type RegMode = "OFFLINE_LEGACY" | "WALKIN_NEW";

interface FormState {
  name: string;
  email: string;
  phone: string;
  password: string;
  studentOrVoterId: string;
  institution: string;
  department: string;
  session: string;
  paymentMethod: string;
  membershipStartedAt: string;
  membershipExpiresAt: string;
  isPaid: boolean;
}

const DEFAULT_FORM: FormState = {
  name: "",
  email: "",
  phone: "",
  password: "Library@123",
  studentOrVoterId: "",
  institution: "University of Rajshahi",
  department: "Islamic Studies",
  session: "2024-2025",
  paymentMethod: "CASH",
  membershipStartedAt: todayStr(),
  membershipExpiresAt: oneYearFromNowStr(),
  isPaid: true,
};

// ─── Sub-components ───────────────────────────────────────────────────────────

interface FieldWrapProps {
  label: string;
  error?: string;
  children: React.ReactNode;
}
function FieldWrap({ label, error, children }: FieldWrapProps) {
  return (
    <div className="space-y-1">
      <label className="font-semibold text-foreground text-xs">{label}</label>
      {children}
      {error && <p className="text-red-500 text-[11px]">{error}</p>}
    </div>
  );
}

interface IconInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon: React.ReactNode;
}
function IconInput({ icon, className, ...props }: IconInputProps) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
        {icon}
      </span>
      <input
        {...props}
        className={`w-full rounded-xl border border-input bg-background pl-9 pr-3 py-2 text-xs focus:ring-2 focus:ring-primary focus:outline-none ${className ?? ""}`}
      />
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddMemberModal({ isOpen, onClose }: AddMemberModalProps) {
  const { mutate: registerMember, isPending } = useRegisterMemberByStaff();
  const { data: userOptions } = useGetUserOptions();
  const departmentOptions = userOptions?.departments ?? [];
  const sessionOptions = userOptions?.sessions ?? [];

  const [regMode, setRegMode] = useState<RegMode>("OFFLINE_LEGACY");
  const [form, setForm] = useState<FormState>({ ...DEFAULT_FORM });
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  // ── Helpers ────────────────────────────────────────────────────────────────

  const set = <K extends keyof FormState>(key: K, val: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: val }));

  const validate = (): Record<string, string> => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Full name is required";
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "Valid email required";
    if (!form.phone.trim() || form.phone.length < 10)
      e.phone = "Valid phone number required";
    if (!form.studentOrVoterId.trim())
      e.studentOrVoterId = "Student Reg # or Voter ID required";
    if (!form.password || form.password.length < 6)
      e.password = "Password must be at least 6 characters";
    if (regMode === "OFFLINE_LEGACY") {
      if (!form.membershipStartedAt)
        e.membershipStartedAt = "Start date is required";
      if (!form.membershipExpiresAt)
        e.membershipExpiresAt = "Expiry date is required";
    }
    return e;
  };

  const handleQuickDuration = (months: number) => {
    const startDate = form.membershipStartedAt
      ? new Date(form.membershipStartedAt)
      : new Date();
    const expiry = new Date(startDate.getTime());
    expiry.setMonth(expiry.getMonth() + months);
    set("membershipExpiresAt", expiry.toISOString().split("T")[0]);
  };

  const handleSetExpiredPreset = () => {
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
    const isExpiredOffline =
      isOffline &&
      form.membershipExpiresAt &&
      new Date(form.membershipExpiresAt) < new Date();

    registerMember(
      {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        password: form.password,
        studentOrVoterId: form.studentOrVoterId.trim(),
        institution: form.institution.trim() || undefined,
        department: form.department.trim() || undefined,
        session: form.session.trim() || undefined,
        paymentMethod: isOffline ? "CASH" : (form.paymentMethod as "CASH" | "ONLINE"),
        isPaid: isOffline ? form.isPaid : false,
        status: isOffline ? ("ACTIVE" as UserStatus) : undefined,
        membershipStartedAt:
          isOffline && form.membershipStartedAt
            ? new Date(form.membershipStartedAt).toISOString()
            : undefined,
        membershipExpiresAt:
          isOffline && form.membershipExpiresAt
            ? new Date(form.membershipExpiresAt).toISOString()
            : undefined,
      },
      {
        onSuccess: () => {
          setForm({ ...DEFAULT_FORM });
          onClose();
        },
      },
    );

    void isExpiredOffline; // used only for display
  };

  const isExpiredOffline =
    regMode === "OFFLINE_LEGACY" &&
    form.membershipExpiresAt &&
    new Date(form.membershipExpiresAt) < new Date();

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in-50">
      <div className="relative w-full max-w-xl rounded-3xl border border-border bg-card p-6 shadow-2xl my-8 space-y-4 max-h-[92vh] overflow-y-auto">

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-muted-foreground hover:text-foreground cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 pb-3 border-b border-border">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#004F32] text-white shrink-0">
            <UserPlus className="h-6 w-6 text-amber-300" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-foreground">
              Add Member to Directory
            </h3>
            <p className="text-xs text-muted-foreground">
              Register a new member or onboard a pre-existing offline registered member.
            </p>
          </div>
        </div>

        {/* Mode Selector */}
        <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-muted/60 border border-border/80">
          {(
            [
              {
                mode: "OFFLINE_LEGACY" as RegMode,
                icon: <History className="h-3.5 w-3.5 text-[#004F32] dark:text-emerald-400" />,
                label: "Pre-Existing Offline Member",
              },
              {
                mode: "WALKIN_NEW" as RegMode,
                icon: <UserPlus className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />,
                label: "New Walk-in Applicant",
              },
            ] as const
          ).map(({ mode, icon, label }) => (
            <button
              key={mode}
              type="button"
              onClick={() => setRegMode(mode)}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                regMode === mode
                  ? "bg-card text-foreground shadow-xs border border-border"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {icon}
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* Banner */}
        {regMode === "OFFLINE_LEGACY" ? (
          <div className="rounded-xl border border-emerald-300/40 bg-emerald-500/10 p-3 text-xs text-emerald-950 dark:text-emerald-200 flex items-start gap-2.5">
            <Sparkles className="h-4 w-4 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
            <div className="space-y-1">
              <p className="font-bold">Offline Members Before Website Launch</p>
              <p className="text-[11px] leading-relaxed text-emerald-900/90 dark:text-emerald-300">
                Members who registered physically in the library before this website do{" "}
                <strong>not</strong> need to re-register. Add them here with their existing
                start &amp; expiry dates. If their validity is already expired, the status
                will automatically be set to <strong>Inactive</strong>.
              </p>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-blue-300/40 bg-blue-500/10 p-3 text-xs text-blue-900 dark:text-blue-200 flex items-start gap-2.5">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-blue-600 dark:text-blue-400" />
            <p className="text-[11px] leading-relaxed">
              Standard new walk-in member registration. Payment can be marked as Cash
              (awaits counter verification) or Online (awaits gateway payment).
            </p>
          </div>
        )}

        {/* Role Notice */}
        <div className="rounded-xl border border-border bg-muted/40 px-3 py-2 text-[11px] text-muted-foreground flex items-center gap-2">
          <Lock className="h-3.5 w-3.5 text-amber-500 shrink-0" />
          <span>
            New members are automatically assigned the <strong>MEMBER</strong> role.
            Shifters cannot alter user roles.
          </span>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3 text-xs">

          {/* Full Name */}
          <FieldWrap label="Full Name *" error={errors.name}>
            <IconInput
              icon={<UserCheck className="h-4 w-4" />}
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="e.g. Abdullah Al Mamun"
            />
          </FieldWrap>

          {/* Email + Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FieldWrap label="Email *" error={errors.email}>
              <IconInput
                icon={<Mail className="h-4 w-4" />}
                type="email"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                placeholder="member@ru.ac.bd"
              />
            </FieldWrap>
            <FieldWrap label="Phone Number *" error={errors.phone}>
              <IconInput
                icon={<Phone className="h-4 w-4" />}
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
                placeholder="017XXXXXXXX"
              />
            </FieldWrap>
          </div>

          {/* Student ID + Password */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FieldWrap label="Student Reg # / Voter ID *" error={errors.studentOrVoterId}>
              <IconInput
                icon={<Hash className="h-4 w-4" />}
                value={form.studentOrVoterId}
                onChange={(e) => set("studentOrVoterId", e.target.value)}
                placeholder="e.g. RU-2023-4512"
              />
            </FieldWrap>
            <FieldWrap label="Initial Account Password *" error={errors.password}>
              <div>
                <IconInput
                  icon={<Lock className="h-4 w-4" />}
                  type="text"
                  value={form.password}
                  onChange={(e) => set("password", e.target.value)}
                  className="font-mono"
                />
                <p className="text-[10px] text-muted-foreground mt-1">
                  Default: Library@123 (member can change after login).
                </p>
              </div>
            </FieldWrap>
          </div>

          {/* Institution + Department + Session */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <FieldWrap label="Institution">
              <IconInput
                icon={<Building className="h-4 w-4" />}
                value={form.institution}
                onChange={(e) => set("institution", e.target.value)}
                placeholder="University of Rajshahi"
              />
            </FieldWrap>

            <FieldWrap label="Department">
              <SearchableSelect
                id="add-department"
                value={form.department}
                onChange={(val) => set("department", val)}
                options={departmentOptions}
                placeholder="Select or type dept."
                icon={<GraduationCap className="h-4 w-4" />}
                listLabel="RU Departments"
              />
            </FieldWrap>

            <FieldWrap label="Academic Session">
              <SearchableSelect
                id="add-session"
                value={form.session}
                onChange={(val) => set("session", val)}
                options={sessionOptions}
                placeholder="e.g. 2024-2025"
                icon={<Calendar className="h-4 w-4" />}
                listLabel="Academic Sessions"
              />
            </FieldWrap>
          </div>

          {/* Mode-specific section */}
          {regMode === "OFFLINE_LEGACY" ? (
            <div className="rounded-2xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/40 dark:bg-emerald-950/20 p-4 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="font-bold text-xs text-foreground flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-[#004F32] dark:text-emerald-400" />
                  Offline Membership Validity Dates
                </span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {[
                    { months: 3, label: "+3M (৳100)" },
                    { months: 6, label: "+6M (৳200)" },
                    { months: 12, label: "+1Y (৳400)" },
                  ].map(({ months, label }) => (
                    <button
                      key={months}
                      type="button"
                      onClick={() => handleQuickDuration(months)}
                      className="px-2 py-1 rounded-lg bg-background border border-border text-[10px] font-semibold hover:bg-muted cursor-pointer"
                    >
                      {label}
                    </button>
                  ))}
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
                  <label className="font-semibold text-foreground text-[11px]">
                    Membership Started At
                  </label>
                  <input
                    type="date"
                    value={form.membershipStartedAt}
                    onChange={(e) => set("membershipStartedAt", e.target.value)}
                    className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                  {errors.membershipStartedAt && (
                    <p className="text-red-500 text-[11px]">{errors.membershipStartedAt}</p>
                  )}
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-foreground text-[11px]">
                    Membership Expires At
                  </label>
                  <input
                    type="date"
                    value={form.membershipExpiresAt}
                    onChange={(e) => set("membershipExpiresAt", e.target.value)}
                    className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                  {errors.membershipExpiresAt && (
                    <p className="text-red-500 text-[11px]">{errors.membershipExpiresAt}</p>
                  )}
                </div>
              </div>

              <div className="text-[11px] pt-1">
                {isExpiredOffline ? (
                  <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400 font-medium">
                    <Clock className="h-3.5 w-3.5 shrink-0" />
                    <span>
                      This member will be registered with <strong>Inactive</strong> status
                      (expired). They can log in and renew their membership.
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-medium">
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                    <span>
                      This member will be activated with <strong>Active</strong> status until{" "}
                      <strong>{form.membershipExpiresAt}</strong>.
                    </span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-1">
              <label className="font-semibold text-foreground">
                Membership Fee Payment Method
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  {
                    val: "CASH",
                    label: "Cash (At Desk)",
                    sub: "Status → Pending Approval",
                  },
                  {
                    val: "ONLINE",
                    label: "Online (bKash / Nagad)",
                    sub: "Status → Pending Payment",
                  },
                ].map(({ val, label, sub }) => (
                  <button
                    type="button"
                    key={val}
                    onClick={() => set("paymentMethod", val)}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      form.paymentMethod === val
                        ? "border-emerald-600 bg-emerald-500/10"
                        : "border-border bg-muted/30 hover:bg-muted/60"
                    }`}
                  >
                    <p className="font-bold text-foreground text-xs">{label}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{sub}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
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
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold rounded-xl bg-[#004F32] hover:bg-emerald-900 text-white shadow-xs disabled:opacity-50 cursor-pointer"
            >
              <UserPlus className="h-3.5 w-3.5 text-amber-300" />
              <span>
                {isPending
                  ? "Adding…"
                  : regMode === "OFFLINE_LEGACY"
                    ? "Add Offline Member"
                    : "Register Member"}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

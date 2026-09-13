"use client";

import React, { useState, useEffect } from "react";
import {
  Edit2,
  X,
  Phone,
  Mail,
  Hash,
  Building,
  GraduationCap,
  Calendar,
  AlertTriangle,
  Ban,
  Shield,
  Check,
  User,
} from "lucide-react";
import { IUser, UserStatus } from "@/types/auth";
import { useUpdateMemberDetails, useGetUserOptions } from "@/hooks/useUsers";
import { SearchableSelect } from "@/components/ui/SearchableSelect";

// ─── Shared sub-components ────────────────────────────────────────────────────

interface FieldWrapProps {
  label: string;
  children: React.ReactNode;
}
function FieldWrap({ label, children }: FieldWrapProps) {
  return (
    <div className="space-y-1">
      <label className="font-semibold text-foreground text-xs">{label}</label>
      {children}
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

// ─── Props ────────────────────────────────────────────────────────────────────

export interface EditMemberModalProps {
  user: IUser | null;
  isOpen: boolean;
  onClose: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function EditMemberModal({ user, isOpen, onClose }: EditMemberModalProps) {
  const { mutate: updateMember, isPending } = useUpdateMemberDetails();
  const { data: userOptions } = useGetUserOptions();
  const departmentOptions = userOptions?.departments ?? [];
  const sessionOptions = userOptions?.sessions ?? [];

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    studentOrVoterId: "",
    institution: "",
    department: "",
    session: "",
    membershipStartedAt: "",
    membershipExpiresAt: "",
    isBlocked: false,
  });

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name ?? "",
        phone: (user.phone ?? user.phoneNumber) ?? "",
        email: user.email ?? "",
        studentOrVoterId: user.studentOrVoterId ?? "",
        institution: user.institution ?? "",
        department: user.department ?? "",
        session: user.session ?? "",
        membershipStartedAt: user.membershipStartedAt
          ? new Date(user.membershipStartedAt).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        membershipExpiresAt: user.membershipExpiresAt
          ? new Date(user.membershipExpiresAt).toISOString().split("T")[0]
          : (() => {
              const next = new Date();
              next.setFullYear(next.getFullYear() + 1);
              return next.toISOString().split("T")[0];
            })(),
        isBlocked: user.status === "BLOCKED",
      });
    }
  }, [user]);

  if (!isOpen || !user) return null;

  const set = <K extends keyof typeof form>(key: K, val: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [key]: val }));

  const handleQuickAddMonths = (months: number) => {
    const base = form.membershipExpiresAt
      ? new Date(form.membershipExpiresAt)
      : new Date();
    base.setMonth(base.getMonth() + months);
    set("membershipExpiresAt", base.toISOString().split("T")[0]);
  };

  const isExpired =
    form.membershipExpiresAt && new Date(form.membershipExpiresAt) < new Date();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const expiresAt = form.membershipExpiresAt
      ? new Date(form.membershipExpiresAt)
      : null;
    const isExpiredNow = expiresAt && expiresAt < new Date();

    const status: UserStatus | undefined = form.isBlocked ? "BLOCKED" : undefined;

    updateMember(
      {
        userId: user.id,
        payload: {
          name: form.name.trim() || undefined,
          phone: form.phone.trim() || undefined,
          email:
            form.email.trim() !== user.email ? form.email.trim() : undefined,
          studentOrVoterId:
            form.studentOrVoterId.trim() !== user.studentOrVoterId
              ? form.studentOrVoterId.trim()
              : undefined,
          institution: form.institution.trim() || undefined,
          department: form.department.trim() || undefined,
          session: form.session.trim() || undefined,
          membershipStartedAt: form.membershipStartedAt
            ? new Date(form.membershipStartedAt).toISOString()
            : undefined,
          membershipExpiresAt: form.membershipExpiresAt
            ? new Date(form.membershipExpiresAt).toISOString()
            : undefined,
          status,
          isPaid: !isExpiredNow,
        },
      },
      { onSuccess: onClose },
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in-50">
      <div className="relative w-full max-w-xl rounded-3xl border border-border bg-card p-6 shadow-2xl my-8 space-y-4 max-h-[92vh] overflow-y-auto text-card-foreground">

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
            <Edit2 className="h-5 w-5 text-amber-300" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-foreground">Edit Member Details</h3>
            <p className="text-xs text-muted-foreground">
              {user.name} · {user.studentOrVoterId || user.email}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">

          {/* Name + Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FieldWrap label="Full Name">
              <IconInput
                icon={<User className="h-4 w-4" />}
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="Full name"
              />
            </FieldWrap>
            <FieldWrap label="Phone Number">
              <IconInput
                icon={<Phone className="h-4 w-4" />}
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
                placeholder="017XXXXXXXX"
              />
            </FieldWrap>
          </div>

          {/* Email + Student/Voter ID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FieldWrap label="Registered Email">
              <IconInput
                icon={<Mail className="h-4 w-4" />}
                type="email"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                placeholder="member@ru.ac.bd"
              />
            </FieldWrap>
            <FieldWrap label="Student / Voter ID">
              <IconInput
                icon={<Hash className="h-4 w-4" />}
                value={form.studentOrVoterId}
                onChange={(e) => set("studentOrVoterId", e.target.value)}
                placeholder="e.g. RU-2023-4512"
                className="font-mono"
              />
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
                id="edit-modal-department"
                value={form.department}
                onChange={(val) => set("department", val)}
                options={departmentOptions}
                placeholder="Select or type"
                icon={<GraduationCap className="h-4 w-4" />}
                listLabel="RU Departments"
              />
            </FieldWrap>

            <FieldWrap label="Academic Session">
              <SearchableSelect
                id="edit-modal-session"
                value={form.session}
                onChange={(val) => set("session", val)}
                options={sessionOptions}
                placeholder="e.g. 2024-2025"
                icon={<Calendar className="h-4 w-4" />}
                listLabel="Academic Sessions"
              />
            </FieldWrap>
          </div>

          {/* Membership Validity */}
          <div className="rounded-2xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/40 dark:bg-emerald-950/20 p-4 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="font-bold text-xs text-foreground flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-[#004F32] dark:text-emerald-400" />
                Membership Validity Dates
              </span>
              <div className="flex gap-1.5">
                {[
                  { months: 3, label: "+3M (৳100)" },
                  { months: 6, label: "+6M (৳200)" },
                  { months: 12, label: "+1Y (৳400)" },
                ].map(({ months, label }) => (
                  <button
                    key={months}
                    type="button"
                    onClick={() => handleQuickAddMonths(months)}
                    className="px-2 py-1 rounded-lg bg-background border border-border text-[10px] font-semibold hover:bg-muted cursor-pointer"
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-semibold text-foreground text-[11px]">
                  Membership Start Date
                </label>
                <input
                  type="date"
                  value={form.membershipStartedAt}
                  onChange={(e) => set("membershipStartedAt", e.target.value)}
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-foreground text-[11px]">
                  Membership Expiration Date
                </label>
                <input
                  type="date"
                  value={form.membershipExpiresAt}
                  onChange={(e) => set("membershipExpiresAt", e.target.value)}
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>
            </div>

            {isExpired && (
              <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400 text-[11px] font-medium">
                <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                <span>
                  Expiry date is in the past — status will automatically be set to{" "}
                  <strong>Inactive</strong> by the system.
                </span>
              </div>
            )}
          </div>

          {/* Block toggle */}
          <div className="rounded-2xl border border-red-200 dark:border-red-900/40 bg-red-50/30 dark:bg-red-950/10 p-4 space-y-2">
            <div className="flex items-center justify-between gap-3">
              <div>
                <span className="font-bold text-xs text-foreground flex items-center gap-1.5">
                  <Ban className="h-4 w-4 text-red-500" />
                  Account Status Control
                </span>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Admins can only manually set status to <strong>Blocked</strong>.
                  Active/Inactive status is auto-managed by membership dates.
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={form.isBlocked}
                onClick={() => set("isBlocked", !form.isBlocked)}
                className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-500 ${
                  form.isBlocked ? "bg-red-500" : "bg-muted"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
                    form.isBlocked ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
            {form.isBlocked && (
              <div className="flex items-center gap-1.5 text-red-700 dark:text-red-400 text-[11px] font-medium">
                <Shield className="h-3.5 w-3.5 shrink-0" />
                <span>
                  This member&apos;s account will be <strong>BLOCKED</strong> — they will
                  not be able to log in.
                </span>
              </div>
            )}
          </div>

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
              className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold rounded-xl bg-[#004F32] hover:bg-emerald-900 text-white shadow-xs disabled:opacity-50 cursor-pointer"
            >
              <Check className="h-4 w-4 text-amber-300" />
              <span>{isPending ? "Saving…" : "Save Member Details"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

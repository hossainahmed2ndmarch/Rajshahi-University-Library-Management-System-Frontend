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
  Heart,
  Home,
  MessageCircle,
} from "lucide-react";
import { useRegisterMemberByStaff, useGetUserOptions } from "@/hooks/useUsers";
import { UserStatus } from "@/types/auth";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { PermanentAddressInput } from "@/components/ui/PermanentAddressInput";
import { CreatableTagSelect } from "@/components/ui/CreatableTagSelect";

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
  whatsappNumber: string;
  password: string;
  studentOrVoterId: string;
  bloodGroup: string;
  institution: string;
  department: string;
  faculty: string;
  session: string;
  accommodationType: string;
  accommodationName: string;
  permanentAddress: string;
  skills: string[];
  paymentMethod: string;
  membershipStartedAt: string;
  membershipExpiresAt: string;
  isPaid: boolean;
}

const DEFAULT_FORM: FormState = {
  name: "",
  email: "",
  phone: "",
  whatsappNumber: "",
  password: "Library@123",
  studentOrVoterId: "",
  bloodGroup: "",
  institution: "University of Rajshahi",
  department: "Islamic Studies",
  faculty: "Faculty of Arts",
  session: "2024-2025",
  accommodationType: "HALL",
  accommodationName: "",
  permanentAddress: "",
  skills: [],
  paymentMethod: "CASH",
  membershipStartedAt: todayStr(),
  membershipExpiresAt: oneYearFromNowStr(),
  isPaid: true,
};

const BLOOD_GROUPS = [
  { value: "A_POSITIVE", label: "A+ (A Positive)" },
  { value: "A_NEGATIVE", label: "A- (A Negative)" },
  { value: "B_POSITIVE", label: "B+ (B Positive)" },
  { value: "B_NEGATIVE", label: "B- (B Negative)" },
  { value: "AB_POSITIVE", label: "AB+ (AB Positive)" },
  { value: "AB_NEGATIVE", label: "AB- (AB Negative)" },
  { value: "O_POSITIVE", label: "O+ (O Positive)" },
  { value: "O_NEGATIVE", label: "O- (O Negative)" },
];

const ACCOMMODATION_TYPES = [
  { value: "HALL", label: "University Residential Hall" },
  { value: "MESS", label: "Student Mess / Shared Flat" },
  { value: "HOME", label: "Permanent Home / Family Residence" },
];

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
        className={`w-full rounded-xl border border-input bg-background pl-9 pr-3 py-2 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none ${className ?? ""}`}
      />
    </div>
  );
}

export interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddMemberModal({ isOpen, onClose }: AddMemberModalProps) {
  const [regMode, setRegMode] = useState<RegMode>("OFFLINE_LEGACY");
  const [form, setForm] = useState<FormState>({ ...DEFAULT_FORM });
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});

  const { mutate: registerMember, isPending } = useRegisterMemberByStaff();
  const { data: userOptions } = useGetUserOptions();

  if (!isOpen) return null;

  const set = <K extends keyof FormState>(key: K, val: FormState[K]) => {
    setForm((f) => ({ ...f, [key]: val }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const validate = (): boolean => {
    const errs: Partial<Record<keyof FormState, string>> = {};
    if (!form.name.trim()) errs.name = "Full name is required";
    if (!form.email.trim()) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
      errs.email = "Enter a valid email address";
    if (!form.phone.trim()) errs.phone = "Phone number is required";
    else if (form.phone.trim().length < 10)
      errs.phone = "Phone must be at least 10 digits";
    if (!form.studentOrVoterId.trim())
      errs.studentOrVoterId = "Student / Voter ID is required";
    if (!form.password || form.password.length < 6)
      errs.password = "Password must be at least 6 characters";

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleQuickDuration = (months: number) => {
    const start = form.membershipStartedAt
      ? new Date(form.membershipStartedAt)
      : new Date();
    const end = new Date(start.getTime());
    end.setMonth(end.getMonth() + months);
    set("membershipExpiresAt", end.toISOString().split("T")[0]);
  };

  const handleSetExpiredPreset = () => {
    const pastStart = new Date();
    pastStart.setFullYear(pastStart.getFullYear() - 2);
    const pastEnd = new Date();
    pastEnd.setFullYear(pastEnd.getFullYear() - 1);

    set("membershipStartedAt", pastStart.toISOString().split("T")[0]);
    set("membershipExpiresAt", pastEnd.toISOString().split("T")[0]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const isOffline = regMode === "OFFLINE_LEGACY";

    registerMember(
      {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        whatsappNumber: form.whatsappNumber.trim() || null,
        password: form.password,
        studentOrVoterId: form.studentOrVoterId.trim(),
        bloodGroup: form.bloodGroup || null,
        institution: form.institution.trim() || null,
        department: form.department.trim() || null,
        faculty: form.faculty.trim() || null,
        session: form.session.trim() || null,
        accommodationType: form.accommodationType || null,
        accommodationName: form.accommodationName.trim() || null,
        permanentAddress: form.permanentAddress.trim() || null,
        skills: form.skills,
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
      }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in-50">
      <div className="relative w-full max-w-2xl rounded-3xl border border-border bg-card p-6 shadow-2xl my-8 space-y-4 max-h-[92vh] overflow-y-auto text-card-foreground">
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
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

          {/* WhatsApp + Blood Group */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FieldWrap label="WhatsApp Number">
              <IconInput
                icon={<MessageCircle className="h-4 w-4 text-emerald-600" />}
                value={form.whatsappNumber}
                onChange={(e) => set("whatsappNumber", e.target.value)}
                placeholder="+8801XXXXXXXXX (WhatsApp)"
              />
            </FieldWrap>
            <FieldWrap label="Blood Group">
              <div className="relative">
                <Heart className="absolute left-3 top-2.5 h-4 w-4 text-rose-500" />
                <select
                  value={form.bloodGroup}
                  onChange={(e) => set("bloodGroup", e.target.value)}
                  className="w-full rounded-xl border border-input bg-background pl-9 pr-3 py-2 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="">Select Blood Group</option>
                  {BLOOD_GROUPS.map((bg) => (
                    <option key={bg.value} value={bg.value}>
                      {bg.label}
                    </option>
                  ))}
                </select>
              </div>
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
              </div>
            </FieldWrap>
          </div>

          {/* Department + Faculty */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FieldWrap label="Department">
              <SearchableSelect
                id="add-department"
                value={form.department}
                onChange={(val) => set("department", val)}
                options={userOptions?.departments ?? []}
                placeholder="Select or enter Department..."
                icon={<GraduationCap className="h-4 w-4" />}
              />
            </FieldWrap>

            <FieldWrap label="Faculty">
              <SearchableSelect
                id="add-faculty"
                value={form.faculty}
                onChange={(val) => set("faculty", val)}
                options={userOptions?.faculties ?? []}
                placeholder="Select or enter Faculty..."
                icon={<Building className="h-4 w-4" />}
              />
            </FieldWrap>
          </div>

          {/* Academic Session + Institution */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FieldWrap label="Academic Session">
              <SearchableSelect
                id="add-session"
                value={form.session}
                onChange={(val) => set("session", val)}
                options={userOptions?.sessions ?? []}
                placeholder="e.g. 2024-2025"
                icon={<Calendar className="h-4 w-4" />}
              />
            </FieldWrap>

            <FieldWrap label="Institution">
              <SearchableSelect
                id="add-institution"
                value={form.institution}
                onChange={(val) => set("institution", val)}
                options={userOptions?.institutions ?? ["University of Rajshahi"]}
                placeholder="Select or enter Institution..."
                icon={<Building className="h-4 w-4" />}
              />
            </FieldWrap>
          </div>

          {/* Accommodation Type + Hall / Residence Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FieldWrap label="Accommodation Type">
              <div className="relative">
                <Home className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <select
                  value={form.accommodationType}
                  onChange={(e) => set("accommodationType", e.target.value)}
                  className="w-full rounded-xl border border-input bg-background pl-9 pr-3 py-2 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                >
                  {ACCOMMODATION_TYPES.map((acc) => (
                    <option key={acc.value} value={acc.value}>
                      {acc.label}
                    </option>
                  ))}
                </select>
              </div>
            </FieldWrap>

            <FieldWrap label="Hall / Mess / Residence Name">
              <SearchableSelect
                id="add-residence"
                value={form.accommodationName}
                onChange={(val) => set("accommodationName", val)}
                options={userOptions?.accommodationNames ?? []}
                placeholder="Select or enter Residence..."
                icon={<Home className="h-4 w-4" />}
              />
            </FieldWrap>
          </div>

          {/* Permanent Address (JSON Structured selection) */}
          <PermanentAddressInput
            value={form.permanentAddress}
            onChange={(val) => set("permanentAddress", val)}
            villageOptions={userOptions?.villages ?? []}
          />

          {/* Skills & Expertise (Creatable Tag selection) */}
          <div className="space-y-1">
            <label className="font-semibold text-foreground text-xs flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              <span>দক্ষতা ও অভিজ্ঞতা (Skills &amp; Expertise)</span>
            </label>
            <CreatableTagSelect
              values={form.skills}
              onChange={(val) => set("skills", val)}
              options={userOptions?.skills ?? []}
              placeholder="Type new skill and press Enter, or choose from suggestions..."
            />
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
                    className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-foreground text-[11px]">
                    Membership Expires At
                  </label>
                  <input
                    type="date"
                    value={form.membershipExpiresAt}
                    onChange={(e) => set("membershipExpiresAt", e.target.value)}
                    className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/40 dark:bg-blue-950/20 p-4 space-y-3">
              <span className="font-bold text-xs text-foreground flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-blue-600" /> Payment &amp; Activation Mode
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-foreground text-[11px]">Payment Method</label>
                  <select
                    value={form.paymentMethod}
                    onChange={(e) => set("paymentMethod", e.target.value)}
                    className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none cursor-pointer"
                  >
                    <option value="CASH">Cash (Desk Payment)</option>
                    <option value="ONLINE">Online (SSLCommerz Gateway)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="pt-2 flex justify-end gap-2 border-t border-border">
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
              <CheckCircle2 className="h-4 w-4 text-amber-300" />
              <span>{isPending ? "Adding Member..." : "Add Member"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

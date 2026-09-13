"use client";

import React, { useState } from "react";
import {
  BookOpen,
  Calendar,
  CheckCircle2,
  CreditCard,
  Lock,
  Mail,
  ShieldAlert,
  ShieldCheck,
  Edit3,
  Save,
  Loader2,
  Hash,
} from "lucide-react";
import { format } from "date-fns";
import { IUser } from "@/types/auth";
import { InfoRow } from "./InfoRow";
import { useUpdateMyProfile } from "@/hooks/useUsers";

interface ProfileCredentialsSectionProps {
  user: IUser | null | undefined;
}

export function ProfileCredentialsSection({ user }: ProfileCredentialsSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [email, setEmail] = useState("");
  const [studentOrVoterId, setStudentOrVoterId] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { mutate: updateProfile, isPending } = useUpdateMyProfile();

  const membershipExpiry = user?.membershipExpiresAt
    ? format(new Date(user.membershipExpiresAt), "dd MMMM yyyy")
    : "Not Configured";

  const handleStartEdit = () => {
    setEmail(user?.email ?? "");
    setStudentOrVoterId(user?.studentOrVoterId ?? "");
    setErrors({});
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setErrors({});
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      e.email = "Please enter a valid email address";
    }
    if (!studentOrVoterId.trim()) {
      e.studentOrVoterId = "Student/Voter ID is required";
    }
    return e;
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const v = validate();
    if (Object.keys(v).length) {
      setErrors(v);
      return;
    }
    setErrors({});

    updateProfile(
      { email: email.trim(), studentOrVoterId: studentOrVoterId.trim() },
      {
        onSuccess: () => {
          setIsEditing(false);
        },
      }
    );
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4 text-card-foreground">
      <div className="flex items-center justify-between pb-3 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-800 text-white shadow-2xs">
            <Lock className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-foreground">Secure System Credentials</h2>
            <p className="text-xs text-muted-foreground">
              System-controlled credentials. Email and Student/Voter ID can be updated by you.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 dark:text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-md">
            <ShieldAlert className="h-3 w-3" /> Security Protected
          </span>
          <button
            type="button"
            onClick={isEditing ? handleCancel : handleStartEdit}
            className="inline-flex items-center gap-1.5 rounded-lg border border-input bg-background hover:bg-accent px-3 py-1.5 text-xs font-semibold text-foreground transition-colors cursor-pointer"
          >
            <Edit3 className="h-3.5 w-3.5 text-primary" />
            {isEditing ? "Cancel" : "Edit"}
          </button>
        </div>
      </div>

      {isEditing ? (
        <form onSubmit={handleSave} className="space-y-4">
          <div className="rounded-xl border border-amber-300/40 bg-amber-500/5 p-3 text-[11px] text-amber-800 dark:text-amber-300 flex items-start gap-2">
            <ShieldAlert className="h-3.5 w-3.5 shrink-0 mt-0.5 text-amber-600" />
            <span>
              Changing your email or Student/Voter ID updates your login credentials. Ensure the new values are correct and uniquely yours.
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Email field */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                <Mail className="h-3.5 w-3.5 text-muted-foreground" /> Registered Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs focus:ring-2 focus:ring-primary focus:outline-none"
              />
              {errors.email && <p className="text-red-500 text-[11px]">{errors.email}</p>}
            </div>

            {/* Student/Voter ID field */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                <Hash className="h-3.5 w-3.5 text-muted-foreground" /> Student / National Voter ID
              </label>
              <input
                type="text"
                value={studentOrVoterId}
                onChange={(e) => setStudentOrVoterId(e.target.value)}
                placeholder="e.g. RU-2023-4512 or Voter ID"
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs font-mono focus:ring-2 focus:ring-primary focus:outline-none"
              />
              {errors.studentOrVoterId && (
                <p className="text-red-500 text-[11px]">{errors.studentOrVoterId}</p>
              )}
            </div>
          </div>

          <div className="flex justify-end pt-1 gap-2">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2.5 text-xs font-semibold rounded-xl border border-input bg-background hover:bg-accent text-foreground cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center gap-2 rounded-xl bg-[#004F32] hover:bg-emerald-900 px-5 py-2.5 text-xs font-bold text-white shadow-xs transition-all disabled:opacity-50 cursor-pointer"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 text-amber-300" /> Save Credentials
                </>
              )}
            </button>
          </div>
        </form>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 pt-1">
            <InfoRow
              icon={<Mail className="h-3.5 w-3.5 text-muted-foreground" />}
              label="Registered Email"
              value={user?.email ?? "—"}
            />
            <InfoRow
              icon={<BookOpen className="h-3.5 w-3.5 text-muted-foreground" />}
              label="Student / National Voter ID"
              value={user?.studentOrVoterId ?? "—"}
            />
            <InfoRow
              icon={<ShieldCheck className="h-3.5 w-3.5 text-muted-foreground" />}
              label="Assigned System Role"
              value={user?.role ?? "MEMBER"}
              isProtected
            />
            <InfoRow
              icon={<CheckCircle2 className="h-3.5 w-3.5 text-muted-foreground" />}
              label="Account Status"
              value={user?.status ?? "ACTIVE"}
              isProtected
            />
            <InfoRow
              icon={<Calendar className="h-3.5 w-3.5 text-muted-foreground" />}
              label="Membership Expiry Date"
              value={membershipExpiry}
              isProtected
            />
            <InfoRow
              icon={<CreditCard className="h-3.5 w-3.5 text-muted-foreground" />}
              label="Membership Paid Status"
              value={user?.isPaid ? "Paid & Verified" : "Pending Payment"}
              isProtected
            />
          </div>

          <div className="rounded-xl border border-border/80 bg-muted/30 p-3 text-[11px] text-muted-foreground flex items-center gap-2">
            <Lock className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>
              Role, account status, and membership expiry are managed by library administration. You can update your email and Student/Voter ID using the Edit button above.
            </span>
          </div>
        </>
      )}
    </div>
  );
}

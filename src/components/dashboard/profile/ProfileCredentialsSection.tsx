"use client";

import React from "react";
import {
  BookOpen,
  Calendar,
  CheckCircle2,
  CreditCard,
  Lock,
  Mail,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import { format } from "date-fns";
import { IUser } from "@/types/auth";
import { InfoRow } from "./InfoRow";

interface ProfileCredentialsSectionProps {
  user: IUser | null | undefined;
}

export function ProfileCredentialsSection({ user }: ProfileCredentialsSectionProps) {
  const membershipExpiry = user?.membershipExpiresAt
    ? format(new Date(user.membershipExpiresAt), "dd MMMM yyyy")
    : "Not Configured";

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
              System-controlled authentication credentials, role assignments, and membership validity.
            </p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 dark:text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-md">
          <ShieldAlert className="h-3 w-3" /> Security Protected
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 pt-1">
        <InfoRow
          icon={<Mail className="h-3.5 w-3.5 text-muted-foreground" />}
          label="Registered Email"
          value={user?.email ?? "—"}
          isProtected
        />
        <InfoRow
          icon={<BookOpen className="h-3.5 w-3.5 text-muted-foreground" />}
          label="Student / National Voter ID"
          value={user?.studentOrVoterId ?? "—"}
          isProtected
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
          Role, membership validity expiry date, account status, and registration IDs are managed by library administration and cannot be edited directly.
        </span>
      </div>
    </div>
  );
}

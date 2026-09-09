"use client";

import React from "react";
import {
  Trash2,
  X,
  AlertTriangle,
  Mail,
  Clock,
  UserX,
  CheckCircle2,
  ShieldAlert,
} from "lucide-react";
import { IUser } from "@/types/auth";
import { useDeleteUser } from "@/hooks/useUsers";

interface DeleteMemberModalProps {
  user: IUser | null;
  isOpen: boolean;
  onClose: () => void;
  onSendNoticeFirst: (user: IUser) => void;
}

export function DeleteMemberModal({
  user,
  isOpen,
  onClose,
  onSendNoticeFirst,
}: DeleteMemberModalProps) {
  const { mutate: deleteUser, isPending } = useDeleteUser();

  if (!isOpen || !user) return null;

  const now = new Date();
  const isExpired = user.membershipExpiresAt
    ? new Date(user.membershipExpiresAt) < now
    : false;
  const isInactive = user.status === "INACTIVE" || user.status === "BLOCKED" || isExpired;

  const handleDelete = () => {
    deleteUser(user.id, {
      onSuccess: () => {
        onClose();
      },
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in-50">
      <div className="relative w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-4 text-card-foreground">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-muted-foreground hover:text-foreground cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/10 text-destructive mx-auto">
          <Trash2 className="h-6 w-6" />
        </div>

        <div className="text-center space-y-1">
          <h3 className="font-extrabold text-base text-foreground">
            Permanently Delete Member?
          </h3>
          <p className="text-xs text-muted-foreground">
            You are about to remove <strong>{user.name}</strong> ({user.email}) from the active library directory.
          </p>
        </div>

        {/* Inactivity / Expiry Check Alert */}
        {isInactive && (
          <div className="rounded-2xl border border-amber-300/40 bg-amber-500/10 p-4 space-y-2 text-xs">
            <div className="flex items-center gap-2 font-bold text-amber-900 dark:text-amber-200">
              <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
              <span>Inactive / Expired Member Notice Check</span>
            </div>
            <p className="text-[11px] leading-relaxed text-amber-900/90 dark:text-amber-300">
              This member is currently <strong>{isExpired ? "Expired" : user.status}</strong>. It is strongly recommended to send them a notice or final reminder before permanent deletion so they have an opportunity to renew.
            </p>
            <button
              type="button"
              onClick={() => {
                onClose();
                onSendNoticeFirst(user);
              }}
              className="w-full mt-1 inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-900 font-extrabold py-2 px-3 text-xs shadow-xs transition-colors cursor-pointer"
            >
              <Mail className="h-3.5 w-3.5" />
              <span>Send Expiry/Inactivity Notice First</span>
            </button>
          </div>
        )}

        <div className="rounded-xl border border-border bg-muted/30 p-3 text-[11px] text-muted-foreground space-y-1">
          <div className="flex justify-between">
            <span>Student/Voter ID:</span>
            <span className="font-mono font-bold text-foreground">{user.studentOrVoterId || "N/A"}</span>
          </div>
          <div className="flex justify-between">
            <span>Role:</span>
            <span className="font-bold text-foreground">{user.role}</span>
          </div>
          <div className="flex justify-between">
            <span>Status:</span>
            <span className="font-semibold text-foreground">{user.status}</span>
          </div>
        </div>

        <div className="pt-2 flex justify-end gap-2 border-t border-border">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-xl border border-input bg-background hover:bg-accent text-foreground cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isPending}
            className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold rounded-xl bg-destructive hover:bg-red-700 text-destructive-foreground shadow-xs disabled:opacity-50 cursor-pointer"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>{isPending ? "Deleting..." : "Confirm Delete Member"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteMemberModal;

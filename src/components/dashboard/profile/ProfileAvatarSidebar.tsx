"use client";

import React, { useRef, useState, useEffect } from "react";
import {
  Camera,
  CheckCircle2,
  CreditCard,
  Loader2,
  ShieldCheck,
  Sparkles,
  Trash2,
  Upload,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { IUser } from "@/types/auth";

interface ProfileAvatarSidebarProps {
  user: IUser | null | undefined;
  activeBorrowsCount: number;
  totalPurchasesCount: number;
  totalDonationsCount: number;
  returnedBorrowsCount: number;
  onUploadAvatar: (file: File) => void;
  onRemoveAvatar: () => void;
  onOpenRenewalModal: () => void;
  isUploadingAvatar: boolean;
  isUpdatingProfile: boolean;
}

export function ProfileAvatarSidebar({
  user,
  activeBorrowsCount,
  totalPurchasesCount,
  totalDonationsCount,
  returnedBorrowsCount,
  onUploadAvatar,
  onRemoveAvatar,
  onOpenRenewalModal,
  isUploadingAvatar,
  isUpdatingProfile,
}: ProfileAvatarSidebarProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [user?.avatarUrl]);

  const handleAvatarFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file (JPEG, PNG, WEBP, GIF, AVIF).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB.");
      return;
    }

    onUploadAvatar(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const memberSince = user?.createdAt
    ? format(new Date(user.createdAt), "dd MMMM yyyy")
    : "N/A";

  const membershipExpiry = user?.membershipExpiresAt
    ? format(new Date(user.membershipExpiresAt), "dd MMMM yyyy")
    : "Not Configured";

  const roleText =
    user?.role === "SHIFTER"
      ? "RUIL Duty Shifter & Member"
      : user?.role === "SUPER_ADMIN"
      ? "RUIL Super Administrator"
      : user?.role === "ADMIN"
      ? "RUIL Administrator"
      : "RUIL Registered Member";

  return (
    <div className="space-y-5">
      {/* ── Avatar Profile Card ── */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-xs text-center space-y-4">
        {/* Hidden File Input for Avatar */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleAvatarFileSelect}
          accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
          className="hidden"
        />

        {/* Profile Avatar with Camera Overlay */}
        <div className="relative mx-auto h-28 w-28 group">
          {user?.avatarUrl && !imgError ? (
            <img
              src={user.avatarUrl}
              alt={user.name || "User Avatar"}
              onError={() => setImgError(true)}
              className="h-28 w-28 rounded-full object-cover border-4 border-[#004F32] shadow-lg transition-transform group-hover:scale-[1.02]"
            />
          ) : (
            <div className="h-28 w-28 rounded-full bg-gradient-to-br from-[#004F32] via-[#00603d] to-emerald-700 flex items-center justify-center text-white text-4xl font-extrabold shadow-lg border-4 border-card">
              {user?.name?.[0]?.toUpperCase() ?? "U"}
            </div>
          )}

          {/* Online Status Badge */}
          <span
            className="absolute bottom-2 left-2 h-4 w-4 rounded-full bg-emerald-500 border-2 border-card shadow-xs"
            title="Online"
          />

          {/* Camera Upload Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploadingAvatar}
            className="absolute bottom-0 right-0 h-9 w-9 rounded-full bg-[#004F32] hover:bg-emerald-800 text-white border-2 border-card flex items-center justify-center shadow-md transition-all hover:scale-110 cursor-pointer disabled:opacity-50"
            title="Change profile photo"
          >
            {isUploadingAvatar ? (
              <Loader2 className="h-4 w-4 animate-spin text-amber-300" />
            ) : (
              <Camera className="h-4 w-4 text-amber-300" />
            )}
          </button>
        </div>

        {/* Avatar Action Buttons */}
        <div className="flex items-center justify-center gap-2 pt-1">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploadingAvatar}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-muted/50 hover:bg-muted px-3 py-1 text-xs font-semibold text-foreground transition-colors cursor-pointer disabled:opacity-50"
          >
            <Upload className="h-3 w-3 text-primary" />
            <span>{isUploadingAvatar ? "Uploading..." : "Upload Photo"}</span>
          </button>
          {user?.avatarUrl && (
            <button
              type="button"
              onClick={onRemoveAvatar}
              disabled={isUpdatingProfile}
              className="inline-flex items-center gap-1 rounded-lg border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 text-red-700 dark:text-red-300 px-2.5 py-1 text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
              title="Remove custom photo"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          )}
        </div>

        <div>
          <h2 className="text-lg font-extrabold text-foreground">{user?.name || "User"}</h2>
          <p className="text-xs text-muted-foreground">{user?.email}</p>
        </div>
        <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950 px-3 py-1 text-xs font-bold text-emerald-800 dark:text-emerald-300">
          <ShieldCheck className="h-3.5 w-3.5" /> {roleText}
        </div>
        <div className="pt-2 border-t border-border/60 text-xs text-muted-foreground space-y-2 text-left">
          <div className="flex justify-between">
            <span>Member Since</span>
            <span className="font-mono text-[11px] font-medium text-foreground">{memberSince}</span>
          </div>
          <div className="flex justify-between">
            <span>Payment Mode</span>
            <span className="font-medium text-foreground">{user?.paymentMethod ?? "CASH"}</span>
          </div>
          <div className="flex justify-between">
            <span>Account Status</span>
            <span className="font-semibold uppercase text-emerald-600 dark:text-emerald-400">
              {user?.status ?? "ACTIVE"}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Validity Expiry</span>
            <span className="font-mono text-[11px] font-bold text-foreground">
              {membershipExpiry}
            </span>
          </div>
        </div>
      </div>

      {/* ── Membership Renewal Callout Card ── */}
      <div className="rounded-2xl border border-amber-300/40 bg-gradient-to-br from-amber-500/10 to-emerald-500/5 p-5 space-y-3 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-extrabold uppercase text-[#C78700] dark:text-amber-400 flex items-center gap-1.5">
            <CreditCard className="h-4 w-4" /> Membership Plan
          </span>
          <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-800 dark:text-amber-300">
            100৳ / 6 Mo
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          Extend library borrowing privileges with instant payment confirmation.
        </p>
        <button
          type="button"
          onClick={onOpenRenewalModal}
          className="w-full flex items-center justify-center space-x-2 rounded-xl bg-[#004F32] hover:bg-emerald-900 py-2.5 text-xs font-bold text-white shadow-xs transition-all cursor-pointer"
        >
          <Sparkles className="h-4 w-4 text-amber-300" />
          <span>Renew Membership (৳100)</span>
        </button>
      </div>

      {/* ── Statistics Grid ── */}
      <div className="grid grid-cols-2 gap-3">
        {[
          {
            label: "Active Borrows",
            value: activeBorrowsCount,
            color: "text-[#004F32] dark:text-emerald-400",
          },
          {
            label: "Purchases",
            value: totalPurchasesCount,
            color: "text-[#C78700] dark:text-amber-400",
          },
          {
            label: "Donations",
            value: totalDonationsCount,
            color: "text-purple-600 dark:text-purple-400",
          },
          {
            label: "Returned",
            value: returnedBorrowsCount,
            color: "text-blue-600 dark:text-blue-400",
          },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-xl border border-border bg-muted/40 p-4 text-center">
            <p className={`text-2xl font-extrabold ${color}`}>{value}</p>
            <p className="mt-0.5 text-[11px] font-medium text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-emerald-300/40 bg-emerald-500/5 p-4 flex items-start gap-2">
        <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-bold text-foreground">Account in Good Standing</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Full borrowing and reading access active.
          </p>
        </div>
      </div>
    </div>
  );
}

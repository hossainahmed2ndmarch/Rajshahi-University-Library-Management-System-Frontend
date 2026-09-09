"use client";

import React, { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { User, ArrowLeft } from "lucide-react";
import { useGetMe, useChangePassword } from "@/hooks/useAuth";
import { useUpdateMyProfile, useUploadAvatar } from "@/hooks/useUsers";
import { useGetMyBorrows } from "@/hooks/useBorrows";
import { useGetMyPurchases } from "@/hooks/usePurchases";
import { useGetDonations } from "@/hooks/useDonations";
import { MembershipRenewalModal } from "@/components/member/MembershipRenewalModal";
import {
  ProfileAvatarSidebar,
  ProfilePersonalInfoSection,
  ProfileCredentialsSection,
  ProfilePasswordSection,
  ProfileFormValues,
  PasswordFormValues,
} from "./profile";

export interface UserProfileContentProps {
  backHref?: string;
  backLabel?: string;
}

export function UserProfileContent({
  backHref = "/dashboard/member",
  backLabel = "Back to Overview",
}: UserProfileContentProps) {
  // ── User & Activity Data ──────────────────────────────────────────────────
  const { data: user } = useGetMe();
  const { data: borrows = [] } = useGetMyBorrows();
  const { data: purchases = [] } = useGetMyPurchases();
  const { data: allDonations = [] } = useGetDonations();

  // ── Mutations ─────────────────────────────────────────────────────────────
  const { mutate: updateProfile, isPending: isUpdatingProfile } = useUpdateMyProfile();
  const { mutate: uploadAvatar, isPending: isUploadingAvatar } = useUploadAvatar();
  const { mutate: changePassword, isPending: isChangingPw } = useChangePassword();

  // ── Modal State ───────────────────────────────────────────────────────────
  const [renewalModalOpen, setRenewalModalOpen] = useState(false);

  // ── Aggregated Statistics ─────────────────────────────────────────────────
  const myDonations = useMemo(() => {
    return (allDonations || []).filter((d) => {
      if (!user) return false;
      if (d.donorId && String(d.donorId) === String(user.id)) return true;
      if (d.donorEmail && user.email && d.donorEmail.toLowerCase() === user.email.toLowerCase()) {
        return true;
      }
      return false;
    });
  }, [allDonations, user]);

  const activeBorrowsCount = useMemo(() => {
    return (borrows || []).filter(
      (b) => b.status === "APPROVED" || b.status === "PENDING" || b.status === "OVERDUE"
    ).length;
  }, [borrows]);

  const returnedBorrowsCount = useMemo(() => {
    return (borrows || []).filter((b) => b.status === "RETURNED").length;
  }, [borrows]);

  const totalPurchasesCount = (purchases || []).length;
  const totalDonationsCount = myDonations.length;

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleUploadAvatar = useCallback(
    (file: File) => {
      uploadAvatar(file);
    },
    [uploadAvatar]
  );

  const handleRemoveAvatar = useCallback(() => {
    updateProfile({ avatarUrl: "" });
  }, [updateProfile]);

  const handleSaveProfile = useCallback(
    (values: ProfileFormValues) => {
      updateProfile({
        name: values.name,
        avatarUrl: values.avatarUrl,
        phone: values.phone,
        institution: values.institution,
        department: values.department,
        session: values.session,
      });
    },
    [updateProfile]
  );

  const handlePasswordChange = useCallback(
    (values: PasswordFormValues) => {
      changePassword({
        oldPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
    },
    [changePassword]
  );

  return (
    <div className="space-y-8 pb-10">
      {/* ── Page Header ── */}
      <div>
        <Link
          href={backHref}
          className="inline-flex items-center text-xs text-muted-foreground hover:text-foreground mb-3 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5 mr-1" /> {backLabel}
        </Link>
        <h1 className="text-2xl font-extrabold text-foreground flex items-center gap-2">
          <User className="h-6 w-6 text-[#004F32] dark:text-emerald-400" />
          My Profile
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Manage your personal information, profile picture, and account security.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ── Left Column: Avatar & Account Summary Sidebar (1 Col) ── */}
        <ProfileAvatarSidebar
          user={user}
          activeBorrowsCount={activeBorrowsCount}
          totalPurchasesCount={totalPurchasesCount}
          totalDonationsCount={totalDonationsCount}
          returnedBorrowsCount={returnedBorrowsCount}
          onUploadAvatar={handleUploadAvatar}
          onRemoveAvatar={handleRemoveAvatar}
          onOpenRenewalModal={() => setRenewalModalOpen(true)}
          isUploadingAvatar={isUploadingAvatar}
          isUpdatingProfile={isUpdatingProfile}
        />

        {/* ── Right Column: Profile Forms & Credentials (2 Cols) ── */}
        <div className="lg:col-span-2 space-y-6">
          <ProfilePersonalInfoSection
            user={user}
            onSaveProfile={handleSaveProfile}
            isUpdatingProfile={isUpdatingProfile}
          />

          <ProfileCredentialsSection user={user} />

          <ProfilePasswordSection
            onPasswordChange={handlePasswordChange}
            isChangingPw={isChangingPw}
          />
        </div>
      </div>

      {/* ── Modal: Membership Renewal ── */}
      <MembershipRenewalModal
        isOpen={renewalModalOpen}
        onClose={() => setRenewalModalOpen(false)}
        user={user}
      />
    </div>
  );
}

export default UserProfileContent;

"use client";

import React from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Calendar, CreditCard, HeartHandshake, ShieldCheck, Sparkles, User } from "lucide-react";
import { IUser } from "@/types/auth";

interface MemberWelcomeBannerProps {
  user: IUser | null | undefined;
  badgeLabel: string;
  onOpenRenewalModal: () => void;
  onOpenDonationModal: () => void;
  profileHref: string;
}

export function MemberWelcomeBanner({
  user,
  badgeLabel,
  onOpenRenewalModal,
  onOpenDonationModal,
  profileHref,
}: MemberWelcomeBannerProps) {
  const membershipExpiryText = user?.membershipExpiresAt
    ? format(new Date(user.membershipExpiresAt), "dd MMM yyyy")
    : "Not Configured";

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#003824] via-[#004F32] to-[#C78700] p-6 sm:p-8 text-white shadow-xl">
      <div className="absolute -right-10 -bottom-10 h-64 w-64 rounded-full bg-white/5 blur-3xl" />
      <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="space-y-2.5">
          <div className="inline-flex items-center space-x-2 rounded-full bg-amber-400/20 px-3 py-1 text-xs font-mono font-bold text-amber-300 backdrop-blur-xs border border-amber-300/30">
            <Sparkles className="h-3.5 w-3.5 text-amber-300" />
            <span>{badgeLabel}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Assalamu Alaikum, {user?.name || "Respected Member"}!
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100/90 max-w-xl leading-relaxed">
            Track active borrowed items, manage your book purchases, view donation statuses, and keep your membership up-to-date.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-amber-200">
            <span className="flex items-center gap-1">
              <ShieldCheck className="h-4 w-4" /> Role:{" "}
              <strong className="text-white uppercase">{user?.role || "MEMBER"}</strong>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <ShieldCheck className="h-4 w-4" /> Status:{" "}
              <strong className="text-white uppercase">{user?.status || "ACTIVE"}</strong>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" /> Expiry:{" "}
              <strong className="text-white">{membershipExpiryText}</strong>
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onOpenRenewalModal}
            className="inline-flex items-center space-x-2 rounded-xl bg-amber-400 hover:bg-amber-300 px-4 py-2.5 text-xs font-extrabold text-stone-900 transition-all shadow-md cursor-pointer"
          >
            <CreditCard className="h-4 w-4" />
            <span>Renew Membership (৳100 / 6 Mo)</span>
          </button>
          <button
            type="button"
            onClick={onOpenDonationModal}
            className="inline-flex items-center space-x-2 rounded-xl bg-[#003824] hover:bg-[#002819] px-4 py-2.5 text-xs font-bold text-white border border-white/20 transition-all shadow-xs cursor-pointer"
          >
            <HeartHandshake className="h-4 w-4 text-amber-300" />
            <span>Donate a Book</span>
          </button>
          <Link
            href={profileHref}
            className="inline-flex items-center space-x-2 rounded-xl bg-white/10 hover:bg-white/20 px-4 py-2.5 text-xs font-bold text-white border border-white/20 transition-all shadow-xs"
          >
            <User className="h-4 w-4 text-amber-300" />
            <span>My Profile</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

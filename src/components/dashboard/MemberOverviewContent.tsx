"use client";

import React, { useState, useMemo } from "react";
import { differenceInDays } from "date-fns";
import { useGetMe } from "@/hooks/useAuth";
import { useGetMyBorrows } from "@/hooks/useBorrows";
import { useGetMyPurchases } from "@/hooks/usePurchases";
import { useGetDonations } from "@/hooks/useDonations";
import { MembershipRenewalModal } from "@/components/member/MembershipRenewalModal";
import { DonationModal } from "@/components/member/DonationModal";
import { IBorrow } from "@/types/borrow";
import { IPurchase } from "@/types/purchase";
import { IDonation } from "@/types/donation";
import {
  MemberWelcomeBanner,
  MemberMetricsGrid,
  MemberMetricsSummary,
  MemberActiveBorrowsSection,
  MemberRecentPurchasesSection,
  MemberSidebarWidgets,
} from "./member-overview";

export interface MemberOverviewContentProps {
  profileHref?: string;
  borrowsHref?: string;
  purchasesHref?: string;
  donationsHref?: string;
  roleBadgeText?: string;
}

export function MemberOverviewContent({
  profileHref = "/dashboard/member/profile",
  borrowsHref = "/dashboard/member/my-borrows",
  purchasesHref = "/dashboard/member/purchases",
  donationsHref = "/dashboard/member/donations",
  roleBadgeText,
}: MemberOverviewContentProps) {
  // ── Data Queries ──────────────────────────────────────────────────────────
  const { data: user } = useGetMe();
  const { data: rawBorrows = [], isLoading: isBorrowsLoading } = useGetMyBorrows();
  const { data: rawPurchases = [], isLoading: isPurchasesLoading } = useGetMyPurchases();
  const { data: rawDonations = [], isLoading: isDonationsLoading } = useGetDonations();

  // ── Modal State ───────────────────────────────────────────────────────────
  const [donationModalOpen, setDonationModalOpen] = useState(false);
  const [renewalModalOpen, setRenewalModalOpen] = useState(false);

  // ── Normalized Collections ────────────────────────────────────────────────
  const borrows: IBorrow[] = useMemo(() => rawBorrows || [], [rawBorrows]);
  const purchases: IPurchase[] = useMemo(() => rawPurchases || [], [rawPurchases]);

  // Filter donations belonging to this member
  const myDonations: IDonation[] = useMemo(() => {
    return (rawDonations || []).filter((d) => {
      if (!user) return true;
      if (d.donorId && String(d.donorId) === String(user.id)) return true;
      if (d.donorEmail && user.email && d.donorEmail.toLowerCase() === user.email.toLowerCase()) {
        return true;
      }
      return false;
    });
  }, [rawDonations, user]);

  // ── Metrics Calculation ───────────────────────────────────────────────────
  const metrics: MemberMetricsSummary = useMemo(() => {
    const approvedActiveBorrows = borrows.filter((b) => b.status === "APPROVED");

    const upcomingDeadlinesCount = approvedActiveBorrows.filter((b) => {
      if (!b.dueDate) return false;
      const diff = differenceInDays(new Date(b.dueDate), new Date());
      return diff >= 0 && diff <= 3;
    }).length;

    const totalPurchasesCount = purchases.length;
    const totalPurchasesAmount = purchases.reduce(
      (acc, curr) => acc + (curr.totalAmount || curr.unitPrice || 0),
      0
    );

    const lastPurchaseDate = purchases[0]?.createdAt || null;

    const totalDonationsSubmitted = myDonations.length;
    const approvedDonationsCount = myDonations.filter(
      (d) => d.status === "APPROVED" || d.status === "RECEIVED" || d.status === "CATALOGED"
    ).length;
    const pendingDonationsCount = myDonations.filter((d) => d.status === "PENDING").length;

    return {
      activeBorrowsCount: approvedActiveBorrows.length,
      maxBorrowQuota: 5,
      upcomingDeadlinesCount,
      totalPurchasesCount,
      totalPurchasesAmount,
      lastPurchaseDate,
      totalDonationsSubmitted,
      approvedDonationsCount,
      pendingDonationsCount,
    };
  }, [borrows, purchases, myDonations]);

  // ── Role Badge Label ──────────────────────────────────────────────────────
  const isShifter = user?.role === "SHIFTER";
  const badgeLabel =
    roleBadgeText ||
    (isShifter
      ? "RUIL Shifter & Member Overview"
      : "RUIL Registered Member Dashboard");

  return (
    <div className="space-y-8 pb-10">
      {/* ── Top Welcome Banner ── */}
      <MemberWelcomeBanner
        user={user}
        badgeLabel={badgeLabel}
        onOpenRenewalModal={() => setRenewalModalOpen(true)}
        onOpenDonationModal={() => setDonationModalOpen(true)}
        profileHref={profileHref}
      />

      {/* ── Metric Summary Grid ── */}
      <MemberMetricsGrid metrics={metrics} />

      {/* ── Main Content Layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Active Borrows & Purchase History (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          <MemberActiveBorrowsSection
            borrows={borrows}
            isLoading={isBorrowsLoading}
            borrowsHref={borrowsHref}
          />

          <MemberRecentPurchasesSection
            purchases={purchases}
            isLoading={isPurchasesLoading}
            purchasesHref={purchasesHref}
          />
        </div>

        {/* Right Column: Renewal, Donations Tracker & Rules (1 Col) */}
        <div className="space-y-6">
          <MemberSidebarWidgets
            user={user}
            myDonations={myDonations}
            isDonationsLoading={isDonationsLoading}
            donationsHref={donationsHref}
            onOpenRenewalModal={() => setRenewalModalOpen(true)}
            onOpenDonationModal={() => setDonationModalOpen(true)}
          />
        </div>
      </div>

      {/* ── Modal: Membership Renewal ── */}
      <MembershipRenewalModal
        isOpen={renewalModalOpen}
        onClose={() => setRenewalModalOpen(false)}
        user={user}
      />

      {/* ── Modal: Full Book Donation ── */}
      <DonationModal
        isOpen={donationModalOpen}
        onClose={() => setDonationModalOpen(false)}
      />
    </div>
  );
}

export default MemberOverviewContent;

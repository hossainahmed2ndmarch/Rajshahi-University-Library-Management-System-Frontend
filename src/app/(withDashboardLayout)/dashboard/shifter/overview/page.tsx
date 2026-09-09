"use client";

import React, { useMemo } from "react";
import { TrendingUp, Trophy } from "lucide-react";
import { MemberOverviewContent } from "@/components/dashboard/MemberOverviewContent";
import { LeaderboardsSection } from "@/components/dashboard/analytics/LeaderboardsSection";
import { StatisticalDiagramsSection } from "@/components/dashboard/analytics/StatisticalDiagramsSection";
import { useGetBooks } from "@/hooks/useBooks";
import { useGetUsers } from "@/hooks/useUsers";
import { useGetAllBorrows } from "@/hooks/useBorrows";
import { useGetAllPurchases } from "@/hooks/usePurchases";
import { useGetDonations } from "@/hooks/useDonations";
import { useGetAllShiftLogs } from "@/hooks/useShifts";

export default function ShifterOverviewPage() {
  const { data: booksData } = useGetBooks({ limit: 1000 });
  const { data: users = [] } = useGetUsers();
  const { data: allBorrows = [] } = useGetAllBorrows();
  const { data: allPurchases = [] } = useGetAllPurchases();
  const { data: allDonations = [] } = useGetDonations();
  const { data: shiftLogs = [] } = useGetAllShiftLogs();

  const books = useMemo(() => {
    if (!booksData) return [];
    if (Array.isArray(booksData)) return booksData;
    return (booksData as any).data || [];
  }, [booksData]);

  return (
    <div className="space-y-10 pb-14">
      {/* Personal Overview Section */}
      <MemberOverviewContent
        profileHref="/dashboard/shifter/profile"
        borrowsHref="/dashboard/shifter/my-borrows"
        purchasesHref="/dashboard/shifter/my-purchases"
        donationsHref="/dashboard/shifter/my-donations"
        roleBadgeText="RUIL Shifter & Member Overview"
      />

      {/* ─── Whole Library Statistical Overview ──────────────────────────── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-border">
          <div>
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-[#004F32]" />
              <span>Whole Library Statistical Overview</span>
            </h2>
            <p className="text-xs text-muted-foreground">
              Visual analytics across borrows, sales, donations, members, and shift activity.
            </p>
          </div>
        </div>
        <StatisticalDiagramsSection
          books={books}
          borrows={allBorrows}
          purchases={allPurchases}
          donations={allDonations}
          users={users}
          shifts={shiftLogs}
        />
      </div>

      {/* ─── Hall of Honor & Performance Leaderboards ────────────────────── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-border">
          <div>
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-500" />
              <span>Library Hall of Honor</span>
            </h2>
            <p className="text-xs text-muted-foreground">
              Best borrowers, sellers, buyers, donors, shifters, and borrow-givers across the library.
            </p>
          </div>
        </div>
        <LeaderboardsSection
          books={books}
          borrows={allBorrows}
          purchases={allPurchases}
          donations={allDonations}
          users={users}
          shifts={shiftLogs}
        />
      </div>
    </div>
  );
}

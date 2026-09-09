"use client";

import React from "react";
import { MemberOverviewContent } from "@/components/dashboard/MemberOverviewContent";

export default function MemberDashboardPage() {
  return (
    <MemberOverviewContent
      profileHref="/dashboard/member/profile"
      borrowsHref="/dashboard/member/my-borrows"
      purchasesHref="/dashboard/member/purchases"
      donationsHref="/dashboard/member/donations"
      roleBadgeText="RUIL Registered Member Dashboard"
    />
  );
}

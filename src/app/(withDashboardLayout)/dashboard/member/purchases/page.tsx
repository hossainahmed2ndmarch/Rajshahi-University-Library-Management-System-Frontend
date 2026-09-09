"use client";

import React from "react";
import { MyPurchasesContent } from "@/components/dashboard/MyPurchasesContent";

export default function MemberPurchasesPage() {
  return (
    <MyPurchasesContent
      backHref="/dashboard/member"
      backLabel="Back to Member Overview"
    />
  );
}

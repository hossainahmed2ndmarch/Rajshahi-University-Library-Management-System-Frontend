"use client";

import React from "react";
import { MyPurchasesContent } from "@/components/dashboard/MyPurchasesContent";

export default function AdminMyPurchasesPage() {
  return (
    <MyPurchasesContent
      backHref="/dashboard/admin"
      backLabel="Back to Admin Overview"
    />
  );
}

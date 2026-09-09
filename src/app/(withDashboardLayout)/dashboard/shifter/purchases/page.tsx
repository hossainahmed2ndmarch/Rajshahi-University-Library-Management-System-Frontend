"use client";

import React from "react";
import PurchasesManagementTable from "@/components/dashboard/PurchasesManagementTable";

export default function ShifterPurchasesPage() {
  return (
    <PurchasesManagementTable
      roleTitle="POS Counter &amp; Campus Dispatch Desk"
      roleBadge="CIRCULATION SHIFTER"
    />
  );
}

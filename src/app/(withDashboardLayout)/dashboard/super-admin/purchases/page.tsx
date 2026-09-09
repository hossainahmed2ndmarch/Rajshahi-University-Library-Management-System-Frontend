"use client";

import React from "react";
import PurchasesManagementTable from "@/components/dashboard/PurchasesManagementTable";

export default function SuperAdminPurchasesPage() {
  return (
    <PurchasesManagementTable
      roleTitle="Universal Purchase & Financial Circulation Audit"
      roleBadge="SUPER ADMIN FULL POWER"
      allowDelete={true}
    />
  );
}


"use client";

import React from "react";
import PurchasesManagementTable from "@/components/dashboard/PurchasesManagementTable";

export default function AdminPurchasesPage() {
  return (
    <PurchasesManagementTable
      roleTitle="Admin Purchases & Orders Fulfillment"
      roleBadge="ADMIN CONTROL"
      allowDelete={true}
    />
  );
}


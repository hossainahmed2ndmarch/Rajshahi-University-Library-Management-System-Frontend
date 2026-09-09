"use client";

import React from "react";
import { BooksManagementTable } from "@/components/dashboard/BooksManagementTable";

export default function AdminBookInventoryPage() {
  return (
    <BooksManagementTable
      roleTitle="Book Inventory &amp; Catalog Management"
      roleBadge="ADMIN CONTROL"
      allowDelete={true}
    />
  );
}

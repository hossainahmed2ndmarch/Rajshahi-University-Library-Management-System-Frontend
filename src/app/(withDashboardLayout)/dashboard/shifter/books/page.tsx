"use client";

import React from "react";
import { BooksManagementTable } from "@/components/dashboard/BooksManagementTable";

export default function ShifterBooksPage() {
  return (
    <BooksManagementTable
      roleTitle="Book Catalog &amp; Inventory Directory"
      roleBadge="CIRCULATION SHIFTER"
      allowDelete={false}
    />
  );
}

"use client";

import React from "react";
import { MyBorrowsContent } from "@/components/dashboard/MyBorrowsContent";

export default function AdminMyBorrowsPage() {
  return (
    <MyBorrowsContent
      backHref="/dashboard/admin"
      backLabel="Back to Admin Overview"
    />
  );
}

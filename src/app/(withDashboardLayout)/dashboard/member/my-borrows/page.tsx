"use client";

import React from "react";
import { MyBorrowsContent } from "@/components/dashboard/MyBorrowsContent";

export default function MemberMyBorrowsPage() {
  return (
    <MyBorrowsContent
      backHref="/dashboard/member"
      backLabel="Back to Member Overview"
    />
  );
}

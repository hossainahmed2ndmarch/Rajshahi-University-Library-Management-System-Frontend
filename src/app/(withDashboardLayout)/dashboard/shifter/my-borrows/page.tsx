"use client";

import React from "react";
import { MyBorrowsContent } from "@/components/dashboard/MyBorrowsContent";

export default function ShifterMyBorrowsPage() {
  return (
    <MyBorrowsContent
      backHref="/dashboard/shifter/overview"
      backLabel="Back to Shifter Overview"
    />
  );
}

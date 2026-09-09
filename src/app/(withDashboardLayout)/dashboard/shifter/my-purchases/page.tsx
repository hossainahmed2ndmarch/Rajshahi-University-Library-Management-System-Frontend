"use client";

import React from "react";
import { MyPurchasesContent } from "@/components/dashboard/MyPurchasesContent";

export default function ShifterMyPurchasesPage() {
  return (
    <MyPurchasesContent
      backHref="/dashboard/shifter/overview"
      backLabel="Back to Shifter Overview"
    />
  );
}

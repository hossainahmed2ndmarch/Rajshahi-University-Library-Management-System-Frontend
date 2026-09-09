"use client";

import React from "react";
import { MyDonationsContent } from "@/components/dashboard/MyDonationsContent";

export default function ShifterMyDonationsPage() {
  return (
    <MyDonationsContent
      backHref="/dashboard/shifter/overview"
      backLabel="Back to Shifter Overview"
    />
  );
}

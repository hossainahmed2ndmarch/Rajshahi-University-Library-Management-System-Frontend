"use client";

import React from "react";
import { MyDonationsContent } from "@/components/dashboard/MyDonationsContent";

export default function MemberDonationsPage() {
  return (
    <MyDonationsContent
      backHref="/dashboard/member"
      backLabel="Back to Member Overview"
    />
  );
}

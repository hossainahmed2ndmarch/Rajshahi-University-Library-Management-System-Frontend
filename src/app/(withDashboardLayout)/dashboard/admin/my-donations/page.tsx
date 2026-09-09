"use client";

import React from "react";
import { MyDonationsContent } from "@/components/dashboard/MyDonationsContent";

export default function AdminMyDonationsPage() {
  return (
    <MyDonationsContent
      backHref="/dashboard/admin"
      backLabel="Back to Admin Overview"
    />
  );
}

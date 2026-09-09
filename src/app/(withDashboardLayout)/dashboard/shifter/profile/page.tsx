"use client";

import React from "react";
import { UserProfileContent } from "@/components/dashboard/UserProfileContent";

export default function ShifterProfilePage() {
  return (
    <UserProfileContent
      backHref="/dashboard/shifter/overview"
      backLabel="Back to Shifter Overview"
    />
  );
}

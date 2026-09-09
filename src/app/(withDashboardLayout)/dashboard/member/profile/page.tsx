"use client";

import React from "react";
import { UserProfileContent } from "@/components/dashboard/UserProfileContent";

export default function MemberProfilePage() {
  return (
    <UserProfileContent
      backHref="/dashboard/member"
      backLabel="Back to Member Overview"
    />
  );
}

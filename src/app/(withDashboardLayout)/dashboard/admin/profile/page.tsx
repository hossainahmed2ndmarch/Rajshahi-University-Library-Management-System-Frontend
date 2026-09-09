"use client";

import React from "react";
import { UserProfileContent } from "@/components/dashboard/UserProfileContent";

export default function AdminProfilePage() {
  return (
    <UserProfileContent
      backHref="/dashboard/admin"
      backLabel="Back to Admin Overview"
    />
  );
}

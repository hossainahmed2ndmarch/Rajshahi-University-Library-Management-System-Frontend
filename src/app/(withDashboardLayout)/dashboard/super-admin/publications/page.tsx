"use client";

import React from "react";
import { PublicationsManagement } from "@/components/dashboard/publications/PublicationsManagement";

export default function SuperAdminPublicationsPage() {
  return (
    <PublicationsManagement
      roleTitle="Super Admin Publications & Editorial Oversight"
      roleBadge="SUPER ADMIN FULL ACCESS"
    />
  );
}

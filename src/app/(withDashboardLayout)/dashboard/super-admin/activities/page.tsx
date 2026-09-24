"use client";

import React from "react";
import { ActivitiesManagementTable } from "@/components/dashboard/activities/ActivitiesManagementTable";

export default function SuperAdminActivitiesPage() {
  return (
    <ActivitiesManagementTable
      roleTitle="Activities & Programs Administration"
      roleBadge="SUPER ADMIN CONTROL"
      allowDelete={true}
    />
  );
}

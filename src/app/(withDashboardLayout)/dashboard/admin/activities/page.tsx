"use client";

import React from "react";
import { ActivitiesManagementTable } from "@/components/dashboard/activities/ActivitiesManagementTable";

export default function AdminActivitiesPage() {
  return (
    <ActivitiesManagementTable
      roleTitle="Activities & Programs Management"
      roleBadge="ADMIN DESK"
      allowDelete={false}
    />
  );
}

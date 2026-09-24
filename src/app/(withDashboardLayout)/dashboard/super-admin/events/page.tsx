"use client";

import React from "react";
import { EventsManagementTable } from "@/components/dashboard/events/EventsManagementTable";

export default function SuperAdminEventsPage() {
  return (
    <EventsManagementTable
      roleTitle="Events & Study Circles Administration"
      roleBadge="SUPER ADMIN CONTROL"
      allowDelete={true}
    />
  );
}

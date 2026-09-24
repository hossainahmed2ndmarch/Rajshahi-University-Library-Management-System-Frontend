"use client";

import React from "react";
import { EventsManagementTable } from "@/components/dashboard/events/EventsManagementTable";

export default function AdminEventsPage() {
  return (
    <EventsManagementTable
      roleTitle="Events & Study Circles Management"
      roleBadge="ADMIN DESK"
      allowDelete={false}
    />
  );
}

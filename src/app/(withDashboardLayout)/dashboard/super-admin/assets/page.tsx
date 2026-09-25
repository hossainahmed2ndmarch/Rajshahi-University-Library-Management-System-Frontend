"use client";

import React from "react";
import { AssetManagerView } from "@/components/dashboard/assets/AssetManagerView";

export default function SuperAdminAssetsPage() {
  return <AssetManagerView baseRoute="/dashboard/super-admin/assets" />;
}

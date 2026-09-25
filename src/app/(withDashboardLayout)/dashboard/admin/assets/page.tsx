"use client";

import React from "react";
import { AssetManagerView } from "@/components/dashboard/assets/AssetManagerView";

export default function AdminAssetsPage() {
  return <AssetManagerView baseRoute="/dashboard/admin/assets" />;
}

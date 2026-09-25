"use client";

import React from "react";
import { GalleryManagerView } from "@/components/dashboard/gallery/GalleryManagerView";

export default function SuperAdminGalleryPage() {
  return <GalleryManagerView baseRoute="/dashboard/super-admin/gallery" canDelete={true} />;
}

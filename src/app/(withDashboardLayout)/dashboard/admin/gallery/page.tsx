"use client";

import React from "react";
import { GalleryManagerView } from "@/components/dashboard/gallery/GalleryManagerView";

export default function AdminGalleryPage() {
  return <GalleryManagerView baseRoute="/dashboard/admin/gallery" canDelete={true} />;
}

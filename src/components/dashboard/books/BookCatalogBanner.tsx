"use client";

import React from "react";
import { Package, Plus } from "lucide-react";

interface BookCatalogBannerProps {
  roleBadge?: string;
  roleTitle?: string;
  onAddNewBook: () => void;
}

export function BookCatalogBanner({
  roleBadge = "INVENTORY DESK",
  roleTitle = "Book Catalog & Inventory Directory",
  onAddNewBook,
}: BookCatalogBannerProps) {
  return (
    <div className="rounded-2xl bg-gradient-to-r from-[#004F32] to-[#C78700] p-5 sm:p-6 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-200">
            {roleBadge}
          </span>
        </div>
        <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight flex items-center gap-2">
          <Package className="h-6 w-6 text-amber-300 shrink-0" />
          <span>{roleTitle}</span>
        </h1>
        <p className="mt-1 text-xs text-emerald-100/90 max-w-xl">
          Browse library collection, register new book titles, update shelf locations and inventory stock counts.
        </p>
      </div>

      <button
        type="button"
        onClick={onAddNewBook}
        className="inline-flex items-center space-x-2 rounded-xl bg-white text-[#004F32] hover:bg-amber-100 px-4 py-2.5 text-xs font-bold shadow-md transition-all self-start sm:self-auto cursor-pointer shrink-0"
      >
        <Plus className="h-4 w-4" />
        <span>Add New Book</span>
      </button>
    </div>
  );
}

"use client";

import React from "react";
import { Filter } from "lucide-react";

interface BookTableFiltersProps {
  typeFilter: string;
  categoryFilter: string;
  onTypeFilterChange: (val: string) => void;
  onCategoryFilterChange: (val: string) => void;
  categories: string[];
  totalFiltered: number;
  totalAll: number;
}

export function BookTableFilters({
  typeFilter,
  categoryFilter,
  onTypeFilterChange,
  onCategoryFilterChange,
  categories,
  totalFiltered,
  totalAll,
}: BookTableFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 p-4 rounded-2xl border border-border bg-card shadow-2xs">
      <div className="flex items-center gap-2 text-xs font-bold text-foreground">
        <Filter className="h-4 w-4 text-primary" />
        <span>Quick Filters:</span>
      </div>

      <select
        value={typeFilter}
        onChange={(e) => onTypeFilterChange(e.target.value)}
        aria-label="Filter books by access type"
        className="rounded-xl border border-input bg-background px-3 py-1.5 text-xs text-foreground focus:ring-2 focus:ring-primary focus:outline-none transition-colors cursor-pointer"
      >
        <option value="ALL">All Access Types</option>
        <option value="BORROW_ONLY">Borrow Only</option>
        <option value="SELL_ONLY">Sell Only</option>
        <option value="HYBRID">Borrow &amp; Sell (Hybrid)</option>
      </select>

      {categories.length > 0 && (
        <select
          value={categoryFilter}
          onChange={(e) => onCategoryFilterChange(e.target.value)}
          aria-label="Filter books by category"
          className="rounded-xl border border-input bg-background px-3 py-1.5 text-xs text-foreground focus:ring-2 focus:ring-primary focus:outline-none transition-colors cursor-pointer"
        >
          <option value="ALL">All Categories ({categories.length})</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      )}

      <div className="ml-auto text-xs text-muted-foreground font-mono">
        Showing <span className="font-bold text-foreground">{totalFiltered}</span> of{" "}
        {totalAll} books
      </div>
    </div>
  );
}

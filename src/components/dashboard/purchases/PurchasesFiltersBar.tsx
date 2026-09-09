"use client";

import React from "react";
import { Search } from "lucide-react";

interface PurchasesFiltersBarProps {
  searchTerm: string;
  onSearchTermChange: (val: string) => void;
  buyerTypeFilter: string;
  onBuyerTypeFilterChange: (val: string) => void;
  statusFilter: string;
  onStatusFilterChange: (val: string) => void;
}

export function PurchasesFiltersBar({
  searchTerm,
  onSearchTermChange,
  buyerTypeFilter,
  onBuyerTypeFilterChange,
  statusFilter,
  onStatusFilterChange,
}: PurchasesFiltersBarProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchTermChange(e.target.value)}
          placeholder="Search #TXN, book, customer name, phone, or email..."
          className="w-full rounded-xl border border-input bg-background pl-10 pr-4 py-2 text-xs focus:ring-2 focus:ring-primary focus:outline-none transition-colors"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        {/* Buyer Type Filter */}
        <select
          value={buyerTypeFilter}
          onChange={(e) => onBuyerTypeFilterChange(e.target.value)}
          className="rounded-xl border border-input bg-background px-3 py-2 text-xs font-semibold focus:ring-2 focus:ring-primary focus:outline-none cursor-pointer"
        >
          <option value="ALL">All Buyers (Member &amp; Guest)</option>
          <option value="MEMBER">Registered Members Only</option>
          <option value="GUEST">Guest Buyers Only</option>
        </select>

        {/* Order Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => onStatusFilterChange(e.target.value)}
          className="rounded-xl border border-input bg-background px-3 py-2 text-xs font-semibold focus:ring-2 focus:ring-primary focus:outline-none cursor-pointer"
        >
          <option value="ALL">All Order Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="PROCESSING">Processing</option>
          <option value="SHIPPED">Shipped</option>
          <option value="DELIVERED">Delivered</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>
    </div>
  );
}

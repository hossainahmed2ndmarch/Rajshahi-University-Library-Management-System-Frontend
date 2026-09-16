"use client";

import React from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

export interface TablePaginationProps {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  pageSizeOptions?: number[];
  className?: string;
}

export function TablePagination({
  currentPage,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [5, 10, 20, 50],
  className = "",
}: TablePaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const validPage = Math.min(Math.max(1, currentPage), totalPages);

  const startRecord = totalItems === 0 ? 0 : (validPage - 1) * pageSize + 1;
  const endRecord = Math.min(validPage * pageSize, totalItems);

  // Generate page numbers to display
  const getPageNumbers = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (validPage <= 4) {
      return [1, 2, 3, 4, 5, "...", totalPages];
    }
    if (validPage >= totalPages - 3) {
      return [1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }
    return [1, "...", validPage - 1, validPage, validPage + 1, "...", totalPages];
  };

  if (totalItems === 0) return null;

  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-border/80 bg-muted/20 text-xs text-muted-foreground ${className}`}
    >
      {/* Left side: Rows per page & record count */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center space-x-2">
          <span>Rows per page:</span>
          <select
            value={pageSize}
            onChange={(e) => {
              onPageSizeChange(Number(e.target.value));
              onPageChange(1);
            }}
            className="rounded-lg border border-input bg-card px-2 py-1 text-xs text-foreground focus:ring-1 focus:ring-primary focus:outline-none cursor-pointer"
          >
            {pageSizeOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        <span className="font-medium text-foreground">
          Showing <span className="font-bold text-primary">{startRecord}</span> to{" "}
          <span className="font-bold text-primary">{endRecord}</span> of{" "}
          <span className="font-bold text-foreground">{totalItems}</span> records
        </span>
      </div>

      {/* Right side: Page navigation */}
      <div className="flex items-center space-x-2">
        <span className="font-medium text-foreground mr-1">
          Page {validPage} of {totalPages}
        </span>

        <div className="flex items-center space-x-1">
          {/* First page */}
          <button
            onClick={() => onPageChange(1)}
            disabled={validPage <= 1}
            className="rounded-lg border border-input bg-card p-1.5 text-foreground hover:bg-accent disabled:opacity-40 transition-colors cursor-pointer disabled:cursor-not-allowed"
            title="First Page"
          >
            <ChevronsLeft className="h-4 w-4" />
          </button>

          {/* Previous page */}
          <button
            onClick={() => onPageChange(validPage - 1)}
            disabled={validPage <= 1}
            className="rounded-lg border border-input bg-card p-1.5 text-foreground hover:bg-accent disabled:opacity-40 transition-colors cursor-pointer disabled:cursor-not-allowed"
            title="Previous Page"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          {/* Numeric Page Buttons */}
          <div className="hidden md:flex items-center space-x-1">
            {getPageNumbers().map((p, idx) =>
              p === "..." ? (
                <span key={`dots-${idx}`} className="px-1 text-muted-foreground select-none">
                  …
                </span>
              ) : (
                <button
                  key={`page-${p}`}
                  onClick={() => onPageChange(Number(p))}
                  className={`min-w-[28px] h-7 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    validPage === p
                      ? "bg-[#004F32] text-white"
                      : "border border-input bg-card text-foreground hover:bg-accent"
                  }`}
                >
                  {p}
                </button>
              )
            )}
          </div>

          {/* Next page */}
          <button
            onClick={() => onPageChange(validPage + 1)}
            disabled={validPage >= totalPages}
            className="rounded-lg border border-input bg-card p-1.5 text-foreground hover:bg-accent disabled:opacity-40 transition-colors cursor-pointer disabled:cursor-not-allowed"
            title="Next Page"
          >
            <ChevronRight className="h-4 w-4" />
          </button>

          {/* Last page */}
          <button
            onClick={() => onPageChange(totalPages)}
            disabled={validPage >= totalPages}
            className="rounded-lg border border-input bg-card p-1.5 text-foreground hover:bg-accent disabled:opacity-40 transition-colors cursor-pointer disabled:cursor-not-allowed"
            title="Last Page"
          >
            <ChevronsRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default TablePagination;

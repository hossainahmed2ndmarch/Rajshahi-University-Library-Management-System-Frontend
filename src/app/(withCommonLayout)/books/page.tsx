"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Search, RefreshCw, BookOpen, SlidersHorizontal } from "lucide-react";
import { useGetBooks } from "@/hooks/useBooks";
import { BookCard } from "@/components/books/BookCard";
import { BookCardSkeleton } from "@/components/ui/skeleton";
import { BookType } from "@/types/book";

const CATEGORIES = ["ALL", "Tafsir", "Hadith", "Seerah", "Fiqh", "History", "Spirituality"];

function BooksCatalogContent() {
  const searchParams = useSearchParams();
  const urlType = searchParams.get("type") as BookType | null;
  const urlCategory = searchParams.get("category");
  const urlSearch = searchParams.get("search") || searchParams.get("q") || "";
  const urlBorrowable = searchParams.get("isBorrowable") === "true";
  const urlSellable = searchParams.get("isSellable") === "true";

  const [searchTerm, setSearchTerm] = useState(urlSearch);
  const [category, setCategory] = useState(urlCategory || "ALL");
  const [bookType, setBookType] = useState<BookType | "ALL">(urlType || "ALL");
  const [isBorrowable, setIsBorrowable] = useState(urlBorrowable);
  const [isSellable, setIsSellable] = useState(urlSellable);
  const [maxPrice, setMaxPrice] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (urlType) setBookType(urlType);
    if (urlCategory) setCategory(urlCategory);
    if (urlBorrowable) setIsBorrowable(true);
    if (urlSellable) setIsSellable(true);
    if (urlSearch) setSearchTerm(urlSearch);
  }, [urlType, urlCategory, urlBorrowable, urlSellable, urlSearch]);

  const queryParams = {
    searchTerm: searchTerm || undefined,
    category: category !== "ALL" ? category : undefined,
    type: bookType !== "ALL" ? (bookType as BookType) : undefined,
    isBorrowable: isBorrowable || undefined,
    isSellable: isSellable || undefined,
    maxPrice: maxPrice || undefined,
  };

  const { data, isLoading, isError, refetch } = useGetBooks(queryParams);

  const resetFilters = () => {
    setSearchTerm("");
    setCategory("ALL");
    setBookType("ALL");
    setIsBorrowable(false);
    setIsSellable(false);
    setMaxPrice(undefined);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Banner */}
      <div className="mb-8 rounded-2xl bg-gradient-to-r from-[#004F32] to-[#003824] p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <span className="inline-block rounded-full bg-amber-500/20 px-3 py-1 text-xs font-semibold text-amber-300 backdrop-blur-xs mb-3 border border-amber-400/30">
            Rajshahi University Islamic Library Catalog
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Browse Authentic Literature & Classical Manuscripts
          </h1>
          <p className="mt-2 text-sm text-emerald-100/90 leading-relaxed">
            Search our curated repository for borrowing or purchasing. Access commentary, Hadith collections, and academic research works.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filter Sidebar */}
        <aside className="lg:col-span-1 space-y-6">
          <div className="rounded-xl border border-border bg-card p-5 shadow-2xs">
            <div className="flex items-center justify-between pb-3 border-b border-border mb-4">
              <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-primary" />
                <span>Filter Catalog</span>
              </h3>
              <button
                onClick={resetFilters}
                className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1"
              >
                <RefreshCw className="h-3 w-3" />
                <span>Reset</span>
              </button>
            </div>

            {/* Search Input */}
            <div className="space-y-1.5 mb-5">
              <label className="text-xs font-semibold text-foreground">Search Keywords</label>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Title, author, ISBN..."
                  className="w-full rounded-lg border border-input bg-background pl-9 pr-3 py-2 text-xs focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="space-y-1.5 mb-5">
              <label className="text-xs font-semibold text-foreground">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs focus:ring-2 focus:ring-primary focus:outline-none"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat === "ALL" ? "All Categories" : cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Book Availability Type */}
            <div className="space-y-1.5 mb-5">
              <label className="text-xs font-semibold text-foreground">Access Type</label>
              <div className="grid grid-cols-3 gap-1">
                {(["ALL", "BORROW_ONLY", "SELL_ONLY"] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setBookType(type)}
                    className={`py-1.5 text-[11px] font-medium rounded-md border text-center transition-colors ${
                      bookType === type
                        ? "bg-primary text-white border-primary"
                        : "border-input bg-background text-muted-foreground hover:bg-accent"
                    }`}
                  >
                    {type === "ALL" ? "All" : type === "BORROW_ONLY" ? "Borrow" : "Buy"}
                  </button>
                ))}
              </div>
            </div>

            {/* Availability Checkboxes */}
            <div className="space-y-2 mb-5">
              <label className="text-xs font-semibold text-foreground block">Availability Toggles</label>
              <label className="flex items-center space-x-2 text-xs text-foreground cursor-pointer">
                <input
                  type="checkbox"
                  checked={isBorrowable}
                  onChange={(e) => setIsBorrowable(e.target.checked)}
                  className="rounded border-input text-primary focus:ring-primary h-4 w-4"
                />
                <span>Borrowable Only</span>
              </label>

              <label className="flex items-center space-x-2 text-xs text-foreground cursor-pointer">
                <input
                  type="checkbox"
                  checked={isSellable}
                  onChange={(e) => setIsSellable(e.target.checked)}
                  className="rounded border-input text-amber-600 focus:ring-amber-500 h-4 w-4"
                />
                <span>For Sale Only</span>
              </label>
            </div>

            {/* Price Filter */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Max Purchase Price (৳)</label>
              <input
                type="number"
                value={maxPrice || ""}
                onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : undefined)}
                placeholder="e.g. 1000"
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>
          </div>
        </aside>

        {/* Catalog Grid Section */}
        <main className="lg:col-span-3">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <span>Catalog Results</span>
              <span className="text-xs font-normal text-muted-foreground">
                ({data?.total || 0} items found)
              </span>
            </h2>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, n) => (
                <BookCardSkeleton key={n} />
              ))}
            </div>
          ) : isError ? (
            <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-8 text-center text-destructive">
              <p className="text-sm font-semibold">Failed to load catalog books.</p>
              <button
                onClick={() => refetch()}
                className="mt-3 inline-flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-white shadow-2xs"
              >
                <RefreshCw className="h-3.5 w-3.5" /> Retry
              </button>
            </div>
          ) : data?.data && data.data.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.data.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-border bg-card p-12 text-center text-muted-foreground">
              <BookOpen className="mx-auto h-10 w-10 text-muted-foreground/50 mb-3" />
              <p className="text-base font-semibold text-foreground">No matching books found</p>
              <p className="text-xs mt-1">Try adjusting your category, keyword search, or availability filters.</p>
              <button
                onClick={resetFilters}
                className="mt-4 inline-flex items-center gap-1 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white shadow-2xs"
              >
                Reset All Filters
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default function BooksCatalogPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-xs text-muted-foreground">Loading Islamic Library Catalog...</p>
        </div>
      }
    >
      <BooksCatalogContent />
    </Suspense>
  );
}

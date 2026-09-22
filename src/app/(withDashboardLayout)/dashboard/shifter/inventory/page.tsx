"use client";

import React, { useState } from "react";
import {
  Package,
  Search,
  MapPin,
  BookOpen,
  Filter,
  Tag,
  BarChart3,
  BookMarked,
  ShoppingBag,
} from "lucide-react";
import { useGetBooks } from "@/hooks/useBooks";
import { IBook, BookType } from "@/types/book";

const TYPE_CONFIG: Record<BookType, { label: string; className: string }> = {
  BORROW_ONLY: { label: "Borrow", className: "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300" },
  SELL_ONLY: { label: "Sell", className: "bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300" },
  HYBRID: { label: "Hybrid", className: "bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300" },
};

export default function ShifterInventoryPage() {
  const { data: bookData } = useGetBooks({ limit: 1000 });
  const books: IBook[] = bookData?.data || [];

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<BookType | "ALL">("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");

  const categories = ["ALL", ...Array.from(new Set(books.map((b) => b.category)))];

  const filtered = books.filter((b) => {
    const term = search.toLowerCase();
    const match =
      b.title.toLowerCase().includes(term) ||
      b.author.toLowerCase().includes(term) ||
      (b.isbn ?? "").toLowerCase().includes(term) ||
      (b.locationCell ?? "").toLowerCase().includes(term);
    const typeOk = typeFilter === "ALL" || b.type === typeFilter;
    const catOk = categoryFilter === "ALL" || b.category === categoryFilter;
    return match && typeOk && catOk;
  });

  const totalBorrow = books.reduce((acc, b) => acc + (b.borrowStock ?? 0), 0);
  const totalSell = books.reduce((acc, b) => acc + (b.sellStock ?? 0), 0);
  const lowStock = books.filter((b) => (b.availableQuantity ?? 0) <= 1).length;

  return (
    <div className="space-y-6 pb-10">
      <div>
        <h1 className="text-2xl font-extrabold text-foreground flex items-center gap-2">
          <Package className="h-6 w-6 text-[#004F32]" />
          Book Inventory
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Read-only inventory view with physical shelf location cells for counter retrieval.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-border bg-card p-4 flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
            <BookMarked className="h-5 w-5" />
          </div>
          <div>
            <p className="text-2xl font-extrabold text-foreground">{totalBorrow}</p>
            <p className="text-[11px] text-muted-foreground">Borrow Stock Units</p>
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4 flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
            <ShoppingBag className="h-5 w-5" />
          </div>
          <div>
            <p className="text-2xl font-extrabold text-foreground">{totalSell}</p>
            <p className="text-[11px] text-muted-foreground">Sell Stock Units</p>
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4 flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-600 dark:text-red-400 shrink-0">
            <BarChart3 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-2xl font-extrabold text-red-600 dark:text-red-400">{lowStock}</p>
            <p className="text-[11px] text-muted-foreground">Low Stock Items</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search title, author, ISBN, or cell..."
            className="w-full rounded-xl border border-input bg-card pl-9 pr-3 py-2 text-xs focus:ring-2 focus:ring-primary focus:outline-none"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          {(["ALL", "BORROW_ONLY", "SELL_ONLY", "HYBRID"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`rounded-lg px-2.5 py-1.5 text-[11px] font-bold transition-colors ${
                typeFilter === t
                  ? "bg-[#004F32] text-white"
                  : "border border-input bg-card text-muted-foreground hover:bg-accent"
              }`}
            >
              {t === "ALL" ? "All Types" : t.replace("_", " ").toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase())}
            </button>
          ))}
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="rounded-xl border border-input bg-card px-3 py-2 text-xs focus:ring-2 focus:ring-primary focus:outline-none"
        >
          {categories.map((c) => (
            <option key={c} value={c}>
              {c === "ALL" ? "All Categories" : c}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground text-xs space-y-2">
            <BookOpen className="h-8 w-8 mx-auto text-muted" />
            <p>No books match your search criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="px-4 py-3 font-semibold text-muted-foreground">Book</th>
                  <th className="px-4 py-3 font-semibold text-muted-foreground">ISBN</th>
                  <th className="px-4 py-3 font-semibold text-muted-foreground">
                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> Location Cell</span>
                  </th>
                  <th className="px-4 py-3 font-semibold text-muted-foreground">Type</th>
                  <th className="px-4 py-3 font-semibold text-muted-foreground text-center">Borrow Stock</th>
                  <th className="px-4 py-3 font-semibold text-muted-foreground text-center">Sell Stock</th>
                  <th className="px-4 py-3 font-semibold text-muted-foreground text-right">Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filtered.map((book) => {
                  const typeCfg = TYPE_CONFIG[book.type];
                  const isLow = (book.availableQuantity ?? book.borrowStock ?? 0) <= 1;
                  return (
                    <tr key={book.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-4">
                        <p className="font-bold text-foreground line-clamp-1">{book.title}</p>
                        <p className="text-[11px] text-muted-foreground">{book.author}</p>
                        <span className="inline-block mt-1 text-[10px] font-medium bg-muted px-2 py-0.5 rounded-md text-muted-foreground">
                          {book.category}
                        </span>
                      </td>
                      <td className="px-4 py-4 font-mono text-[11px] text-muted-foreground whitespace-nowrap">
                        {book.isbn ?? "—"}
                      </td>
                      <td className="px-4 py-4">
                        {book.locationCell ? (
                          <span className="inline-flex items-center gap-1.5 rounded-lg border border-[#004F32]/30 bg-[#004F32]/10 px-2.5 py-1 font-mono font-bold text-[#004F32] dark:text-emerald-400 text-xs">
                            <MapPin className="h-3 w-3" />
                            {book.locationCell}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold ${typeCfg.className}`}>
                          <Tag className="h-3 w-3" />
                          {typeCfg.label}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        {book.borrowStock != null ? (
                          <div>
                            <span className={`font-bold text-sm ${isLow ? "text-red-600 dark:text-red-400" : "text-foreground"}`}>
                              {book.availableQuantity ?? book.borrowStock}
                            </span>
                            <span className="text-muted-foreground">/{book.borrowStock}</span>
                            {isLow && <p className="text-[10px] text-red-500 font-bold">LOW</p>}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-center">
                        {book.sellStock != null ? (
                          <span className="font-bold text-foreground">{book.sellStock}</span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-right font-mono font-bold text-foreground">
                        {book.sellPrice ? `৳${book.sellPrice}` : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="rounded-xl border border-blue-300/40 bg-blue-500/10 p-4 flex items-start gap-3 text-xs">
        <MapPin className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-blue-900 dark:text-blue-200">Location Cell Format</p>
          <p className="text-blue-800 dark:text-blue-300 mt-0.5">
            Cell codes follow <strong>[Section]-[Row]-[Category Initial]</strong> format. E.g., <strong>A-01-T</strong> = Section A, Row 1, Tafsir shelf. This is a read-only view — update inventory via Admin panel.
          </p>
        </div>
      </div>
    </div>
  );
}

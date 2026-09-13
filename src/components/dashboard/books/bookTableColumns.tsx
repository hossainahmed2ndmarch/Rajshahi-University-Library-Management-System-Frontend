"use client";

import React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { BookOpen, MapPin, Eye, Edit, Trash2 } from "lucide-react";
import { IBook } from "@/types/book";

interface CreateBookTableColumnsOptions {
  allowDelete: boolean;
  onView: (book: IBook) => void;
  onEdit: (book: IBook) => void;
  onDelete: (book: IBook) => void;
}

export function createBookTableColumns({
  allowDelete,
  onView,
  onEdit,
  onDelete,
}: CreateBookTableColumnsOptions): ColumnDef<IBook>[] {
  return [
    {
      accessorKey: "title",
      header: "Book Title & Author",
      cell: ({ row }) => {
        const book = row.original;
        return (
          <div className="flex items-center space-x-3">
            {book.coverImage ? (
              <img
                src={book.coverImage}
                alt={book.title}
                className="h-10 w-7 shrink-0 rounded object-cover border border-border shadow-xs"
              />
            ) : (
              <div className="flex h-10 w-7 shrink-0 items-center justify-center rounded bg-primary/10 text-primary border border-border">
                <BookOpen className="h-4 w-4" />
              </div>
            )}
            <div className="min-w-0 max-w-xs">
              <div className="font-bold text-foreground text-xs leading-tight truncate">
                {book.title}
              </div>
              <div className="text-[11px] text-muted-foreground mt-0.5 truncate flex items-center gap-1">
                <span>by</span>
                {book.authors && book.authors.length > 0 ? (
                  <span className="font-medium text-foreground truncate">
                    {book.authors.map((a, i) => (
                      <React.Fragment key={i}>
                        {a.name}
                        {a.role === "TRANSLATOR" && (
                          <span className="text-[9px] text-blue-600 dark:text-blue-400 font-mono ml-0.5">
                            (Tr.)
                          </span>
                        )}
                        {i < book.authors!.length - 1 ? ", " : ""}
                      </React.Fragment>
                    ))}
                  </span>
                ) : (
                  <span className="font-medium text-foreground truncate">{book.author}</span>
                )}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "isbn",
      header: "ISBN / Cell",
      cell: ({ row }) => {
        const book = row.original;
        return (
          <div className="space-y-0.5 font-mono text-[11px]">
            <div className="text-muted-foreground truncate">{book.isbn || "—"}</div>
            <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
              <MapPin className="h-3 w-3 shrink-0" />
              <span>{book.locationCell || "Unassigned"}</span>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "category",
      header: "Categories",
      cell: ({ row }) => {
        const book = row.original;
        const cats =
          book.categories && book.categories.length > 0
            ? book.categories
            : book.category
            ? book.category.split(",").map((s) => s.trim())
            : [];
        if (cats.length === 0) return <span className="text-muted-foreground text-[11px]">—</span>;
        return (
          <div className="flex flex-wrap gap-1 max-w-[180px]">
            {cats.slice(0, 2).map((c, i) => (
              <span
                key={i}
                className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-[10px] font-semibold text-foreground truncate max-w-[120px]"
              >
                {c}
              </span>
            ))}
            {cats.length > 2 && (
              <span className="inline-flex items-center rounded-md bg-primary/10 text-primary px-1.5 py-0.5 text-[10px] font-bold">
                +{cats.length - 2}
              </span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "type",
      header: "Access Type",
      cell: ({ row }) => {
        const type = row.original.type;
        if (type === "BORROW_ONLY") {
          return (
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2.5 py-0.5 text-[10px] font-bold text-blue-700 dark:text-blue-300">
              Borrow Only
            </span>
          );
        }
        if (type === "SELL_ONLY") {
          return (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-300">
              Sell Only
            </span>
          );
        }
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
            Borrow &amp; Sell
          </span>
        );
      },
    },
    {
      accessorKey: "borrowStock",
      header: "Stock Counts",
      cell: ({ row }) => {
        const b = row.original;
        const bStock = b.borrowStock ?? b.availableQuantity ?? 0;
        const sStock = b.sellStock ?? b.stockQuantity ?? 0;
        return (
          <div className="text-[11px] space-y-0.5 font-mono">
            <div className="text-emerald-600 dark:text-emerald-400 font-semibold">
              Borrow: {bStock}
            </div>
            <div className="text-amber-600 dark:text-amber-400 font-semibold">
              Sell: {sStock}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "sellPrice",
      header: "Pricing & Margins (৳)",
      cell: ({ row }) => {
        const b = row.original;
        const isBorrowOnly = b.type === "BORROW_ONLY";

        if (isBorrowOnly) {
          return (
            <div className="text-[11px] text-muted-foreground italic font-medium">
              Free Library Loan
            </div>
          );
        }

        const sellP = b.sellPrice ?? b.price ?? 0;
        const buyP = b.buyPrice ?? 0;
        const discount = b.discount ?? 0;
        const finalSellP = discount > 0 ? Math.round(sellP * (1 - discount / 100)) : sellP;
        const profit = buyP > 0 ? finalSellP - buyP : null;

        return (
          <div className="text-[11px] font-mono space-y-0.5">
            <div className="text-foreground font-bold flex items-center gap-1">
              <span>Sell: ৳{finalSellP}</span>
              {discount > 0 && (
                <span className="text-[9px] bg-rose-500/10 text-rose-600 dark:text-rose-400 px-1 rounded">
                  -{discount}%
                </span>
              )}
            </div>
            {buyP > 0 && (
              <div className="text-muted-foreground text-[10px]">Cost: ৳{buyP}</div>
            )}
            {profit !== null && (
              <div
                className={`text-[10px] font-semibold ${
                  profit >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600"
                }`}
              >
                Margin: {profit >= 0 ? "+" : ""}৳{profit}/unit
              </div>
            )}
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const book = row.original;
        return (
          <div className="flex items-center space-x-1.5">
            <button
              type="button"
              onClick={() => onView(book)}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-input bg-background hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              title="View Book Details"
            >
              <Eye className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onEdit(book)}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-input bg-background hover:bg-accent text-foreground transition-colors cursor-pointer"
              title="Edit Book Details"
            >
              <Edit className="h-3.5 w-3.5 text-primary" />
            </button>
            {allowDelete && (
              <button
                type="button"
                onClick={() => onDelete(book)}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-input bg-background hover:bg-red-500/10 text-destructive transition-colors cursor-pointer"
                title="Delete Book"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        );
      },
    },
  ];
}

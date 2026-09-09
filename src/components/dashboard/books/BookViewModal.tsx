"use client";

import React from "react";
import { BookOpen, X } from "lucide-react";
import { IBook } from "@/types/book";

interface BookViewModalProps {
  book: IBook | null;
  onClose: () => void;
}

export function BookViewModal({ book, onClose }: BookViewModalProps) {
  if (!book) return null;

  const sellPrice = book.sellPrice ?? book.price ?? 0;
  const discount = book.discount ?? 0;
  const finalSellPrice = discount > 0 ? Math.round(sellPrice * (1 - discount / 100)) : sellPrice;
  const buyPrice = book.buyPrice ?? null;
  const profitPerUnit = buyPrice !== null ? finalSellPrice - buyPrice : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in-50">
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-2xl text-card-foreground space-y-4">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer transition-colors"
          title="Close details"
        >
          <X className="h-5 w-5" />
        </button>

        {/* ── Header details ── */}
        <div className="flex items-start space-x-4 pb-3 border-b border-border">
          <div className="flex flex-col items-center shrink-0">
            {book.coverImage ? (
              <img
                src={book.coverImage}
                alt={book.title}
                className="h-24 w-16 shrink-0 rounded-lg object-cover border border-border shadow"
              />
            ) : (
              <div className="flex h-24 w-16 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary border border-border">
                <BookOpen className="h-7 w-7" />
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-base text-foreground truncate">{book.title}</h3>
            <p className="text-xs text-muted-foreground">by {book.author}</p>
            {book.publisher && (
              <p className="text-[10px] text-muted-foreground mt-1">Publisher: {book.publisher}</p>
            )}
            {Array.isArray(book.images) && book.images.length > 0 && (
              <span className="inline-block mt-2 text-[10px] bg-primary/10 text-primary font-semibold px-2 py-0.5 rounded">
                📷 {book.images.length} Additional Photo(s) Attached
              </span>
            )}
          </div>
        </div>

        {/* ── Additional Photos Gallery ── */}
        {Array.isArray(book.images) && book.images.length > 0 && (
          <div className="space-y-1.5 pt-1">
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
              Attached Preview Images
            </span>
            <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-thin">
              {book.images.map((img, i) => (
                <a
                  key={i}
                  href={img}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-16 w-12 shrink-0 rounded-lg overflow-hidden border border-border hover:border-primary transition-colors"
                  title="Click to view full image"
                >
                  <img src={img} alt={`Preview ${i + 1}`} className="h-full w-full object-cover" />
                </a>
              ))}
            </div>
          </div>
        )}

        {/* ── Information Grid ── */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-muted/40 border border-border space-y-1">
            <span className="text-[10px] text-muted-foreground uppercase font-bold">Category</span>
            <p className="font-semibold text-foreground">{book.category}</p>
          </div>

          <div className="p-3 rounded-xl bg-muted/40 border border-border space-y-1">
            <span className="text-[10px] text-muted-foreground uppercase font-bold">ISBN / Barcode</span>
            <p className="font-mono font-semibold text-foreground">{book.isbn || "—"}</p>
          </div>

          <div className="p-3 rounded-xl bg-muted/40 border border-border space-y-1">
            <span className="text-[10px] text-muted-foreground uppercase font-bold">Shelf Location</span>
            <p className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
              {book.locationCell || "Unassigned"}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-muted/40 border border-border space-y-1">
            <span className="text-[10px] text-muted-foreground uppercase font-bold">Access Type</span>
            <p className="font-semibold text-foreground">{book.type.replace("_", " ")}</p>
          </div>

          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-300/40 space-y-1">
            <span className="text-[10px] text-emerald-700 dark:text-emerald-300 uppercase font-bold">
              Borrow Stock
            </span>
            <p className="font-mono font-bold text-emerald-800 dark:text-emerald-200">
              {book.borrowStock ?? 0} Copies
            </p>
          </div>

          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-300/40 space-y-1">
            <span className="text-[10px] text-amber-700 dark:text-amber-300 uppercase font-bold">
              Sell Stock &amp; Price
            </span>
            <p className="font-mono font-bold text-amber-800 dark:text-amber-200">
              {book.sellStock ?? 0} Copies • ৳{finalSellPrice}
              {discount > 0 && ` (-${discount}%)`}
            </p>
            {buyPrice !== null && profitPerUnit !== null && (
              <p className="text-[10px] font-mono text-muted-foreground">
                Cost: ৳{buyPrice} | Margin: {profitPerUnit >= 0 ? "+" : ""}৳{profitPerUnit}/unit
              </p>
            )}
          </div>
        </div>

        {/* ── Synopsis / Description ── */}
        {book.description && (
          <div className="p-3 rounded-xl bg-muted/30 border border-border text-xs space-y-1">
            <span className="text-[10px] text-muted-foreground uppercase font-bold">
              Synopsis / Description
            </span>
            <p className="text-foreground leading-relaxed whitespace-pre-line">{book.description}</p>
          </div>
        )}

        <div className="flex justify-end pt-2 border-t border-border">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

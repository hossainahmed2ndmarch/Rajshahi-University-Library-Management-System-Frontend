"use client";

import React, { useState } from "react";
import { BookOpen, Heart, ShoppingBag, BookCheck } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";
import { IBook } from "@/types/book";
import { useCartStore } from "@/store/useCartStore";
import { useWishlistStore } from "@/store/useWishlistStore";
import { useGetMe } from "@/hooks/useAuth";
import { BookDetailModal } from "./BookDetailModal";

// ── Utility ───────────────────────────────────────────────────────────────────
function getDiscountedPrice(sellPrice: number, discount: number): number {
  if (!discount || discount <= 0) return sellPrice;
  return Math.round(sellPrice * (1 - discount / 100) * 100) / 100;
}

export interface BookCardProps {
  book: IBook;
}

export function BookCard({ book }: BookCardProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // ── Stores ─────────────────────────────────────────────────────────────────
  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.openCart);
  const cartItems = useCartStore((s) => s.items);
  const toggleWishlist = useWishlistStore((s) => s.toggleWishlist);
  const isInWishlist = useWishlistStore((s) => s.isInWishlist);

  // ── Auth ───────────────────────────────────────────────────────────────────
  const { data: user } = useGetMe();
  const isGuest = !user;

  // ── Derived values ─────────────────────────────────────────────────────────
  const rawPrice = book.sellPrice ?? book.price ?? 0;
  const discount = book.discount ?? 0;
  const finalPrice = getDiscountedPrice(rawPrice, discount);
  const hasDiscount = discount > 0 && rawPrice > 0;

  const isBorrowable = book.isBorrowable ?? (book.type === "BORROW_ONLY" || book.type === "HYBRID");
  const isSellable = book.isSellable ?? (book.type === "SELL_ONLY" || book.type === "HYBRID");

  const wishlisted = isInWishlist(book.id);
  const inCart = cartItems.some((i) => i.bookId === book.id && i.type === "SELL");
  const sellOutOfStock = (book.sellStock ?? 0) <= 0;
  const borrowOutOfStock = (book.borrowStock ?? 0) <= 0;

  // ── Helpers ────────────────────────────────────────────────────────────────
  const requireAuth = (action: () => void) => {
    if (isGuest) {
      toast.info("Please log in to continue.");
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }
    action();
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    requireAuth(() => {
      toggleWishlist(book);
      toast.success(
        wishlisted ? `Removed from wishlist` : `Added to wishlist`
      );
    });
  };

  const handleBuy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (sellOutOfStock) { toast.error("Out of stock."); return; }
    requireAuth(() => {
      addItem({
        bookId: book.id,
        title: book.title,
        author: book.author,
        category: book.category,
        price: finalPrice,
        borrowFee: book.borrowFee,
        coverImage: book.coverImage,
        type: "SELL",
      });
      openCart();
      toast.success(`"${book.title}" added to cart!`);
    });
  };

  const handleBorrow = (e: React.MouseEvent) => {
    e.stopPropagation();
    requireAuth(() => {
      setModalOpen(true);
    });
  };

  return (
    <>
      {/* Card */}
      <div
        className="group relative flex flex-col rounded-2xl border border-border bg-card overflow-hidden transition-all duration-300 hover:border-[#004F32] dark:hover:border-emerald-600/40 cursor-pointer"
        onClick={() => setModalOpen(true)}
      >
        {/* ── Cover Image ──────────────────────────────────────────────────── */}
        <div className="relative w-full aspect-[3/4] bg-muted overflow-hidden shrink-0">
          {book.coverImage ? (
            <img
              src={book.coverImage}
              alt={book.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-[#004F32]/10 to-[#C78700]/10">
              <BookOpen className="h-10 w-10 text-muted-foreground/40" />
            </div>
          )}

          {/* Discount Badge */}
          {hasDiscount && (
            <span className="absolute top-2 left-2 bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md shadow-sm">
              -{discount}%
            </span>
          )}

          {/* Book type badge */}
          <div className="absolute top-2 right-2 flex flex-col items-end gap-1">
            {isBorrowable && (
              <span className="inline-flex items-center gap-0.5 rounded-md bg-[#004F32]/90 backdrop-blur-sm px-1.5 py-0.5 text-[10px] font-bold text-white shadow-sm">
                <BookCheck className="h-2.5 w-2.5 text-amber-300" />
                <span>Borrow</span>
              </span>
            )}
            {isSellable && (
              <span className="inline-flex items-center gap-0.5 rounded-md bg-[#C78700]/90 backdrop-blur-sm px-1.5 py-0.5 text-[10px] font-bold text-white shadow-sm">
                <ShoppingBag className="h-2.5 w-2.5" />
                <span>Buy</span>
              </span>
            )}
          </div>

          {/* Wishlist heart overlay */}
          <button
            onClick={handleWishlist}
            aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
            className={`absolute bottom-2 right-2 rounded-full p-1.5 transition-all duration-200 shadow-md border backdrop-blur-sm ${
              wishlisted
                ? "bg-rose-500 border-rose-400 text-white"
                : "bg-background/70 border-border/60 text-muted-foreground hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/60 opacity-0 group-hover:opacity-100"
            }`}
          >
            <Heart className={`h-3.5 w-3.5 transition-transform ${wishlisted ? "fill-white scale-110" : ""}`} />
          </button>
        </div>

        {/* ── Card Body ────────────────────────────────────────────────────── */}
        <div className="flex flex-col flex-1 p-3 gap-1.5">
          {/* Category */}
          <span className="text-[10px] font-semibold text-[#004F32] dark:text-emerald-400 uppercase tracking-wider truncate">
            {book.category || "General"}
          </span>

          {/* Title */}
          <h3 className="text-sm font-bold text-foreground line-clamp-2 leading-snug group-hover:text-[#004F32] dark:group-hover:text-emerald-400 transition-colors">
            {book.title}
          </h3>

          {/* Author */}
          <p className="text-[11px] text-muted-foreground font-medium truncate">
            {book.author}
          </p>

          {/* ── Price ───────────────────────────────────────────────────────── */}
          {isSellable && rawPrice > 0 && (
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-sm font-black text-[#C78700]">
                ৳{finalPrice}
              </span>
              {hasDiscount && (
                <span className="text-[11px] text-muted-foreground line-through">
                  ৳{rawPrice}
                </span>
              )}
            </div>
          )}

          {/* ── Action Buttons ───────────────────────────────────────────────── */}
          <div className="flex items-center gap-1.5 mt-auto pt-2">
            {/* Wishlist (always visible in footer for clarity) */}
            <button
              onClick={handleWishlist}
              aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
              className={`flex items-center justify-center rounded-xl border p-1.5 transition-all duration-200 shadow-xs ${
                wishlisted
                  ? "bg-rose-50 dark:bg-rose-950/50 border-rose-300 dark:border-rose-700 text-rose-500"
                  : "border-border/60 text-muted-foreground hover:text-rose-500 hover:border-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/30"
              }`}
            >
              <Heart className={`h-3.5 w-3.5 ${wishlisted ? "fill-rose-500" : ""}`} />
            </button>

            {/* Buy button */}
            {isSellable && (
              <button
                onClick={handleBuy}
                disabled={sellOutOfStock}
                aria-label={inCart ? "Already in cart" : "Add to cart"}
                className={`flex-1 flex items-center justify-center gap-1 rounded-xl border px-2 py-1.5 text-[11px] font-bold transition-all shadow-xs disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${
                  inCart
                    ? "bg-[#C78700] border-[#C78700] text-white"
                    : "border-[#C78700]/60 text-[#C78700] hover:bg-[#C78700] hover:text-white hover:border-[#C78700]"
                }`}
              >
                <ShoppingBag className="h-3 w-3 shrink-0" />
                <span>{inCart ? "In Cart" : "Buy"}</span>
              </button>
            )}

            {/* Borrow button */}
            {isBorrowable && (
              <button
                onClick={handleBorrow}
                disabled={borrowOutOfStock}
                aria-label="Borrow this book"
                className="flex-1 flex items-center justify-center gap-1 rounded-xl border border-[#004F32]/60 px-2 py-1.5 text-[11px] font-bold text-[#004F32] dark:text-emerald-400 hover:bg-[#004F32] hover:text-white transition-all shadow-xs disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <BookCheck className="h-3 w-3 shrink-0" />
                <span>Borrow</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {modalOpen && <BookDetailModal book={book} onClose={() => setModalOpen(false)} />}
    </>
  );
}

export default BookCard;

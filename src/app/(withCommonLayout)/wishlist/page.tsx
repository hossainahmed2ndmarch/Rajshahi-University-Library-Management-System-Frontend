"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Heart,
  Trash2,
  ShoppingCart,
  BookOpen,
  ArrowLeft,
  BookMarked,
  BookmarkPlus,
  BookCheck,
  CheckCircle2,
  Calendar,
  Layers,
  MapPin,
} from "lucide-react";
import { useWishlistStore, WishlistItem } from "@/store/useWishlistStore";
import { useCartStore } from "@/store/useCartStore";
import { useGetMe } from "@/hooks/useAuth";
import { useCreateBorrow } from "@/hooks/useBorrows";
import { toast } from "sonner";

export default function WishlistPage() {
  const router = useRouter();
  const { items, removeItem, clearWishlist } = useWishlistStore();
  const { addItem: addToCart, items: cartItems } = useCartStore();
  const { data: user } = useGetMe();
  const { mutate: createBorrow, isPending: isBorrowPending } = useCreateBorrow();

  const [isMounted, setIsMounted] = useState(false);
  const [borrowModalItem, setBorrowModalItem] = useState<WishlistItem | null>(null);
  const [borrowDays, setBorrowDays] = useState(14);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const handleMoveToCart = (item: WishlistItem) => {
    addToCart({
      bookId: item.bookId,
      title: item.title,
      author: item.author,
      category: item.category,
      price: item.price ?? 0,
      coverImage: item.coverImage,
      type: "SELL",
    });
    toast.success(`"${item.title}" added to cart!`);
  };

  const handleOpenBorrowModal = (item: WishlistItem) => {
    if (!user) {
      toast.info("Please log in or register to submit a borrow reservation.");
      router.push(`/login?redirect=/wishlist`);
      return;
    }
    setBorrowModalItem(item);
  };

  const handleConfirmBorrow = () => {
    if (!borrowModalItem) return;

    const dueDate = new Date(Date.now() + borrowDays * 86400000).toISOString();
    createBorrow(
      {
        bookId: borrowModalItem.bookId,
        dueDate,
      },
      {
        onSuccess: () => {
          setBorrowModalItem(null);
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-zinc-950 py-8 sm:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb & Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-2">
            <Link href="/" className="hover:text-primary transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link href="/books" className="hover:text-primary transition-colors">
              Books
            </Link>
            <span>/</span>
            <span className="text-foreground">Wishlist</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground flex items-center gap-2.5">
                <Heart className="h-7 w-7 text-primary fill-primary/20" />
                Saved Books &amp; Wishlist
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Keep track of books you plan to borrow or purchase for your studies and research.
              </p>
            </div>
            {items.length > 0 && (
              <button
                onClick={clearWishlist}
                className="self-start sm:self-auto text-xs font-semibold text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-200 dark:border-rose-900/50 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Clear Wishlist
              </button>
            )}
          </div>
        </div>

        {items.length === 0 ? (
          /* Empty State */
          <div className="bg-card rounded-2xl border border-border p-12 text-center max-w-lg mx-auto shadow-sm">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-5">
              <BookMarked className="h-10 w-10" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">Your Wishlist is Empty</h2>
            <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
              Explore our library catalogue and save the treatises, Hadith compilations, and Islamic books you're interested in.
            </p>
            <Link
              href="/books"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
            >
              <BookOpen className="h-4 w-4" />
              Browse Books Catalog
            </Link>
          </div>
        ) : (
          /* Wishlist Items Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {items.map((item) => {
              const isBorrowOnly = item.type === "BORROW_ONLY" || (item.isBorrowable && !item.isSellable);
              const isSellOnly = item.type === "SELL_ONLY" || (item.isSellable && !item.isBorrowable);
              const isHybrid = item.type === "HYBRID" || (item.isBorrowable && item.isSellable) || (!isBorrowOnly && !isSellOnly);

              const isInCart = cartItems.some((ci) => ci.bookId === item.bookId && ci.type === "SELL");

              return (
                <div
                  key={item.bookId}
                  className="bg-card rounded-2xl border border-border overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between group"
                >
                  {/* Top Section: Cover & Badges */}
                  <div>
                    <div className="relative aspect-[4/3] bg-muted flex items-center justify-center overflow-hidden border-b border-border">
                      {item.coverImage ? (
                        <img
                          src={item.coverImage}
                          alt={item.title}
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <BookOpen className="h-12 w-12 text-muted-foreground/40" />
                      )}
                      <button
                        onClick={() => removeItem(item.bookId)}
                        className="absolute top-3 right-3 p-2 rounded-full bg-background/80 backdrop-blur-xs text-muted-foreground hover:text-rose-600 dark:hover:text-rose-400 hover:bg-background transition-colors shadow-xs cursor-pointer"
                        title="Remove from wishlist"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                      <div className="absolute bottom-3 left-3 flex gap-1.5 flex-wrap">
                        {item.category && (
                          <span className="bg-background/90 backdrop-blur-xs text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md text-foreground border border-border/50">
                            {item.category}
                          </span>
                        )}
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                            isBorrowOnly
                              ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300"
                              : isSellOnly
                              ? "bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300"
                              : "bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300"
                          }`}
                        >
                          {item.type || (isBorrowOnly ? "Borrow" : isSellOnly ? "Buy" : "Hybrid")}
                        </span>
                      </div>
                    </div>

                    {/* Book Metadata */}
                    <div className="p-5 space-y-2">
                      <h3 className="font-bold text-sm sm:text-base text-foreground line-clamp-2 leading-snug">
                        {item.title}
                      </h3>
                      <p className="text-xs text-muted-foreground">By {item.author}</p>
                    </div>
                  </div>

                  {/* Bottom Section: Pricing & Strict Mode Buttons */}
                  <div className="p-5 pt-0">
                    <div className="pt-3 border-t border-border/60 mb-3 space-y-1">
                      {item.isSellable || item.price ? (
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Purchase Price:</span>
                          <span className="font-black text-amber-600 dark:text-amber-400">
                            ৳{Number(item.price ?? 0).toLocaleString()}
                          </span>
                        </div>
                      ) : null}
                      {item.isBorrowable || isBorrowOnly ? (
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Borrow Fee:</span>
                          <span className="font-black text-[#004F32] dark:text-emerald-400">
                            ৳{Number(item.borrowFee ?? 0).toLocaleString()}
                          </span>
                        </div>
                      ) : null}
                    </div>

                    {/* Action Buttons strictly mapped per user instruction:
                        1. BORROW_ONLY -> Only "Request Borrow"
                        2. HYBRID      -> Both "Add to Cart" AND "Request Borrow"
                        3. SELL_ONLY   -> Only "Add to Cart"
                    */}
                    <div className="space-y-2">
                      {isBorrowOnly && (
                        <button
                          onClick={() => handleOpenBorrowModal(item)}
                          className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#004F32] hover:bg-emerald-900 text-white py-2.5 px-3 text-xs font-bold shadow-xs transition-colors cursor-pointer"
                        >
                          <BookmarkPlus className="h-3.5 w-3.5" />
                          <span>Request Borrow</span>
                        </button>
                      )}

                      {isSellOnly && (
                        <button
                          onClick={() => handleMoveToCart(item)}
                          className={`w-full inline-flex items-center justify-center gap-1.5 rounded-xl py-2.5 px-3 text-xs font-bold transition-colors shadow-xs cursor-pointer ${
                            isInCart
                              ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                              : "bg-[#C78700] hover:bg-amber-600 text-white"
                          }`}
                        >
                          {isInCart ? <CheckCircle2 className="h-3.5 w-3.5" /> : <ShoppingCart className="h-3.5 w-3.5" />}
                          <span>{isInCart ? "In Cart" : "Add to Cart"}</span>
                        </button>
                      )}

                      {isHybrid && (
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => handleOpenBorrowModal(item)}
                            className="inline-flex items-center justify-center gap-1 rounded-xl bg-[#004F32] hover:bg-emerald-900 text-white py-2.5 px-2 text-[11px] font-bold shadow-xs transition-colors cursor-pointer"
                          >
                            <BookmarkPlus className="h-3 w-3" />
                            <span>Borrow</span>
                          </button>
                          <button
                            onClick={() => handleMoveToCart(item)}
                            className={`inline-flex items-center justify-center gap-1 rounded-xl py-2.5 px-2 text-[11px] font-bold transition-colors shadow-xs cursor-pointer ${
                              isInCart
                                ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                                : "bg-[#C78700] hover:bg-amber-600 text-white"
                            }`}
                          >
                            {isInCart ? <CheckCircle2 className="h-3 w-3" /> : <ShoppingCart className="h-3 w-3" />}
                            <span>{isInCart ? "In Cart" : "Add to Cart"}</span>
                          </button>
                        </div>
                      )}

                      <Link
                        href={`/books/${item.bookId}`}
                        className="w-full inline-flex items-center justify-center gap-1 rounded-xl border border-border hover:bg-muted py-1.5 text-[11px] font-semibold text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <BookOpen className="h-3 w-3" />
                        <span>View Book Details</span>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {items.length > 0 && (
          <div className="mt-10">
            <Link
              href="/books"
              className="inline-flex items-center gap-2 text-xs font-semibold text-primary hover:underline"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Continue Browsing Catalog
            </Link>
          </div>
        )}
      </div>

      {/* Borrow Confirmation Modal */}
      {borrowModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in-50">
          <div className="relative w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-4 animate-in zoom-in-95 text-card-foreground">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-[#004F32] dark:text-emerald-400">
                <BookCheck className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-foreground">Confirm Borrow Request</h3>
                <p className="text-xs text-muted-foreground">RU Central Islamic Library</p>
              </div>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              You are requesting to borrow <strong className="text-foreground">"{borrowModalItem.title}"</strong> by {borrowModalItem.author}.
            </p>

            <div className="p-3.5 rounded-xl bg-muted/40 border border-border text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Pick-up Location:</span>
                <span className="font-bold text-foreground">RU Central Library (Counter 3)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Borrow Fee:</span>
                <span className="font-bold text-primary">৳{borrowModalItem.borrowFee ?? 0}</span>
              </div>
              {borrowModalItem.locationCell && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shelf Cell:</span>
                  <span className="font-mono font-bold text-foreground">{borrowModalItem.locationCell}</span>
                </div>
              )}
            </div>

            <div>
              <label className="text-xs font-bold text-foreground block mb-1.5">
                Target Loan Period
              </label>
              <select
                value={borrowDays}
                onChange={(e) => setBorrowDays(Number(e.target.value))}
                className="w-full rounded-xl border border-input bg-background p-2.5 text-xs font-medium focus:ring-2 focus:ring-primary focus:outline-none"
              >
                <option value={7}>7 Days (Rapid Reference)</option>
                <option value={14}>14 Days (Standard Academic Loan)</option>
                <option value={28}>28 Days (Faculty &amp; Research Extension)</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border">
              <button
                type="button"
                onClick={() => setBorrowModalItem(null)}
                disabled={isBorrowPending}
                className="rounded-xl border border-border px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmBorrow}
                disabled={isBorrowPending}
                className="rounded-xl bg-[#004F32] hover:bg-emerald-900 text-white px-5 py-2 text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
              >
                {isBorrowPending ? (
                  <span>Submitting...</span>
                ) : (
                  <>
                    <BookmarkPlus className="h-3.5 w-3.5" />
                    <span>Confirm Borrow</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


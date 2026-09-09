"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  BookOpen,
  ArrowLeft,
  ShieldCheck,
  Truck,
  RotateCcw,
} from "lucide-react";
import { useCartStore } from "@/store/useCartStore";

export default function CartPage() {
  const router = useRouter();
  const { items, removeItem, updateQuantity, clearCart, getTotalPrice, getTotalItems } =
    useCartStore();
  const [isMounted, setIsMounted] = useState(false);

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

  const subtotal = getTotalPrice();
  const deliveryFee = items.length > 0 ? 50 : 0;
  const grandTotal = subtotal + deliveryFee;

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-zinc-950 py-8 sm:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header Breadcrumb & Title */}
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
            <span className="text-foreground">Cart</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground flex items-center gap-2.5">
                <ShoppingBag className="h-7 w-7 text-primary" />
                Shopping Cart
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Manage your selected books for borrow reservation or direct purchase.
              </p>
            </div>
            {items.length > 0 && (
              <button
                onClick={clearCart}
                className="self-start sm:self-auto text-xs font-semibold text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-200 dark:border-rose-900/50 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Clear Cart
              </button>
            )}
          </div>
        </div>

        {items.length === 0 ? (
          /* Empty Cart State */
          <div className="bg-card rounded-2xl border border-border p-12 text-center max-w-lg mx-auto shadow-sm">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-5">
              <ShoppingBag className="h-10 w-10" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">Your Cart is Empty</h2>
            <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
              Looks like you haven't added any books yet. Explore our authentic Islamic catalog,
              scholarly treatises, and research collections.
            </p>
            <Link
              href="/books"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
            >
              <BookOpen className="h-4 w-4" />
              Browse Catalog
            </Link>
          </div>
        ) : (
          /* Active Cart Grid */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Cart Items List */}
            <div className="lg:col-span-8 space-y-4">
              <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
                <div className="p-4 sm:p-5 border-b border-border bg-muted/30 flex justify-between items-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  <span>Book Details ({getTotalItems()} items)</span>
                  <span className="hidden sm:inline">Price & Quantity</span>
                </div>

                <div className="divide-y divide-border">
                  {items.map((item) => {
                    const unitPrice = item.type === "BORROW" ? item.borrowFee || 0 : item.price;
                    const itemTotal = unitPrice * item.quantity;

                    return (
                      <div
                        key={`${item.bookId}-${item.type}`}
                        className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-muted/10 transition-colors"
                      >
                        {/* Book Info */}
                        <div className="flex items-start gap-4 flex-1">
                          <div className="h-20 w-16 flex-shrink-0 rounded-lg bg-muted flex items-center justify-center overflow-hidden border border-border/50">
                            {item.coverImage ? (
                              <img
                                src={item.coverImage}
                                alt={item.title}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <BookOpen className="h-8 w-8 text-muted-foreground/50" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <span
                                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                  item.type === "BORROW"
                                    ? "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300"
                                    : "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300"
                                }`}
                              >
                                {item.type === "BORROW" ? "Borrow Reservation" : "Direct Purchase"}
                              </span>
                              {item.category && (
                                <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-md">
                                  {item.category}
                                </span>
                              )}
                            </div>
                            <h3 className="font-semibold text-sm sm:text-base text-foreground line-clamp-1">
                              {item.title}
                            </h3>
                            {item.author && (
                              <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                                By {item.author}
                              </p>
                            )}
                            <p className="text-xs font-semibold text-primary mt-1">
                              ৳{unitPrice.toLocaleString()}{" "}
                              <span className="text-[10px] font-normal text-muted-foreground">
                                / copy
                              </span>
                            </p>
                          </div>
                        </div>

                        {/* Modifiers & Remove */}
                        <div className="flex items-center justify-between sm:justify-end gap-6 sm:gap-8 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/50">
                          {/* Quantity Controls */}
                          <div className="flex items-center border border-border rounded-xl bg-background overflow-hidden shadow-xs">
                            <button
                              onClick={() => updateQuantity(item.bookId, item.type, item.quantity - 1)}
                              className="p-2 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40"
                              disabled={item.quantity <= 1}
                              aria-label="Decrease quantity"
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <span className="w-9 text-center text-xs font-bold text-foreground">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.bookId, item.type, item.quantity + 1)}
                              className="p-2 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                              aria-label="Increase quantity"
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>

                          {/* Item Subtotal */}
                          <div className="text-right min-w-[70px]">
                            <p className="text-sm font-bold text-foreground">
                              ৳{itemTotal.toLocaleString()}
                            </p>
                          </div>

                          {/* Delete Button */}
                          <button
                            onClick={() => removeItem(item.bookId, item.type)}
                            className="text-muted-foreground hover:text-rose-600 dark:hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                            title="Remove item"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Continue Shopping Action */}
              <div className="flex justify-between items-center pt-2">
                <Link
                  href="/books"
                  className="inline-flex items-center gap-2 text-xs font-semibold text-primary hover:underline"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Continue Exploring Catalog
                </Link>
              </div>
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-4 space-y-4">
              <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
                <h2 className="text-base font-bold text-foreground mb-4">Order Summary</h2>

                <div className="space-y-3 text-xs border-b border-border pb-4">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Items Subtotal</span>
                    <span className="font-semibold text-foreground">৳{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Library Processing & Delivery</span>
                    <span className="font-semibold text-foreground">৳{deliveryFee}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Campus Handover Point</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                      RU Central Library
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center py-4 border-b border-border mb-6">
                  <span className="text-sm font-bold text-foreground">Grand Total</span>
                  <span className="text-xl font-black text-primary">
                    ৳{grandTotal.toLocaleString()}
                  </span>
                </div>

                <button
                  onClick={() => router.push("/checkout")}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary py-3.5 px-4 text-sm font-bold text-primary-foreground shadow-sm hover:bg-primary/90 transition-all hover:gap-3"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="h-4 w-4" />
                </button>

                {/* Trust Badges */}
                <div className="mt-6 pt-4 border-t border-border/60 space-y-2.5 text-[11px] text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
                    <span>Verified Authentic Islamic Publications</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Truck className="h-4 w-4 text-primary shrink-0" />
                    <span>Fast Campus & Inter-Department Delivery</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <RotateCcw className="h-4 w-4 text-primary shrink-0" />
                    <span>Easy Returns & Exchange Policy</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

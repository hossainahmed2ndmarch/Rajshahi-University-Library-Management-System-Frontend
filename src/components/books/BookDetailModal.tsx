"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import {
  X,
  BookOpen,
  Building,
  ShoppingBag,
  BookmarkPlus,
  Heart,
  CheckCircle,
  MapPin,
  FileText,
  Clock,
  AlertCircle,
  ExternalLink,
  BookCheck,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
} from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";
import { IBook } from "@/types/book";
import { useCartStore } from "@/store/useCartStore";
import { useWishlistStore } from "@/store/useWishlistStore";
import { useGetMe } from "@/hooks/useAuth";
import { useCreateBorrow } from "@/hooks/useBorrows";
import { BookReviewsSection } from "./BookReviewsSection";

// ── Utility ───────────────────────────────────────────────────────────────────
function getDiscountedPrice(sellPrice: number, discount: number): number {
  if (!discount || discount <= 0) return sellPrice;
  return Math.round(sellPrice * (1 - discount / 100) * 100) / 100;
}

export interface BookDetailModalProps {
  book: IBook;
  onClose: () => void;
}

// ── Full-screen Image Lightbox ────────────────────────────────────────────────
function ImageLightbox({
  images,
  initialIndex,
  onClose,
}: {
  images: string[];
  initialIndex: number;
  onClose: () => void;
}) {
  const [current, setCurrent] = useState(initialIndex);

  const prev = () => setCurrent((c) => (c - 1 + images.length) % images.length);
  const next = () => setCurrent((c) => (c + 1) % images.length);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return createPortal(
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/95 backdrop-blur-sm animate-in fade-in-50"
      onClick={onClose}
    >
      {/* Close */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 p-2 text-white transition-colors cursor-pointer"
      >
        <X className="h-5 w-5" />
      </button>

      {/* Counter */}
      <span className="absolute top-4 left-1/2 -translate-x-1/2 text-white/70 text-sm font-medium">
        {current + 1} / {images.length}
      </span>

      {/* Image */}
      <div
        className="relative max-w-4xl max-h-[85vh] flex items-center justify-center px-16"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={images[current]}
          alt={`Image ${current + 1}`}
          className="max-w-full max-h-[80vh] object-contain rounded-xl shadow-2xl"
        />
      </div>

      {/* Prev / Next */}
      {images.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); prev(); }}
            className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 hover:bg-white/25 border border-white/20 p-3 text-white transition-colors cursor-pointer"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); next(); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 hover:bg-white/25 border border-white/20 p-3 text-white transition-colors cursor-pointer"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 px-4 py-2 rounded-2xl bg-black/50 backdrop-blur-sm">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={(e) => { e.stopPropagation(); setCurrent(idx); }}
              className={`h-12 w-9 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                current === idx ? "border-white scale-110" : "border-white/30 opacity-60 hover:opacity-90"
              }`}
            >
              <img src={img} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>,
    document.body
  );
}

export function BookDetailModal({ book, onClose }: BookDetailModalProps) {
  const [mounted, setMounted] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const router = useRouter();
  const pathname = usePathname();

  // ── Stores ─────────────────────────────────────────────────────────────────
  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.openCart);
  const cartItems = useCartStore((s) => s.items);
  const toggleWishlist = useWishlistStore((s) => s.toggleWishlist);
  const isInWishlist = useWishlistStore((s) => s.isInWishlist);

  // ── Auth & Borrow Mutation ─────────────────────────────────────────────────
  const { data: user } = useGetMe();
  const { mutate: createBorrow, isPending: isBorrowPending } = useCreateBorrow();

  const isStaff = user?.role && ["ADMIN", "SUPER_ADMIN", "SHIFTER"].includes(user.role);

  // Modal Interactive States
  const [isBorrowStep, setIsBorrowStep] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const allImages = React.useMemo(() => {
    const list: string[] = [];
    if (book?.coverImage) list.push(book.coverImage);
    if (book?.images && Array.isArray(book.images)) {
      book.images.forEach((img) => {
        if (img && !list.includes(img)) list.push(img);
      });
    }
    return list;
  }, [book?.coverImage, book?.images]);

  const activeImage = selectedImage || (allImages.length > 0 ? allImages[0] : book?.coverImage);
  const activeIndex = activeImage ? allImages.indexOf(activeImage) : 0;

  // Mount check & body scroll lock
  useEffect(() => {
    setMounted(true);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  // Close on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !lightboxOpen) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, lightboxOpen]);

  // ── Derived ────────────────────────────────────────────────────────────────
  const rawPrice = book.sellPrice ?? book.price ?? 0;
  const discount = book.discount ?? 0;
  const finalPrice = getDiscountedPrice(rawPrice, discount);
  const hasDiscount = discount > 0 && rawPrice > 0;

  const outOfStock = (book.borrowStock ?? 0) <= 0;
  const isBorrowable = book.isBorrowable ?? (book.type === "BORROW_ONLY" || book.type === "HYBRID");
  const isSellable = book.isSellable ?? (book.type === "SELL_ONLY" || book.type === "HYBRID");

  const wishlisted = isInWishlist(book.id);
  const inCart = cartItems.some((i) => i.bookId === book.id && i.type === "SELL");

  // Dynamic reading days calculation: 15 pages per day max
  const bookPages = book.pages && book.pages > 0 ? book.pages : 15;
  const calculatedDays = Math.max(1, Math.ceil(bookPages / 15));

  // Check user membership validity
  const now = new Date();
  const isMembershipExpired =
    user &&
    (!user.isPaid ||
      user.status === "PENDING_PAYMENT" ||
      user.status === "BLOCKED" ||
      user.status === "INACTIVE" ||
      (user.membershipExpiresAt && new Date(user.membershipExpiresAt) <= now));

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleWishlist = () => {
    if (!user) {
      toast.info("Please log in to save books to your wishlist.");
      onClose();
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }
    toggleWishlist(book);
    toast.success(
      wishlisted
        ? `Removed "${book.title}" from wishlist`
        : `"${book.title}" saved to wishlist`
    );
  };

  const handleAddToCart = () => {
    if ((book.sellStock ?? 0) <= 0) {
      toast.error("This book is currently out of stock for purchase.");
      return;
    }
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
  };

  const handleStartBorrow = () => {
    if (!user) {
      toast.info("Please log in or register to submit a borrow request.");
      onClose();
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }
    if (isMembershipExpired) {
      toast.error("Your library membership has expired or is inactive. Please renew to borrow books.");
      return;
    }
    if (outOfStock) {
      toast.error("No copies currently available in library borrow inventory.");
      return;
    }
    setIsBorrowStep(true);
  };

  const handleConfirmBorrow = () => {
    createBorrow(
      { bookId: book.id },
      {
        onSuccess: () => {
          setIsBorrowStep(false);
          onClose();
        },
      }
    );
  };

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  if (!mounted) return null;

  const modalContent = (
    <>
      <div
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 backdrop-blur-sm p-3 sm:p-4 animate-in fade-in-50"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div className="relative w-full max-w-2xl max-h-[92vh] flex flex-col rounded-3xl border border-border bg-card shadow-2xl text-card-foreground animate-in zoom-in-95 overflow-hidden">
          {/* Top Header Bar */}
          <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-border bg-muted/20">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center rounded-full bg-emerald-100 dark:bg-emerald-950 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                {book.category || "Islamic Treatise"}
              </span>
              <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                {book.type || "General"}
              </span>
              {hasDiscount && (
                <span className="inline-flex items-center rounded-full bg-rose-100 dark:bg-rose-950/60 px-2 py-0.5 text-[11px] font-bold text-rose-600 dark:text-rose-400">
                  -{discount}% OFF
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleWishlist}
                aria-label={wishlisted ? "Remove from wishlist" : "Save to wishlist"}
                className={`rounded-full p-2 border transition-all duration-200 shadow-xs cursor-pointer ${
                  wishlisted
                    ? "bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800 text-rose-500"
                    : "bg-background border-border/60 text-muted-foreground hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                }`}
                title={wishlisted ? "Remove from wishlist" : "Save to wishlist"}
              >
                <Heart className={`h-4 w-4 ${wishlisted ? "fill-rose-500" : ""}`} />
              </button>
              <button
                onClick={onClose}
                className="rounded-full p-2 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors border border-border/60 cursor-pointer"
                title="Close modal"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Scrollable Content Body */}
          <div className="overflow-y-auto px-5 sm:px-6 py-5 space-y-6">
            {/* Membership Notice if expired */}
            {user && isMembershipExpired && (
              <div className="rounded-2xl bg-amber-500/10 border border-amber-500/30 p-4 flex items-start gap-3 text-xs text-amber-800 dark:text-amber-300">
                <ShieldAlert className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
                <div className="flex-1 space-y-1">
                  <p className="font-bold">Membership Expired or Inactive</p>
                  <p className="opacity-90">
                    Your library membership has expired. In accordance with library policy, you must renew your membership before requesting book borrows.
                  </p>
                  <Link
                    href="/dashboard/member/profile"
                    onClick={onClose}
                    className="inline-block mt-2 font-bold text-amber-700 dark:text-amber-200 underline hover:no-underline"
                  >
                    Renew Membership Now →
                  </Link>
                </div>
              </div>
            )}

            {/* Main Book Banner (Cover + Title Summary) */}
            <div className="flex flex-col sm:flex-row gap-5 items-start">
              {/* Book Cover — click to open lightbox */}
              <div className="flex flex-col items-center sm:items-start shrink-0 mx-auto sm:mx-0">
                <div
                  className="w-28 sm:w-36 aspect-[3/4] rounded-2xl bg-muted overflow-hidden border border-border flex items-center justify-center relative shadow-md group/cover cursor-pointer"
                  onClick={() => allImages.length > 0 && openLightbox(activeIndex >= 0 ? activeIndex : 0)}
                  title="Click to view full gallery"
                >
                  {activeImage ? (
                    <img
                      src={activeImage}
                      alt={book.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover/cover:scale-105"
                    />
                  ) : (
                    <BookOpen className="h-10 w-10 text-muted-foreground/50" />
                  )}

                  {/* Zoom overlay hint */}
                  {allImages.length > 0 && (
                    <div className="absolute inset-0 bg-black/0 group-hover/cover:bg-black/40 transition-all duration-200 flex items-center justify-center rounded-2xl">
                      <ZoomIn className="h-6 w-6 text-white opacity-0 group-hover/cover:opacity-100 transition-opacity duration-200" />
                    </div>
                  )}

                  {allImages.length > 1 && (
                    <span className="absolute bottom-1.5 right-1.5 bg-black/75 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                      {allImages.indexOf(activeImage as string) + 1}/{allImages.length}
                    </span>
                  )}
                </div>

                {/* Mini thumbnails if multiple images */}
                {allImages.length > 1 && (
                  <div className="flex items-center gap-1.5 mt-2 max-w-[148px] overflow-x-auto pb-1 scrollbar-thin">
                    {allImages.map((img, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedImage(img)}
                        className={`h-9 w-7 shrink-0 rounded overflow-hidden border cursor-pointer transition-all ${
                          activeImage === img
                            ? "border-[#004F32] dark:border-emerald-400 ring-1 ring-primary"
                            : "border-border opacity-70 hover:opacity-100"
                        }`}
                        title={`View image ${idx + 1}`}
                      >
                        <img src={img} alt="" className="h-full w-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}

                {/* Gallery hint text */}
                {allImages.length > 1 && (
                  <button
                    onClick={() => openLightbox(0)}
                    className="mt-1.5 text-[10px] text-primary hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <ZoomIn className="h-3 w-3" />
                    View gallery ({allImages.length})
                  </button>
                )}
              </div>

              {/* Title & Key Highlights */}
              <div className="flex-1 space-y-2 text-center sm:text-left">
                <h2 className="text-lg sm:text-xl font-bold leading-snug text-foreground">
                  {book.title}
                </h2>
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                  By <span className="font-semibold text-foreground">{book.author}</span>
                </p>

                {/* Price & Fee Badges */}
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                  {isSellable && rawPrice > 0 && (
                    <div className="flex flex-col items-start gap-0.5">
                      <span className="inline-flex items-center gap-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 px-3 py-1 text-xs font-bold text-[#C78700] dark:text-amber-400">
                        <span>Purchase:</span>
                        <strong className="text-sm">৳{finalPrice}</strong>
                        {hasDiscount && (
                          <span className="text-[10px] line-through text-muted-foreground font-normal">৳{rawPrice}</span>
                        )}
                      </span>
                    </div>
                  )}
                  {isBorrowable && (
                    <span className="inline-flex items-center gap-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 px-3 py-1 text-xs font-bold text-[#004F32] dark:text-emerald-400">
                      <span>Reading Pace:</span>
                      <strong className="text-sm">{calculatedDays} Days ({bookPages}p)</strong>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Inline Borrow Reservation Flow */}
            {isBorrowStep && (
              <div className="rounded-2xl border-2 border-[#004F32]/40 bg-[#004F32]/5 p-4 sm:p-5 space-y-4 animate-in fade-in-50">
                <div className="flex items-center justify-between border-b border-border/80 pb-2.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                    <BookCheck className="h-4 w-4 text-[#004F32] dark:text-emerald-400" />
                    <span>Request Book Borrow</span>
                  </div>
                  <button
                    onClick={() => setIsBorrowStep(false)}
                    className="text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>

                {/* System Rules Details */}
                <div className="rounded-xl bg-card border border-border p-3.5 space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-semibold">
                    <Clock className="h-4 w-4 shrink-0 text-[#004F32] dark:text-emerald-400" />
                    <span>Automatic Due Date: 1 Day per 15 Pages ({calculatedDays} Days Total)</span>
                  </div>
                  <p className="text-muted-foreground text-[11px] leading-relaxed">
                    Upon submission, your request will be in <strong>PENDING</strong> status. When a shifter or administrator approves your request at the counter, the due date ({calculatedDays} days from approval) will be officially activated.
                  </p>
                  <div className="flex items-center gap-1.5 text-[11px] text-amber-700 dark:text-amber-300 pt-1">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    <span>Note: Each member can have a maximum of 3 active/pending books at a time.</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-card border border-border space-y-1">
                    <span className="text-muted-foreground block text-[11px]">Collection Point</span>
                    <span className="font-bold text-foreground">RU Islamic Library Counter</span>
                  </div>

                  <div className="p-3 rounded-xl bg-card border border-border space-y-1">
                    <span className="text-muted-foreground block text-[11px]">Location Cell</span>
                    <span className="font-mono font-bold text-primary">{book.locationCell || "Shelf C-2"}</span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsBorrowStep(false)}
                    className="rounded-xl border border-border px-3.5 py-2 text-xs font-semibold hover:bg-muted cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmBorrow}
                    disabled={isBorrowPending}
                    className="rounded-xl bg-[#004F32] hover:bg-emerald-900 text-white px-5 py-2 text-xs font-bold shadow-md transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {isBorrowPending ? (
                      <span>Submitting Request...</span>
                    ) : (
                      <>
                        <BookmarkPlus className="h-3.5 w-3.5" />
                        <span>Submit Borrow Request (Pending Approval)</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Scholarly Description */}
            {book.description && (
              <div className="space-y-1 text-xs">
                <h4 className="font-bold uppercase tracking-wider text-muted-foreground text-[10px]">
                  Overview & Abstract
                </h4>
                <p className="text-muted-foreground leading-relaxed text-xs">
                  {book.description}
                </p>
              </div>
            )}

            {/* Technical Metadata Grid — ISBN hidden from non-staff customers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
              {/* ISBN: only visible to staff */}
              {isStaff && book.isbn && book.isbn !== "N/A" && (
                <div className="flex items-center space-x-2 p-2.5 rounded-xl bg-muted/30 border border-border/60">
                  <span className="text-muted-foreground">ISBN:</span>
                  <span className="font-mono font-medium truncate text-foreground">{book.isbn}</span>
                </div>
              )}

              {book.publisher && (
                <div className="flex items-center space-x-2 p-2.5 rounded-xl bg-muted/30 border border-border/60">
                  <Building className="h-4 w-4 text-primary shrink-0" />
                  <span className="text-muted-foreground">Publisher:</span>
                  <span className="font-medium truncate text-foreground">{book.publisher}</span>
                </div>
              )}

              {(book.pages ?? 0) > 0 && (
                <div className="flex items-center space-x-2 p-2.5 rounded-xl bg-muted/30 border border-border/60">
                  <FileText className="h-4 w-4 text-primary shrink-0" />
                  <span className="text-muted-foreground">Pages:</span>
                  <span className="font-medium text-foreground">{book.pages} Pages ({calculatedDays} days allowed)</span>
                </div>
              )}

              {book.locationCell && (
                <div className="flex items-center space-x-2 p-2.5 rounded-xl bg-muted/30 border border-border/60">
                  <MapPin className="h-4 w-4 text-primary shrink-0" />
                  <span className="text-muted-foreground">Location Cell:</span>
                  <span className="font-mono font-bold text-foreground">{book.locationCell}</span>
                </div>
              )}

              <div className="flex items-center space-x-2 p-2.5 rounded-xl bg-muted/30 border border-border/60 col-span-1 sm:col-span-2">
                <Clock className="h-4 w-4 text-primary shrink-0" />
                <span className="text-muted-foreground">Borrow Stock Availability:</span>
                <span
                  className={`font-bold ${
                    (book.borrowStock ?? 0) > 0
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-destructive"
                  }`}
                >
                  {(book.borrowStock ?? 0)} copies in circulation
                </span>
              </div>
            </div>

            {/* Book Reviews and Ratings Section */}
            <div className="pt-2 border-t border-border">
              <BookReviewsSection book={book} compact />
            </div>
          </div>

          {/* Modal Footer Actions */}
          <div className="px-5 sm:px-6 py-4 border-t border-border bg-muted/20 flex flex-col sm:flex-row items-center justify-between gap-3">
            <Link
              href={`/books/${book.id}`}
              onClick={onClose}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline self-start sm:self-auto"
            >
              <span>Full Catalog Page</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
              {isBorrowable && !isBorrowStep && (
                <button
                  onClick={handleStartBorrow}
                  disabled={outOfStock}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 rounded-xl bg-[#004F32] px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-900 focus:ring-2 focus:ring-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
                >
                  <BookmarkPlus className="h-4 w-4 text-amber-300" />
                  <span>Request Borrow ({calculatedDays}d)</span>
                </button>
              )}

              {isSellable && (
                <button
                  onClick={handleAddToCart}
                  disabled={(book.sellStock ?? 0) <= 0}
                  className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-bold shadow-xs focus:ring-2 focus:ring-amber-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer ${
                    inCart
                      ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                      : "bg-[#C78700] hover:bg-amber-600 text-white"
                  }`}
                >
                  {inCart ? (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      <span>In Cart</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="h-4 w-4" />
                      <span>Add to Cart (৳{finalPrice}{hasDiscount ? ` — was ৳${rawPrice}` : ""})</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Full-screen Lightbox */}
      {lightboxOpen && allImages.length > 0 && (
        <ImageLightbox
          images={allImages}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </>
  );

  return createPortal(modalContent, document.body);
}

export default BookDetailModal;

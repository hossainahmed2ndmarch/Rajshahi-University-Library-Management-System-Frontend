"use client";

import React, { use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  ArrowLeft,
  Heart,
  ShoppingCart,
  BookCheck,
  Building,
  Hash,
  Layers,
  MapPin,
  ShieldCheck,
  Clock,
  Share2,
  BookmarkPlus,
  AlertCircle,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  X,
  ZoomIn,
} from "lucide-react";
import { useGetBookById } from "@/hooks/useBooks";
import { useCartStore } from "@/store/useCartStore";
import { useWishlistStore } from "@/store/useWishlistStore";
import { useCreateBorrow } from "@/hooks/useBorrows";
import { useGetMe } from "@/hooks/useAuth";
import { BookReviewsSection } from "@/components/books/BookReviewsSection";
import { getDiscountedPrice } from "@/lib/utils";
import { toast } from "sonner";

interface BookDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function BookDetailPage({ params }: BookDetailPageProps) {
  const { id } = use(params);
  const router = useRouter();

  const { data: book, isLoading, isError } = useGetBookById(id);
  const { data: user } = useGetMe();
  const { addItem: addToCart } = useCartStore();
  const { toggleWishlist, isInWishlist } = useWishlistStore();
  const { mutate: createBorrow, isPending: isBorrowPending } = useCreateBorrow();

  const [borrowModalOpen, setBorrowModalOpen] = React.useState(false);
  const [selectedImage, setSelectedImage] = React.useState<string | null>(null);
  const [lightboxOpen, setLightboxOpen] = React.useState(false);
  const [lightboxIndex, setLightboxIndex] = React.useState(0);

  const isStaff = user?.role && ["ADMIN", "SUPER_ADMIN", "SHIFTER"].includes(user.role);

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

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
        </div>
      </div>
    );
  }

  if (isError || !book) {
    return (
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="p-12 rounded-3xl border border-border bg-card shadow-sm space-y-4">
          <BookOpen className="h-12 w-12 text-muted-foreground mx-auto" />
          <h1 className="text-xl font-bold text-foreground">Book Not Found</h1>
          <p className="text-xs text-muted-foreground">
            The book record you requested does not exist in our library catalog directory.
          </p>
          <Link
            href="/books"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-xs font-bold text-primary-foreground hover:bg-primary/90"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Catalog
          </Link>
        </div>
      </div>
    );
  }

  const isSaved = isInWishlist(book.id);
  const rawPrice = book.sellPrice ?? book.price ?? 0;
  const discount = book.discount ?? 0;
  const finalPrice = getDiscountedPrice(rawPrice, discount);
  const hasDiscount = discount > 0 && rawPrice > 0;
  const availStock = book.availableQuantity ?? (book.borrowStock ?? 0) + (book.sellStock ?? 0);
  const totalStock = book.stockQuantity ?? (book.borrowStock ?? 0) + (book.sellStock ?? 0);
  const borrowCopies = book.borrowStock ?? 0;

  const isBorrowable =
    book.isBorrowable ??
    (book.type === "BORROW_ONLY" || book.type === "HYBRID");

  const isSellable =
    book.isSellable ??
    (book.type === "SELL_ONLY" || book.type === "HYBRID");

  // Dynamic reading pace: 15 pages per day
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

  const handleAddToCart = (type: "BORROW" | "SELL") => {
    addToCart({
      bookId: book.id,
      title: book.title,
      author: book.author,
      category: book.category,
      price: type === "SELL" ? finalPrice : (book.sellPrice ?? book.price ?? 0),
      borrowFee: book.borrowFee ?? 0,
      coverImage: book.coverImage,
      type,
    });
    toast.success(`"${book.title}" added to cart!`);
  };

  const handleBorrowRequest = () => {
    if (!user) {
      toast.info("Please register or log in to submit a member borrow request.");
      router.push(`/login?redirect=/books/${book.id}`);
      return;
    }

    if (isMembershipExpired) {
      toast.error("Your library membership has expired or is inactive. Please renew to borrow books.");
      return;
    }

    createBorrow(
      {
        bookId: book.id,
      },
      {
        onSuccess: () => {
          setBorrowModalOpen(false);
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-zinc-950 py-8 sm:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb & Navigation */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/books"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Books Directory
          </Link>

          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({ title: book.title, url: window.location.href });
              } else {
                navigator.clipboard.writeText(window.location.href);
                toast.success("Book link copied to clipboard!");
              }
            }}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground p-2 rounded-xl hover:bg-muted transition-colors cursor-pointer"
          >
            <Share2 className="h-4 w-4" />
            <span>Share</span>
          </button>
        </div>

        {/* Membership Warning Banner */}
        {user && isMembershipExpired && (
          <div className="mb-6 rounded-2xl bg-amber-500/10 border border-amber-500/30 p-4 flex items-start gap-3 text-xs text-amber-800 dark:text-amber-300">
            <ShieldAlert className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
            <div className="flex-1 space-y-1">
              <p className="font-bold">Membership Expired or Inactive</p>
              <p className="opacity-90">
                Your library membership has expired. Please renew your membership before requesting book borrows.
              </p>
              <Link
                href="/dashboard/member/profile"
                className="inline-block mt-1.5 font-bold text-amber-700 dark:text-amber-200 underline hover:no-underline"
              >
                Renew Membership in Member Dashboard →
              </Link>
            </div>
          </div>
        )}

        {/* Main Book Card Details */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 bg-card rounded-3xl border border-border p-6 sm:p-10 shadow-sm">
          {/* Left Column: Book Cover, Gallery & Quick Meta */}
          <div className="lg:col-span-5 flex flex-col items-center lg:items-start">
            <div
              className="w-full max-w-sm aspect-[3/4] rounded-2xl bg-muted overflow-hidden border border-border flex items-center justify-center relative shadow-md group/cover cursor-pointer"
              onClick={() => {
                if (allImages.length > 0) {
                  const idx = activeImage ? allImages.indexOf(activeImage) : 0;
                  setLightboxIndex(idx >= 0 ? idx : 0);
                  setLightboxOpen(true);
                }
              }}
              title="Click to view full image gallery"
            >
              {activeImage ? (
                <img
                  src={activeImage}
                  alt={book.title}
                  className="w-full h-full object-cover transition-all duration-300 group-hover/cover:scale-105"
                />
              ) : (
                <div className="text-center p-8">
                  <BookOpen className="h-20 w-20 text-muted-foreground/40 mx-auto mb-3" />
                  <p className="font-serif text-lg font-bold text-foreground">{book.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">RU Islamic Library Collection</p>
                </div>
              )}

              {/* Hover Zoom Overlay */}
              {allImages.length > 0 && (
                <div className="absolute inset-0 bg-black/0 group-hover/cover:bg-black/30 transition-all duration-200 flex items-center justify-center">
                  <div className="flex items-center gap-1.5 bg-black/75 text-white px-3 py-1.5 rounded-full text-xs font-semibold opacity-0 group-hover/cover:opacity-100 transition-opacity duration-200 shadow-lg">
                    <ZoomIn className="h-4 w-4" />
                    <span>View Gallery ({allImages.length})</span>
                  </div>
                </div>
              )}

              {/* Category Pill Overlay */}
              {book.categories && book.categories.length > 0 ? (
                <div className="absolute top-4 left-4 flex flex-wrap gap-1 max-w-[80%]">
                  {book.categories.map((cat, idx) => (
                    <span
                      key={idx}
                      className="bg-background/90 backdrop-blur-xs text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-lg border border-border shadow-xs"
                    >
                      {cat}
                    </span>
                  ))}
                </div>
              ) : book.category ? (
                <span className="absolute top-4 left-4 bg-background/90 backdrop-blur-xs text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-lg border border-border shadow-xs">
                  {book.category}
                </span>
              ) : null}

              {hasDiscount && (
                <span className="absolute top-4 right-4 bg-rose-500 text-white text-xs font-bold px-2.5 py-1 rounded-lg shadow-sm">
                  -{discount}% OFF
                </span>
              )}

              {allImages.length > 1 && (
                <span className="absolute bottom-3 right-3 bg-black/70 text-white text-[11px] font-semibold px-2 py-0.5 rounded-md backdrop-blur-xs">
                  {allImages.indexOf(activeImage as string) + 1} / {allImages.length}
                </span>
              )}
            </div>

            {/* Multiple Images Thumbnail Gallery */}
            {allImages.length > 1 && (
              <div className="w-full max-w-sm mt-3 flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-thin">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImage(img)}
                    className={`relative h-16 w-12 shrink-0 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                      activeImage === img
                        ? "border-[#004F32] dark:border-emerald-500 scale-105 shadow-md ring-2 ring-primary/30"
                        : "border-border hover:border-muted-foreground/60 opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img src={img} alt={`Preview ${idx + 1}`} className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Cell Location Info Badge */}
            <div className="w-full max-w-sm mt-6 p-4 rounded-2xl bg-muted/40 border border-border/80 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span>Library Location Cell:</span>
                </span>
                <span className="font-mono font-bold text-foreground bg-primary/10 text-primary px-2 py-0.5 rounded">
                  {book.locationCell || "Shelf C-2"}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Layers className="h-4 w-4 text-primary" />
                  <span>Borrow Circulation Copies:</span>
                </span>
                <span className={`font-bold ${borrowCopies > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-destructive"}`}>
                  {borrowCopies} copies in library
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Information & Actions */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                      isBorrowable
                        ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {book.type}
                  </span>
                  {book.isArchived && (
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800">
                      Archived
                    </span>
                  )}
                </div>

                <h1 className="text-2xl sm:text-4xl font-black text-foreground tracking-tight leading-tight">
                  {book.title}
                </h1>
                <div className="text-sm sm:text-base text-muted-foreground mt-1.5 flex items-center gap-1.5 flex-wrap">
                  <span>Authored / Compiled by</span>
                  {book.authors && book.authors.length > 0 ? (
                    book.authors.map((a, idx) => (
                      <span key={idx} className="inline-flex items-center gap-1">
                        <strong className="text-foreground">{a.name}</strong>
                        {a.role === "TRANSLATOR" && (
                          <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-500/20">
                            Translator
                          </span>
                        )}
                        {idx < book.authors!.length - 1 ? "," : ""}
                      </span>
                    ))
                  ) : (
                    <strong className="text-foreground">{book.author}</strong>
                  )}
                </div>
              </div>

              {/* Price & Reading Pace Banner */}
              <div className="flex flex-wrap items-center gap-6 p-4 rounded-2xl bg-muted/20 border border-border">
                {isSellable && (
                  <div>
                    <span className="text-[11px] text-muted-foreground block">Purchase Price</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-black text-[#C78700]">
                        ৳{finalPrice.toLocaleString()}
                      </span>
                      {hasDiscount && (
                        <span className="text-sm line-through text-muted-foreground font-semibold">
                          ৳{rawPrice.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                )}
                {isBorrowable && (
                  <div>
                    <span className="text-[11px] text-muted-foreground block">Reading Pace Allowance</span>
                    <span className="text-2xl font-black text-primary flex items-center gap-1.5">
                      <Clock className="h-5 w-5 text-[#004F32] dark:text-emerald-400" />
                      <span>{calculatedDays} Days</span>
                      <span className="text-xs font-normal text-muted-foreground">({bookPages} pages @ 15p/day)</span>
                    </span>
                  </div>
                )}
              </div>

              {/* Metadata Details Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs pt-2">
                {isStaff && (
                  <div className="p-3 rounded-xl bg-card border border-border">
                    <span className="text-muted-foreground block text-[11px]">ISBN Number (Staff)</span>
                    <span className="font-mono font-bold text-foreground mt-0.5 block truncate">
                      {book.isbn || "—"}
                    </span>
                  </div>
                )}
                <div className="p-3 rounded-xl bg-card border border-border">
                  <span className="text-muted-foreground block text-[11px]">Publisher</span>
                  <span className="font-bold text-foreground mt-0.5 block truncate">
                    {book.publisher || "Islamic Foundation"}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-card border border-border">
                  <span className="text-muted-foreground block text-[11px]">Volume Pages</span>
                  <span className="font-bold text-foreground mt-0.5 block">
                    {bookPages} Pages ({calculatedDays}d max)
                  </span>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2 pt-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Scholarly Abstract &amp; Content Overview
                </h3>
                <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed">
                  {book.description ||
                    "This authoritative treatise constitutes part of the Rajshahi University Islamic Library research holdings. Carefully indexed for student consultation, seminar preparations, and graduate theses."}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-6 border-t border-border space-y-3">
              <div className="flex flex-wrap gap-3">
                {isBorrowable && (
                  <button
                    onClick={() => {
                      if (!user) {
                        toast.info("Please log in to submit a borrow request.");
                        router.push(`/login?redirect=/books/${book.id}`);
                        return;
                      }
                      if (isMembershipExpired) {
                        toast.error("Your membership is expired or inactive. Please renew to borrow books.");
                        return;
                      }
                      setBorrowModalOpen(true);
                    }}
                    disabled={borrowCopies <= 0}
                    className="flex-1 min-w-[160px] inline-flex items-center justify-center gap-2 rounded-2xl bg-[#004F32] hover:bg-emerald-900 py-3.5 px-5 text-xs sm:text-sm font-bold text-white shadow-md transition-all disabled:opacity-50 cursor-pointer"
                  >
                    <BookCheck className="h-4 w-4 text-amber-300" />
                    <span>Request Borrow ({calculatedDays}d loan)</span>
                  </button>
                )}

                {isSellable && (
                  <button
                    onClick={() => handleAddToCart("SELL")}
                    disabled={(book.sellStock ?? 0) <= 0}
                    className="flex-1 min-w-[160px] inline-flex items-center justify-center gap-2 rounded-2xl bg-[#C78700] hover:bg-amber-600 py-3.5 px-5 text-xs sm:text-sm font-bold text-white shadow-md transition-all disabled:opacity-50 cursor-pointer"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    <span>Add to Cart (৳{finalPrice})</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    toggleWishlist(book);
                    toast.success(isSaved ? "Removed from Wishlist" : "Saved to Wishlist");
                  }}
                  className={`p-3.5 rounded-2xl border transition-colors cursor-pointer ${
                    isSaved
                      ? "border-rose-300 bg-rose-50 dark:bg-rose-950/40 text-rose-600"
                      : "border-border hover:bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                  title={isSaved ? "In Wishlist" : "Save to Wishlist"}
                >
                  <Heart className={`h-5 w-5 ${isSaved ? "fill-rose-600" : ""}`} />
                </button>
              </div>

              <div className="flex items-center gap-2 text-[11px] text-muted-foreground pt-1">
                <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
                <span>Verified physical edition at Rajshahi University Central Library</span>
              </div>
            </div>
          </div>
        </div>

        {/* Book Reviews and Ratings Section */}
        <div className="mt-10 bg-card rounded-3xl border border-border p-6 sm:p-10 shadow-sm">
          <BookReviewsSection book={book} />
        </div>
      </div>

      {/* Borrow Request Confirmation Modal */}
      {borrowModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in-50">
          <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                <BookmarkPlus className="h-5 w-5 text-[#004F32] dark:text-emerald-400" />
                <span>Submit Borrow Request</span>
              </h3>
              <button
                onClick={() => setBorrowModalOpen(false)}
                className="text-muted-foreground hover:text-foreground text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-muted-foreground">
                You are requesting to borrow{" "}
                <strong className="text-foreground">"{book.title}"</strong>.
              </p>

              <div className="p-3.5 rounded-xl bg-muted/40 border border-border/60 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Volume Pages:</span>
                  <span className="font-bold text-foreground">{bookPages} Pages</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Reading Loan Duration:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">{calculatedDays} Days (15 pages/day)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shelf Cell:</span>
                  <span className="font-mono font-bold text-primary">{book.locationCell || "Shelf C-2"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Initial Status:</span>
                  <span className="font-bold text-amber-600 dark:text-amber-400">PENDING (Awaiting Shifter Approval)</span>
                </div>
              </div>

              <div className="rounded-xl bg-amber-500/10 border border-amber-500/30 p-3 text-[11px] text-amber-800 dark:text-amber-300 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>
                  After submission, please present your student / voter ID at the library counter. The shifter will approve your request and issue the book. Members can hold at most 3 active books concurrently.
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-3">
              <button
                onClick={() => setBorrowModalOpen(false)}
                className="flex-1 rounded-xl border border-border py-2.5 text-xs font-semibold text-muted-foreground hover:bg-muted cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleBorrowRequest}
                disabled={isBorrowPending}
                className="flex-1 rounded-xl bg-[#004F32] hover:bg-emerald-900 py-2.5 text-xs font-bold text-white disabled:opacity-50 cursor-pointer shadow-md"
              >
                {isBorrowPending ? "Submitting..." : "Confirm Request"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full-Screen Image / E-book / PDF Preview Lightbox */}
      {lightboxOpen && allImages.length > 0 && (
        <div
          className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/95 backdrop-blur-sm animate-in fade-in-50"
          onClick={() => setLightboxOpen(false)}
        >
          {/* Close */}
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 z-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 p-2 text-white transition-colors cursor-pointer"
            title="Close viewer"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Counter */}
          <span className="absolute top-4 left-1/2 -translate-x-1/2 text-white/75 text-xs font-semibold px-3 py-1 bg-white/10 rounded-full border border-white/10">
            Page {lightboxIndex + 1} of {allImages.length}
          </span>

          {/* Main Displayed Image */}
          <div
            className="relative max-w-4xl max-h-[85vh] flex items-center justify-center px-12 sm:px-16"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={allImages[lightboxIndex]}
              alt={`${book.title} - Page ${lightboxIndex + 1}`}
              className="max-w-full max-h-[80vh] object-contain rounded-xl shadow-2xl"
            />
          </div>

          {/* Prev / Next Nav */}
          {allImages.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex((c) => (c - 1 + allImages.length) % allImages.length);
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 hover:bg-white/25 border border-white/20 p-3 text-white transition-colors cursor-pointer"
                title="Previous Image"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex((c) => (c + 1) % allImages.length);
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 hover:bg-white/25 border border-white/20 p-3 text-white transition-colors cursor-pointer"
                title="Next Image"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}

          {/* Thumbnail Carousel Strip */}
          {allImages.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 px-4 py-2 rounded-2xl bg-black/60 backdrop-blur-md border border-white/10 max-w-[90vw] overflow-x-auto">
              {allImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightboxIndex(idx);
                  }}
                  className={`h-12 w-9 rounded-lg overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                    lightboxIndex === idx
                      ? "border-white scale-110 shadow-md"
                      : "border-white/30 opacity-60 hover:opacity-100"
                  }`}
                  title={`Page ${idx + 1}`}
                >
                  <img src={img} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

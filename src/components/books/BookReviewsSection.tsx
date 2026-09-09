"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Star,
  MessageSquare,
  Lock,
  LogIn,
  Send,
  User,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Loader2,
  AlertCircle,
  ThumbsUp,
  Trash2,
} from "lucide-react";
import { IBook } from "@/types/book";
import { useGetMe } from "@/hooks/useAuth";
import { useGetBookReviews, useCreateBookReview, useDeleteReview } from "@/hooks/useReviews";
import { toast } from "sonner";

interface BookReviewsSectionProps {
  book: IBook;
  compact?: boolean;
}

export function BookReviewsSection({ book, compact = false }: BookReviewsSectionProps) {
  const pathname = usePathname();
  const { data: user } = useGetMe();
  const { data: reviewsData, isLoading } = useGetBookReviews(book.id);
  const { mutate: submitReview, isPending: isSubmitting } = useCreateBookReview();
  const { mutate: deleteReview, isPending: isDeleting } = useDeleteReview();


  // Form State
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState<string>("");
  const [guestName, setGuestName] = useState<string>("");
  const [guestEmail, setGuestEmail] = useState<string>("");
  const [isFormOpen, setIsFormOpen] = useState<boolean>(!compact);

  // Permission Logic:
  // - BORROW_ONLY: ONLY MEMBER, SHIFTER, ADMIN, and SUPER_ADMIN can review.
  // - SELL_ONLY & HYBRID: ANY user (guest or logged-in) can review.
  const isBorrowOnly = book.type === "BORROW_ONLY";
  const isAuthorizedRole =
    user && ["MEMBER", "SHIFTER", "ADMIN", "SUPER_ADMIN"].includes(user.role);
  const canReview = !isBorrowOnly || Boolean(isAuthorizedRole);

  const reviews = reviewsData?.reviews || [];
  const totalReviews = reviewsData?.totalReviews || reviews.length;
  const averageRating = reviewsData?.averageRating || 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (rating < 1 || rating > 5) {
      toast.error("Please select a rating between 1 and 5 stars.");
      return;
    }

    if (isBorrowOnly && !user) {
      toast.error("You must be logged in as a library member to review borrowable books.");
      return;
    }

    if (!user && !guestName.trim()) {
      toast.error("Please provide your name as a guest reviewer.");
      return;
    }

    submitReview(
      {
        bookId: Number(book.id) || book.id,
        rating,
        comment: comment.trim() || undefined,
        reviewerName: user ? user.name : guestName.trim(),
        reviewerEmail: user ? user.email : guestEmail.trim() || undefined,
      },
      {
        onSuccess: () => {
          setComment("");
          if (!user) {
            setGuestName("");
            setGuestEmail("");
          }
          if (compact) {
            setIsFormOpen(false);
          }
        },
      }
    );
  };

  return (
    <div className={`space-y-6 ${compact ? "text-xs" : "text-sm"}`}>
      {/* Header & Rating Breakdown Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h3 className="font-extrabold text-foreground flex items-center gap-2 text-base sm:text-lg">
            <MessageSquare className="h-5 w-5 text-[#C78700]" />
            <span>Scholarly Reviews &amp; Ratings</span>
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Verified opinions and academic evaluations from readers and library scholars.
          </p>
        </div>

        {/* Aggregate Score Badge */}
        <div className="flex items-center gap-3 bg-muted/30 border border-border/80 px-4 py-2 rounded-2xl shrink-0 self-start sm:self-auto">
          <div className="flex items-center gap-1 text-amber-500">
            <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
            <span className="text-lg font-black text-foreground">
              {averageRating > 0 ? averageRating.toFixed(1) : "—"}
            </span>
            <span className="text-xs text-muted-foreground font-normal">/ 5</span>
          </div>
          <span className="text-muted-foreground text-xs">|</span>
          <span className="text-xs font-semibold text-muted-foreground">
            {totalReviews} {totalReviews === 1 ? "Review" : "Reviews"}
          </span>
        </div>
      </div>

      {/* Review Submission Form / Lock Prompt */}
      <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span>Write a Review</span>
          </h4>

          {compact && (
            <button
              onClick={() => setIsFormOpen(!isFormOpen)}
              className="text-xs font-bold text-primary hover:underline"
            >
              {isFormOpen ? "Hide Form" : "Leave a Review"}
            </button>
          )}
        </div>

        {!canReview ? (
          /* Locked State for Borrow-Only books when not logged in */
          <div className="rounded-xl border border-amber-300/40 bg-amber-500/10 p-4 space-y-3">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 shrink-0">
                <Lock className="h-4 w-4" />
              </div>
              <div className="space-y-1">
                <h5 className="font-bold text-xs text-foreground">
                  Member &amp; Staff Exclusive Review
                </h5>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Borrowable volumes can only be reviewed and rated by registered <strong>Rajshahi University Islamic Library Members, Shifters, Admins, and Super Admins</strong>.
                </p>
              </div>
            </div>

            <div className="pt-1 flex items-center gap-2">
              <Link
                href={`/login?redirect=${encodeURIComponent(pathname)}`}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#004F32] hover:bg-emerald-900 px-4 py-2 text-xs font-bold text-white shadow-xs transition-colors"
              >
                <LogIn className="h-3.5 w-3.5 text-amber-300" />
                <span>Log In as Member to Review</span>
              </Link>
            </div>
          </div>
        ) : isFormOpen ? (
          /* Active Review Form (Any user for sellable/hybrid; Member/staff for borrowable) */
          <form onSubmit={handleSubmit} className="space-y-4 pt-1">
            {/* User identification indicator */}
            {user ? (
              <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/40 p-2.5 rounded-xl border border-border/60">
                <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>
                  Posting review as: <strong className="text-foreground">{user.name}</strong>{" "}
                  <span className="font-mono text-[10px] uppercase bg-primary/10 text-primary px-1.5 py-0.5 rounded font-bold">
                    {user.role}
                  </span>
                </span>
              </div>
            ) : (
              /* Guest Reviewer Input Fields */
              <div className="space-y-3">
                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-200 dark:border-amber-900/50 text-[11px] text-amber-900 dark:text-amber-200">
                  <span>Guest review enabled for this catalog volume. Enter your details below.</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-foreground block mb-1">
                      Your Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      placeholder="e.g. Abdullah Al Mamun"
                      required
                      className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs focus:ring-2 focus:ring-primary focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-foreground block mb-1">
                      Email Address (Optional)
                    </label>
                    <input
                      type="email"
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                      placeholder="e.g. abdullah@example.com"
                      className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs focus:ring-2 focus:ring-primary focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Interactive 5-Star Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground block">
                Your Rating (1 to 5 Stars)
              </label>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => {
                  const active = (hoverRating || rating) >= star;
                  return (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1 rounded-lg hover:bg-muted transition-colors cursor-pointer"
                      title={`${star} Star${star > 1 ? "s" : ""}`}
                    >
                      <Star
                        className={`h-6 w-6 transition-transform hover:scale-110 ${
                          active
                            ? "fill-amber-400 text-amber-400 drop-shadow-2xs"
                            : "text-muted-foreground/40"
                        }`}
                      />
                    </button>
                  );
                })}
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400 ml-2">
                  {rating === 5
                    ? "Excellent / Masterpiece"
                    : rating === 4
                    ? "Very Good / Recommended"
                    : rating === 3
                    ? "Good / Useful Reference"
                    : rating === 2
                    ? "Fair"
                    : "Needs Revision"}
                </span>
              </div>
            </div>

            {/* Comment Textarea */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground block">
                Your Review &amp; Academic Feedback
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={compact ? 2 : 3}
                placeholder="Share your thoughts on the edition, commentary depth, translation fidelity, or volume condition..."
                className="w-full rounded-xl border border-input bg-background p-3 text-xs focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 rounded-xl bg-[#004F32] hover:bg-emerald-900 text-white px-5 py-2.5 text-xs font-bold shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Submitting Review...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-3.5 w-3.5 text-amber-300" />
                    <span>Submit Review &amp; Rating</span>
                  </>
                )}
              </button>
            </div>
          </form>
        ) : null}
      </div>

      {/* Reviews Feed List */}
      <div className="space-y-3">
        <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
          Reader Community Reviews ({reviews.length})
        </h4>

        {isLoading ? (
          <div className="py-8 text-center text-muted-foreground text-xs space-y-2">
            <Loader2 className="h-6 w-6 mx-auto animate-spin text-primary" />
            <p>Loading community reviews...</p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground text-xs rounded-2xl border border-dashed border-border p-6 space-y-2">
            <MessageSquare className="h-8 w-8 mx-auto text-muted" />
            <p className="font-semibold text-foreground">No reviews yet for this volume.</p>
            <p className="text-[11px]">
              Be the first to share an evaluation or rating with fellow scholars!
            </p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
            {reviews.map((rev) => {
              const reviewerDisplayName =
                rev.user?.name || rev.reviewerName || "Verified Reader";
              const isStaffOrMember = rev.user?.role;

              return (
                <div
                  key={String(rev.id)}
                  className="rounded-2xl border border-border/80 bg-card p-4 shadow-2xs space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-primary text-xs">
                        {reviewerDisplayName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-xs text-foreground">
                            {reviewerDisplayName}
                          </span>
                          {isStaffOrMember ? (
                            <span className="font-mono text-[9px] uppercase bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold px-1.5 py-0.5 rounded">
                              {rev.user?.role}
                            </span>
                          ) : (
                            <span className="font-mono text-[9px] uppercase bg-muted text-muted-foreground font-semibold px-1.5 py-0.5 rounded">
                              Guest Buyer
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-muted-foreground block">
                          {rev.createdAt
                            ? new Date(rev.createdAt).toLocaleDateString("en-BD", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })
                            : "Recent"}
                        </span>
                      </div>
                    </div>

                    {/* Star Rating and Delete action */}
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-0.5 text-amber-400">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`h-3.5 w-3.5 ${
                              s <= rev.rating
                                ? "fill-amber-400 text-amber-400"
                                : "text-muted-foreground/30"
                            }`}
                          />
                        ))}
                      </div>

                      {user &&
                        (["SUPER_ADMIN", "ADMIN", "SHIFTER"].includes(user.role) ||
                          String(user.id) === String(rev.userId)) && (
                          <button
                            onClick={() =>
                              deleteReview({
                                reviewId: rev.id,
                                bookId: Number(book.id) || undefined,
                              })
                            }

                            disabled={isDeleting}
                            title="Delete this review"
                            className="p-1 rounded-lg text-muted-foreground hover:text-destructive hover:bg-red-500/10 transition-colors cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                    </div>
                  </div>

                  {rev.comment && (
                    <p className="text-xs text-foreground/90 leading-relaxed pt-1">
                      {rev.comment}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}

export default BookReviewsSection;

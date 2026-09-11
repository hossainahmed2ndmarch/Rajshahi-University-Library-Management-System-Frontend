"use client";

import React, { useState, useMemo } from "react";
import { Star, Quote, Sparkles, MessageSquarePlus, Send, User } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import Autoplay from "embla-carousel-autoplay";
import { useGetMe } from "@/hooks/useAuth";
import { useGetServiceReviews, useCreateServiceReview } from "@/hooks/useReviews";
import { IServiceReview } from "@/types/review";
import { SectionHeader } from "@/components/shared/SectionHeader";

// Hardcoded fallback testimonials shown when no real reviews exist
const FALLBACK_TESTIMONIALS = [
  {
    name: "Dr. A. K. M. Shamsuddin",
    role: "Professor of Islamic Studies, Rajshahi University",
    comment:
      "The digital catalog system has transformed our departmental research workflow. Accessing verified Tafsir manuscripts and Hadith commentaries has never been this seamless.",
    rating: 5,
    avatar: "S",
  },
  {
    name: "Tahmidur Rahman",
    role: "Masters Research Scholar, Faculty of Law",
    comment:
      "Borrowing classical Fiqh treatises through my student card and picking them up directly at Shahid Ziaur Rahman Hall station saves me hours every week.",
    rating: 5,
    avatar: "T",
  },
  {
    name: "Fatima Tuz Zahra",
    role: "Undergraduate Student, Arabic Department",
    comment:
      "The express checkout is incredibly convenient for buying authentic study texts at reasonable prices. The book condition and authenticity are always top tier.",
    rating: 5,
    avatar: "F",
  },
  {
    name: "Maulana Hasanul Banna",
    role: "Visiting Research Fellow, Islamic Foundation",
    comment:
      "An outstanding repository of authentic literature in North Bengal. The cataloguing precision and shifter responsiveness are exemplary.",
    rating: 5,
    avatar: "H",
  },
];

// --- Star Rating Input Component ---
function StarRatingInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (val: number) => void;
}) {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className="p-0.5 transition-transform hover:scale-110 focus:outline-none"
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(star)}
        >
          <Star
            className={`h-7 w-7 transition-colors ${
              star <= (hovered || value)
                ? "fill-amber-400 text-amber-400"
                : "fill-transparent text-muted-foreground/40"
            }`}
          />
        </button>
      ))}
      {value > 0 && (
        <span className="ml-2 text-xs text-muted-foreground font-medium">
          {value}/5
        </span>
      )}
    </div>
  );
}

// --- Review Card Component ---
function ReviewCard({ review }: { review: IServiceReview }) {
  // Determine display identity
  const isAnon = review.isAnonymous || (!review.user && !review.reviewerName);
  const displayName = isAnon
    ? "Anonymous"
    : review.user?.name || review.reviewerName || "Anonymous";
  const avatarUrl = isAnon ? null : review.user?.avatarUrl;
  const avatarInitial = isAnon ? "?" : displayName.charAt(0).toUpperCase();
  const userRole = isAnon ? null : review.user?.role;

  const roleLabel = userRole
    ? userRole.charAt(0) + userRole.slice(1).toLowerCase().replace("_", " ")
    : null;

  const timeAgo = review.createdAt ? formatTimeAgo(review.createdAt) : "";

  return (
    <div className="h-full bg-card rounded-3xl border border-border p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 hover:border-[#004F32] dark:hover:border-emerald-600/40">
      <div>
        {/* Star Rating */}
        <div className="flex items-center gap-1 text-amber-400 mb-4">
          {[...Array(review.rating)].map((_, i) => (
            <Star key={i} className="h-4 w-4 fill-amber-400" />
          ))}
          {[...Array(5 - review.rating)].map((_, i) => (
            <Star
              key={`empty-${i}`}
              className="h-4 w-4 fill-transparent text-muted-foreground/30"
            />
          ))}
        </div>
        {/* Comment */}
        <Quote className="h-6 w-6 text-primary mb-2" />
        <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed italic">
          &ldquo;{review.comment || "Great library service!"}&rdquo;
        </p>
      </div>

      {/* Reviewer Identity */}
      <div className="mt-6 pt-4 border-t border-border flex items-center gap-3">
        {isAnon ? (
          /* Anonymous - show generic icon, no name details */
          <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
            <User className="h-5 w-5 text-muted-foreground" />
          </div>
        ) : (
          /* Identified user - show avatar */
          <Avatar size="lg">
            {avatarUrl ? (
              <AvatarImage src={avatarUrl} alt={displayName} />
            ) : null}
            <AvatarFallback>{avatarInitial}</AvatarFallback>
          </Avatar>
        )}
        <div>
          <h4 className="font-bold text-xs sm:text-sm text-foreground">
            {isAnon ? "Anonymous Reviewer" : displayName}
          </h4>
          {!isAnon && roleLabel && (
            <p className="text-[11px] text-muted-foreground">
              {roleLabel} · {timeAgo}
            </p>
          )}
          {isAnon && timeAgo && (
            <p className="text-[11px] text-muted-foreground">{timeAgo}</p>
          )}
        </div>
      </div>
    </div>
  );
}

// --- Fallback Card Component (for hardcoded testimonials) ---
function FallbackCard({
  testimonial,
}: {
  testimonial: (typeof FALLBACK_TESTIMONIALS)[number];
}) {
  return (
    <div className="h-full bg-card rounded-3xl border border-border p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 hover:border-[#004F32] dark:hover:border-emerald-600/40">
      <div>
        <div className="flex items-center gap-1 text-amber-400 mb-4">
          {[...Array(testimonial.rating)].map((_, i) => (
            <Star key={i} className="h-4 w-4 fill-amber-400" />
          ))}
        </div>
        <Quote className="h-6 w-6 text-primary mb-2" />
        <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed italic">
          &ldquo;{testimonial.comment}&rdquo;
        </p>
      </div>
      <div className="mt-6 pt-4 border-t border-border flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-black text-sm">
          {testimonial.avatar}
        </div>
        <div>
          <h4 className="font-bold text-xs sm:text-sm text-foreground">
            {testimonial.name}
          </h4>
          <p className="text-[11px] text-muted-foreground">
            {testimonial.role}
          </p>
        </div>
      </div>
    </div>
  );
}

// --- Review Form Dialog Component ---
function ReviewFormDialog() {
  const { data: user } = useGetMe();
  const createReview = useCreateServiceReview();
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [reviewerName, setReviewerName] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);

  const isLoggedIn = Boolean(user);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return;

    createReview.mutate(
      {
        rating,
        comment: comment.trim() || undefined,
        isAnonymous: isLoggedIn ? isAnonymous : true,
        reviewerName: !isLoggedIn && reviewerName.trim() ? reviewerName.trim() : undefined,
      },
      {
        onSuccess: () => {
          setOpen(false);
          setRating(0);
          setComment("");
          setReviewerName("");
          setIsAnonymous(false);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            variant="default"
            size="lg"
            className="gap-2 rounded-full px-5 shadow-md hover:shadow-lg transition-shadow dark:bg-primary/60"
          />
        }
      >
        <MessageSquarePlus className="h-4 w-4" />
        Share Your Experience
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Rate Our Library Service</DialogTitle>
          <DialogDescription>
            {isLoggedIn
              ? `Posting as ${user?.name}. Your feedback helps us improve!`
              : "Share your opinion about our library. No login required!"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 pt-2">
          {/* Star Rating */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Your Rating <span className="text-destructive">*</span>
            </label>
            <StarRatingInput value={rating} onChange={setRating} />
            {rating === 0 && (
              <p className="text-[11px] text-muted-foreground">
                Tap a star to rate
              </p>
            )}
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <label
              htmlFor="review-comment"
              className="text-sm font-medium text-foreground"
            >
              Your Review
            </label>
            <textarea
              id="review-comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell us about your experience with our library..."
              className="w-full rounded-xl border-2 border-emerald-600/30 dark:border-emerald-500/30 bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-emerald-600 dark:focus:border-emerald-500 dark:bg-background resize-none"
              rows={4}
              maxLength={500}
            />
            <p className="text-[11px] text-muted-foreground text-right">
              {comment.length}/500
            </p>
          </div>

          {/* Guest Name (only if not logged in) */}
          {!isLoggedIn && (
            <div className="space-y-2">
              <label
                htmlFor="reviewer-name"
                className="text-sm font-medium text-foreground"
              >
                Your Name{" "}
                <span className="text-muted-foreground font-normal">
                  (optional — leave blank to post anonymously)
                </span>
              </label>
              <input
                id="reviewer-name"
                type="text"
                value={reviewerName}
                onChange={(e) => setReviewerName(e.target.value)}
                placeholder="e.g. Abdullah Rahman"
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring"
                maxLength={100}
              />
            </div>
          )}

          {/* Anonymous toggle (only if logged in) */}
          {isLoggedIn && (
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="h-4 w-4 rounded border-border text-primary focus:ring-ring/50 accent-primary"
              />
              <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                Post anonymously (hide my name & avatar)
              </span>
            </label>
          )}

          <DialogFooter>
            <Button
              type="submit"
              disabled={rating === 0 || createReview.isPending}
              className="gap-2 w-full sm:w-auto"
            >
              {createReview.isPending ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Submit Review
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// --- Time Ago Utility ---
function formatTimeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

// --- Main Testimonials Section ---
export function Testimonials() {
  const autoplayPlugin = React.useMemo(
    () => Autoplay({ delay: 5000, stopOnInteraction: false }),
    []
  );

  const { data: serviceReviewsData, isLoading } = useGetServiceReviews();

  // Merge real reviews with fallback testimonials
  const realReviews = useMemo(
    () => serviceReviewsData?.reviews || [],
    [serviceReviewsData]
  );
  const hasRealReviews = realReviews.length > 0;

  const stats = useMemo(() => {
    if (!serviceReviewsData || serviceReviewsData.totalReviews === 0) return null;
    return {
      total: serviceReviewsData.totalReviews,
      average: serviceReviewsData.averageRating,
    };
  }, [serviceReviewsData]);

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-5">
      {/* Header */}
      <SectionHeader
        icon={Sparkles}
        subtitleKey="home.testimonialsSubtitle"
        titleKey="home.testimonialsTitle"
        descriptionKey="home.testimonialsDesc"
        align="center"
        className="mb-6 max-w-xl"
      >
        {/* Aggregate Stats */}
        {stats && (
          <div className="mt-3 inline-flex items-center gap-2 bg-muted/60 rounded-full px-4 py-1.5">
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`h-3.5 w-3.5 ${
                    s <= Math.round(stats.average)
                      ? "fill-amber-400 text-amber-400"
                      : "fill-transparent text-muted-foreground/30"
                  }`}
                />
              ))}
            </div>
            <span className="text-xs font-bold text-foreground">
              {stats.average}
            </span>
            <span className="text-[11px] text-muted-foreground">
              · {stats.total} review{stats.total !== 1 ? "s" : ""}
            </span>
          </div>
        )}
      </SectionHeader>

      {/* Share Button + Carousel Controls */}
      <Carousel
        plugins={[autoplayPlugin]}
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full"
      >
        <div className="flex items-center justify-between gap-3 mb-4">
          <ReviewFormDialog />
          <div className="flex gap-2">
            <CarouselPrevious className="static translate-y-0 h-9 w-9 rounded-xl bg-card border border-border transition-all duration-300 hover:border-[#004F32]/30 dark:hover:border-emerald-600/40" />
            <CarouselNext className="static translate-y-0 h-9 w-9 rounded-xl bg-card border border-border transition-all duration-300 hover:border-[#004F32]/30 dark:hover:border-emerald-600/40" />
          </div>
        </div>

        <CarouselContent className="-ml-4">
          {/* Real reviews from DB (most recent first) */}
          {hasRealReviews &&
            realReviews.map((review) => (
              <CarouselItem
                key={`service-${review.id}`}
                className="pl-4 basis-full md:basis-1/2 lg:basis-1/3"
              >
                <ReviewCard review={review} />
              </CarouselItem>
            ))}

          {/* Fallback testimonials (always shown for variety, or as sole content) */}
          {!isLoading &&
            FALLBACK_TESTIMONIALS.map((t, idx) => (
              <CarouselItem
                key={`fallback-${idx}`}
                className="pl-4 basis-full md:basis-1/2 lg:basis-1/3"
              >
                <FallbackCard testimonial={t} />
              </CarouselItem>
            ))}

          {/* Loading skeleton */}
          {isLoading &&
            [1, 2, 3].map((i) => (
              <CarouselItem
                key={`skeleton-${i}`}
                className="pl-4 basis-full md:basis-1/2 lg:basis-1/3"
              >
                <div className="h-64 bg-card rounded-3xl border border-border p-6 sm:p-8 animate-pulse">
                  <div className="flex gap-1 mb-4">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <div
                        key={s}
                        className="h-4 w-4 rounded bg-muted"
                      />
                    ))}
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 bg-muted rounded w-full" />
                    <div className="h-3 bg-muted rounded w-4/5" />
                    <div className="h-3 bg-muted rounded w-3/5" />
                  </div>
                  <div className="mt-auto pt-4 border-t border-border flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-muted" />
                    <div className="space-y-1.5">
                      <div className="h-3 bg-muted rounded w-24" />
                      <div className="h-2.5 bg-muted rounded w-16" />
                    </div>
                  </div>
                </div>
              </CarouselItem>
            ))}
        </CarouselContent>
      </Carousel>
    </section>
  );
}

export default Testimonials;

"use client";

import React, { useState } from "react";
import {
  MessageSquare,
  Quote,
  Sparkles,
  Star,
  User,
  X,
} from "lucide-react";
import { useGetServiceReviews, useCreateServiceReview } from "@/hooks/useReviews";
import { useGetMe } from "@/hooks/useAuth";

export function RudcReviewsSection() {
  const { data, isLoading } = useGetServiceReviews("RUDC");
  const { data: currentUser } = useGetMe();
  const { mutateAsync: createReview, isPending } = useCreateServiceReview();

  const reviews = data?.reviews || [];
  const averageRating = data?.averageRating || 5;
  const totalReviews = data?.totalReviews || reviews.length;

  const [modalOpen, setModalOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [reviewerName, setReviewerName] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    await createReview({
      rating,
      comment,
      reviewerName: isAnonymous ? undefined : reviewerName || currentUser?.name || undefined,
      isAnonymous,
    });

    setComment("");
    setModalOpen(false);
  };

  return (
    <section className="py-16 lg:py-24 bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-500/10 text-[#C78700] dark:text-amber-400 mb-2">
              <Quote className="h-3.5 w-3.5" />
              <span>সদস্য ও শুভানুধ্যায়ীদের মন্তব্য</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-foreground">
              Reviews & Reflections (আমাদের প্রতি প্রতিক্রিয়া)
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-2xl">
              RUDC-এর বিভিন্ন আয়োজন ও ক্যাম্পাস দাওয়াহ কার্যক্রম নিয়ে শিক্ষার্থী ও মেম্বারদের অভিজ্ঞতা।
            </p>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            {totalReviews > 0 && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-border bg-card">
                <div className="flex text-amber-400">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`h-4 w-4 ${
                        s <= Math.round(averageRating) ? "fill-amber-400" : "text-muted"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs font-bold text-foreground">
                  {averageRating.toFixed(1)} ({totalReviews})
                </span>
              </div>
            )}

            <button
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#004F32] hover:bg-[#003e27] text-white text-xs font-bold shadow-xs transition-colors"
            >
              <MessageSquare className="h-3.5 w-3.5 text-amber-300" />
              <span>মতামত দিন</span>
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-44 rounded-3xl bg-muted animate-pulse border border-border/60"
              />
            ))}
          </div>
        ) : reviews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reviews.map((rev) => (
              <div
                key={rev.id}
                className="rounded-3xl border border-border/80 bg-card p-6 shadow-xs flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex text-amber-400">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`h-3.5 w-3.5 ${
                            s <= rev.rating ? "fill-amber-400" : "text-muted"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-[10px] text-muted-foreground font-medium">
                      {rev.createdAt
                        ? new Date(rev.createdAt).toLocaleDateString("bn-BD", {
                            month: "short",
                            year: "numeric",
                          })
                        : "সম্প্রতি"}
                    </span>
                  </div>

                  <p className="text-xs text-foreground/90 leading-relaxed italic">
                    &ldquo;{rev.comment}&rdquo;
                  </p>
                </div>

                <div className="flex items-center gap-2.5 pt-3 border-t border-border/50">
                  <div className="h-8 w-8 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-[#004F32] dark:text-emerald-400 font-black text-xs">
                    {rev.isAnonymous ? "গোপন" : rev.reviewerName?.charAt(0) || rev.user?.name?.charAt(0) || "U"}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-foreground">
                      {rev.isAnonymous ? "গোপন শুভানুধ্যায়ী" : rev.reviewerName || rev.user?.name || "RUDC Member"}
                    </h4>
                    <span className="text-[10px] text-muted-foreground">
                      {rev.user?.department ? `${rev.user.department}, RU` : "Rajshahi University"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-border p-12 text-center bg-card">
            <Quote className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <h4 className="text-sm font-bold text-foreground">এখনো কোনো মতামত যোগ করা হয়নি</h4>
            <p className="text-xs text-muted-foreground mt-1">
              RUDC কার্যক্রম সম্পর্কে আপনার মূল্যবান অভিজ্ঞতা শেয়ার করুন।
            </p>
            <button
              onClick={() => setModalOpen(true)}
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-600/30 text-[#004F32] dark:text-emerald-300 text-xs font-bold hover:bg-emerald-100 transition-colors"
            >
              <MessageSquare className="h-3.5 w-3.5 text-amber-500" />
              <span>প্রথম মতামত প্রদান করুন</span>
            </button>
          </div>
        )}

        {/* Feedback Modal */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in-50">
            <div className="bg-card border border-border rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-[#004F32] dark:text-emerald-400" />
                  <h3 className="text-sm font-bold text-foreground">
                    RUDC সম্পর্কিত মতামত / রিভিউ
                  </h3>
                </div>
                <button
                  onClick={() => setModalOpen(false)}
                  className="p-1 text-muted-foreground hover:text-foreground rounded-lg"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                {/* Rating selection */}
                <div className="space-y-1">
                  <label className="font-semibold text-foreground">রেটিং নির্বাচন করুন</label>
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setRating(star)}
                        className="p-1 focus:outline-hidden"
                      >
                        <Star
                          className={`h-6 w-6 ${
                            star <= rating
                              ? "fill-amber-400 text-amber-400"
                              : "text-muted hover:text-amber-300"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Name */}
                {!isAnonymous && (
                  <div className="space-y-1">
                    <label className="font-semibold text-foreground">আপনার নাম (ঐচ্ছিক)</label>
                    <input
                      type="text"
                      value={reviewerName}
                      onChange={(e) => setReviewerName(e.target.value)}
                      placeholder={currentUser?.name || "যেমন: আব্দুল্লাহ"}
                      className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground"
                    />
                  </div>
                )}

                {/* Anonymous Checkbox */}
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="accent-emerald-600 rounded-md"
                  />
                  <span className="text-muted-foreground">গোপন (বেনামে) মন্তব্য হিসেবে প্রকাশ করুন</span>
                </label>

                {/* Comment */}
                <div className="space-y-1">
                  <label className="font-semibold text-foreground">আপনার মতামত / পরামর্শ *</label>
                  <textarea
                    rows={4}
                    required
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="RUDC-এর কার্যক্রম আপনার দ্বীনি জীবনে কেমন প্রভাব ফেলেছে..."
                    className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-border bg-card text-foreground"
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    disabled={isPending}
                    className="px-5 py-2 rounded-xl bg-[#004F32] hover:bg-[#003e27] text-white font-bold disabled:opacity-50"
                  >
                    {isPending ? "জমা হচ্ছে..." : "জমা দিন"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

"use client";

import React, { useState, useMemo } from "react";
import {
  MessageSquare,
  Star,
  Trash2,
  Search,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  User,
  ShieldCheck,
  Building,
  Sparkles,
  Filter,
  RefreshCw,
  Mail,
  ShieldAlert,
} from "lucide-react";
import { useGetAllReviews, useDeleteReview } from "@/hooks/useReviews";
import { IBookReview, IServiceReview } from "@/types/review";
import { RUTable } from "@/components/ui/RUTable";
import { ColumnDef } from "@tanstack/react-table";

export default function ReviewsManagementPage() {
  const { data, isLoading, refetch, isRefetching } = useGetAllReviews();
  const { mutate: deleteReview, isPending: isDeleting } = useDeleteReview();

  const [activeTab, setActiveTab] = useState<"ALL" | "BOOK" | "SERVICE">("ALL");
  const [ratingFilter, setRatingFilter] = useState<number | "ALL">("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteReviewItem, setDeleteReviewItem] = useState<{ id: number | string; type: string; title: string } | null>(null);

  const bookReviews: IBookReview[] = useMemo(() => data?.bookReviews || [], [data]);
  const serviceReviews: IServiceReview[] = useMemo(() => data?.serviceReviews || [], [data]);

  // Combined review list with unified type
  interface ICombinedReview {
    id: number | string;
    type: "BOOK" | "SERVICE";
    bookTitle?: string;
    bookAuthor?: string;
    reviewerName: string;
    reviewerEmail?: string | null;
    reviewerRole?: string;
    rating: number;
    comment?: string | null;
    createdAt?: string;
  }


  const combinedList: ICombinedReview[] = useMemo(() => {
    const list: ICombinedReview[] = [];

    bookReviews.forEach((r) => {
      list.push({
        id: r.id,
        type: "BOOK",
        bookTitle: r.book?.title || `Book #${r.bookId}`,
        bookAuthor: r.book?.author || "Author",
        reviewerName: r.user?.name || r.reviewerName || "Reader",
        reviewerEmail: r.user?.email || r.reviewerEmail,
        reviewerRole: r.user?.role,
        rating: r.rating,
        comment: r.comment,
        createdAt: r.createdAt,
      });
    });

    serviceReviews.forEach((s) => {
      list.push({
        id: s.id,
        type: "SERVICE",
        bookTitle: "Library Services & Staff Feedback",
        reviewerName: s.user?.name || s.reviewerName || "Visitor",
        reviewerEmail: s.user?.email || s.reviewerEmail,
        reviewerRole: s.user?.role,
        rating: s.rating,
        comment: s.comment,
        createdAt: s.createdAt,
      });
    });

    return list.sort((a, b) => {
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return timeB - timeA;
    });
  }, [bookReviews, serviceReviews]);

  const filteredReviews = useMemo(() => {
    return combinedList.filter((r) => {
      if (activeTab !== "ALL" && r.type !== activeTab) return false;
      if (ratingFilter !== "ALL" && r.rating !== ratingFilter) return false;

      const term = searchTerm.toLowerCase().trim();
      if (!term) return true;

      const matchesTitle = (r.bookTitle || "").toLowerCase().includes(term);
      const matchesName = (r.reviewerName || "").toLowerCase().includes(term);
      const matchesEmail = (r.reviewerEmail || "").toLowerCase().includes(term);
      const matchesComment = (r.comment || "").toLowerCase().includes(term);

      return matchesTitle || matchesName || matchesEmail || matchesComment;
    });
  }, [combinedList, activeTab, ratingFilter, searchTerm]);

  const handleDeleteConfirm = () => {
    if (deleteReviewItem) {
      deleteReview(
        { reviewId: deleteReviewItem.id },
        {
          onSuccess: () => {
            setDeleteReviewItem(null);
            refetch();
          },
        }
      );
    }
  };

  const columns: ColumnDef<ICombinedReview>[] = [
    {
      accessorKey: "type",
      header: "Category & Target",
      cell: ({ row }) => {
        const r = row.original;
        return (
          <div className="space-y-1">
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                r.type === "BOOK"
                  ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300"
                  : "bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300"
              }`}
            >
              {r.type === "BOOK" ? <BookOpen className="h-3 w-3" /> : <Building className="h-3 w-3" />}
              <span>{r.type === "BOOK" ? "Book Review" : "Service Feedback"}</span>
            </span>
            <p className="font-bold text-xs text-foreground line-clamp-1">{r.bookTitle}</p>
            {r.bookAuthor && (
              <p className="text-[11px] text-muted-foreground">by {r.bookAuthor}</p>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "reviewerName",
      header: "Reviewer & Contact",
      cell: ({ row }) => {
        const r = row.original;
        return (
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-xs text-foreground">{r.reviewerName}</span>
              {r.reviewerRole ? (
                <span className="font-mono text-[9px] uppercase bg-primary/10 text-primary px-1.5 py-0.2 rounded font-bold">
                  {r.reviewerRole}
                </span>
              ) : (
                <span className="font-mono text-[9px] uppercase bg-muted text-muted-foreground px-1.5 py-0.2 rounded">
                  Guest
                </span>
              )}
            </div>
            {r.reviewerEmail && (
              <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                <Mail className="h-3 w-3" /> {r.reviewerEmail}
              </p>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "rating",
      header: "Rating Score",
      cell: ({ row }) => {
        const r = row.original;
        return (
          <div className="flex items-center gap-1">
            <div className="flex items-center text-amber-400">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`h-3.5 w-3.5 ${
                    s <= r.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"
                  }`}
                />
              ))}
            </div>
            <span className="font-bold text-xs text-foreground ml-1">{r.rating}/5</span>
          </div>
        );
      },
    },
    {
      accessorKey: "comment",
      header: "Review Comment",
      cell: ({ row }) => {
        const r = row.original;
        return (
          <div className="max-w-md">
            <p className="text-xs text-foreground leading-relaxed line-clamp-3 bg-muted/20 p-2 rounded-xl border border-border/60">
              {r.comment || <span className="italic text-muted-foreground">No written comment provided.</span>}
            </p>
            <span className="text-[10px] text-muted-foreground block mt-1 font-mono">
              {r.createdAt ? new Date(r.createdAt).toLocaleDateString("en-BD", { year: "numeric", month: "short", day: "numeric" }) : "—"}
            </span>
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const r = row.original;
        return (
          <div className="flex items-center justify-end">
            <button
              onClick={() => setDeleteReviewItem({ id: r.id, type: r.type, title: r.bookTitle || "Review" })}
              title="Delete Review (Super Admin / Admin Full Power)"
              className="inline-flex items-center gap-1.5 p-2 rounded-xl border border-input bg-background hover:bg-red-500/10 text-destructive text-xs font-bold transition-colors cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Delete Review</span>
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-[#003824] via-[#004F32] to-[#C78700] p-6 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-400/20 px-3 py-0.5 text-xs font-mono font-bold text-amber-300 border border-amber-300/30 mb-2">
            <Sparkles className="h-3.5 w-3.5 text-amber-300" />
            <span>EXECUTIVE AUDIT &amp; MODERATION DESK</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-amber-300" />
            <span>Review &amp; Feedback Moderation</span>
          </h1>
          <p className="mt-1 text-xs text-emerald-100/90 max-w-xl">
            Full administrative oversight to review, audit, and delete book ratings and service feedback across the entire platform.
          </p>
        </div>

        <button
          onClick={() => refetch()}
          disabled={isRefetching}
          className="inline-flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 px-4 py-2.5 text-xs font-semibold text-white shadow-xs transition-all self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className={`h-4 w-4 text-amber-300 ${isRefetching ? "animate-spin" : ""}`} />
          <span>Refresh Reviews</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-border bg-card p-4 space-y-1 shadow-2xs">
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Total Book Reviews</span>
          <p className="text-2xl font-extrabold text-foreground">{bookReviews.length}</p>
          <p className="text-[11px] text-muted-foreground">Scholarly reader volume assessments</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 space-y-1 shadow-2xs">
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Service Reviews</span>
          <p className="text-2xl font-extrabold text-purple-600 dark:text-purple-400">{serviceReviews.length}</p>
          <p className="text-[11px] text-muted-foreground">Library desk &amp; staff feedback</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 space-y-1 shadow-2xs">
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Total Feedback Items</span>
          <p className="text-2xl font-extrabold text-amber-600 dark:text-amber-400">{combinedList.length}</p>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">Moderation &amp; Deletion Power Active</p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by book title, reviewer name, email, or comment..."
            className="w-full rounded-xl border border-input bg-card pl-9 pr-3 py-2 text-xs focus:ring-2 focus:ring-primary focus:outline-none"
          />
        </div>

        <div className="flex gap-2 flex-wrap items-center">
          {/* Tab Filter */}
          <div className="flex gap-1 bg-muted/60 p-1 rounded-xl border border-border">
            {(["ALL", "BOOK", "SERVICE"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  activeTab === t
                    ? "bg-card text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t === "ALL" ? "All Reviews" : t === "BOOK" ? "Books Only" : "Service Only"}
              </button>
            ))}
          </div>

          {/* Rating Filter */}
          <select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value === "ALL" ? "ALL" : Number(e.target.value))}
            className="rounded-xl border border-input bg-card px-3 py-2 text-xs font-semibold focus:ring-2 focus:ring-primary focus:outline-none"
          >
            <option value="ALL">All Star Ratings</option>
            <option value="5">⭐⭐⭐⭐⭐ (5 Stars)</option>
            <option value="4">⭐⭐⭐⭐ (4 Stars)</option>
            <option value="3">⭐⭐⭐ (3 Stars)</option>
            <option value="2">⭐⭐ (2 Stars)</option>
            <option value="1">⭐ (1 Star)</option>
          </select>
        </div>
      </div>

      {/* Main Datatable */}
      <RUTable
        columns={columns}
        data={filteredReviews}
        isLoading={isLoading}
        searchPlaceholder="Filter reviews..."
      />

      {/* Delete Review Confirmation Modal */}
      {deleteReviewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in-50">
          <div className="relative w-full max-w-sm rounded-3xl border border-border bg-card p-6 shadow-2xl text-card-foreground text-center space-y-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/10 text-destructive mx-auto">
              <Trash2 className="h-6 w-6" />
            </div>

            <div>
              <h3 className="font-extrabold text-base text-foreground">Permanently Delete Review?</h3>
              <p className="text-xs text-muted-foreground mt-1">
                You are about to delete this {deleteReviewItem.type.toLowerCase()} review for <strong>{deleteReviewItem.title}</strong>. This action will update aggregate rating calculations immediately.
              </p>
            </div>

            <div className="flex justify-center space-x-2 pt-2 border-t border-border">
              <button
                onClick={() => setDeleteReviewItem(null)}
                className="px-4 py-2 text-xs font-semibold rounded-xl border border-input bg-background hover:bg-accent text-foreground cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-destructive hover:bg-red-700 text-destructive-foreground shadow-xs disabled:opacity-50 cursor-pointer"
              >
                {isDeleting ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

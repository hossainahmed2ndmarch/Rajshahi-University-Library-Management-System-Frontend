"use client";

import React, { use } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Calendar,
  User,
  Clock,
  Tag,
  BookOpen,
  Share2,
  Eye,
  ShieldCheck,
  Bookmark,
  CheckCircle2,
} from "lucide-react";
import { useGetArticle } from "@/hooks/useArticles";
import { toast } from "sonner";
import { format } from "date-fns";

interface PublicationReaderPageProps {
  params: Promise<{ id: string }>;
}

const DEFAULT_COVER_IMAGE =
  "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=1000&auto=format&fit=crop";

export default function PublicationReaderPage({ params }: PublicationReaderPageProps) {
  const { id } = use(params);
  const { data: article, isLoading, isError } = useGetArticle(id);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50/50 dark:bg-zinc-950 py-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="h-6 w-36 bg-muted/60 rounded-md animate-pulse" />
          <div className="bg-card rounded-3xl border border-border p-8 sm:p-12 space-y-6 animate-pulse">
            <div className="h-64 bg-muted/60 rounded-2xl w-full" />
            <div className="h-8 bg-muted/60 rounded-md w-3/4" />
            <div className="h-4 bg-muted/60 rounded-md w-1/2" />
            <div className="space-y-3 pt-6">
              <div className="h-4 bg-muted/60 rounded-md w-full" />
              <div className="h-4 bg-muted/60 rounded-md w-full" />
              <div className="h-4 bg-muted/60 rounded-md w-4/5" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !article) {
    return (
      <div className="min-h-screen bg-slate-50/50 dark:bg-zinc-950 py-16">
        <div className="mx-auto max-w-md px-4 text-center space-y-4">
          <h2 className="text-xl font-bold text-foreground">Publication Not Found</h2>
          <p className="text-xs text-muted-foreground">
            The article or gazette bulletin you are looking for may have been removed or is not currently published.
          </p>
          <Link
            href="/publications"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#004F32] text-white text-xs font-bold"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Return to Publications</span>
          </Link>
        </div>
      </div>
    );
  }

  const coverImg = article.coverImage || DEFAULT_COVER_IMAGE;
  const formattedDate = article.createdAt
    ? format(new Date(article.createdAt), "dd MMMM yyyy")
    : "Recent";

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-zinc-950 py-8 sm:py-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Navigation & Controls */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/publications"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-[#004F32] dark:hover:text-emerald-400 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Publications
          </Link>

          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({ title: article.title, url: window.location.href });
              } else {
                navigator.clipboard.writeText(window.location.href);
                toast.success("Publication link copied to clipboard!");
              }
            }}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground p-2 rounded-xl hover:bg-muted transition-colors cursor-pointer"
          >
            <Share2 className="h-4 w-4" />
            <span>Share</span>
          </button>
        </div>

        {/* Article Card */}
        <article className="bg-card rounded-3xl border border-border p-6 sm:p-12 shadow-sm space-y-8 overflow-hidden">
          {/* Cover Image */}
          {coverImg && (
            <div className="relative w-full h-72 sm:h-96 rounded-2xl overflow-hidden shadow-md">
              <Image
                src={coverImg}
                alt={article.title}
                fill
                priority
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-40" />
            </div>
          )}

          {/* Header Block */}
          <div className="space-y-4 border-b border-border pb-8">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-lg bg-[#004F32]/10 text-[#004F32] dark:text-emerald-400">
                <Tag className="h-3.5 w-3.5" />
                <span>{article.category}</span>
              </span>
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                <span>{article.totalReadTime || 3} min read</span>
              </span>
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Eye className="h-3.5 w-3.5" />
                <span>{article.totalViews || 0} views</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-foreground tracking-tight leading-tight">
              {article.title}
            </h1>

            {/* Author Block */}
            <div className="flex items-center gap-3 pt-2">
              <div className="h-12 w-12 rounded-full bg-[#004F32]/10 dark:bg-emerald-950 text-[#004F32] dark:text-emerald-400 flex items-center justify-center font-bold text-base shrink-0">
                {article.authorName ? article.authorName.charAt(0).toUpperCase() : "A"}
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">{article.authorName}</p>
                <p className="text-xs text-muted-foreground">
                  {article.authorDesignation || "Library Author"} • Published on {formattedDate}
                </p>
              </div>
            </div>
          </div>

          {/* Article Body Content */}
          <div className="prose dark:prose-invert max-w-none text-xs sm:text-sm text-foreground/90 leading-relaxed space-y-4 whitespace-pre-line">
            {article.content}
          </div>

          {/* Related Book Highlight (if attached in article) */}
          {article.relatedBook && (
            <div className="rounded-2xl border border-emerald-900/20 bg-emerald-500/5 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-8">
              <div className="flex items-center gap-3">
                <div className="h-14 w-12 rounded-lg bg-muted relative overflow-hidden shrink-0 border border-border">
                  {article.relatedBook.coverImage ? (
                    <Image
                      src={article.relatedBook.coverImage}
                      alt={article.relatedBook.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <BookOpen className="h-6 w-6 text-muted-foreground m-auto" />
                  )}
                </div>
                <div>
                  <span className="text-[10px] font-bold text-[#004F32] dark:text-emerald-400 uppercase tracking-wider">
                    Mentioned Library Book
                  </span>
                  <h4 className="text-sm font-bold text-foreground line-clamp-1">
                    {article.relatedBook.title}
                  </h4>
                  <p className="text-[11px] text-muted-foreground">
                    Author: {article.relatedBook.author}
                  </p>
                </div>
              </div>

              <Link
                href={`/books`}
                className="shrink-0 px-4 py-2 rounded-xl bg-[#004F32] hover:bg-emerald-900 text-white text-xs font-bold inline-flex items-center gap-1.5 transition-colors"
              >
                <span>View in Catalog</span>
                <BookOpen className="h-3.5 w-3.5" />
              </Link>
            </div>
          )}

          {/* Footer Card */}
          <div className="pt-6 border-t border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-muted/30 p-5 rounded-2xl">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-[#004F32] dark:text-emerald-400 shrink-0" />
              <span>Official Publication of Rajshahi University Central Islamic Library</span>
            </div>
            <Link
              href="/publications"
              className="inline-flex items-center gap-2 text-xs font-bold text-[#004F32] dark:text-emerald-400 hover:underline"
            >
              <span>Explore All Publications</span>
              <ArrowLeft className="h-3.5 w-3.5 rotate-180" />
            </Link>
          </div>
        </article>
      </div>
    </div>
  );
}

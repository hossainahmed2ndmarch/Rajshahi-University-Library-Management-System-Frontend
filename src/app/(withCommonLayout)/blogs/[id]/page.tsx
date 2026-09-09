"use client";

import React, { use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  User,
  Clock,
  Tag,
  BookOpen,
  Share2,
  BookmarkPlus,
  ShieldCheck,
} from "lucide-react";
import { BLOG_POSTS } from "@/types/blog";
import { toast } from "sonner";

interface BlogPostReaderPageProps {
  params: Promise<{ id: string }>;
}

export default function BlogPostReaderPage({ params }: BlogPostReaderPageProps) {
  const { id } = use(params);

  const post = BLOG_POSTS.find((p) => p.id === id) || {
    id,
    title: "Rajshahi University Islamic Library Research Journal",
    excerpt: "Scholarly insights and library catalog updates from RU Central Islamic Library.",
    author: "Library Editorial Board",
    authorRole: "Central Circulation Division",
    date: "August 2026",
    readTime: "5 min read",
    category: "Monthly Newspaper" as const,
  };

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-zinc-950 py-8 sm:py-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Back Link & Meta */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/blogs"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Publications
          </Link>

          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({ title: post.title, url: window.location.href });
              } else {
                navigator.clipboard.writeText(window.location.href);
                toast.success("Article link copied!");
              }
            }}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground p-2 rounded-xl hover:bg-muted transition-colors"
          >
            <Share2 className="h-4 w-4" />
            <span>Share Article</span>
          </button>
        </div>

        {/* Article Reader Card */}
        <article className="bg-card rounded-3xl border border-border p-6 sm:p-12 shadow-sm space-y-8">
          {/* Header Block */}
          <div className="space-y-4 border-b border-border pb-8">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-md bg-primary/10 text-primary">
                <Tag className="h-3.5 w-3.5" />
                <span>{post.category}</span>
              </span>
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                <span>{post.readTime}</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-foreground tracking-tight leading-tight">
              {post.title}
            </h1>

            {/* Author Block */}
            <div className="flex items-center gap-3 pt-2">
              <div className="h-11 w-11 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                {post.author.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">{post.author}</p>
                <p className="text-xs text-muted-foreground">
                  {post.authorRole} • Published on {post.date}
                </p>
              </div>
            </div>
          </div>

          {/* Body Content */}
          <div className="prose dark:prose-invert max-w-none text-xs sm:text-sm text-foreground/90 leading-relaxed space-y-5">
            <p className="text-sm sm:text-base font-medium text-foreground leading-relaxed italic border-l-4 border-primary pl-4 py-1">
              "{post.excerpt}"
            </p>

            <p>
              The Rajshahi University Islamic Library system serves as a pillar for authentic
              knowledge transmission across the northern division of Bangladesh. With continuous
              digitization, physical shelf cell indexing, and an active student shifter network,
              students can access multi-volume commentaries and historical archives with minimal friction.
            </p>

            <h2 className="text-base sm:text-lg font-bold text-foreground pt-4">
              Circulation Enhancements & Digital Shelf Indexing
            </h2>
            <p>
              Recent updates to the library circulation engine enable automated SMS reminders for
              due dates, transparent fine calculations, and real-time inventory tracking for both
              borrowable volumes and bookstore acquisitions. Enrolled students are encouraged to
              link their student IDs through the member portal to enjoy unlimited borrowing quotas.
            </p>

            <h2 className="text-base sm:text-lg font-bold text-foreground pt-4">
              Sadaqah Jariyah & Community Literature Drives
            </h2>
            <p>
              Our book donation program continues to welcome authentic Islamic literature,
              textbooks, and research journals. Each donated book is cataloged, labeled with the
              donor’s dedicated dedication note, and placed on active shelves for future generations.
            </p>
          </div>

          {/* Footer Card */}
          <div className="mt-8 pt-6 border-t border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-muted/30 p-5 rounded-2xl">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <span>Official Publication of Rajshahi University Islamic Library</span>
            </div>
            <Link
              href="/books"
              className="inline-flex items-center gap-2 text-xs font-bold text-primary hover:underline"
            >
              <span>Explore Library Catalog</span>
              <BookOpen className="h-3.5 w-3.5" />
            </Link>
          </div>
        </article>
      </div>
    </div>
  );
}

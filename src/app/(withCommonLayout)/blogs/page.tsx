"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Newspaper,
  BookOpen,
  Calendar,
  User,
  ArrowRight,
  Sparkles,
  Tag,
  Clock,
} from "lucide-react";
import { BLOG_POSTS, IBlogPost } from "@/types/blog";

export default function BlogsPage() {
  const [activeCategory, setActiveCategory] = useState<string>("ALL");

  const categories = [
    "ALL",
    "Monthly Newspaper",
    "Scholarly Article",
    "Library Notice",
    "Manuscript Review",
  ];

  const filteredPosts =
    activeCategory === "ALL"
      ? BLOG_POSTS
      : BLOG_POSTS.filter((p) => p.category === activeCategory);

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-zinc-950 py-8 sm:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header Banner */}
        <div className="rounded-3xl bg-gradient-to-r from-[#004F32] via-[#003824] to-[#040D09] p-8 sm:p-12 text-white shadow-xl mb-10 relative overflow-hidden">
          <div className="max-w-2xl space-y-4 relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#C78700]/20 px-3.5 py-1 text-xs font-bold text-amber-300 border border-[#C78700]/30">
              <Newspaper className="h-3.5 w-3.5" />
              <span>Library Periodicals & Gazette</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              Blogs & Monthly Publications
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed font-light">
              Monthly Rajshahi University Islamic Library newsletters, academic research insights, manuscript reviews, and student announcements.
            </p>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 mb-8">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeCategory === cat
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-card border border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Blog Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {filteredPosts.map((post) => (
            <article
              key={post.id}
              className="bg-card rounded-3xl border border-border p-6 sm:p-8 flex flex-col justify-between shadow-xs hover:shadow-md transition-shadow group"
            >
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-primary/10 text-primary">
                    <Tag className="h-3 w-3" />
                    <span>{post.category}</span>
                  </span>
                  <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{post.readTime}</span>
                  </span>
                </div>

                <Link href={`/blogs/${post.id}`}>
                  <h2 className="text-lg sm:text-xl font-bold text-foreground group-hover:text-primary transition-colors leading-snug">
                    {post.title}
                  </h2>
                </Link>

                <p className="text-xs sm:text-sm text-muted-foreground mt-3 leading-relaxed">
                  {post.excerpt}
                </p>
              </div>

              <div className="mt-6 pt-5 border-t border-border flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-foreground">
                    {post.author.charAt(0)}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-foreground leading-tight">{post.author}</p>
                    <p className="text-[10px] text-muted-foreground">{post.date}</p>
                  </div>
                </div>

                <Link
                  href={`/blogs/${post.id}`}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-primary group-hover:underline"
                >
                  <span>Read Article</span>
                  <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Newspaper,
  Calendar,
  User,
  ArrowRight,
  Tag,
  Clock,
  Eye,
  Search,
  BookOpen,
  Sparkles,
} from "lucide-react";
import { useGetArticles, useGetArticleCategories } from "@/hooks/useArticles";
import { IArticle } from "@/types/article";
import { format } from "date-fns";

const DEFAULT_COVER_IMAGE =
  "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=1000&auto=format&fit=crop";

export default function PublicationsPage() {
  const [activeCategory, setActiveCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const { data: articlesData, isLoading } = useGetArticles({
    isPublished: "true",
  });
  const { data: categoryCounts } = useGetArticleCategories();

  const articles: IArticle[] = useMemo(() => {
    if (!articlesData) return [];
    if (Array.isArray(articlesData)) return articlesData;
    if (typeof articlesData === "object" && "data" in articlesData && Array.isArray((articlesData as any).data)) {
      return (articlesData as any).data;
    }
    return [];
  }, [articlesData]);

  const categories = useMemo(() => {
    const unique = new Set<string>();

    if (categoryCounts && Array.isArray(categoryCounts)) {
      categoryCounts.forEach((c) => {
        if (c.category && c.count > 0) {
          unique.add(c.category.trim());
        }
      });
    }

    articles.forEach((a) => {
      if (a.category && a.category.trim()) {
        unique.add(a.category.trim());
      }
    });

    const sorted = Array.from(unique).sort((a, b) => a.localeCompare(b));
    return ["ALL", ...sorted];
  }, [categoryCounts, articles]);

  const filteredArticles = useMemo(() => {
    return articles.filter((post) => {
      const matchesCategory =
        activeCategory === "ALL" || post.category.toLowerCase() === activeCategory.toLowerCase();
      const term = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !term ||
        post.title.toLowerCase().includes(term) ||
        post.authorName.toLowerCase().includes(term) ||
        post.category.toLowerCase().includes(term) ||
        post.content.toLowerCase().includes(term);

      return matchesCategory && matchesSearch;
    });
  }, [articles, activeCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-zinc-950 py-8 sm:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header Banner */}
        <div className="rounded-3xl bg-gradient-to-r from-[#004F32] via-[#003824] to-[#040D09] p-8 sm:p-12 text-white shadow-xl mb-10 relative overflow-hidden">
          <div className="max-w-2xl space-y-4 relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#C78700]/20 px-3.5 py-1 text-xs font-bold text-amber-300 border border-[#C78700]/30">
              <Newspaper className="h-3.5 w-3.5" />
              <span>Library Periodicals, Gazettes &amp; Scholarly Insights</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              Library Publications &amp; Journals
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed font-light">
              Explore Rajshahi University Central Islamic Library research articles, monthly gazettes,
              manuscript restoration updates, academic bulletin notes, and student literary submissions.
            </p>
          </div>
          <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 opacity-10 pointer-events-none">
            <BookOpen className="w-96 h-96 text-white" />
          </div>
        </div>

        {/* Search & Category Filter Controls */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-8">
          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeCategory === cat
                    ? "bg-[#004F32] text-white shadow-xs"
                    : "bg-card border border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative min-w-[260px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search publications by title, author..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-input bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-[#004F32] shadow-xs"
            />
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((idx) => (
              <div
                key={idx}
                className="bg-card rounded-3xl border border-border overflow-hidden animate-pulse flex flex-col h-96"
              >
                <div className="h-48 bg-muted/60 w-full" />
                <div className="p-6 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="h-4 bg-muted/60 rounded-md w-1/3" />
                    <div className="h-6 bg-muted/60 rounded-md w-full" />
                    <div className="h-4 bg-muted/60 rounded-md w-2/3" />
                  </div>
                  <div className="h-4 bg-muted/60 rounded-md w-1/2" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredArticles.length === 0 && (
          <div className="text-center py-16 bg-card rounded-3xl border border-border p-8">
            <Newspaper className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-40" />
            <h3 className="text-lg font-bold text-foreground mb-1">No publications found</h3>
            <p className="text-xs text-muted-foreground max-w-md mx-auto mb-4">
              {searchQuery
                ? `No articles match the keyword "${searchQuery}". Try changing your search query or category filter.`
                : "No articles are published in this category yet. Check back soon for new research and bulletins."}
            </p>
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setActiveCategory("ALL");
                }}
                className="px-4 py-2 rounded-xl bg-[#004F32] text-white text-xs font-semibold cursor-pointer"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}

        {/* Articles Grid with Cover Image Display */}
        {!isLoading && filteredArticles.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredArticles.map((post) => {
              const coverImg = post.coverImage || DEFAULT_COVER_IMAGE;
              const formattedDate = post.createdAt
                ? format(new Date(post.createdAt), "dd MMMM yyyy")
                : "Recent";
              const targetUrl = `/publications/${post.slug || post.id}`;

              return (
                <article
                  key={post.id}
                  className="bg-card rounded-3xl border border-border overflow-hidden flex flex-col justify-between shadow-xs hover:shadow-lg transition-all duration-300 group hover:-translate-y-1"
                >
                  <div>
                    {/* Cover Image */}
                    <Link href={targetUrl} className="block relative h-52 w-full overflow-hidden bg-muted">
                      <Image
                        src={coverImg}
                        alt={post.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
                      <span className="absolute top-3 left-3 inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-amber-300 border border-white/10">
                        <Tag className="h-3 w-3" />
                        <span>{post.category}</span>
                      </span>
                    </Link>

                    {/* Card Content */}
                    <div className="p-6">
                      <div className="flex items-center gap-3 text-[11px] text-muted-foreground mb-2.5">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{post.totalReadTime || 3} min read</span>
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          <span>{post.totalViews || 0} views</span>
                        </span>
                      </div>

                      <Link href={targetUrl}>
                        <h2 className="text-base sm:text-lg font-bold text-foreground group-hover:text-[#004F32] dark:group-hover:text-emerald-400 transition-colors leading-snug line-clamp-2">
                          {post.title}
                        </h2>
                      </Link>

                      <p className="text-xs text-muted-foreground mt-2.5 leading-relaxed line-clamp-3">
                        {post.content.replace(/[#*`_\[\]]/g, "").slice(0, 160)}…
                      </p>
                    </div>
                  </div>

                  {/* Footer Info */}
                  <div className="px-6 pb-6 pt-4 border-t border-border/70 flex items-center justify-between">
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                      <div className="h-8 w-8 rounded-full bg-[#004F32]/10 dark:bg-emerald-950 text-[#004F32] dark:text-emerald-400 flex items-center justify-center text-xs font-bold shrink-0">
                        {post.authorName ? post.authorName.charAt(0).toUpperCase() : "A"}
                      </div>
                      <div className="truncate">
                        <p className="text-xs font-bold text-foreground truncate leading-tight">
                          {post.authorName}
                        </p>
                        <p className="text-[10px] text-muted-foreground truncate">
                          {post.authorDesignation || formattedDate}
                        </p>
                      </div>
                    </div>

                    <Link
                      href={targetUrl}
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#004F32] dark:text-emerald-400 group-hover:underline shrink-0"
                    >
                      <span>Read</span>
                      <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Clock,
  Eye,
  FileText,
  PenLine,
  User,
} from "lucide-react";
import { useGetArticles } from "@/hooks/useArticles";
import { IArticle } from "@/types/article";
import { SubmitArticleModal } from "@/components/articles/SubmitArticleModal";

export function RudcArticlesSection() {
  const { data, isLoading } = useGetArticles({ org: "RUDC", limit: 4 });
  const articles: IArticle[] = data?.data || [];
  const [submitOpen, setSubmitOpen] = useState(false);

  return (
    <section className="py-16 lg:py-24 bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-500/10 text-[#C78700] dark:text-amber-400 mb-2">
              <FileText className="h-3.5 w-3.5" />
              <span>জ্ঞান ও গবেষণা প্রকাশনা</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-foreground">
              Publications &amp; Articles (আমাদের প্রবন্ধ ও প্রকাশনা)
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-2xl">
              ক্যাম্পাস শিক্ষার্থীদের নৈতিক চরিত্র গঠন, সমকালীন সংশয় নিরসন ও দ্বীনি দিকনির্দেশনামূলক প্রবন্ধ।
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setSubmitOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#004F32] hover:bg-[#003e27] text-white text-xs font-black shadow-xs transition-colors cursor-pointer"
            >
              <PenLine className="h-3.5 w-3.5" />
              <span>প্রবন্ধ জমা দিন</span>
            </button>
            <Link
              href="/rudc/publications"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#004F32] dark:text-emerald-400 hover:underline"
            >
              <span>সকল প্রকাশনা দেখুন</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-72 rounded-3xl bg-muted animate-pulse border border-border/60"
              />
            ))}
          </div>
        ) : articles.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {articles.map((article) => (
              <div
                key={article.id}
                className="group rounded-3xl border border-border/80 bg-card overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {article.coverImage ? (
                    <div className="h-44 w-full overflow-hidden relative bg-muted">
                      <img
                        src={article.coverImage}
                        alt={article.title}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-bold bg-black/60 backdrop-blur-md text-amber-300">
                        {article.category}
                      </span>
                    </div>
                  ) : (
                    <div className="h-32 w-full bg-gradient-to-br from-emerald-950 to-[#004F32] p-4 flex flex-col justify-between text-white relative">
                      <span className="self-end px-2 py-0.5 rounded-full text-[10px] font-bold bg-black/40 backdrop-blur-md text-amber-300">
                        {article.category}
                      </span>
                      <BookOpen className="h-6 w-6 text-amber-300/80" />
                    </div>
                  )}

                  <div className="p-4 space-y-2">
                    <h3 className="text-sm font-bold text-foreground group-hover:text-[#004F32] dark:group-hover:text-emerald-400 transition-colors line-clamp-2 leading-snug">
                      {article.title}
                    </h3>

                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground pt-1">
                      <User className="h-3 w-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span className="truncate">{article.authorName || "RUDC দাওয়াহ উইং"}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 pt-2 border-t border-border/50 flex items-center justify-between text-[11px] text-muted-foreground">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-amber-500" />
                      <span>{article.totalReadTime || 5} মিনিট</span>
                    </span>
                    {article.totalViews > 0 && (
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3 text-emerald-500" />
                        <span>{article.totalViews}</span>
                      </span>
                    )}
                  </div>

                  <Link
                    href={`/articles/${article.slug}`}
                    className="inline-flex items-center gap-1 font-bold text-[#004F32] dark:text-emerald-400 hover:underline"
                  >
                    <span>পড়ুন</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-border p-12 text-center bg-card">
            <BookOpen className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <h4 className="text-sm font-bold text-foreground">বর্তমানে কোনো আর্টিকেল তালিকাভুক্ত নেই</h4>
            <p className="text-xs text-muted-foreground mt-1">
              খুব শীঘ্রই RUDC প্রকাশনা ও দাওয়াহ রিসার্চ উইংয়ের নতুন প্রবন্ধ যুক্ত করা হবে।
            </p>
            <button
              onClick={() => setSubmitOpen(true)}
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#004F32] text-white text-xs font-bold shadow-xs hover:bg-[#003e27] transition-colors cursor-pointer"
            >
              <PenLine className="h-3.5 w-3.5" />
              <span>প্রথম প্রবন্ধ জমা দিন</span>
            </button>
          </div>
        )}
      </div>

      <SubmitArticleModal
        isOpen={submitOpen}
        onClose={() => setSubmitOpen(false)}
        org="RUDC"
      />
    </section>
  );
}

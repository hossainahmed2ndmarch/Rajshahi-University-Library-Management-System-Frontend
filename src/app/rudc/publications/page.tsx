"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, Calendar, Clock, Eye, FileText, PenLine, User } from "lucide-react";
import { useGetArticles } from "@/hooks/useArticles";
import { SubmitArticleModal } from "@/components/articles/SubmitArticleModal";

export default function RudcPublicationsPage() {
  const { data, isLoading } = useGetArticles({ org: "RUDC" });
  const dbArticles = data?.data || [];
  const [submitOpen, setSubmitOpen] = useState(false);

  const defaultPublications = [
    {
      title: "The Importance of Congregational Salah on Campus: A Divine Shield",
      author: "RUDC Research & Dawah Wing",
      date: "September 2026",
      category: "Salah & Fard",
      summary:
        "An analytical guide on why preserving 5 daily prayers in congregation is essential for university students navigating worldly distractions.",
    },
    {
      title: "Guarding the Eyes and Mind: Overcoming Fitnah in University Life",
      author: "Tazkiyah Circle",
      date: "August 2026",
      category: "Tazkiyah & Ethics",
      summary:
        "Practical and spiritual steps from Quran and Sunnah to protect modesty, moral integrity, and focus during undergraduate years.",
    },
    {
      title: "Brotherhood & Unity: Navigating Differences Within Ahlus Sunnah",
      author: "Shura Council, RUDC",
      date: "July 2026",
      category: "Manhaj & Unity",
      summary:
        "Exploring how students should adopt tolerance, adab, and flexibility across recognized Madhhabs without engaging in partisan fanaticism.",
    },
    {
      title: "Time Management for Muslim Students: Balancing Deen & Degree",
      author: "Academic Guidance Wing",
      date: "June 2026",
      category: "Student Life",
      summary:
        "Actionable advice on prioritizing studies, fulfilling organizational tasks, and keeping Salah and Quran at the center of student routine.",
    },
  ];

  return (
    <>
    <div className="py-12 lg:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-600/30 text-[#004F32] dark:text-emerald-300 text-xs font-bold">
            <FileText className="h-3.5 w-3.5 text-[#C78700] dark:text-amber-400" />
            <span>Articles & Guidance</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-foreground">
            RUDC Publications & Articles
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Beneficial reminders, research papers, and youth guidance brochures published by the
            Rajshahi University Dawah Community.
          </p>
          <div className="pt-2">
            <button
              onClick={() => setSubmitOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#004F32] hover:bg-[#003e27] text-white text-xs font-black shadow-xs transition-colors cursor-pointer"
            >
              <PenLine className="h-3.5 w-3.5" />
              <span>প্রবন্ধ জমা দিন — Submit Your Article</span>
            </button>
          </div>
        </div>

        {/* Publication Cards */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-56 rounded-3xl bg-muted animate-pulse border border-border/60"
              />
            ))}
          </div>
        ) : dbArticles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {dbArticles.map((pub) => {
              const formattedDate = new Date(pub.createdAt).toLocaleDateString("bn-BD", {
                year: "numeric",
                month: "long",
                day: "numeric",
              });

              return (
                <div
                  key={pub.id}
                  className="rounded-3xl border border-border/80 bg-card overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="p-6 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/15 text-[#C78700] dark:text-amber-400">
                        {pub.category}
                      </span>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>{formattedDate}</span>
                      </div>
                    </div>

                    <h3 className="text-base font-bold text-foreground leading-snug">
                      {pub.title}
                    </h3>

                    <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                      {pub.content
                        ? pub.content.replace(/<[^>]*>?/gm, "").slice(0, 180) + "..."
                        : "ক্যাম্পাস শিক্ষার্থীদের নৈতিক চরিত্র গঠন ও দ্বীনি দিকনির্দেশনামূলক প্রবন্ধ।"}
                    </p>
                  </div>

                  <div className="p-4 px-6 border-t border-border/50 bg-muted/20 flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5 font-medium">
                      <User className="h-3.5 w-3.5 text-[#004F32] dark:text-emerald-400 shrink-0" />
                      <span className="truncate">{pub.authorName || "RUDC দাওয়াহ উইং"}</span>
                    </div>

                    <Link
                      href={`/articles/${pub.slug}`}
                      className="inline-flex items-center gap-1 font-bold text-[#004F32] dark:text-emerald-400 hover:underline"
                    >
                      <span>সম্পূর্ণ প্রবন্ধ পড়ুন</span>
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {defaultPublications.map((pub, idx) => (
              <div
                key={idx}
                className="rounded-3xl border border-border/80 bg-card p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/15 text-[#C78700] dark:text-amber-400">
                      {pub.category}
                    </span>
                    <span className="text-xs text-muted-foreground">{pub.date}</span>
                  </div>

                  <h3 className="text-base font-bold text-foreground leading-snug">{pub.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{pub.summary}</p>
                </div>

                <div className="pt-4 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 text-[#004F32] dark:text-emerald-400 shrink-0" />
                    <span>{pub.author}</span>
                  </div>

                  <Link
                    href="/articles"
                    className="inline-flex items-center gap-1 font-bold text-[#004F32] dark:text-emerald-400 hover:underline"
                  >
                    <span>লাইব্রেরি আর্টিকেল দেখুন</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Read More in Library Notice */}
        <div className="rounded-3xl bg-muted/40 border border-border p-8 text-center max-w-2xl mx-auto space-y-4">
          <h3 className="text-lg font-bold text-foreground">Want to read full Islamic books?</h3>
          <p className="text-xs text-muted-foreground">
            Explore hundreds of authentic books at Rajshahi University Islamic Library.
          </p>
          <div className="pt-2">
            <Link
              href="/books"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#004F32] hover:bg-[#003e27] text-white font-bold text-xs shadow-xs"
            >
              <BookOpen className="h-4 w-4 text-amber-400" />
              <span>Browse Book Catalog</span>
            </Link>
          </div>
        </div>
      </div>
    </div>

    <SubmitArticleModal
      isOpen={submitOpen}
      onClose={() => setSubmitOpen(false)}
      org="RUDC"
    />
    </>
  );
}

"use client";

import React from "react";
import { BookOpen, Users, HeartHandshake, Layers } from "lucide-react";
import { motion } from "motion/react";
import { useQuery } from "@tanstack/react-query";
import { BookService } from "@/services/book.service";
import { UserService } from "@/services/user.service";
import { DonationService } from "@/services/donation.service";
import { IslamicPattern } from "@/components/shared/IslamicPattern";

export function StatsCounter() {
  // Use limit=1 queries and read meta.total for accurate counts —
  // avoids showing only the current page's item count when the server
  // enforces its own pagination limits.
  const { data: booksData } = useQuery({
    queryKey: ["stats-books-total"],
    queryFn: () => BookService.getAllBooks({ limit: 1, page: 1 }),
    staleTime: 5 * 60 * 1000,
  });

  const { data: membersCount = 0 } = useQuery({
    queryKey: ["stats-users-total"],
    queryFn: () => UserService.getTotalCount(),
    staleTime: 5 * 60 * 1000,
  });

  const { data: donationsCount = 0 } = useQuery({
    queryKey: ["stats-donations-total"],
    queryFn: () => DonationService.getTotalCount(),
    staleTime: 5 * 60 * 1000,
  });

  const { data: categoriesData } = useQuery({
    queryKey: ["book-categories"],
    queryFn: () => BookService.getCategories(),
    staleTime: 5 * 60 * 1000,
  });

  const totalBooks = booksData?.total ?? 0;
  const categoriesCount = categoriesData?.length ?? 0;

  const stats = [
    {
      label: "Total Books & Collections",
      value: `${totalBooks.toLocaleString()}${totalBooks > 0 ? "+" : ""}`,
      description: "Classical & contemporary titles ready for issue",
      icon: BookOpen,
      color: "text-emerald-600 dark:text-emerald-400 bg-emerald-100/80 dark:bg-emerald-950/60",
    },
    {
      label: "Total Registered Members",
      value: `${membersCount.toLocaleString()}${membersCount > 0 ? "+" : ""}`,
      description: "RU students, research fellows & faculty",
      icon: Users,
      color: "text-[#C78700] bg-amber-100/80 dark:bg-amber-950/60",
    },
    {
      label: "Total Donated Books",
      value: `${donationsCount.toLocaleString()}${donationsCount > 0 ? "+" : ""}`,
      description: "Sadaqah Jariyah community contributions",
      icon: HeartHandshake,
      color: "text-rose-600 dark:text-rose-400 bg-rose-100/80 dark:bg-rose-950/60",
    },
    {
      label: "Total Active Categories",
      value: `${categoriesCount.toLocaleString()}${categoriesCount > 0 ? "+" : ""}`,
      description: "Tafsir, Hadith, Fiqh, Seerah & History",
      icon: Layers,
      color: "text-blue-600 dark:text-blue-400 bg-blue-100/80 dark:bg-blue-950/60",
    },
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
      {/* Subtle arabesque pattern behind the stat cards */}
      <IslamicPattern variant="minimal" opacity={0.7} />
      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: idx * 0.1 }}
            className="rounded-2xl border border-border bg-card p-6 text-center flex flex-col items-center justify-between transition-all duration-300 hover:border-[#004F32]/30  dark:hover:border-emerald-600/40 cursor-pointer"
          >
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-2xl ${stat.color} mb-3`}
            >
              <stat.icon className="h-6 w-6" />
            </div>
            <div>
              <div className="text-3xl font-black tracking-tight text-foreground">
                {stat.value}
              </div>
              <div className="text-xs font-bold text-foreground/90 mt-1">
                {stat.label}
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {stat.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

export default StatsCounter;

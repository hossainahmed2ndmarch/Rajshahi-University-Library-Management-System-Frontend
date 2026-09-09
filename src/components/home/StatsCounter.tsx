"use client";

import React from "react";
import { BookOpen, Users, HeartHandshake, Layers } from "lucide-react";
import { motion } from "motion/react";
import { useGetBookCategories, useGetBooks } from "@/hooks/useBooks";
import { useGetUsers } from "@/hooks/useUsers";
import { useGetDonations } from "@/hooks/useDonations";

export function StatsCounter() {
  const { data: booksData } = useGetBooks();
  const { data: usersData } = useGetUsers();
  const { data: donationsData } = useGetDonations();
  const {data: categoriesData}= useGetBookCategories()

  const borrowableCount =
    booksData?.data?.filter(
      (b) => b.isBorrowable || b.type === "BORROW_ONLY" || b.type === "HYBRID"
    ).length || 8200;
  const membersCount = usersData?.length || 4850;
  const donationsCount = donationsData?.length || 2140;
  const categoriessCount = categoriesData?.length || 2140;


  const stats = [
    {
      label: "Total Borrowable Books",
      value: `${borrowableCount.toLocaleString()}+`,
      description: "Classical & contemporary titles ready for issue",
      icon: BookOpen,
      color: "text-emerald-600 dark:text-emerald-400 bg-emerald-100/80 dark:bg-emerald-950/60",
    },
    {
      label: "Total Active Members",
      value: `${membersCount.toLocaleString()}+`,
      description: "RU students, research fellows & faculty",
      icon: Users,
      color: "text-[#C78700] bg-amber-100/80 dark:bg-amber-950/60",
    },
    {
      label: "Total Donated Books",
      value: `${donationsCount.toLocaleString()}+`,
      description: "Sadaqah Jariyah community contributions",
      icon: HeartHandshake,
      color: "text-rose-600 dark:text-rose-400 bg-rose-100/80 dark:bg-rose-950/60",
    },
    {
      label: "Total Active Categories",
      value: `${categoriessCount.toLocaleString()}+`,
      description: "Tafsir, Hadith, Fiqh, Seerah & History",
      icon: Layers,
      color: "text-blue-600 dark:text-blue-400 bg-blue-100/80 dark:bg-blue-950/60",
    },
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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

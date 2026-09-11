"use client";

import React from "react";
import { HeroCarousel } from "@/components/home/HeroCarousel";
import { StatsCounter } from "@/components/home/StatsCounter";
import { CategoryCarousel } from "@/components/home/CategoryCarousel";
import { TrendingBooks } from "@/components/home/TrendingBooks";
import { FeaturedBuyable } from "@/components/home/FeaturedBuyable";
import { Testimonials } from "@/components/home/Testimonials";
import { LiveMapAndScheduleSection } from "@/components/home/LiveMapAndScheduleSection";
import { DonationAndServices } from "@/components/home/DonationAndServices";

export default function HomePage() {
  return (
    <div className="space-y-12 sm:space-y-16 pb-16">
      {/* 1. Hero / Banner Carousel (Shadcn Embla) */}
      <HeroCarousel />

      {/* 2. Platform Stats Counter (Framer Motion) */}
      <StatsCounter />

      {/* 3. Borrowable Categories Carousel (Shadcn Embla) */}
      <CategoryCarousel />

      {/* 4. New Arrivals vs. Most Borrowed Carousel (Shadcn Embla) */}
      <TrendingBooks />

      {/* 5. Buyable Collections & Featured Buyable Carousel (Shadcn Embla) */}
      <FeaturedBuyable />

      {/* 6. Member Reviews & Testimonials Carousel (Shadcn Embla) */}
      <Testimonials />

      {/* 7. Live Desk Operations, Duty Shifter Schedule & Campus Location */}
      <LiveMapAndScheduleSection />

      {/* 8. Donation Banner & Academic Services Grid */}
      <DonationAndServices />
    </div>
  );
}

"use client";

import React from "react";
import { HeroCarousel } from "@/components/home/HeroCarousel";
import { StatsCounter } from "@/components/home/StatsCounter";
import { CategoryCarousel } from "@/components/home/CategoryCarousel";
import { TrendingBooks } from "@/components/home/TrendingBooks";
import { FeaturedBuyable } from "@/components/home/FeaturedBuyable";
import { Testimonials } from "@/components/home/Testimonials";
import { LiveMap } from "@/components/home/LiveMap";
import { DonationAndServices } from "@/components/home/DonationAndServices";
import { ShiftScheduleSection } from "@/components/shared/ShiftScheduleSection";

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

      {/* 7. Today's Duty Shifter & Schedule (compact card) */}
      <ShiftScheduleSection compact />

      {/* 8. Live Map & Real-Time Operational Counter Status */}
      <LiveMap />

      {/* 9. Donation Banner & Academic Services Grid */}
      <DonationAndServices />
    </div>
  );
}

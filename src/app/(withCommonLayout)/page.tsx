"use client";

import React from "react";
import { IslamicPattern } from "@/components/shared/IslamicPattern";
import { HeroCarousel } from "@/components/home/HeroCarousel";
import { StatsCounter } from "@/components/home/StatsCounter";
import { CategoryCarousel } from "@/components/home/CategoryCarousel";
import { TrendingBooks } from "@/components/home/TrendingBooks";
import { FeaturedBuyable } from "@/components/home/FeaturedBuyable";
import { Testimonials } from "@/components/home/Testimonials";
import { LiveMapAndScheduleSection } from "@/components/home/LiveMapAndScheduleSection";
import { ServicesGrid } from "@/components/home/ServicesGrid";
import { DonationBanner } from "@/components/shared/DonationBanner";

export default function HomePage() {
  return (
    <div className="relative min-h-screen pb-16 overflow-hidden">
      {/* Main Landing Content Container */}
      <div className="relative z-10 space-y-12 sm:space-y-16">
        {/* 1. Hero / Banner Carousel */}
        <HeroCarousel />

        {/* 2. Platform Stats Counter */}
        <StatsCounter />

        {/* 3. Borrowable Categories Carousel */}
        <CategoryCarousel />

        {/* 4. New Arrivals vs. Most Borrowed Carousel */}
        <TrendingBooks />

        {/* 5. Buyable Collections & Featured Buyable Carousel */}
        <FeaturedBuyable />

        {/* 6. Member Reviews & Testimonials Carousel */}
        <Testimonials />

        {/* 7. Live Desk Operations, Duty Shifter Schedule & Campus Location */}
        <LiveMapAndScheduleSection />

        {/* 8. Sadaqah Jariyah & Book Endowment Portal */}
        <DonationBanner />

        {/* 9. Academic & Institutional Library Services */}
        <ServicesGrid />
      </div>
    </div>
  );
}

"use client";

import React from "react";
import { IslamicPattern } from "@/components/ruil/shared/IslamicPattern";
import { HeroCarousel } from "@/components/ruil/home/HeroCarousel";
import { StatsCounter } from "@/components/ruil/home/StatsCounter";
import { CategoryCarousel } from "@/components/ruil/home/CategoryCarousel";
import { TrendingBooks } from "@/components/ruil/home/TrendingBooks";
import { FeaturedBuyable } from "@/components/ruil/home/FeaturedBuyable";
import { Testimonials } from "@/components/ruil/home/Testimonials";
import { LiveMapAndScheduleSection } from "@/components/ruil/home/LiveMapAndScheduleSection";
import { ServicesGrid } from "@/components/ruil/home/ServicesGrid";
import { DonationBanner } from "@/components/ruil/shared/DonationBanner";
import { EventsSection } from "@/components/ruil/home/EventsSection";
import { ActivitiesSection } from "@/components/ruil/home/ActivitiesSection";

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

        {/* 8. Events & Seminars Showcase */}
        <EventsSection />

        {/* 9. Core Ongoing Activities & Study Circles */}
        <ActivitiesSection />

        {/* 10. Sadaqah Jariyah & Book Endowment Portal */}
        <DonationBanner />

        {/* 11. Academic & Institutional Library Services */}
        <ServicesGrid />
      </div>
    </div>
  );
}

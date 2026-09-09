"use client";

import React from "react";
import Link from "next/link";
import Autoplay from "embla-carousel-autoplay";
import {
  BookOpen,
  ShoppingBag,
  Sparkles,
  UserPlus,
  HeartHandshake,
  ShieldCheck,
} from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  CarouselDots,
} from "@/components/ui/carousel";

const SLIDES = [
  {
    badge: "Rajshahi University Islamic Library System",
    title: "Preserving Classical Islamic Knowledge & Academic Excellence",
    description:
      "Access digitized commentaries, authentic Hadith sets, Islamic jurisprudence, and scholarly research manuscripts with campus-wide borrowing and instant delivery.",
    primaryAction: { label: "Borrow Books", href: "/books?type=BORROW_ONLY", icon: BookOpen },
    secondaryAction: { label: "Buy Literature", href: "/books?type=SELL_ONLY", icon: ShoppingBag },
    tertiaryAction: { label: "Become a Member", href: "/register", icon: UserPlus },
    accentColor: "from-[#004F32] via-[#003824] to-[#040D09]",
  },
  {
    badge: "Campus Digital Circulation",
    title: "Seamless Book Reservation & Dormitory Handover",
    description:
      "RU students and faculty members can borrow up to 3 titles concurrently with automated notifications and pickup desks across 8 residential halls.",
    primaryAction: { label: "Explore Catalog", href: "/books", icon: BookOpen },
    secondaryAction: { label: "Become a Member", href: "/register", icon: UserPlus },
    tertiaryAction: { label: "Library Stacks", href: "/about", icon: ShieldCheck },
    accentColor: "from-[#003824] via-[#002819] to-[#020805]",
  },
  {
    badge: "Sadaqah Jariyah Programme",
    title: "Donate Islamic Treatises & Build Lasting Knowledge",
    description:
      "Contribute authentic copies, textbooks, or personal collections to expand our institutional library holdings for future academic generations.",
    primaryAction: { label: "Donate Books", href: "/donate", icon: HeartHandshake },
    secondaryAction: { label: "Saved Wishlist", href: "/wishlist", icon: Sparkles },
    tertiaryAction: { label: "Become a Member", href: "/register", icon: UserPlus },
    accentColor: "from-[#00422B] via-[#002D1D] to-[#030A07]",
  },
];

export function HeroCarousel() {
  // Use React.useMemo instead of React.useRef to safely create the plugin instance
  const autoplayPlugin = React.useMemo(
    () => Autoplay({ delay: 6000, stopOnInteraction: false }),
    []
  );

  return (
    <div className="relative w-full overflow-hidden ">
      <Carousel
        plugins={[autoplayPlugin]}
        opts={{
          loop: true,
          align: "start",
        }}
        className="w-full"
      >
        <CarouselContent>
          {SLIDES.map((slide, index) => (
            <CarouselItem key={index}>
              <section
                className={`relative overflow-hidden bg-gradient-to-b ${slide.accentColor} text-white pt-10 sm:pt-14 pb-20 sm:pb-28 border-b border-emerald-900/50`}
              >
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
                  <div className="mx-auto max-w-3xl text-center space-y-6">
                    {/* Badge */}
                    <div className="inline-flex items-center space-x-2 rounded-full bg-[#C78700]/20 px-4 py-1.5 text-xs font-bold text-amber-300 border border-[#C78700]/40 shadow-xs">
                      <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                      <span>{slide.badge}</span>
                    </div>

                    {/* Headline */}
                    <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
                      {slide.title}
                    </h1>

                    {/* Description */}
                    <p className="text-sm sm:text-base lg:text-lg text-emerald-100/90 leading-relaxed font-light max-w-2xl mx-auto">
                      {slide.description}
                    </p>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 pt-4">
                      <Link
                        href={slide.primaryAction.href}
                        className="flex items-center space-x-2 rounded-xl bg-[#C78700] hover:bg-amber-600 px-6 py-3.5 text-xs sm:text-sm font-bold text-white shadow-lg transition-all transform hover:-translate-y-0.5"
                      >
                        <slide.primaryAction.icon className="h-4 w-4" />
                        <span>{slide.primaryAction.label}</span>
                      </Link>

                      <Link
                        href={slide.secondaryAction.href}
                        className="flex items-center space-x-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 px-5 py-3.5 text-xs sm:text-sm font-bold text-white backdrop-blur-sm transition-all hover:-translate-y-0.5"
                      >
                        <slide.secondaryAction.icon className="h-4 w-4 text-amber-300" />
                        <span>{slide.secondaryAction.label}</span>
                      </Link>

                      <Link
                        href={slide.tertiaryAction.href}
                        className="flex items-center space-x-2 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-700/50 px-5 py-3.5 text-xs sm:text-sm font-bold text-emerald-200 transition-all hover:-translate-y-0.5"
                      >
                        <slide.tertiaryAction.icon className="h-4 w-4 text-amber-400" />
                        <span>{slide.tertiaryAction.label}</span>
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Decorative Lighting */}
                <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />
                <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-[#C78700]/15 blur-3xl pointer-events-none" />
              </section>
            </CarouselItem>
          ))}
        </CarouselContent>

        {/* Carousel Controls */}
        <CarouselPrevious className="hidden md:flex left-6 bg-black/40 border-white/20 text-white hover:bg-[#C78700] hover:text-white" />
        <CarouselNext className="hidden md:flex right-6 bg-black/40 border-white/20 text-white hover:bg-[#C78700] hover:text-white" />
        <div className="absolute bottom-6 left-0 right-0 z-20">
          <CarouselDots />
        </div>
      </Carousel>
    </div>
  );
}

export default HeroCarousel;
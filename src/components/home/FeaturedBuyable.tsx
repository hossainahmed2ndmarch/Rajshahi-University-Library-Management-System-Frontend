"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  Flame,
  Clock,
  ArrowRight,
} from "lucide-react";
import { useGetBooks } from "@/hooks/useBooks";
import { BookCard } from "@/components/books/BookCard";
import { BookCardSkeleton } from "@/components/ui/skeleton";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { useLanguageStore } from "@/store/useLanguageStore";

export function FeaturedBuyable() {
  const { t } = useLanguageStore();
  const [filterType, setFilterType] = useState<"NEW" | "BEST_SELLING">("BEST_SELLING");

  const { data: booksData, isLoading } = useGetBooks({
    isSellable: true,
    limit: 8,
  });

  const books = booksData?.data || [];

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-5">
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full"
      >
        <SectionHeader
          icon={ShoppingBag}
          subtitleKey="home.bookstoreSubtitle"
          badgeVariant="gold"
          titleKey="home.bookstoreTitle"
          descriptionKey="home.bookstoreDesc"
          className="mb-8"
          action={
            <div className="flex items-center gap-3">
              <div className="flex p-1 rounded-xl bg-muted border border-border text-xs font-bold">
                <button
                  onClick={() => setFilterType("BEST_SELLING")}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    filterType === "BEST_SELLING"
                      ? "bg-[#C78700] text-white shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Flame className="h-3.5 w-3.5" />
                  <span>{t("common.bestSellers")}</span>
                </button>
                <button
                  onClick={() => setFilterType("NEW")}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    filterType === "NEW"
                      ? "bg-[#C78700] text-white shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Clock className="h-3.5 w-3.5" />
                  <span>{t("common.newArrivals")}</span>
                </button>
              </div>

              <div className="hidden sm:flex items-center gap-1.5 relative">
                <CarouselPrevious className="static translate-y-0 h-9 w-9 rounded-xl bg-card border border-border transition-all duration-300 hover:border-[#004F32]/30 dark:hover:border-emerald-600/40" />
                <CarouselNext className="static translate-y-0 h-9 w-9 rounded-xl bg-card border border-border transition-all duration-300 hover:border-[#004F32]/30 dark:hover:border-emerald-600/40" />
              </div>
            </div>
          }
        />

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <BookCardSkeleton key={n} />
            ))}
          </div>
        ) : books.length === 0 ? (
          <div className="p-12 text-center rounded-2xl border border-border bg-card text-muted-foreground text-sm">
            No buyable books currently in stock for this filter.
          </div>
        ) : (
          <CarouselContent className="-ml-4 pb-2">
            {books.map((book) => (
              <CarouselItem
                key={book.id}
                className="pl-4 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4"
              >
                <BookCard book={book} />
              </CarouselItem>
            ))}
          </CarouselContent>
        )}
      </Carousel>

      {/* Directory CTA */}
      <div className="mt-8 text-center">
        <Link
          href="/books?type=SELL_ONLY"
          className="inline-flex items-center gap-2 text-xs font-bold text-[#C78700] hover:underline"
        >
          <span>Explore All Purchaseable Titles</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </section>
  );
}

export default FeaturedBuyable;

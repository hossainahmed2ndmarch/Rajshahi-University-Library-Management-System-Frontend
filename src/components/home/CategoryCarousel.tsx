"use client";

import React from "react";
import Link from "next/link";
import { BookOpen, ArrowRight, Sparkles, Layers } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetBookCategories, useGetBooks } from "@/hooks/useBooks";
import { SectionHeader } from "@/components/shared/SectionHeader";

// ---------------------------------------------------------------------------
// Static display metadata keyed by backend category slug
// ---------------------------------------------------------------------------
const CATEGORY_META: Record<
  string,
  {
    label: string;
    description: string;
  }
> = {
  Tafsir: {
    label: "Tafsir & Quranic Studies",
    description:
      "Classical exegesis by Ibn Kathir, Tabari, Qurtubi, and modern analysis.",
  },
  Hadith: {
    label: "Hadith & Prophetic Sunnah",
    description:
      "Kutub al-Sittah compilations, Hadith grading commentaries, and riwayah.",
  },
  Fiqh: {
    label: "Islamic Jurisprudence (Fiqh)",
    description:
      "Hanafi, Shafi\u2019i, Maliki, and Hanbali comparative legal treatises.",
  },
  Seerah: {
    label: "Seerah & Prophetic Biography",
    description: "Chronicles of Prophet Muhammad (SAW), Sahabah biographies.",
  },
  History: {
    label: "Islamic History & Civilizations",
    description:
      "Caliphates, Andalusian scholarship, Ottoman annals, Bengal Islamic heritage.",
  },
  Aqeedah: {
    label: "Aqeedah & Comparative Theology",
    description:
      "Foundational creed, articles of faith, refutations, and epistemology.",
  },
  Spirituality: {
    label: "Spirituality & Tazkiyah",
    description:
      "Purification of the soul, dhikr, Sufi literature, and personal development.",
  },
  Dawah: {
    label: "Dawah & Islamic Ethics",
    description:
      "Methodology of calling to Islam, comparative religion, and Muslim character.",
  },
  Education: {
    label: "Islamic Education",
    description:
      "Pedagogical texts, Islamic curricula, children\u2019s books, and Arabic learning.",
  },
};

const DEFAULT_META = {
  label: (slug: string) => slug,
  description: "Browse books in this category.",
};

// ---------------------------------------------------------------------------
// Book Preview Cover Grid (2x2)
// ---------------------------------------------------------------------------
interface BookPreview {
  id: string;
  title: string;
  coverImage?: string;
  author: string;
}

function CategoryBookPreviewsGrid({
  books,
  category,
}: {
  books?: BookPreview[];
  category: string;
}) {
  if (!books || books.length === 0) return null;
  const previews = books.slice(0, 4);

  return (
    <div className="grid grid-cols-2 gap-x-5 gap-y-6 flex-1 mb-4">
      {previews.map((book) => (
        <div key={book.id} className="flex flex-col gap-2">
          {/* Light grey rounded background for cover */}
          <div className="bg-muted w-full flex items-center justify-center overflow-hidden">
            {book.coverImage ? (
              <img
                src={book.coverImage}
                alt={book.title}
                className="h-full w-auto object-contain"
              />
            ) : (
              <BookOpen className="h-10 w-10 text-muted-foreground/30" />
            )}
          </div>
          {/* Book title */}
          <p className="text-sm font-semibold text-foreground truncate line-clamp-2 px-1">
            {book.title}
          </p>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Skeleton card shown while categories are loading
// ---------------------------------------------------------------------------
function CategorySkeleton() {
  return (
    <CarouselItem className="pl-4 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4">
      <div className="flex flex-col p-6 rounded-3xl border border-border/40 bg-card h-full min-h-[500px]">
        {/* Category Label Skeleton */}
        <Skeleton className="h-8 w-3/4 mb-6 rounded-lg" />
        {/* Book grid skeletons */}
        <div className="grid grid-cols-2 gap-x-5 gap-y-6 flex-1 mb-8">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="flex flex-col gap-2">
              <Skeleton className="h-48 w-full rounded-xl" />
              <Skeleton className="h-5 w-5/6 mt-1 rounded" />
              <Skeleton className="h-4 w-2/3 mt-1 rounded" />
            </div>
          ))}
        </div>
        {/* Link Skeleton */}
        <Skeleton className="h-5 w-28 rounded" />
      </div>
    </CarouselItem>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------
export function CategoryCarousel() {
  const { data: liveCategories, isLoading: categoriesLoading } =
    useGetBookCategories();

  // Fetch all books once — we filter per category client-side so that a book
  // belonging to multiple categories (e.g. ["Tafsir", "Hadith"]) naturally
  // appears in every relevant category grid without creating duplicate cards.
  const { data: booksData, isLoading: booksLoading } = useGetBooks();
  const allBooks = booksData?.data ?? [];

  const isLoading = categoriesLoading || booksLoading;

  /**
   * Returns up to 4 preview books for a given category slug.
   * Matches against the full `categories` array so multi-category books
   * are included in every category they belong to — the same book object
   * is simply referenced in multiple grids; no duplicate card is created.
   */
  const getBooksForCategory = (categorySlug: string): BookPreview[] =>
    allBooks
      .filter((book) => {
        // Prefer the structured `categories` array; fall back to the
        // comma-separated legacy `category` string.
        const cats: string[] =
          Array.isArray(book.categories) && book.categories.length > 0
            ? book.categories
            : book.category
            ? book.category.split(",").map((c) => c.trim())
            : [];
        return cats.some(
          (c) => c.toLowerCase() === categorySlug.toLowerCase()
        );
      })
      .slice(0, 4)
      .map((book) => ({
        id: book.id,
        title: book.title,
        coverImage: book.coverImage,
        author: book.author,
      }));

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
          icon={Sparkles}
          subtitleKey="home.categorySubtitle"
          titleKey="home.categoryTitle"
          titleClassName="text-3xl sm:text-4xl tracking-tighter"
          descriptionKey="home.categoryDesc"
          className="mb-12"
          action={
            <div className="flex items-center gap-2.5 relative">
              <CarouselPrevious className="static translate-y-0 transition-all duration-300 h-10 w-10 rounded-full bg-card border border-border hover:border-[#004F32]/30 dark:hover:border-emerald-600/40" />
              <CarouselNext className="static translate-y-0 transition-all duration-300 h-10 w-10 rounded-full bg-card border border-border hover:border-[#004F32]/30 dark:hover:border-emerald-600/40" />
            </div>
          }
        />

        <CarouselContent className="-ml-4">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <CategorySkeleton key={i} />
              ))
            : (liveCategories ?? []).map((item) => {
                const meta = CATEGORY_META[item.category];
                const label =
                  meta?.label ?? DEFAULT_META.label(item.category);
                // Resolve books that belong to this category (multi-category aware)
                const previewBooks = getBooksForCategory(item.category);

                return (
                  <CarouselItem
                    key={item.category}
                    className="pl-4 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4"
                  >
                    <div className="flex flex-col p-6 rounded-3xl border border-border bg-card h-full min-h-[500px] transition-all duration-300 hover:border-[#004F32]/30  dark:hover:border-emerald-600/40 cursor-pointer group">
                      {/* 1. Category Label at top */}
                      <h3 className="font-bold text-md text-foreground mb-6 line-clamp-1 group-hover:text-primary transition-colors">
                        {label}
                      </h3>

                      {/* 2. 2x2 Grid of up to 4 Books for this category.
                           Multi-category books appear in each matching grid
                           — no extra category card is generated. */}
                      <CategoryBookPreviewsGrid
                        books={previewBooks}
                        category={item.category}
                      />

                      {/* 3. Redirection Link at bottom */}
                      <div className="mt-auto border-t border-border/60">
                        <Link
                          href={`/books?category=${encodeURIComponent(
                            item.category
                          )}`}
                          className="inline-flex items-center gap-1.5 text-sm font-extrabold text-[#C78700] hover:text-amber-600"
                        >
                          <span> সব দেখুন</span>
                          <ArrowRight className="h-4 w-4 group-hover:translate-x-1.5 transition-transform" />
                        </Link>
                      </div>
                    </div>
                  </CarouselItem>
                );
              })}
        </CarouselContent>
      </Carousel>
    </section>
  );
}

export default CategoryCarousel;

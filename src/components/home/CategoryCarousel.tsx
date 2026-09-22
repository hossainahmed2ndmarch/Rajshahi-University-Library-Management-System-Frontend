"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { BookOpen, ArrowRight, Sparkles } from "lucide-react";
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
// Types
// ---------------------------------------------------------------------------
interface BookPreview {
  id: string | number;
  title: string;
  coverImage?: string;
  author: string;
}

interface CategoryItem {
  category: string;
  count: number;
  books: BookPreview[];
}

// ---------------------------------------------------------------------------
// Book Preview Cover Grid (2x2)
// ---------------------------------------------------------------------------
function CategoryBookPreviewsGrid({ books }: { books?: BookPreview[] }) {
  const previews = (books || []).slice(0, 4);

  if (previews.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-muted-foreground/60 mb-4 rounded-2xl bg-muted/20 border border-dashed border-border/50">
        <BookOpen className="h-8 w-8 mb-2 opacity-30" />
        <p className="text-xs">বইগুলো দেখতে নিচে ক্লিক করুন</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 flex-1 mb-4">
      {previews.map((book) => (
        <div key={book.id} className="flex flex-col gap-1.5 group/item">
          {/* Cover image container with fixed aspect ratio */}
          <div className="bg-muted/40 rounded-xl w-full aspect-[3/4] flex items-center justify-center overflow-hidden border border-border/40 transition-transform group-hover/item:scale-105 duration-200">
            {book.coverImage ? (
              <img
                src={book.coverImage}
                alt={book.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <BookOpen className="h-7 w-7 text-muted-foreground/30" />
            )}
          </div>
          {/* Book title */}
          <p
            className="text-xs font-semibold text-foreground truncate line-clamp-2 px-0.5 leading-snug"
            title={book.title}
          >
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
      <div className="flex flex-col p-6 rounded-3xl border border-border/40 bg-card h-full min-h-[480px]">
        {/* Category Label Skeleton */}
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-6 w-3/5 rounded-lg" />
          <Skeleton className="h-5 w-12 rounded-full" />
        </div>
        {/* Book grid skeletons */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 flex-1 mb-4">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="flex flex-col gap-1.5">
              <Skeleton className="w-full aspect-[3/4] rounded-xl" />
              <Skeleton className="h-3 w-5/6 rounded" />
            </div>
          ))}
        </div>
        {/* Link Skeleton */}
        <Skeleton className="h-4 w-28 rounded mt-auto" />
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

  // Fetch all books with limit: 1000 so real-time preview books are available for all categories
  const { data: booksData, isLoading: booksLoading } = useGetBooks({ limit: 1000 });
  const allBooks = useMemo(() => booksData?.data ?? [], [booksData]);

  const isLoading = (categoriesLoading && (!allBooks || allBooks.length === 0)) || (booksLoading && (!liveCategories || liveCategories.length === 0));

  /**
   * Pure real-time category extraction from DB records:
   * - Eliminates all fake categories and static fake descriptions.
   * - Books belonging to multiple categories appear under EVERY category they belong to.
   * - Never creates combined category cards like "Category A, Category B".
   */
  const categoriesToDisplay: CategoryItem[] = useMemo(() => {
    const catMap = new Map<string, { category: string; count: number; books: BookPreview[] }>();

    if (allBooks && allBooks.length > 0) {
      for (const book of allBooks) {
        const bookCats = new Set<string>();

        if (Array.isArray(book.categories) && book.categories.length > 0) {
          book.categories.forEach((c) => {
            const trimmed = c?.trim();
            if (trimmed) bookCats.add(trimmed);
          });
        }
        if (book.category) {
          book.category.split(",").forEach((c) => {
            const trimmed = c?.trim();
            if (trimmed) bookCats.add(trimmed);
          });
        }

        const preview: BookPreview = {
          id: book.id,
          title: book.title,
          coverImage: book.coverImage,
          author: book.author,
        };

        bookCats.forEach((cat) => {
          if (!catMap.has(cat)) {
            catMap.set(cat, { category: cat, count: 0, books: [] });
          }
          const entry = catMap.get(cat)!;
          entry.count += 1;
          if (entry.books.length < 4) {
            entry.books.push(preview);
          }
        });
      }
    } else if (liveCategories && liveCategories.length > 0) {
      // Fallback to /books/categories endpoint
      for (const item of liveCategories) {
        const individualCats = item.category
          .split(",")
          .map((c) => c.trim())
          .filter(Boolean);

        for (const catName of individualCats) {
          if (!catMap.has(catName)) {
            catMap.set(catName, { category: catName, count: 0, books: [] });
          }
          const entry = catMap.get(catName)!;
          entry.count = Math.max(entry.count, item.count);

          if (item.books && item.books.length > 0) {
            for (const b of item.books) {
              if (
                !entry.books.some((eb) => String(eb.id) === String(b.id)) &&
                entry.books.length < 4
              ) {
                entry.books.push({
                  id: b.id,
                  title: b.title,
                  coverImage: b.coverImage ?? undefined,
                  author: b.author,
                });
              }
            }
          }
        }
      }
    }

    return Array.from(catMap.values())
      .filter((item) => item.count > 0)
      .sort((a, b) => b.count - a.count || a.category.localeCompare(b.category));
  }, [allBooks, liveCategories]);

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
            : categoriesToDisplay.map((item) => (
                <CarouselItem
                  key={item.category}
                  className="pl-4 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4"
                >
                  <div className="flex flex-col p-6 rounded-3xl border border-border bg-card h-full min-h-[480px] transition-all duration-300 hover:border-[#004F32]/40 hover:shadow-md dark:hover:border-emerald-600/40 cursor-pointer group">
                    {/* 1. Category Label at top */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-base text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                          {item.category}
                        </h3>
                        <span className="text-[11px] font-semibold text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-full shrink-0 ml-2">
                          {item.count} বই
                        </span>
                      </div>
                    </div>

                    {/* 2. Grid of Books for this category */}
                    <CategoryBookPreviewsGrid books={item.books} />

                    {/* 3. Redirection Link at bottom */}
                    <div className="mt-auto pt-3 border-t border-border/60 flex items-center justify-between">
                      <Link
                        href={`/books?category=${encodeURIComponent(
                          item.category
                        )}`}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#C78700] hover:text-amber-600 dark:text-amber-400 dark:hover:text-amber-300"
                      >
                        <span>সবগুলো বই দেখুন</span>
                        <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1.5 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </CarouselItem>
              ))}
        </CarouselContent>
      </Carousel>
    </section>
  );
}

export default CategoryCarousel;

"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2, BookOpen, ArrowRight, X } from "lucide-react";
import { BookService } from "@/services/book.service";
import { IBook } from "@/types/book";

export function UniversalSearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<IBook[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced real-time preview search
  useEffect(() => {
    if (!query.trim() || query.trim().length < 2) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setIsLoading(true);
        const res = await BookService.getBooks({
          searchTerm: query.trim(),
          limit: 5,
        });
        setResults(res.data || []);
        setIsOpen(true);
      } catch (err) {
        console.error("Quick search error:", err);
      } finally {
        setIsLoading(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setIsOpen(false);
    router.push(`/books?search=${encodeURIComponent(query.trim())}`);
  };

  const handleSelectBook = (bookId: string) => {
    setIsOpen(false);
    setQuery("");
    router.push(`/books/${bookId}`);
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-xl mx-auto">
      <form onSubmit={handleSearchSubmit} className="relative flex items-center">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (results.length > 0) setIsOpen(true);
          }}
          placeholder="বইয়ের নাম, লেখক, বা বিষয় দিয়ে খুঁজুন... (Search books, authors)"
          className="w-full h-10 sm:h-11 pl-4 pr-24 rounded-full border-2 border-emerald-600/30 dark:border-emerald-500/30 bg-gray-50/90 dark:bg-card text-foreground placeholder:text-muted-foreground text-xs sm:text-sm focus:outline-none focus:border-emerald-600 dark:focus:border-emerald-500 focus:bg-background transition-all shadow-inner"
        />

        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setResults([]);
              setIsOpen(false);
            }}
            className="absolute right-12 p-1 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        <button
          type="submit"
          aria-label="Search"
          className="absolute right-1 sm:right-1.5 h-8 sm:h-8.5 px-3.5 sm:px-4 rounded-full bg-[#004F32] hover:bg-[#003d27] dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white flex items-center justify-center transition-colors shadow-xs cursor-pointer"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-amber-300" />
          ) : (
            <Search className="h-4 w-4 text-amber-300" />
          )}
        </button>
      </form>

      {/* Auto-suggest / Live results popup */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden z-[100] animate-in fade-in-50 zoom-in-95">
          {isLoading && results.length === 0 ? (
            <div className="p-4 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <span>বই অনুসন্ধান করা হচ্ছে... (Searching catalog)</span>
            </div>
          ) : results.length > 0 ? (
            <div>
              <div className="p-2 border-b border-border/70 text-[11px] font-bold text-muted-foreground px-3 uppercase tracking-wider flex justify-between items-center bg-muted/40">
                <span>মিলিত বইসমূহ ({results.length})</span>
                <span className="text-[10px] lowercase text-primary">Live suggestions</span>
              </div>
              <div className="divide-y divide-border/60 max-h-80 overflow-y-auto">
                {results.map((book) => (
                  <div
                    key={book.id}
                    onClick={() => handleSelectBook(book.id)}
                    className="flex items-center gap-3 p-3 hover:bg-muted/70 cursor-pointer transition-colors"
                  >
                    <div className="h-12 w-9 rounded-md bg-muted flex items-center justify-center overflow-hidden shrink-0 border border-border">
                      {book.coverImage ? (
                        <img
                          src={book.coverImage}
                          alt={book.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <BookOpen className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-semibold text-foreground truncate">
                        {book.title}
                      </p>
                      <p className="text-[11px] text-muted-foreground truncate">
                        {book.author} • <span className="text-amber-600 dark:text-amber-400 font-medium">{book.category}</span>
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      {book.sellPrice && book.sellPrice > 0 ? (
                        <span className="text-xs font-bold text-[#004F32] dark:text-emerald-400">
                          ৳{book.sellPrice}
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-[#004F32] dark:text-emerald-300">
                          Borrowable
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-2.5 bg-muted/50 border-t border-border text-center">
                <button
                  type="button"
                  onClick={handleSearchSubmit}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#004F32] dark:text-emerald-400 hover:underline cursor-pointer"
                >
                  <span>সব ফলাফল দেখুন &quot;{query}&quot;</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ) : query.trim().length >= 2 ? (
            <div className="p-5 text-center text-xs text-muted-foreground">
              কোনো বই খুঁজে পাওয়া যায়নি &quot;{query}&quot; এর জন্য
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}

export default UniversalSearchBar;

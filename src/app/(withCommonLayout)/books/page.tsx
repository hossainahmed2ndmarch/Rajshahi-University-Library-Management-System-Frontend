"use client";

import React, { useState, useMemo, useCallback, Suspense, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  Search,
  RefreshCw,
  BookOpen,
  SlidersHorizontal,
  X,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useGetBooks, useGetBookOptions } from "@/hooks/useBooks";
import { BookCard } from "@/components/books/BookCard";
import { BookCardSkeleton } from "@/components/ui/skeleton";
import { BookType } from "@/types/book";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const BOOKS_PER_PAGE = 12;
const PRICE_MIN = 0;
const PRICE_MAX = 5000;
const PRICE_STEP = 10;

// ---------------------------------------------------------------------------
// Helpers: URL <-> filter state
// ---------------------------------------------------------------------------
function parseMulti(sp: URLSearchParams, key: string): string[] {
  const val = sp.get(key);
  if (!val) return [];
  return val
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

function buildParams(
  base: URLSearchParams,
  updates: Record<string, string | string[] | null>
): URLSearchParams {
  const next = new URLSearchParams(base.toString());
  for (const [k, v] of Object.entries(updates)) {
    if (v === null || v === "" || (Array.isArray(v) && v.length === 0)) {
      next.delete(k);
    } else if (Array.isArray(v)) {
      next.set(k, v.join(","));
    } else {
      next.set(k, v);
    }
  }
  // Reset page whenever a filter changes (except when explicitly setting page)
  if (!("page" in updates)) next.delete("page");
  return next;
}

// ---------------------------------------------------------------------------
// Collapsible filter section
// ---------------------------------------------------------------------------
function FilterSection({
  title,
  children,
  defaultOpen = true,
  count = 0,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  count?: number;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-border/60 last:border-b-0 py-1">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between py-2.5 text-xs font-bold text-foreground hover:text-primary transition-colors select-none group"
      >
        <span className="uppercase tracking-wider text-[11px] flex items-center gap-2">
          {title}
          {count > 0 && (
            <span className="rounded-full bg-[#004F32] text-white text-[10px] font-bold px-1.5 py-0.2 leading-none shadow-xs">
              {count}
            </span>
          )}
        </span>
        <div
          className={`p-1 rounded-md text-muted-foreground group-hover:text-foreground transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        >
          <ChevronDown className="h-3.5 w-3.5" />
        </div>
      </button>
      {open && <div className="pb-3 pt-0.5">{children}</div>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Scrollable checkbox list with optional inline search — no show-more/less
// ---------------------------------------------------------------------------
function CheckboxList({
  items,
  selected,
  onToggle,
  loading = false,
  searchable = false,
}: {
  items: string[];
  selected: string[];
  onToggle: (value: string) => void;
  loading?: boolean;
  /** @deprecated kept for API compatibility but no longer used */
  maxVisible?: number;
  searchable?: boolean;
}) {
  const [filterQuery, setFilterQuery] = useState("");

  if (loading) {
    return (
      <div className="space-y-1.5 py-1">
        {[1, 2, 3, 4].map((n) => (
          <div key={n} className="h-7 bg-muted/50 animate-pulse rounded-lg w-full" />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <p className="text-[11px] text-muted-foreground/80 italic py-1">
        কোনো অপশন পাওয়া যায়নি
      </p>
    );
  }

  // Apply inline search filter
  const filtered = filterQuery.trim()
    ? items.filter((i) => i.toLowerCase().includes(filterQuery.toLowerCase()))
    : items;

  // Always show selected items first
  const sortedFiltered = [
    ...filtered.filter((i) => selected.includes(i)),
    ...filtered.filter((i) => !selected.includes(i)),
  ];

  return (
    <div className="space-y-1.5">
      {/* Inline search for larger lists */}
      {(searchable || items.length > 8) && (
        <div className="relative mb-1">
          <input
            type="text"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            placeholder="Search..."
            className="w-full rounded-md border border-input bg-background px-2.5 py-1 text-[11px] focus:ring-1 focus:ring-primary focus:outline-none placeholder:text-muted-foreground/60"
          />
          {filterQuery && (
            <button
              type="button"
              onClick={() => setFilterQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-2.5 w-2.5" />
            </button>
          )}
        </div>
      )}

      {/* Scrollable list — all items visible, no show-more */}
      <div className="overflow-y-auto max-h-52 space-y-0.5 pr-1 scrollbar-thin scrollbar-thumb-[#004F32]/20 scrollbar-track-transparent hover:scrollbar-thumb-[#004F32]/40">
        {sortedFiltered.length === 0 ? (
          <p className="text-[11px] text-muted-foreground/70 italic py-1 text-center">
            No results for &quot;{filterQuery}&quot;
          </p>
        ) : (
          sortedFiltered.map((item) => {
            const isChecked = selected.includes(item);
            return (
              <label
                key={item}
                onClick={(e) => {
                  e.preventDefault();
                  onToggle(item);
                }}
                className={`flex items-center gap-2 text-xs px-2.5 py-1.5 rounded-lg cursor-pointer transition-all duration-150 select-none group border ${
                  isChecked
                    ? "bg-[#004F32]/10 text-[#004F32] dark:bg-emerald-950/40 dark:text-emerald-300 font-semibold border-[#004F32]/25 dark:border-emerald-700/40 shadow-xs"
                    : "text-foreground/85 hover:bg-muted/60 hover:text-foreground border-transparent"
                }`}
              >
                <div
                  className={`h-3.5 w-3.5 rounded border flex items-center justify-center transition-colors shrink-0 ${
                    isChecked
                      ? "bg-[#004F32] border-[#004F32] text-white"
                      : "border-input bg-background group-hover:border-muted-foreground/50"
                  }`}
                >
                  {isChecked && <span className="text-[10px] leading-none font-bold">✓</span>}
                </div>
                <span className="truncate flex-1">{item}</span>
              </label>
            );
          })
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Dual-handle price range slider (pure React/CSS — no extra dependency)
// ---------------------------------------------------------------------------
function DualRangeSlider({
  min,
  max,
  value,
  onChange,
  step = PRICE_STEP,
}: {
  min: number;
  max: number;
  value: [number, number];
  onChange: (val: [number, number]) => void;
  step?: number;
}) {
  const [low, high] = value;
  const rangeRef = React.useRef<HTMLDivElement>(null);

  const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
  const toPercent = (v: number) => ((v - min) / (max - min)) * 100;

  const startDrag = (thumb: "low" | "high") => (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const track = rangeRef.current;
    if (!track) return;

    const move = (clientX: number) => {
      const rect = track.getBoundingClientRect();
      const ratio = clamp((clientX - rect.left) / rect.width, 0, 1);
      const raw = min + ratio * (max - min);
      const snapped = Math.round(raw / step) * step;

      if (thumb === "low") {
        onChange([clamp(snapped, min, high - step), high]);
      } else {
        onChange([low, clamp(snapped, low + step, max)]);
      }
    };

    const onMouseMove = (ev: MouseEvent) => move(ev.clientX);
    const onTouchMove = (ev: TouchEvent) => move(ev.touches[0].clientX);
    const stop = () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", stop);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", stop);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", stop);
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", stop);
  };

  const lowPct = toPercent(low);
  const highPct = toPercent(high);

  return (
    <div className="px-1 pt-2 pb-1 select-none">
      {/* Live value labels */}
      <div className="flex justify-between items-center mb-4">
        <span className="bg-[#004F32]/10 text-[#004F32] dark:bg-emerald-950/40 dark:text-emerald-300 px-2 py-0.5 rounded-md border border-[#004F32]/20 text-[11px] font-semibold tabular-nums">
          ৳{low.toLocaleString()}
        </span>
        <span className="text-muted-foreground text-[10px]">to</span>
        <span className="bg-[#004F32]/10 text-[#004F32] dark:bg-emerald-950/40 dark:text-emerald-300 px-2 py-0.5 rounded-md border border-[#004F32]/20 text-[11px] font-semibold tabular-nums">
          ৳{high.toLocaleString()}
        </span>
      </div>

      {/* Slider track */}
      <div
        ref={rangeRef}
        className="relative h-2 rounded-full bg-muted cursor-pointer mx-2"
      >
        {/* Active range fill */}
        <div
          className="absolute h-full rounded-full bg-[#004F32] dark:bg-emerald-500 pointer-events-none"
          style={{ left: `${lowPct}%`, right: `${100 - highPct}%` }}
        />

        {/* Low thumb */}
        <button
          type="button"
          onMouseDown={startDrag("low")}
          onTouchStart={startDrag("low")}
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-5 w-5 rounded-full bg-white border-2 border-[#004F32] shadow-md cursor-grab active:cursor-grabbing focus:outline-none focus:ring-2 focus:ring-[#004F32]/40 hover:scale-110 transition-transform z-10"
          style={{ left: `${lowPct}%` }}
          role="slider"
          aria-valuenow={low}
          aria-valuemin={min}
          aria-valuemax={high - step}
          aria-label="Minimum price"
          onKeyDown={(e) => {
            if (e.key === "ArrowLeft") onChange([clamp(low - step, min, high - step), high]);
            if (e.key === "ArrowRight") onChange([clamp(low + step, min, high - step), high]);
          }}
        />

        {/* High thumb */}
        <button
          type="button"
          onMouseDown={startDrag("high")}
          onTouchStart={startDrag("high")}
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-5 w-5 rounded-full bg-white border-2 border-[#004F32] shadow-md cursor-grab active:cursor-grabbing focus:outline-none focus:ring-2 focus:ring-[#004F32]/40 hover:scale-110 transition-transform z-10"
          style={{ left: `${highPct}%` }}
          role="slider"
          aria-valuenow={high}
          aria-valuemin={low + step}
          aria-valuemax={max}
          aria-label="Maximum price"
          onKeyDown={(e) => {
            if (e.key === "ArrowLeft") onChange([low, clamp(high - step, low + step, max)]);
            if (e.key === "ArrowRight") onChange([low, clamp(high + step, low + step, max)]);
          }}
        />
      </div>

      {/* Track min/max labels */}
      <div className="flex justify-between text-[10px] text-muted-foreground mt-3 px-1">
        <span>৳{min}</span>
        <span>৳{max.toLocaleString()}</span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Active filter badge chip
// ---------------------------------------------------------------------------
function FilterBadge({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-[#004F32]/10 text-[#004F32] dark:bg-emerald-900/40 dark:text-emerald-300 px-2 py-0.5 text-[11px] font-medium border border-[#004F32]/20 dark:border-emerald-700/40">
      {label}
      <button
        type="button"
        onClick={onRemove}
        className="hover:text-destructive transition-colors"
      >
        <X className="h-2.5 w-2.5" />
      </button>
    </span>
  );
}

// ---------------------------------------------------------------------------
// Pagination component
// ---------------------------------------------------------------------------
function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  // Build page windows: always show first, last, current ±2
  const pages: (number | "…")[] = [];
  const window = 2;

  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||
      i === totalPages ||
      (i >= currentPage - window && i <= currentPage + window)
    ) {
      pages.push(i);
    } else if (
      pages[pages.length - 1] !== "…"
    ) {
      pages.push("…");
    }
  }

  return (
    <nav
      aria-label="Pagination"
      className="flex items-center justify-center gap-1 mt-8"
    >
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className="inline-flex items-center gap-1 rounded-lg border border-input bg-card px-3 py-2 text-xs font-medium text-foreground disabled:opacity-40 disabled:cursor-not-allowed hover:border-[#004F32]/50 hover:text-primary transition-colors"
      >
        <ChevronLeft className="h-3.5 w-3.5" />
        Prev
      </button>

      {pages.map((p, i) =>
        p === "…" ? (
          <span key={`ellipsis-${i}`} className="px-2 text-muted-foreground text-xs">
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p as number)}
            className={`rounded-lg border px-3 py-2 text-xs font-semibold transition-colors ${
              p === currentPage
                ? "bg-[#004F32] text-white border-[#004F32]"
                : "border-input bg-card text-foreground hover:border-[#004F32]/50 hover:text-primary"
            }`}
          >
            {p}
          </button>
        )
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="inline-flex items-center gap-1 rounded-lg border border-input bg-card px-3 py-2 text-xs font-medium text-foreground disabled:opacity-40 disabled:cursor-not-allowed hover:border-[#004F32]/50 hover:text-primary transition-colors"
      >
        Next
        <ChevronRight className="h-3.5 w-3.5" />
      </button>
    </nav>
  );
}

// ---------------------------------------------------------------------------
// Main catalog content (uses URL state for all filters)
// ---------------------------------------------------------------------------
function BooksCatalogContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // ── Read filters from URL ────────────────────────────────────────────────
  const searchTerm = searchParams.get("q") || "";
  const selectedCategories = parseMulti(searchParams, "category");
  const selectedAuthors = parseMulti(searchParams, "author");
  const selectedPublishers = parseMulti(searchParams, "publisher");
  const selectedType = (searchParams.get("type") as BookType | "ALL") || "ALL";
  const minPrice = searchParams.get("minPrice") || "";
  const maxPrice = searchParams.get("maxPrice") || "";
  const sort = searchParams.get("sort") || "default";
  const currentPage = Math.max(1, Number(searchParams.get("page")) || 1);

  // ── Price slider local state (synced from URL) ────────────────────────────
  const sliderLow = minPrice ? Math.max(PRICE_MIN, Number(minPrice)) : PRICE_MIN;
  const sliderHigh = maxPrice ? Math.min(PRICE_MAX, Number(maxPrice)) : PRICE_MAX;
  const [sliderValue, setSliderValue] = useState<[number, number]>([sliderLow, sliderHigh]);

  // Debounce slider → URL update
  const sliderDebounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSliderChange = (val: [number, number]) => {
    setSliderValue(val);
    if (sliderDebounceRef.current) clearTimeout(sliderDebounceRef.current);
    sliderDebounceRef.current = setTimeout(() => {
      const updates: Record<string, string | null> = {};
      updates.minPrice = val[0] > PRICE_MIN ? String(val[0]) : null;
      updates.maxPrice = val[1] < PRICE_MAX ? String(val[1]) : null;
      navigate(updates);
    }, 300);
  };

  // Sync slider when URL params change externally (e.g. clear all)
  React.useEffect(() => {
    setSliderValue([
      minPrice ? Math.max(PRICE_MIN, Number(minPrice)) : PRICE_MIN,
      maxPrice ? Math.min(PRICE_MAX, Number(maxPrice)) : PRICE_MAX,
    ]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [minPrice, maxPrice]);

  // ── Compute active filter count ──────────────────────────────────────────
  const activeFilterCount =
    selectedCategories.length +
    selectedAuthors.length +
    selectedPublishers.length +
    (selectedType !== "ALL" ? 1 : 0) +
    (minPrice ? 1 : 0) +
    (maxPrice ? 1 : 0);

  // ── URL navigation helper ────────────────────────────────────────────────
  const navigate = useCallback(
    (updates: Record<string, string | string[] | null>) => {
      const next = buildParams(searchParams, updates);
      startTransition(() => {
        router.push(`${pathname}?${next.toString()}`, { scroll: false });
      });
    },
    [router, pathname, searchParams]
  );

  const setPage = useCallback(
    (page: number) => {
      const next = new URLSearchParams(searchParams.toString());
      next.set("page", String(page));
      startTransition(() => {
        router.push(`${pathname}?${next.toString()}`, { scroll: true });
      });
    },
    [router, pathname, searchParams]
  );

  // ── Toggle helpers (multi-select for category / author / publisher) ───────
  const toggleCategory = (v: string) => {
    const next = selectedCategories.includes(v)
      ? selectedCategories.filter((c) => c !== v)
      : [...selectedCategories, v];
    navigate({ category: next });
  };

  const toggleAuthor = (v: string) => {
    const next = selectedAuthors.includes(v)
      ? selectedAuthors.filter((a) => a !== v)
      : [...selectedAuthors, v];
    navigate({ author: next });
  };

  const togglePublisher = (v: string) => {
    const next = selectedPublishers.includes(v)
      ? selectedPublishers.filter((p) => p !== v)
      : [...selectedPublishers, v];
    navigate({ publisher: next });
  };

  const setType = (t: BookType | "ALL") => navigate({ type: t === "ALL" ? null : t });

  const resetFilters = () => {
    setSliderValue([PRICE_MIN, PRICE_MAX]);
    startTransition(() => {
      router.push(pathname, { scroll: false });
    });
  };

  // ── Debounced search ─────────────────────────────────────────────────────
  const [localSearch, setLocalSearch] = useState(searchTerm);
  const searchDebounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearchChange = (value: string) => {
    setLocalSearch(value);
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      navigate({ q: value || null });
    }, 400);
  };

  // ── API query params ─────────────────────────────────────────────────────
  const sortBy =
    sort === "price_asc" || sort === "price_desc"
      ? "sellPrice"
      : sort === "title_asc"
      ? "title"
      : undefined;
  const sortOrder = sort === "price_asc" || sort === "title_asc" ? "asc" : "desc";

  const queryParams = useMemo(
    () => ({
      searchTerm: searchTerm || undefined,
      // Send multi-value arrays — the service joins them as comma-separated strings for the API
      categories: selectedCategories.length > 0 ? selectedCategories : undefined,
      authors: selectedAuthors.length > 0 ? selectedAuthors : undefined,
      publishers: selectedPublishers.length > 0 ? selectedPublishers : undefined,
      type: selectedType !== "ALL" ? selectedType : undefined,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      page: currentPage,
      limit: BOOKS_PER_PAGE,
      sortBy,
      sortOrder: sortOrder as "asc" | "desc",
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [searchTerm, selectedCategories, selectedAuthors, selectedPublishers, selectedType, minPrice, maxPrice, currentPage, sortBy, sortOrder]
  );

  const { data, isLoading, isError, refetch } = useGetBooks(queryParams);
  const { data: bookOptions, isLoading: optionsLoading } = useGetBookOptions();

  // ── Pagination data from API meta ─────────────────────────────────────────
  const totalBooks = data?.meta?.total ?? data?.total ?? 0;
  const totalPages = data?.meta?.totalPage ?? Math.ceil(totalBooks / BOOKS_PER_PAGE);

  // ── Live filter options ──────────────────────────────────────────────────
  const liveCategories = useMemo(
    () => (bookOptions?.categories ?? []).filter(Boolean).sort((a, b) => a.localeCompare(b)),
    [bookOptions]
  );

  const liveAuthors = useMemo(
    () =>
      (bookOptions?.authors ?? [])
        .map((a) => a.name)
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b)),
    [bookOptions]
  );

  const livePublishers = useMemo(
    () => (bookOptions?.publishers ?? []).filter(Boolean).sort((a, b) => a.localeCompare(b)),
    [bookOptions]
  );

  const books = data?.data ?? [];

  // ── Filter sidebar (shared desktop/mobile) ───────────────────────────────
  const FilterSidebar = (
    <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
      {/* Sidebar header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
        <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-primary" />
          <span>Filter Books</span>
        </h3>
        {activeFilterCount > 0 && (
          <button
            type="button"
            onClick={resetFilters}
            className="text-[11px] text-muted-foreground hover:text-destructive flex items-center gap-1 transition-colors"
          >
            <RefreshCw className="h-3 w-3" />
            Clear all
          </button>
        )}
      </div>

      {/* Sort by — always at the top of the filter bar */}
      <div className="px-4 py-3 border-b border-border/60 bg-muted/10">
        <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5 block">
          Sort By
        </label>
        <select
          value={sort}
          onChange={(e) => navigate({ sort: e.target.value })}
          className="w-full rounded-lg border border-input bg-background px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-primary focus:outline-none"
        >
          <option value="default">Default</option>
          <option value="title_asc">Title: A–Z</option>
          <option value="price_asc">Price: Low → High</option>
          <option value="price_desc">Price: High → Low</option>
        </select>
      </div>

      <div className="px-4 divide-y divide-border/50">
        {/* Search */}
        <FilterSection title="Search" defaultOpen={true}>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              value={localSearch}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Title, author, ISBN..."
              className="w-full rounded-lg border border-input bg-background pl-8 pr-3 py-1.5 text-xs focus:ring-1 focus:ring-primary focus:outline-none"
            />
            {localSearch && (
              <button
                type="button"
                onClick={() => handleSearchChange("")}
                className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        </FilterSection>

        {/* Book Type */}
        <FilterSection title="Book Type" defaultOpen={true} count={selectedType !== "ALL" ? 1 : 0}>
          <div className="flex flex-wrap gap-1.5">
            {(
              [
                { value: "ALL", label: "All" },
                { value: "BORROW_ONLY", label: "Borrow" },
                { value: "SELL_ONLY", label: "Buy" },
                { value: "HYBRID", label: "Both" },
              ] as const
            ).map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => setType(value)}
                className={`px-3 py-1 rounded-full text-[11px] font-semibold border transition-all ${
                  selectedType === value
                    ? "bg-[#004F32] text-white border-[#004F32]"
                    : "bg-background text-muted-foreground border-input hover:border-[#004F32]/50 hover:text-foreground"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </FilterSection>

        {/* Category — multi-select */}
        <FilterSection title="Category" defaultOpen={true} count={selectedCategories.length}>
          <CheckboxList
            items={liveCategories}
            selected={selectedCategories}
            onToggle={toggleCategory}
            maxVisible={7}
            loading={optionsLoading}
          />
        </FilterSection>

        {/* Author — multi-select */}
        <FilterSection title="Author" defaultOpen={false} count={selectedAuthors.length}>
          <CheckboxList
            items={liveAuthors}
            selected={selectedAuthors}
            onToggle={toggleAuthor}
            maxVisible={6}
            loading={optionsLoading}
          />
        </FilterSection>

        {/* Publisher — multi-select */}
        <FilterSection title="Publisher" defaultOpen={false} count={selectedPublishers.length}>
          <CheckboxList
            items={livePublishers}
            selected={selectedPublishers}
            onToggle={togglePublisher}
            maxVisible={6}
            loading={optionsLoading}
          />
        </FilterSection>

        {/* Price Range — dual-handle slider */}
        <FilterSection
          title="Price Range (৳)"
          defaultOpen={false}
          count={(minPrice ? 1 : 0) + (maxPrice ? 1 : 0)}
        >
          <DualRangeSlider
            min={PRICE_MIN}
            max={PRICE_MAX}
            value={sliderValue}
            onChange={handleSliderChange}
            step={PRICE_STEP}
          />
          {/* Quick manual inputs below the slider */}
          <div className="flex items-center gap-2 mt-3">
            <div className="flex-1">
              <label className="text-[10px] text-muted-foreground mb-1 block">Min ৳</label>
              <input
                type="number"
                value={sliderValue[0] === PRICE_MIN ? "" : sliderValue[0]}
                onChange={(e) => {
                  const v = e.target.value === "" ? PRICE_MIN : Number(e.target.value);
                  const clamped = Math.max(PRICE_MIN, Math.min(v, sliderValue[1] - PRICE_STEP));
                  handleSliderChange([clamped, sliderValue[1]]);
                }}
                placeholder={`${PRICE_MIN}`}
                min={PRICE_MIN}
                max={sliderValue[1] - PRICE_STEP}
                className="w-full rounded-lg border border-input bg-background px-2 py-1.5 text-xs focus:ring-1 focus:ring-primary focus:outline-none"
              />
            </div>
            <span className="text-muted-foreground text-xs mt-4">–</span>
            <div className="flex-1">
              <label className="text-[10px] text-muted-foreground mb-1 block">Max ৳</label>
              <input
                type="number"
                value={sliderValue[1] === PRICE_MAX ? "" : sliderValue[1]}
                onChange={(e) => {
                  const v = e.target.value === "" ? PRICE_MAX : Number(e.target.value);
                  const clamped = Math.min(PRICE_MAX, Math.max(v, sliderValue[0] + PRICE_STEP));
                  handleSliderChange([sliderValue[0], clamped]);
                }}
                placeholder={`${PRICE_MAX}`}
                min={sliderValue[0] + PRICE_STEP}
                max={PRICE_MAX}
                className="w-full rounded-lg border border-input bg-background px-2 py-1.5 text-xs focus:ring-1 focus:ring-primary focus:outline-none"
              />
            </div>
          </div>
          {/* Reset price */}
          {(minPrice || maxPrice) && (
            <button
              type="button"
              onClick={() => {
                setSliderValue([PRICE_MIN, PRICE_MAX]);
                navigate({ minPrice: null, maxPrice: null });
              }}
              className="mt-2 text-[11px] text-muted-foreground hover:text-destructive flex items-center gap-1"
            >
              <X className="h-2.5 w-2.5" /> Reset price
            </button>
          )}
        </FilterSection>
      </div>
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Banner */}
      <div className="mb-8 rounded-2xl bg-gradient-to-r from-[#004F32] to-[#003824] p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <span className="inline-block rounded-full bg-amber-500/20 px-3 py-1 text-xs font-semibold text-amber-300 backdrop-blur-xs mb-3 border border-amber-400/30">
            Rajshahi University Islamic Library Catalog
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Browse Authentic Literature &amp; Classical Manuscripts
          </h1>
          <p className="mt-2 text-sm text-emerald-100/90 leading-relaxed">
            Search our curated repository for borrowing or purchasing. Access commentary,
            Hadith collections, and academic research works.
          </p>
        </div>
      </div>

      {/* Mobile: filter toggle */}
      <div className="flex items-center mb-4 lg:hidden">
        <button
          type="button"
          onClick={() => setMobileFiltersOpen((v) => !v)}
          className="inline-flex items-center gap-2 rounded-lg border border-input bg-card px-3 py-2 text-xs font-semibold text-foreground shadow-sm"
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          Filters &amp; Sort
          {activeFilterCount > 0 && (
            <span className="rounded-full bg-[#004F32] text-white text-[10px] font-bold px-1.5 py-0.5">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Mobile filter drawer */}
      {mobileFiltersOpen && (
        <div className="lg:hidden mb-6">
          <div className="relative">
            <button
              type="button"
              onClick={() => setMobileFiltersOpen(false)}
              className="absolute top-2 right-2 z-10 rounded-full p-1 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
            {FilterSidebar}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Desktop filter sidebar */}
        <aside className="hidden lg:block lg:col-span-1 space-y-4">
          {FilterSidebar}
        </aside>

        {/* Catalog main */}
        <main className="lg:col-span-3">
          {/* Toolbar: result count + sort + active chips */}
          <div className="mb-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-primary" />
                <span>
                  {isLoading
                    ? "Loading..."
                    : `${totalBooks} Book${totalBooks !== 1 ? "s" : ""} Found`}
                </span>
                {activeFilterCount > 0 && (
                  <span className="text-xs font-normal text-muted-foreground">
                    (filtered)
                  </span>
                )}
              </h2>
            </div>

            {/* Active filter badges */}
            {activeFilterCount > 0 && (
              <div className="flex flex-wrap gap-1.5 items-center">
                <span className="text-[11px] text-muted-foreground font-medium">
                  Active:
                </span>
                {selectedCategories.map((c) => (
                  <FilterBadge
                    key={`cat-${c}`}
                    label={c}
                    onRemove={() => toggleCategory(c)}
                  />
                ))}
                {selectedAuthors.map((a) => (
                  <FilterBadge
                    key={`auth-${a}`}
                    label={a}
                    onRemove={() => toggleAuthor(a)}
                  />
                ))}
                {selectedPublishers.map((p) => (
                  <FilterBadge
                    key={`pub-${p}`}
                    label={p}
                    onRemove={() => togglePublisher(p)}
                  />
                ))}
                {selectedType !== "ALL" && (
                  <FilterBadge
                    label={
                      selectedType === "BORROW_ONLY"
                        ? "Borrow Only"
                        : selectedType === "SELL_ONLY"
                        ? "Buy Only"
                        : "Borrow & Buy"
                    }
                    onRemove={() => setType("ALL")}
                  />
                )}
                {minPrice && (
                  <FilterBadge
                    label={`Min ৳${minPrice}`}
                    onRemove={() => {
                      setSliderValue([PRICE_MIN, sliderValue[1]]);
                      navigate({ minPrice: null });
                    }}
                  />
                )}
                {maxPrice && (
                  <FilterBadge
                    label={`Max ৳${maxPrice}`}
                    onRemove={() => {
                      setSliderValue([sliderValue[0], PRICE_MAX]);
                      navigate({ maxPrice: null });
                    }}
                  />
                )}
                <button
                  type="button"
                  onClick={resetFilters}
                  className="text-[11px] text-destructive hover:underline font-medium ml-1"
                >
                  Clear all
                </button>
              </div>
            )}
          </div>

          {/* Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {Array.from({ length: BOOKS_PER_PAGE }).map((_, n) => (
                <BookCardSkeleton key={n} />
              ))}
            </div>
          ) : isError ? (
            <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-8 text-center text-destructive">
              <p className="text-sm font-semibold">Failed to load catalog books.</p>
              <button
                onClick={() => refetch()}
                className="mt-3 inline-flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-white shadow-sm"
              >
                <RefreshCw className="h-3.5 w-3.5" /> Retry
              </button>
            </div>
          ) : books.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {books.map((book) => (
                  <BookCard key={book.id} book={book} />
                ))}
              </div>

              {/* Pagination */}
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setPage}
              />

              {/* Pagination info */}
              {totalPages > 1 && (
                <p className="text-center text-[11px] text-muted-foreground mt-3">
                  Page {currentPage} of {totalPages} — {totalBooks} total books
                </p>
              )}
            </>
          ) : (
            <div className="rounded-xl border border-border bg-card p-12 text-center text-muted-foreground">
              <BookOpen className="mx-auto h-10 w-10 text-muted-foreground/40 mb-3" />
              <p className="text-base font-semibold text-foreground">
                No matching books found
              </p>
              <p className="text-xs mt-1">
                Try adjusting your filters, or clear all to see the full catalog.
              </p>
              <button
                onClick={resetFilters}
                className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white shadow-sm"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Reset All Filters
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page wrapper (required for useSearchParams inside Suspense)
// ---------------------------------------------------------------------------
export default function BooksCatalogPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-xs text-muted-foreground">
            Loading Islamic Library Catalog...
          </p>
        </div>
      }
    >
      <BooksCatalogContent />
    </Suspense>
  );
}

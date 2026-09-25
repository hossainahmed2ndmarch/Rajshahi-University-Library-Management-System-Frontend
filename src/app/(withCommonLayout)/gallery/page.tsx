"use client";

import React, { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Image as ImageIcon,
  Sparkles,
  X,
  Maximize2,
  Calendar,
  Search,
  Filter,
  Star,
  Play,
  Share2,
  Download,
  ChevronLeft,
  ChevronRight,
  Building2,
  Layers,
  BookOpen,
  ArrowRight,
  ExternalLink,
  Video,
} from "lucide-react";
import { useGetGalleryItems, useGetGalleryCategories, useSiteAsset } from "@/hooks/useGallery";
import { IGalleryItem, Organization, MediaType } from "@/types/gallery";
import { toast } from "sonner";

export default function GalleryPage() {
  const [activeOrg, setActiveOrg] = useState<string>("ALL");
  const [activeCategory, setActiveCategory] = useState<string>("ALL");
  const [activeMediaType, setActiveMediaType] = useState<string>("ALL");
  const [featuredOnly, setFeaturedOnly] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  // Dynamic header banner asset with fallback
  const { url: headerBannerUrl } = useSiteAsset(
    "gallery_header_banner",
    "https://images.unsplash.com/photo-1507842229451-7f01be7fe82a?q=80&w=1600&auto=format&fit=crop"
  );

  // Fetch gallery items from backend (strictly RUIL and BOTH only)
  const queryOrg = activeOrg === "ALL" ? "RUIL,BOTH" : activeOrg;

  const { data: galleryResponse, isLoading } = useGetGalleryItems({
    org: queryOrg,
    category: activeCategory !== "ALL" ? activeCategory : undefined,
    mediaType: activeMediaType !== "ALL" ? activeMediaType : undefined,
    featured: featuredOnly ? true : undefined,
    isPublished: true,
    isAsset: false,
    limit: 1000,
  });

  const { data: dynamicCategories = [] } = useGetGalleryCategories("RUIL,BOTH");

  // Filter items to guarantee only RUIL and BOTH
  const allItems = useMemo(() => {
    const raw = galleryResponse?.data || [];
    return raw.filter((item) => item.org === "RUIL" || item.org === "BOTH");
  }, [galleryResponse]);

  // Filter client-side search query
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return allItems;
    const q = searchQuery.toLowerCase();
    return allItems.filter(
      (item) =>
        item.title?.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q) ||
        item.category?.toLowerCase().includes(q)
    );
  }, [allItems, searchQuery]);

  // Featured items for top spotlight
  const featuredSpotlight = useMemo(() => {
    return allItems.filter((item) => item.featured).slice(0, 3);
  }, [allItems]);

  // Selected item for Lightbox
  const activeItem: IGalleryItem | null =
    selectedIndex !== null && filteredItems[selectedIndex]
      ? filteredItems[selectedIndex]
      : null;

  // Keyboard navigation for Lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedIndex === null) return;
      if (e.key === "Escape") setSelectedIndex(null);
      if (e.key === "ArrowRight") {
        setSelectedIndex((prev) => (prev !== null && prev < filteredItems.length - 1 ? prev + 1 : 0));
      }
      if (e.key === "ArrowLeft") {
        setSelectedIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : filteredItems.length - 1));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedIndex, filteredItems.length]);

  // Real-time categories extracted from DB and current items (clearing fake categories)
  const categories = useMemo(() => {
    const fromItems = allItems
      .map((item) => item.category?.trim())
      .filter((cat): cat is string => Boolean(cat && cat.length > 0));
    const combined = Array.from(new Set([...dynamicCategories, ...fromItems]))
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b));
    return ["ALL", ...combined];
  }, [dynamicCategories, allItems]);

  // Auto-reset activeCategory if it no longer exists in real categories
  useEffect(() => {
    if (activeCategory !== "ALL" && !categories.includes(activeCategory)) {
      setActiveCategory("ALL");
    }
  }, [categories, activeCategory]);

  const handleShare = (item: IGalleryItem) => {
    if (navigator.share) {
      navigator
        .share({
          title: item.title || "RU Islamic Library Archives",
          text: item.description || "Visual glimpse from Rajshahi University Islamic Library",
          url: window.location.href,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] dark:bg-[#070D0A] text-foreground transition-colors duration-300 pb-24">
      {/* ─── 1. Ultra-Aesthetic Islamic Hero Header ────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#002B1B] via-[#003824] to-[#011F14] text-white pt-16 pb-20 md:pt-24 md:pb-28">
        {/* Ambient background photograph with blur & overlay */}
        <div className="absolute inset-0 z-0 opacity-25 mix-blend-overlay">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={headerBannerUrl}
            alt="Library Archival Background"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Decorative Geometric Radial Highlights */}
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-radial from-emerald-500/20 via-amber-400/10 to-transparent blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          {/* Calligraphic & Badge Accent */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-amber-300 text-xs font-bold tracking-wider uppercase shadow-lg shadow-black/20">
            <Sparkles className="h-4 w-4 text-amber-400 animate-pulse" />
            <span>Visual Archives & Cultural Repository</span>
          </div>

          {/* Arabic Spiritual Calligraphy Header */}
          <div className="space-y-1">
            <p className="font-serif text-lg sm:text-2xl text-amber-200/90 tracking-widest font-normal select-none">
              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
            </p>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
              Glimpses of Knowledge, <br />
              <span className="bg-gradient-to-r from-amber-300 via-amber-200 to-emerald-200 bg-clip-text text-transparent">
                Faith & Heritage
              </span>
            </h1>
          </div>

          <p className="text-xs sm:text-sm md:text-base text-emerald-100/80 max-w-2xl mx-auto leading-relaxed font-normal">
            Step inside our silent reading halls, rare classical manuscripts,
            volunteer book cataloging drives, and academic research seminars across Rajshahi University.
          </p>

          {/* Stats Badges */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs text-emerald-100/90 font-medium">
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-black/30 backdrop-blur-xs border border-white/10">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              <span>
                <strong>{allItems.length || "50+"}</strong> Archived Visuals
              </span>
            </div>
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-black/30 backdrop-blur-xs border border-white/10">
              <span className="h-2 w-2 rounded-full bg-amber-400" />
              <span>
                <strong>10+</strong> Manuscript Collections
              </span>
            </div>
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-black/30 backdrop-blur-xs border border-white/10">
              <span className="h-2 w-2 rounded-full bg-sky-400" />
              <span>
                <strong>2</strong> Collections (RUIL & Joint)
              </span>
            </div>
          </div>

          {/* Search Bar Input */}
          <div className="max-w-xl mx-auto pt-2">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-emerald-200/60 group-focus-within:text-amber-300 transition-colors" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by keywords, study hall, manuscripts, exhibition..."
                className="w-full rounded-2xl bg-black/40 text-white placeholder-emerald-100/50 pl-12 pr-10 py-3.5 text-xs sm:text-sm border border-white/15 focus:outline-none focus:ring-2 focus:ring-amber-400/80 backdrop-blur-md transition-all shadow-xl"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-emerald-200/70 hover:text-white rounded-md"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ─── 2. Interactive Organization & Category Filter Bar ──────────────── */}
      <section className="sticky top-16 z-30 bg-[#FDFBF7]/90 dark:bg-[#070D0A]/90 backdrop-blur-md border-b border-border shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 space-y-3">
          {/* Top Row: Organization Switcher & Media Type */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Organization Segmented Pills: strictly RUIL and Both only */}
            <div className="flex items-center gap-1.5 bg-muted/60 p-1 rounded-2xl border border-border/80">
              <button
                onClick={() => setActiveOrg("ALL")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeOrg === "ALL"
                    ? "bg-[#004F32] text-white shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                All (RUIL & Joint)
              </button>
              <button
                onClick={() => setActiveOrg("RUIL")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeOrg === "RUIL"
                    ? "bg-[#004F32] text-white shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                RU Islamic Library
              </button>
              <button
                onClick={() => setActiveOrg("BOTH")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeOrg === "BOTH"
                    ? "bg-[#004F32] text-white shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Joint Collections
              </button>
            </div>

            {/* Right Controls: Media Type & Featured Toggle */}
            <div className="flex items-center gap-2">
              {/* Media Type Filter */}
              <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-2xl border border-border/80 text-xs">
                <button
                  onClick={() => setActiveMediaType("ALL")}
                  className={`px-3 py-1 rounded-xl font-bold transition-all cursor-pointer ${
                    activeMediaType === "ALL"
                      ? "bg-card text-foreground shadow-xs font-black"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setActiveMediaType("IMAGE")}
                  className={`px-3 py-1 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1 ${
                    activeMediaType === "IMAGE"
                      ? "bg-card text-foreground shadow-xs font-black"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <ImageIcon className="h-3.5 w-3.5" />
                  Photos
                </button>
                <button
                  onClick={() => setActiveMediaType("VIDEO")}
                  className={`px-3 py-1 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1 ${
                    activeMediaType === "VIDEO"
                      ? "bg-card text-foreground shadow-xs font-black"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Video className="h-3.5 w-3.5" />
                  Videos
                </button>
              </div>

              {/* Featured Only Pill */}
              <button
                onClick={() => setFeaturedOnly(!featuredOnly)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all border cursor-pointer ${
                  featuredOnly
                    ? "bg-amber-500 text-slate-950 border-amber-500 shadow-xs"
                    : "bg-muted/40 border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                <Star
                  className={`h-3.5 w-3.5 ${featuredOnly ? "fill-slate-950" : ""}`}
                />
                <span>Featured</span>
              </button>
            </div>
          </div>

          {/* Bottom Row: Category Horizontal Scroll Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none]">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 border ${
                  activeCategory === cat
                    ? "bg-amber-400 text-slate-950 border-amber-400 shadow-sm"
                    : "bg-card border-border/80 text-muted-foreground hover:text-foreground hover:border-primary/40"
                }`}
              >
                {cat === "ALL" ? "All Archives" : cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 3. Main Gallery Showcase ──────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        {isLoading ? (
          /* Loading Skeletons */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="aspect-[4/3] rounded-3xl bg-muted/40 animate-pulse border border-border"
              />
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          /* Empty State */
          <div className="py-20 text-center space-y-4 max-w-md mx-auto">
            <div className="h-16 w-16 rounded-3xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
              <ImageIcon className="h-8 w-8" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-lg text-foreground">
                No visual records found
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                No photographs or videos match your current filter selection. Try selecting
                another category or clearing search terms.
              </p>
            </div>
            <button
              onClick={() => {
                setActiveOrg("ALL");
                setActiveCategory("ALL");
                setActiveMediaType("ALL");
                setFeaturedOnly(false);
                setSearchQuery("");
              }}
              className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-colors cursor-pointer"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          /* Bento / Masonry Fluid Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((item, index) => {
              const isVideo = item.mediaType === "VIDEO";

              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedIndex(index)}
                  className="group relative bg-card rounded-3xl border border-border/80 overflow-hidden shadow-xs hover:shadow-2xl transition-all duration-300 cursor-pointer flex flex-col justify-between"
                >
                  {/* Image Graphic Container */}
                  <div className="aspect-[4/3] relative overflow-hidden bg-slate-900 flex items-center justify-center">
                    {/* Media Thumbnail */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.thumbnail || item.url}
                      alt={item.title || "Archive Image"}
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-108"
                      loading="lazy"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = "none";
                      }}
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30 opacity-60 group-hover:opacity-80 transition-opacity" />

                    {/* Top Badges */}
                    <div className="absolute top-3.5 left-3.5 flex items-center gap-1.5 z-10">
                      <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-black/60 text-amber-300 backdrop-blur-md border border-white/10">
                        {item.org}
                      </span>
                      {item.category && (
                        <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-white/20 text-white backdrop-blur-md border border-white/10">
                          {item.category}
                        </span>
                      )}
                    </div>

                    {/* Star or Video Icon Top Right */}
                    <div className="absolute top-3.5 right-3.5 flex items-center gap-1 z-10">
                      {item.featured && (
                        <span
                          title="Featured Highlight"
                          className="p-1 rounded-lg bg-amber-400 text-slate-950 shadow-md"
                        >
                          <Star className="h-3 w-3 fill-slate-950" />
                        </span>
                      )}
                      {isVideo && (
                        <span className="p-1.5 rounded-lg bg-sky-500/90 text-white backdrop-blur-xs shadow-md">
                          <Play className="h-3 w-3 fill-white" />
                        </span>
                      )}
                    </div>

                    {/* Hover Center Zoom Button */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                      <div className="h-12 w-12 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 text-white flex items-center justify-center transform group-hover:scale-110 transition-transform">
                        {isVideo ? (
                          <Play className="h-5 w-5 fill-white" />
                        ) : (
                          <Maximize2 className="h-5 w-5" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Context Info Footer */}
                  <div className="p-5 space-y-2 flex-1 flex flex-col justify-between bg-card">
                    <div>
                      <h3 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors line-clamp-1">
                        {item.title || "Library Cultural Archive"}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed font-normal">
                        {item.description || "Archived collection piece preserved at RU Library."}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-border/60 flex items-center justify-between text-[11px] text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3 w-3 text-primary" />
                        <span>
                          {new Date(item.createdAt).toLocaleDateString(undefined, {
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>

                      {item.activity && (
                        <span className="text-[10px] font-bold text-primary truncate max-w-[120px]">
                          {item.activity.title}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* ─── 4. Fullscreen Aesthetic Lightbox Modal ────────────────────────── */}
      {activeItem && selectedIndex !== null && (
        <div
          onClick={() => setSelectedIndex(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-3 sm:p-6 animate-in fade-in-50 cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-5xl bg-card border border-border/80 rounded-3xl overflow-hidden shadow-2xl flex flex-col lg:flex-row max-h-[92vh] cursor-default"
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedIndex(null)}
              className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-black/60 text-white hover:bg-black/90 backdrop-blur-md transition-colors cursor-pointer"
              title="Close (Esc)"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Prev / Next Navigation Arrows */}
            {filteredItems.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedIndex((prev) =>
                      prev !== null && prev > 0 ? prev - 1 : filteredItems.length - 1
                    );
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-black/60 text-white hover:bg-black/90 backdrop-blur-md transition-colors cursor-pointer"
                  title="Previous (Arrow Left)"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedIndex((prev) =>
                      prev !== null && prev < filteredItems.length - 1 ? prev + 1 : 0
                    );
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 lg:right-[380px] z-20 p-3 rounded-full bg-black/60 text-white hover:bg-black/90 backdrop-blur-md transition-colors cursor-pointer"
                  title="Next (Arrow Right)"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}

            {/* Media Display Viewport */}
            <div className="flex-1 bg-black flex items-center justify-center relative min-h-[300px] lg:min-h-[550px] overflow-hidden">
              {activeItem.mediaType === "VIDEO" && activeItem.url.includes("youtube.com") ? (
                <iframe
                  src={activeItem.url.replace("watch?v=", "embed/") + "?autoplay=1"}
                  title={activeItem.title || "Video"}
                  className="w-full h-full aspect-video"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : activeItem.mediaType === "VIDEO" ? (
                <video
                  src={activeItem.url}
                  controls
                  autoPlay
                  className="max-h-full max-w-full object-contain"
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={activeItem.url}
                  alt={activeItem.title || "Visual View"}
                  className="max-h-[80vh] max-w-full object-contain select-none"
                />
              )}

              {/* Index Indicator Pill */}
              <div className="absolute bottom-4 left-4 z-10 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white/80 text-xs font-mono font-bold border border-white/10">
                {selectedIndex + 1} / {filteredItems.length}
              </div>
            </div>

            {/* Metadata & Details Sidebar */}
            <div className="w-full lg:w-96 p-6 sm:p-8 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-border bg-card overflow-y-auto">
              <div className="space-y-4">
                {/* Org & Category Badges */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                    {activeItem.org}
                  </span>
                  {activeItem.category && (
                    <span className="px-3 py-1 rounded-lg text-xs font-bold bg-muted text-foreground border border-border">
                      {activeItem.category}
                    </span>
                  )}
                  {activeItem.featured && (
                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-400/20 text-amber-600 dark:text-amber-400 border border-amber-400/30 flex items-center gap-1">
                      <Star className="h-3 w-3 fill-current" />
                      Featured
                    </span>
                  )}
                </div>

                {/* Title */}
                <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight leading-snug">
                  {activeItem.title || "Archival Record"}
                </h2>

                {/* Description Context */}
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {activeItem.description ||
                    "This visual artifact is officially preserved in the Rajshahi University Islamic Library cultural collection."}
                </p>

                {/* Associated Activity Card */}
                {activeItem.activity && (
                  <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-primary">
                      <Layers className="h-3.5 w-3.5" />
                      <span>Associated Program</span>
                    </div>
                    <p className="text-xs font-semibold text-foreground">
                      {activeItem.activity.title}
                    </p>
                    <Link
                      href={`/activities/${activeItem.activity.slug}`}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:underline pt-1"
                    >
                      <span>Explore this activity</span>
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                )}
              </div>

              {/* Action Buttons & Timestamp */}
              <div className="pt-6 border-t border-border space-y-4">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-primary" />
                    <span>
                      Preserved:{" "}
                      {new Date(activeItem.createdAt).toLocaleDateString(undefined, {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleShare(activeItem)}
                    className="flex-1 py-2.5 px-3 rounded-xl border border-border text-xs font-bold hover:bg-muted transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Share2 className="h-4 w-4" />
                    <span>Share</span>
                  </button>
                  <a
                    href={activeItem.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2.5 px-4 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <ExternalLink className="h-4 w-4" />
                    <span>Original</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

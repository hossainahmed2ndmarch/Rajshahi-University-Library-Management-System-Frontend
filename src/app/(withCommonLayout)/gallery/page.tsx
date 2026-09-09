"use client";

import React, { useState } from "react";
import {
  Image as ImageIcon,
  BookOpen,
  Users,
  Sparkles,
  X,
  Maximize2,
  Calendar,
} from "lucide-react";

export default function GalleryPage() {
  const [activeCategory, setActiveCategory] = useState<string>("ALL");
  const [selectedImage, setSelectedImage] = useState<{
    title: string;
    description: string;
    category: string;
    date: string;
  } | null>(null);

  const galleryItems = [
    {
      id: 1,
      title: "Central Islamic Reading Hall",
      category: "Study Halls",
      date: "August 2026",
      description: "Students engaged in individual research and thesis review in the air-conditioned reading room.",
    },
    {
      id: 2,
      title: "Annual Rare Manuscript Exhibition",
      category: "Events",
      date: "July 2026",
      description: "Display of early 20th-century Bengali and Arabic translations of classical Fiqh manuscripts.",
    },
    {
      id: 3,
      title: "Shifter Desk & Barcode Circulation Station",
      category: "Operations",
      date: "August 2026",
      description: "Live check-in and automated borrowing counter at Central Library Bhaban.",
    },
    {
      id: 4,
      title: "Classical Hadith Commentary Stacks",
      category: "Archives",
      date: "June 2026",
      description: "Complete 10-volume Tafsir and Kutub al-Sittah shelves organized by Dewey Decimal class.",
    },
    {
      id: 5,
      title: "Book Donation Sorting & Repair Workshop",
      category: "Events",
      date: "May 2026",
      description: "Volunteers and student shifters indexing incoming community-donated Islamic literature.",
    },
    {
      id: 6,
      title: "Faculty Research & Seminar Corner",
      category: "Study Halls",
      date: "August 2026",
      description: "Dedicated discussion zone for post-graduate scholars and visiting Islamic researchers.",
    },
  ];

  const categories = ["ALL", "Study Halls", "Events", "Operations", "Archives"];

  const filteredItems =
    activeCategory === "ALL"
      ? galleryItems
      : galleryItems.filter((i) => i.category === activeCategory);

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-zinc-950 py-8 sm:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Visual Archives</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground mt-1">
            RU Library Photo Gallery & Archives
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-2">
            Glimpses into our study halls, rare manuscript collections, book donation drives, and academic seminars.
          </p>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeCategory === cat
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "bg-card border border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedImage(item)}
              className="group bg-card rounded-3xl border border-border overflow-hidden shadow-xs hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between"
            >
              {/* Image Container / Placeholder Graphic */}
              <div className="aspect-[4/3] bg-gradient-to-br from-emerald-950/80 via-[#004F32] to-[#002819] flex items-center justify-center relative p-6 text-white group-hover:scale-105 transition-transform duration-500">
                <div className="text-center space-y-2">
                  <div className="h-12 w-12 rounded-2xl bg-white/10 text-amber-300 flex items-center justify-center mx-auto backdrop-blur-xs">
                    <ImageIcon className="h-6 w-6" />
                  </div>
                  <p className="text-xs font-bold font-serif">{item.title}</p>
                </div>

                <span className="absolute top-4 left-4 bg-black/40 backdrop-blur-xs text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md text-amber-300 border border-white/10">
                  {item.category}
                </span>

                <div className="absolute bottom-4 right-4 p-2 rounded-xl bg-black/40 text-white backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity">
                  <Maximize2 className="h-4 w-4" />
                </div>
              </div>

              {/* Text Card */}
              <div className="p-6">
                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mb-1.5">
                  <Calendar className="h-3.5 w-3.5 text-primary" />
                  <span>{item.date}</span>
                </div>
                <h3 className="font-bold text-base text-foreground group-hover:text-primary transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed line-clamp-2">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in-50">
          <div className="w-full max-w-2xl bg-card rounded-3xl border border-border p-6 sm:p-8 shadow-2xl relative space-y-4">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-muted text-muted-foreground hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="aspect-video bg-gradient-to-br from-emerald-950 via-[#004F32] to-[#040D09] rounded-2xl flex items-center justify-center text-white p-8 text-center">
              <div>
                <BookOpen className="h-16 w-16 text-amber-400 mx-auto mb-3 opacity-60" />
                <h2 className="text-xl font-bold font-serif">{selectedImage.title}</h2>
                <span className="inline-block mt-2 text-xs font-semibold px-3 py-1 rounded-full bg-white/10 text-amber-300">
                  {selectedImage.category} • {selectedImage.date}
                </span>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-lg text-foreground">{selectedImage.title}</h3>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1 leading-relaxed">
                {selectedImage.description}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

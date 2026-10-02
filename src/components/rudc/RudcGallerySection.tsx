"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Camera,
  Compass,
  Expand,
  Image as ImageIcon,
  Play,
  Sparkles,
  X,
} from "lucide-react";
import { useGetGalleryItems } from "@/hooks/useGallery";
import { IGalleryItem } from "@/types/gallery";

export function RudcGallerySection() {
  const { data, isLoading } = useGetGalleryItems({ org: "RUDC", limit: 6 });
  const galleryItems: IGalleryItem[] = data?.data || [];
  const [selectedImage, setSelectedImage] = useState<IGalleryItem | null>(null);

  return (
    <section className="py-16 lg:py-24 bg-muted/30 border-y border-border/70">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-500/10 text-[#004F32] dark:text-emerald-400 mb-2">
              <Camera className="h-3.5 w-3.5" />
              <span>মুহূর্ত ও চিত্রশালা</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-foreground">
              Gallery of RUDC (আমাদের ক্যাম্পাস স্মৃতিকথা)
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-2xl">
              দাওয়াহ মাহফিল, বই প্রদর্শনী, ইফতার মাহফিল ও ক্যাম্পাস কার্যক্রমের কিছু মুহূর্ত।
            </p>
          </div>

          <Link
            href="/gallery"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#004F32] dark:text-emerald-400 hover:underline shrink-0"
          >
            <span>সম্পূর্ণ গ্যালারি দেখুন</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-52 rounded-2xl bg-muted animate-pulse border border-border/60"
              />
            ))}
          </div>
        ) : galleryItems.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {galleryItems.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedImage(item)}
                className="group relative h-52 sm:h-64 rounded-2xl overflow-hidden border border-border/70 bg-card cursor-pointer shadow-xs hover:shadow-lg transition-all duration-300"
              >
                <img
                  src={item.url}
                  alt={item.title || "RUDC Gallery"}
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-4 text-white">
                  <div className="flex items-center justify-between">
                    {item.category && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/20 backdrop-blur-md">
                        {item.category}
                      </span>
                    )}
                    {item.mediaType === "VIDEO" && (
                      <span className="p-1.5 rounded-full bg-amber-500 text-slate-950">
                        <Play className="h-3 w-3 fill-current" />
                      </span>
                    )}
                  </div>

                  <div>
                    <h4 className="text-xs sm:text-sm font-bold line-clamp-1">{item.title}</h4>
                    {item.description && (
                      <p className="text-[11px] text-slate-300 line-clamp-1 mt-0.5">
                        {item.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-border p-12 text-center bg-card">
            <ImageIcon className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <h4 className="text-sm font-bold text-foreground">গ্যালারিতে কোনো ছবি পাওয়া যায়নি</h4>
            <p className="text-xs text-muted-foreground mt-1">
              শিঘ্রই নতুন ইভেন্ট ও দাওয়াহ প্রোগ্রামের ছবি আপলোড করা হবে।
            </p>
          </div>
        )}

        {/* Lightbox Modal */}
        {selectedImage && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-in fade-in-50"
            onClick={() => setSelectedImage(null)}
          >
            <div
              className="relative max-w-4xl max-h-[90vh] bg-card border border-border/80 rounded-3xl overflow-hidden shadow-2xl flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="overflow-hidden max-h-[70vh] bg-black flex items-center justify-center">
                <img
                  src={selectedImage.url}
                  alt={selectedImage.title || "Preview"}
                  className="max-h-[70vh] w-auto object-contain"
                />
              </div>

              <div className="p-5 space-y-1 bg-card">
                {selectedImage.category && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-[#004F32] dark:text-emerald-400">
                    {selectedImage.category}
                  </span>
                )}
                <h3 className="text-base font-bold text-foreground">
                  {selectedImage.title || "RUDC Gallery"}
                </h3>
                {selectedImage.description && (
                  <p className="text-xs text-muted-foreground">{selectedImage.description}</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

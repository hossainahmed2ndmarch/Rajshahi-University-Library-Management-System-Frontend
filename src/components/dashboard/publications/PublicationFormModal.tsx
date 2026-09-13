"use client";

import React, { useState, useEffect, useId } from "react";
import Image from "next/image";
import {
  X,
  Newspaper,
  UploadCloud,
  Loader2,
  BookOpen,
  CheckCircle2,
  Calendar,
  Sparkles,
  Link as LinkIcon,
  Image as ImageIcon,
} from "lucide-react";
import { IArticle, ICreateArticlePayload } from "@/types/article";
import { useUploadArticleCover } from "@/hooks/useArticles";
import { useGetBooks } from "@/hooks/useBooks";
import { useGetMe } from "@/hooks/useAuth";
import { toast } from "sonner";

interface PublicationFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedArticle: IArticle | null;
  onSubmit: (data: ICreateArticlePayload) => void;
  isSubmitting: boolean;
}

const COMMON_CATEGORIES = [
  "Monthly Newspaper",
  "Scholarly Article",
  "Library Notice",
  "Manuscript Review",
  "Islamic Research",
  "Book Excerpt",
];

const slugify = (text: string) => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

export function PublicationFormModal({
  isOpen,
  onClose,
  selectedArticle,
  onSubmit,
  isSubmitting,
}: PublicationFormModalProps) {
  const { data: currentUser } = useGetMe();
  const { mutateAsync: uploadCover, isPending: isUploadingCover } = useUploadArticleCover();
  const { data: booksData } = useGetBooks();

  const books = React.useMemo(() => {
    if (!booksData) return [];
    if (Array.isArray(booksData)) return booksData;
    if (typeof booksData === "object" && "data" in booksData && Array.isArray((booksData as any).data)) {
      return (booksData as any).data;
    }
    return [];
  }, [booksData]);

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [isCustomSlug, setIsCustomSlug] = useState(false);
  const [category, setCategory] = useState("Monthly Newspaper");
  const [authorName, setAuthorName] = useState("");
  const [authorDesignation, setAuthorDesignation] = useState("");
  const [content, setContent] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [relatedBookId, setRelatedBookId] = useState<string>("");
  const [totalReadTime, setTotalReadTime] = useState<number>(3);
  const [isPublished, setIsPublished] = useState(true);

  // Initialize or reset state on open/article change
  useEffect(() => {
    if (selectedArticle) {
      setTitle(selectedArticle.title || "");
      setSlug(selectedArticle.slug || "");
      setIsCustomSlug(true);
      setCategory(selectedArticle.category || "Monthly Newspaper");
      setAuthorName(selectedArticle.authorName || "");
      setAuthorDesignation(selectedArticle.authorDesignation || "");
      setContent(selectedArticle.content || "");
      setCoverImage(selectedArticle.coverImage || "");
      setRelatedBookId(selectedArticle.relatedBookId ? String(selectedArticle.relatedBookId) : "");
      setTotalReadTime(selectedArticle.totalReadTime || 3);
      setIsPublished(Boolean(selectedArticle.isPublished));
    } else {
      setTitle("");
      setSlug("");
      setIsCustomSlug(false);
      setCategory("Monthly Newspaper");
      setAuthorName(currentUser?.name || "Library Editorial Board");
      setAuthorDesignation(currentUser?.role === "SUPER_ADMIN" ? "Super Admin" : "Library Administration");
      setContent("");
      setCoverImage("");
      setRelatedBookId("");
      setTotalReadTime(3);
      setIsPublished(true);
    }
  }, [selectedArticle, isOpen, currentUser]);

  // Auto-generate slug while typing title unless manually customized
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    if (!isCustomSlug) {
      setSlug(slugify(newTitle));
    }
  };

  // Upload image to Cloudinary
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const url = await uploadCover({ file, articleId: selectedArticle?.id });
      if (url) {
        setCoverImage(url);
      }
    } catch {
      toast.error("Failed to upload cover image.");
    }
  };

  // Estimate read time on content change
  useEffect(() => {
    if (content) {
      const words = content.trim().split(/\s+/).length;
      const minutes = Math.max(1, Math.ceil(words / 200));
      setTotalReadTime(minutes);
    }
  }, [content]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Please enter a title for the publication.");
      return;
    }
    if (!content.trim()) {
      toast.error("Please enter the publication content.");
      return;
    }
    if (!authorName.trim()) {
      toast.error("Author name is required.");
      return;
    }

    const payload: ICreateArticlePayload = {
      title: title.trim(),
      slug: slug.trim() ? slugify(slug) : slugify(title),
      category: category.trim() || "General",
      authorName: authorName.trim(),
      authorDesignation: authorDesignation.trim() || undefined,
      content: content.trim(),
      coverImage: coverImage.trim() || undefined,
      relatedBookId: relatedBookId ? Number(relatedBookId) : null,
      totalReadTime: Number(totalReadTime) || 3,
      isPublished,
    };

    onSubmit(payload);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in-0">
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-card text-card-foreground border border-border rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/40 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#004F32] text-white">
              <Newspaper className="h-5 w-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">
                {selectedArticle ? "Edit Publication / Article" : "Create New Publication"}
              </h2>
              <p className="text-[11px] text-muted-foreground">
                {selectedArticle
                  ? "Update article content, metadata, or publishing status"
                  : "Publish an article, monthly gazette, research note, or notice"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Title & Slug */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-foreground mb-1">
                Article Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. RU Library Monthly Gazette: September 2026"
                value={title}
                onChange={handleTitleChange}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-input bg-background text-foreground focus:ring-2 focus:ring-[#004F32] focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
                  URL Slug (Auto-generated or custom)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-[11px]">
                    /publications/
                  </span>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => {
                      setIsCustomSlug(true);
                      setSlug(slugify(e.target.value));
                    }}
                    placeholder="ru-library-gazette-sep-2026"
                    className="w-full pl-28 pr-3 py-2 text-xs font-mono rounded-xl border border-input bg-background text-foreground focus:ring-2 focus:ring-[#004F32] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
                  Category
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    list="category-suggestions"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="Select or enter category"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-input bg-background text-foreground focus:ring-2 focus:ring-[#004F32] focus:outline-none"
                  />
                  <datalist id="category-suggestions">
                    {COMMON_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat} />
                    ))}
                  </datalist>
                </div>
              </div>
            </div>
          </div>

          {/* Author Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-border">
            <div>
              <label className="block text-xs font-bold text-foreground mb-1">
                Author Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="e.g. Dr. Tariqur Rahman / Editorial Board"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-input bg-background text-foreground focus:ring-2 focus:ring-[#004F32] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-foreground mb-1">
                Author Designation / Affiliation
              </label>
              <input
                type="text"
                value={authorDesignation}
                onChange={(e) => setAuthorDesignation(e.target.value)}
                placeholder="e.g. Senior Researcher / Faculty of Islamic Studies"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-input bg-background text-foreground focus:ring-2 focus:ring-[#004F32] focus:outline-none"
              />
            </div>
          </div>

          {/* Cover Image Upload / URL */}
          <div className="space-y-2 pt-2 border-t border-border">
            <label className="block text-xs font-bold text-foreground">
              Cover Image (Cloudinary Upload or Web URL)
            </label>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              {/* File upload trigger */}
              <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-muted hover:bg-muted/80 text-foreground text-xs font-semibold cursor-pointer border border-border shrink-0 transition-colors">
                {isUploadingCover ? (
                  <Loader2 className="h-4 w-4 animate-spin text-[#004F32]" />
                ) : (
                  <UploadCloud className="h-4 w-4 text-[#004F32]" />
                )}
                <span>{isUploadingCover ? "Uploading to Cloudinary…" : "Upload Cover Image"}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileChange}
                  disabled={isUploadingCover}
                  className="hidden"
                />
              </label>

              <span className="text-[11px] text-muted-foreground">or direct URL:</span>

              <input
                type="url"
                placeholder="https://images.unsplash.com/..."
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                className="flex-1 px-3 py-2 text-xs rounded-xl border border-input bg-background text-foreground focus:ring-2 focus:ring-[#004F32] focus:outline-none"
              />
            </div>

            {/* Image Preview */}
            {coverImage && (
              <div className="relative h-32 w-full max-w-sm rounded-xl overflow-hidden border border-border mt-2 bg-muted">
                <Image
                  src={coverImage}
                  alt="Cover preview"
                  fill
                  className="object-cover"
                />
                <button
                  type="button"
                  onClick={() => setCoverImage("")}
                  className="absolute top-2 right-2 p-1 rounded-full bg-black/70 text-white hover:bg-red-600 transition-colors"
                  title="Remove image"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Related Book & Read Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-border">
            <div>
              <label className="block text-xs font-bold text-foreground mb-1">
                Link to Catalog Book (Optional)
              </label>
              <select
                value={relatedBookId}
                onChange={(e) => setRelatedBookId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-input bg-background text-foreground focus:ring-2 focus:ring-[#004F32] focus:outline-none cursor-pointer"
              >
                <option value="">-- None / General Publication --</option>
                {books.map((b: any) => (
                  <option key={b.id} value={b.id}>
                    {b.title} ({b.author})
                  </option>
                ))}
              </select>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Displays a "Featured Library Book" card inside the article.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground mb-1">
                Estimated Reading Time (Minutes)
              </label>
              <input
                type="number"
                min={1}
                max={120}
                value={totalReadTime}
                onChange={(e) => setTotalReadTime(Number(e.target.value))}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-input bg-background text-foreground focus:ring-2 focus:ring-[#004F32] focus:outline-none"
              />
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Calculated automatically from word count (~200 wpm).
              </p>
            </div>
          </div>

          {/* Content Area */}
          <div className="pt-2 border-t border-border">
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-foreground">
                Article Body &amp; Content <span className="text-red-500">*</span>
              </label>
              <span className="text-[10px] text-muted-foreground">Markdown supported (## headings, - bullets, etc.)</span>
            </div>
            <textarea
              required
              rows={10}
              placeholder="Write the article content here... Markdown formatting like ## Subheadings and bullet points are supported."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full p-3.5 text-xs font-sans rounded-xl border border-input bg-background text-foreground focus:ring-2 focus:ring-[#004F32] focus:outline-none leading-relaxed"
            />
          </div>

          {/* Publishing Status Toggle */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/40 border border-border">
            <div>
              <p className="text-xs font-bold text-foreground">Publish to Public Portal</p>
              <p className="text-[11px] text-muted-foreground">
                When enabled, visitors can read this article immediately on the /publications page.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsPublished(!isPublished)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                isPublished ? "bg-[#004F32]" : "bg-muted-foreground/30"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  isPublished ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold rounded-xl border border-input bg-background hover:bg-muted text-foreground transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isUploadingCover}
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold rounded-xl bg-[#004F32] hover:bg-emerald-900 text-white shadow-xs disabled:opacity-50 transition-colors cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-amber-300" />
                  <span>Saving Publication…</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 text-amber-300" />
                  <span>{selectedArticle ? "Update Publication" : "Publish Article"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

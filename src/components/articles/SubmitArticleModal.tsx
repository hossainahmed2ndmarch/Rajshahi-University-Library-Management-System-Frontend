"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Newspaper,
  Send,
  Loader2,
  User,
  Mail,
  Type,
  FileText,
  Tag,
  Briefcase,
  Info,
} from "lucide-react";
import { useGetMe } from "@/hooks/useAuth";
import { useGetArticleCategories, useSubmitArticle } from "@/hooks/useArticles";

interface SubmitArticleModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Which org the article is submitted for. Defaults to "RUIL". */
  org?: "RUIL" | "RUDC" | "BOTH";
}

const DEFAULT_CATEGORIES = [
  "ফিকহ ও মাসআলা",
  "আকিদা",
  "তাজকিয়া",
  "সীরাত",
  "ইতিহাস",
  "সমকালীন বিষয়",
  "ক্যাম্পাস জীবন",
  "দাওয়াহ",
  "কুরআন ও তাফসীর",
  "হাদিস",
  "General",
];

export function SubmitArticleModal({ isOpen, onClose, org = "RUIL" }: SubmitArticleModalProps) {
  const { data: currentUser } = useGetMe();
  const { data: categoryCounts } = useGetArticleCategories();
  const { mutate: submitArticle, isPending } = useSubmitArticle();

  const availableCategories = React.useMemo(() => {
    const set = new Set<string>(DEFAULT_CATEGORIES);
    if (categoryCounts && Array.isArray(categoryCounts)) {
      categoryCounts.forEach((c) => {
        if (c.category && c.category.trim()) set.add(c.category.trim());
      });
    }
    return Array.from(set).sort();
  }, [categoryCounts]);

  const [form, setForm] = useState({
    title: "",
    content: "",
    category: "",
    customCategory: "",
    authorName: currentUser?.name ?? "",
    authorDesignation: "",
    authorEmail: currentUser?.email ?? "",
  });

  const [useCustomCategory, setUseCustomCategory] = useState(false);

  // Pre-fill author info when user data loads
  useEffect(() => {
    if (currentUser) {
      setForm((prev) => ({
        ...prev,
        authorName: prev.authorName || currentUser.name || "",
        authorEmail: prev.authorEmail || currentUser.email || "",
      }));
    }
  }, [currentUser]);

  // Reset form on open/close
  useEffect(() => {
    if (isOpen) {
      setForm({
        title: "",
        content: "",
        category: "",
        customCategory: "",
        authorName: currentUser?.name ?? "",
        authorDesignation: "",
        authorEmail: currentUser?.email ?? "",
      });
      setUseCustomCategory(false);
    }
  }, [isOpen]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const resolvedCategory = useCustomCategory
      ? form.customCategory.trim()
      : form.category.trim();

    if (!resolvedCategory) {
      return;
    }

    submitArticle(
      {
        org,
        title: form.title.trim(),
        content: form.content.trim(),
        category: resolvedCategory,
        authorName: form.authorName.trim() || "Guest Contributor",
        authorDesignation: form.authorDesignation.trim() || null,
        authorEmail: form.authorEmail.trim() || null,
      },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-sm overflow-y-auto py-6 px-4">
      <div className="relative w-full max-w-2xl bg-card rounded-3xl shadow-2xl border border-border/80 my-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/60">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-emerald-500/10 text-[#004F32] dark:text-emerald-400">
              <Newspaper className="h-4 w-4" />
            </span>
            <div>
              <h2 className="text-sm font-black text-foreground">প্রবন্ধ জমা দিন</h2>
              <p className="text-[10px] text-muted-foreground">
                Submit Article for Review — Admin will approve before publishing
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-muted transition-colors text-muted-foreground cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Notice */}
        <div className="mx-6 mt-4 flex items-start gap-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 px-4 py-3 text-amber-700 dark:text-amber-300">
          <Info className="h-3.5 w-3.5 shrink-0 mt-0.5" />
          <p className="text-[11px] leading-relaxed">
            আপনার প্রবন্ধ জমা দেওয়ার পর অ্যাডমিন কর্তৃক পর্যালোচনা করে প্রকাশ করা হবে।
            গবেষণামূলক, দাওয়াহ-বিষয়ক এবং ইসলামী বিষয়ে লেখা স্বাগত।
          </p>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* Author Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-foreground flex items-center gap-1">
                <User className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                লেখকের নাম <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="authorName"
                required
                value={form.authorName}
                onChange={handleChange}
                placeholder="আপনার পূর্ণ নাম"
                className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-foreground flex items-center gap-1">
                <Mail className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                ইমেইল (ঐচ্ছিক)
              </label>
              <input
                type="email"
                name="authorEmail"
                value={form.authorEmail}
                onChange={handleChange}
                placeholder="your@email.com"
                className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              />
            </div>
          </div>

          {/* Designation */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-foreground flex items-center gap-1">
              <Briefcase className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
              পদবি / বিভাগ (ঐচ্ছিক)
            </label>
            <input
              type="text"
              name="authorDesignation"
              value={form.authorDesignation}
              onChange={handleChange}
              placeholder="যেমন: পদার্থবিজ্ঞান বিভাগ, ২য় বর্ষ — রাবি"
              className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            />
          </div>

          {/* Title */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-foreground flex items-center gap-1">
              <Type className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
              প্রবন্ধের শিরোনাম <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              required
              value={form.title}
              onChange={handleChange}
              placeholder="প্রবন্ধের শিরোনাম লিখুন"
              className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            />
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-foreground flex items-center gap-1">
              <Tag className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
              বিষয়শ্রেণী <span className="text-rose-500">*</span>
            </label>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-1.5 text-[10px] text-muted-foreground cursor-pointer">
                <input
                  type="radio"
                  name="catType"
                  checked={!useCustomCategory}
                  onChange={() => setUseCustomCategory(false)}
                  className="accent-emerald-600"
                />
                বিদ্যমান বিষয়
              </label>
              <label className="flex items-center gap-1.5 text-[10px] text-muted-foreground cursor-pointer">
                <input
                  type="radio"
                  name="catType"
                  checked={useCustomCategory}
                  onChange={() => setUseCustomCategory(true)}
                  className="accent-emerald-600"
                />
                নতুন বিষয়
              </label>
            </div>
            {!useCustomCategory ? (
              <select
                name="category"
                required={!useCustomCategory}
                value={form.category}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              >
                <option value="">— বিষয়শ্রেণী বেছে নিন —</option>
                {availableCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                name="customCategory"
                required={useCustomCategory}
                value={form.customCategory}
                onChange={handleChange}
                placeholder="নতুন বিষয়শ্রেণী লিখুন"
                className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              />
            )}
          </div>

          {/* Content */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-foreground flex items-center gap-1">
              <FileText className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
              প্রবন্ধের বিষয়বস্তু <span className="text-rose-500">*</span>
            </label>
            <textarea
              name="content"
              required
              rows={10}
              value={form.content}
              onChange={handleChange}
              placeholder="এখানে আপনার প্রবন্ধ লিখুন… (বাংলা বা English উভয়েই গ্রহণযোগ্য)"
              className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30 resize-y leading-relaxed"
            />
            <p className="text-[10px] text-muted-foreground">
              {form.content.trim().split(/\s+/).filter(Boolean).length} শব্দ — ন্যূনতম ২০০ শব্দ পাঠানো ভালো।
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-border/50">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-border bg-background text-xs font-semibold text-foreground hover:bg-muted transition-colors cursor-pointer"
            >
              বাতিল
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-[#004F32] hover:bg-[#003e27] text-white text-xs font-black shadow-xs transition-colors disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Send className="h-3.5 w-3.5" />
              )}
              <span>{isPending ? "জমা হচ্ছে…" : "প্রবন্ধ জমা দিন"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

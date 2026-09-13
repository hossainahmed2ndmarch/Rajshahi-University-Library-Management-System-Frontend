"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Newspaper,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  Eye,
  Edit2,
  Trash2,
  ExternalLink,
  Tag,
  Filter,
  AlertCircle,
  FileText,
  Sparkles,
} from "lucide-react";
import {
  useGetArticles,
  useCreateArticle,
  useUpdateArticle,
  useDeleteArticle,
} from "@/hooks/useArticles";
import { IArticle, ICreateArticlePayload } from "@/types/article";
import { PublicationFormModal } from "@/components/dashboard/publications/PublicationFormModal";
import { PublicationDeleteModal } from "@/components/dashboard/publications/PublicationDeleteModal";
import { format } from "date-fns";
import { toast } from "sonner";

type StatusFilter = "ALL" | "PUBLISHED" | "DRAFT";

export default function AdminPublicationsPage() {
  const { data: articlesData, isLoading } = useGetArticles({
    isPublished: "ALL", // Fetch both drafts and published for admin
  });

  const { mutate: createArticle, isPending: isCreating } = useCreateArticle();
  const { mutate: updateArticle, isPending: isUpdating } = useUpdateArticle();
  const { mutate: deleteArticle, isPending: isDeleting } = useDeleteArticle();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<IArticle | null>(null);
  const [deletingArticle, setDeletingArticle] = useState<IArticle | null>(null);

  const articles: IArticle[] = useMemo(() => {
    if (!articlesData) return [];
    if (Array.isArray(articlesData)) return articlesData;
    if (typeof articlesData === "object" && "data" in articlesData && Array.isArray((articlesData as any).data)) {
      return (articlesData as any).data;
    }
    return [];
  }, [articlesData]);

  // Extract unique categories for filter
  const categories = useMemo(() => {
    const set = new Set<string>();
    articles.forEach((a) => {
      if (a.category) set.add(a.category.trim());
    });
    return ["ALL", ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, [articles]);

  // Filtered articles list
  const filteredArticles = useMemo(() => {
    return articles.filter((a) => {
      const term = search.toLowerCase().trim();
      const matchesSearch =
        !term ||
        a.title.toLowerCase().includes(term) ||
        a.authorName.toLowerCase().includes(term) ||
        a.category.toLowerCase().includes(term) ||
        a.slug.toLowerCase().includes(term);

      const matchesStatus =
        statusFilter === "ALL"
          ? true
          : statusFilter === "PUBLISHED"
          ? a.isPublished === true
          : a.isPublished === false;

      const matchesCategory =
        categoryFilter === "ALL" || a.category.toLowerCase() === categoryFilter.toLowerCase();

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [articles, search, statusFilter, categoryFilter]);

  // Summary stats
  const totalArticles = articles.length;
  const publishedCount = articles.filter((a) => a.isPublished).length;
  const draftCount = articles.filter((a) => !a.isPublished).length;
  const totalViews = articles.reduce((acc, a) => acc + (a.totalViews || 0), 0);

  // Toggle publish status handler
  const handleTogglePublish = (article: IArticle) => {
    const newStatus = !article.isPublished;
    updateArticle({
      id: article.id,
      isPublished: newStatus,
    });
  };

  // Modal handlers
  const handleOpenAdd = () => {
    setEditingArticle(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (article: IArticle) => {
    setEditingArticle(article);
    setIsFormModalOpen(true);
  };

  const handleFormSubmit = (payload: ICreateArticlePayload) => {
    if (editingArticle) {
      updateArticle(
        {
          id: editingArticle.id,
          ...payload,
        },
        {
          onSuccess: () => {
            setIsFormModalOpen(false);
            setEditingArticle(null);
          },
        }
      );
    } else {
      createArticle(payload, {
        onSuccess: () => {
          setIsFormModalOpen(false);
        },
      });
    }
  };

  const handleDeleteConfirm = (id: number) => {
    deleteArticle(id, {
      onSuccess: () => {
        setDeletingArticle(null);
      },
    });
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#004F32] text-white">
              <Newspaper className="h-5 w-5 text-amber-300" />
            </div>
            <span>Publications &amp; Articles Management</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Publish research articles, monthly gazettes, manuscript reviews, and library announcements to the public portal.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 rounded-xl bg-[#004F32] hover:bg-emerald-900 px-4 py-2.5 text-xs font-bold text-white shadow-xs transition-all cursor-pointer shrink-0"
        >
          <Plus className="h-4 w-4 text-amber-300" />
          <span>New Publication</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            label: "Total Publications",
            value: totalArticles,
            icon: <Newspaper className="h-4 w-4" />,
            color: "text-[#004F32] dark:text-emerald-400",
            bg: "bg-[#004F32]/10",
          },
          {
            label: "Published on Portal",
            value: publishedCount,
            icon: <CheckCircle2 className="h-4 w-4" />,
            color: "text-emerald-600 dark:text-emerald-400",
            bg: "bg-emerald-500/10",
          },
          {
            label: "Drafts / Staged",
            value: draftCount,
            icon: <Clock className="h-4 w-4" />,
            color: "text-amber-600 dark:text-amber-400",
            bg: "bg-amber-500/10",
          },
          {
            label: "Total Reader Views",
            value: totalViews,
            icon: <Eye className="h-4 w-4" />,
            color: "text-blue-600 dark:text-blue-400",
            bg: "bg-blue-500/10",
          },
        ].map(({ label, value, icon, color, bg }) => (
          <div key={label} className="rounded-2xl border border-border bg-card p-4 space-y-1.5 shadow-xs">
            <div className={`h-8 w-8 rounded-xl ${bg} flex items-center justify-center ${color}`}>
              {icon}
            </div>
            <p className={`text-xl font-extrabold ${color}`}>{value}</p>
            <p className="text-[11px] text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by article title, author, category, slug…"
            className="w-full rounded-xl border border-input bg-card pl-9 pr-3 py-2 text-xs focus:ring-2 focus:ring-[#004F32] focus:outline-none"
          />
        </div>

        {/* Category selector */}
        <div className="flex items-center gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-xl border border-input bg-card px-3 py-2 text-xs text-foreground focus:ring-2 focus:ring-[#004F32] focus:outline-none cursor-pointer"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c === "ALL" ? "All Categories" : c}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter Buttons */}
        <div className="flex gap-1.5">
          {(
            [
              { val: "ALL", label: "All" },
              { val: "PUBLISHED", label: "Published" },
              { val: "DRAFT", label: "Drafts" },
            ] as const
          ).map(({ val, label }) => (
            <button
              key={val}
              onClick={() => setStatusFilter(val)}
              className={`rounded-xl px-3 py-2 text-xs font-bold transition-colors cursor-pointer ${
                statusFilter === val
                  ? "bg-[#004F32] text-white"
                  : "border border-input bg-card text-muted-foreground hover:bg-accent"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Publications Table */}
      <div className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-muted-foreground">
            Loading library publications directory…
          </div>
        ) : filteredArticles.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground text-xs space-y-2">
            <Newspaper className="h-8 w-8 mx-auto text-muted opacity-40" />
            <p>No publications match your search or filter criteria.</p>
            <button
              onClick={handleOpenAdd}
              className="px-3 py-1.5 rounded-lg bg-[#004F32] text-white font-bold text-xs cursor-pointer inline-flex items-center gap-1.5 mt-2"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Create New Publication</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-muted-foreground font-semibold">
                  <th className="px-4 py-3">Article &amp; Cover</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Author</th>
                  <th className="px-4 py-3">Read Time / Views</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredArticles.map((article) => {
                  return (
                    <tr key={article.id} className="hover:bg-muted/30 transition-colors">
                      {/* Cover & Title */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="relative h-12 w-16 rounded-lg overflow-hidden bg-muted shrink-0 border border-border">
                            {article.coverImage ? (
                              <Image
                                src={article.coverImage}
                                alt={article.title}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <Newspaper className="h-5 w-5 text-muted-foreground m-auto" />
                            )}
                          </div>
                          <div className="min-w-0 max-w-sm">
                            <p className="font-bold text-foreground line-clamp-1">
                              {article.title}
                            </p>
                            <p className="text-[11px] text-muted-foreground font-mono truncate">
                              /publications/{article.slug}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold bg-[#004F32]/10 text-[#004F32] dark:text-emerald-400">
                          <Tag className="h-3 w-3" />
                          <span>{article.category}</span>
                        </span>
                      </td>

                      {/* Author */}
                      <td className="px-4 py-3">
                        <div className="space-y-0.5">
                          <p className="font-semibold text-foreground leading-tight">
                            {article.authorName}
                          </p>
                          {article.authorDesignation && (
                            <p className="text-[10px] text-muted-foreground truncate max-w-[150px]">
                              {article.authorDesignation}
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Read Time & Views */}
                      <td className="px-4 py-3">
                        <div className="space-y-0.5 font-mono text-[11px] text-muted-foreground">
                          <p className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{article.totalReadTime || 3} min</span>
                          </p>
                          <p className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            <span>{article.totalViews || 0} views</span>
                          </p>
                        </div>
                      </td>

                      {/* Status Toggle */}
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => handleTogglePublish(article)}
                          title="Click to toggle published / draft status"
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer transition-all hover:opacity-80 ${
                            article.isPublished
                              ? "bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300/40"
                              : "bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300/40"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              article.isPublished ? "bg-emerald-600 dark:bg-emerald-400" : "bg-amber-600 dark:bg-amber-400"
                            }`}
                          />
                          <span>{article.isPublished ? "Published" : "Draft"}</span>
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Live preview link */}
                          <Link
                            href={`/publications/${article.slug || article.id}`}
                            target="_blank"
                            title="View Public Publication"
                            className="p-1.5 rounded-lg border border-input bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </Link>

                          {/* Edit button */}
                          <button
                            onClick={() => handleOpenEdit(article)}
                            title="Edit Publication"
                            className="inline-flex items-center gap-1 p-1.5 rounded-lg border border-input bg-card hover:bg-[#004F32]/10 text-[#004F32] dark:text-emerald-400 text-xs font-semibold transition-colors cursor-pointer"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                            <span className="hidden xl:inline text-[11px]">Edit</span>
                          </button>

                          {/* Delete button */}
                          <button
                            onClick={() => setDeletingArticle(article)}
                            title="Delete Publication"
                            className="p-1.5 rounded-lg border border-input bg-card hover:bg-red-500/10 text-red-600 dark:text-red-400 transition-colors cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Form Modal (Create / Edit) */}
      <PublicationFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingArticle(null);
        }}
        selectedArticle={editingArticle}
        onSubmit={handleFormSubmit}
        isSubmitting={isCreating || isUpdating}
      />

      {/* Delete Confirmation Modal */}
      <PublicationDeleteModal
        isOpen={Boolean(deletingArticle)}
        onClose={() => setDeletingArticle(null)}
        article={deletingArticle}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
      />
    </div>
  );
}

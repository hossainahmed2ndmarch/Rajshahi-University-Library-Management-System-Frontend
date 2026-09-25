"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Image as ImageIcon,
  Video,
  Plus,
  Search,
  Filter,
  Star,
  Eye,
  EyeOff,
  Edit2,
  Trash2,
  ExternalLink,
  LayoutGrid,
  Table as TableIcon,
  Sparkles,
  Calendar,
  Building2,
  Layers,
  CheckCircle2,
  AlertCircle,
  Maximize2,
  RefreshCw,
} from "lucide-react";
import {
  IGalleryItem,
  ICreateGalleryItemPayload,
  IUpdateGalleryItemPayload,
  Organization,
  MediaType,
} from "@/types/gallery";
import {
  useGetGalleryItems,
  useCreateGalleryItem,
  useUpdateGalleryItem,
  useDeleteGalleryItem,
  useTogglePublishGalleryItem,
  useToggleFeatureGalleryItem,
  useGetGalleryCategories,
} from "@/hooks/useGallery";
import { GalleryFormModal } from "./GalleryFormModal";

interface GalleryManagerViewProps {
  baseRoute: "/dashboard/admin/gallery" | "/dashboard/super-admin/gallery";
  canDelete?: boolean;
}

export function GalleryManagerView({
  baseRoute,
  canDelete = true,
}: GalleryManagerViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrg, setSelectedOrg] = useState<string>("ALL");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedMediaType, setSelectedMediaType] = useState<string>("ALL");
  const [publishedFilter, setPublishedFilter] = useState<string>("ALL");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<IGalleryItem | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [previewItem, setPreviewItem] = useState<IGalleryItem | null>(null);

  // Queries & Mutations
  const {
    data: galleryData,
    isLoading,
    refetch,
  } = useGetGalleryItems({
    searchTerm,
    org: selectedOrg !== "ALL" ? selectedOrg : undefined,
    category: selectedCategory !== "ALL" ? selectedCategory : undefined,
    mediaType: selectedMediaType !== "ALL" ? selectedMediaType : undefined,
    isPublished:
      publishedFilter === "PUBLISHED"
        ? true
        : publishedFilter === "DRAFT"
        ? false
        : undefined,
    isAsset: false, // Manage general visual gallery items (assets have dedicated tab)
    limit: 1000,
  });

  const { data: categories = [] } = useGetGalleryCategories();
  const createMutation = useCreateGalleryItem();
  const updateMutation = useUpdateGalleryItem();
  const deleteMutation = useDeleteGalleryItem();
  const togglePublishMutation = useTogglePublishGalleryItem();
  const toggleFeatureMutation = useToggleFeatureGalleryItem();

  const items = galleryData?.data || [];

  // Metrics
  const totalCount = items.length;
  const publishedCount = items.filter((i) => i.isPublished).length;
  const featuredCount = items.filter((i) => i.featured).length;
  const videoCount = items.filter((i) => i.mediaType === "VIDEO").length;

  const handleOpenCreate = () => {
    setEditingItem(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (item: IGalleryItem) => {
    setEditingItem(item);
    setModalOpen(true);
  };

  const handleSave = async (
    payload: ICreateGalleryItemPayload | IUpdateGalleryItemPayload
  ) => {
    if ("id" in payload) {
      await updateMutation.mutateAsync(payload);
    } else {
      await createMutation.mutateAsync(payload);
    }
  };

  const handleDelete = async (id: number) => {
    await deleteMutation.mutateAsync(id);
    setDeletingId(null);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner & Action Bar */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950 via-[#003824] to-[#012619] p-6 sm:p-8 text-white border border-emerald-800/40 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-300 text-xs font-bold tracking-wide uppercase">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Media & Visual Archives</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Gallery & Exhibition Manager
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/70 max-w-xl">
              Curate high-resolution photographs, historical manuscripts, study hall glimpses,
              and video documentation across RUIL and RUDC circles.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/gallery"
              target="_blank"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 text-emerald-100 hover:bg-white/20 text-xs font-bold backdrop-blur-xs transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
              <span>Public Showcase</span>
            </Link>
            <button
              onClick={handleOpenCreate}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-lg shadow-amber-950/20 transition-all transform hover:scale-[1.02] cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Add New Visual</span>
            </button>
          </div>
        </div>

        {/* Quick Stats Strip */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-emerald-800/40">
          <div className="bg-emerald-900/30 rounded-2xl p-3 border border-emerald-800/30 backdrop-blur-xs">
            <p className="text-[11px] font-medium text-emerald-200">Total Archives</p>
            <p className="text-xl font-black text-white mt-0.5">{totalCount}</p>
          </div>
          <div className="bg-emerald-900/30 rounded-2xl p-3 border border-emerald-800/30 backdrop-blur-xs">
            <p className="text-[11px] font-medium text-emerald-200">Published Live</p>
            <p className="text-xl font-black text-emerald-300 mt-0.5">{publishedCount}</p>
          </div>
          <div className="bg-emerald-900/30 rounded-2xl p-3 border border-emerald-800/30 backdrop-blur-xs">
            <p className="text-[11px] font-medium text-emerald-200">Featured Spotlight</p>
            <p className="text-xl font-black text-amber-300 mt-0.5">{featuredCount}</p>
          </div>
          <div className="bg-emerald-900/30 rounded-2xl p-3 border border-emerald-800/30 backdrop-blur-xs">
            <p className="text-[11px] font-medium text-emerald-200">Video Logs</p>
            <p className="text-xl font-black text-sky-300 mt-0.5">{videoCount}</p>
          </div>
        </div>
      </div>

      {/* 2. Controls & Filter Bar */}
      <div className="bg-card rounded-2xl border border-border p-4 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search visual titles, descriptions, categories..."
              className="w-full rounded-xl border border-input bg-background pl-10 pr-3.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Filters Group */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Org Selector */}
            <select
              value={selectedOrg}
              onChange={(e) => setSelectedOrg(e.target.value)}
              className="rounded-xl border border-input bg-background px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="ALL">All Organizations</option>
              <option value="RUIL">RUIL Only</option>
              <option value="RUDC">RUDC Only</option>
              <option value="BOTH">Joint / Both</option>
            </select>

            {/* Category Selector */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="rounded-xl border border-input bg-background px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="ALL">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            {/* Media Type Selector */}
            <select
              value={selectedMediaType}
              onChange={(e) => setSelectedMediaType(e.target.value)}
              className="rounded-xl border border-input bg-background px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="ALL">All Media Types</option>
              <option value="IMAGE">Photographs</option>
              <option value="VIDEO">Videos</option>
            </select>

            {/* Published Status Selector */}
            <select
              value={publishedFilter}
              onChange={(e) => setPublishedFilter(e.target.value)}
              className="rounded-xl border border-input bg-background px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="ALL">All Status</option>
              <option value="PUBLISHED">Published</option>
              <option value="DRAFT">Unpublished (Draft)</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 bg-muted rounded-xl p-1 border border-border">
              <button
                onClick={() => setViewMode("grid")}
                title="Card Grid View"
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === "grid"
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("table")}
                title="Data Table View"
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === "table"
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <TableIcon className="h-4 w-4" />
              </button>
            </div>

            <button
              onClick={() => refetch()}
              className="p-2 text-muted-foreground hover:text-foreground rounded-xl border border-border bg-background hover:bg-muted transition-colors cursor-pointer"
              title="Refresh"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 3. Items View */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="aspect-square bg-muted/40 rounded-3xl animate-pulse border border-border"
            />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border bg-card p-12 text-center space-y-4">
          <div className="h-16 w-16 rounded-3xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
            <ImageIcon className="h-8 w-8" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-base text-foreground">No gallery visuals found</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              {searchTerm || selectedCategory !== "ALL" || selectedOrg !== "ALL"
                ? "Try clearing your filters or search keywords."
                : "Begin curating your library archive by uploading your first image or video."}
            </p>
          </div>
          <button
            onClick={handleOpenCreate}
            className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-xs inline-flex items-center gap-2 hover:bg-primary/90 transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Add First Visual
          </button>
        </div>
      ) : viewMode === "grid" ? (
        /* Bento / Card Grid View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {items.map((item) => (
            <div
              key={item.id}
              className="group bg-card rounded-3xl border border-border overflow-hidden shadow-xs hover:shadow-xl transition-all flex flex-col justify-between"
            >
              {/* Image Preview Container */}
              <div className="aspect-[4/3] bg-muted/30 relative overflow-hidden flex items-center justify-center">
                {item.mediaType === "VIDEO" && item.url.includes("youtube.com") ? (
                  <iframe
                    src={item.url.replace("watch?v=", "embed/")}
                    title={item.title || "Video"}
                    className="w-full h-full pointer-events-none"
                  />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.url}
                    alt={item.title || "Gallery Visual"}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = "none";
                    }}
                  />
                )}

                {/* Organization & Category Badges */}
                <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-black/60 text-amber-300 backdrop-blur-xs border border-white/10">
                    {item.org}
                  </span>
                  {item.category && (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-black/40 text-white backdrop-blur-xs border border-white/10">
                      {item.category}
                    </span>
                  )}
                </div>

                {/* Media Type Icon Badge */}
                <div className="absolute top-3 right-3 flex items-center gap-1.5">
                  {item.featured && (
                    <span
                      title="Featured Highlight"
                      className="p-1 rounded-md bg-amber-500 text-slate-950 shadow-xs"
                    >
                      <Star className="h-3 w-3 fill-slate-950" />
                    </span>
                  )}
                  <span className="p-1 rounded-md bg-black/50 text-white backdrop-blur-xs">
                    {item.mediaType === "VIDEO" ? (
                      <Video className="h-3 w-3 text-sky-400" />
                    ) : (
                      <ImageIcon className="h-3 w-3" />
                    )}
                  </span>
                </div>

                {/* Hover Quick Actions */}
                <div className="absolute inset-0 bg-black/60 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-4">
                  <button
                    onClick={() => setPreviewItem(item)}
                    className="p-2.5 rounded-xl bg-white/20 text-white hover:bg-white hover:text-slate-950 transition-colors cursor-pointer"
                    title="Preview Visual"
                  >
                    <Maximize2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => toggleFeatureMutation.mutate(item.id)}
                    className={`p-2.5 rounded-xl transition-colors cursor-pointer ${
                      item.featured
                        ? "bg-amber-500 text-slate-950"
                        : "bg-white/20 text-white hover:bg-amber-500 hover:text-slate-950"
                    }`}
                    title={item.featured ? "Unmark Featured" : "Mark as Featured"}
                  >
                    <Star
                      className={`h-4 w-4 ${item.featured ? "fill-slate-950" : ""}`}
                    />
                  </button>
                  <button
                    onClick={() => togglePublishMutation.mutate(item.id)}
                    className={`p-2.5 rounded-xl transition-colors cursor-pointer ${
                      item.isPublished
                        ? "bg-emerald-500 text-white"
                        : "bg-white/20 text-white hover:bg-emerald-500"
                    }`}
                    title={item.isPublished ? "Unpublish" : "Publish to Gallery"}
                  >
                    {item.isPublished ? (
                      <Eye className="h-4 w-4" />
                    ) : (
                      <EyeOff className="h-4 w-4" />
                    )}
                  </button>
                  <button
                    onClick={() => handleOpenEdit(item)}
                    className="p-2.5 rounded-xl bg-white/20 text-white hover:bg-white hover:text-slate-950 transition-colors cursor-pointer"
                    title="Edit Item"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  {canDelete && (
                    <button
                      onClick={() => setDeletingId(item.id)}
                      className="p-2.5 rounded-xl bg-red-500/80 text-white hover:bg-red-600 transition-colors cursor-pointer"
                      title="Delete Item"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Card Meta Description */}
              <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-sm text-foreground line-clamp-1">
                    {item.title || "Untitled Archive Item"}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                    {item.description || "No context description provided."}
                  </p>
                </div>

                <div className="pt-3 border-t border-border/60 flex items-center justify-between text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(item.createdAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>

                  <span
                    className={`px-2 py-0.5 rounded-md font-semibold text-[10px] ${
                      item.isPublished
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                    }`}
                  >
                    {item.isPublished ? "Live" : "Draft"}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Data Table View */
        <div className="rounded-3xl border border-border bg-card overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/50 border-b border-border text-muted-foreground uppercase tracking-wider font-bold">
                <tr>
                  <th className="py-3 px-4">Visual</th>
                  <th className="py-3 px-4">Title & Context</th>
                  <th className="py-3 px-4">Org</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Featured</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border font-medium">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/20 transition-colors">
                    <td className="py-3 px-4">
                      <div className="h-12 w-16 rounded-xl overflow-hidden bg-muted relative border border-border">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.url}
                          alt={item.title || "Visual"}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = "none";
                          }}
                        />
                      </div>
                    </td>
                    <td className="py-3 px-4 max-w-xs">
                      <p className="font-bold text-foreground truncate">
                        {item.title || "Untitled Visual"}
                      </p>
                      <p className="text-[11px] text-muted-foreground truncate">
                        {item.description || "No description"}
                      </p>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-md font-mono text-[10px] font-bold bg-muted border border-border">
                        {item.org}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-muted-foreground">{item.category || "General"}</span>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => togglePublishMutation.mutate(item.id)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-colors cursor-pointer ${
                          item.isPublished
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20"
                            : "bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20"
                        }`}
                      >
                        {item.isPublished ? "Published" : "Draft"}
                      </button>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => toggleFeatureMutation.mutate(item.id)}
                        className="cursor-pointer"
                        title={item.featured ? "Remove featured" : "Make featured"}
                      >
                        <Star
                          className={`h-4 w-4 ${
                            item.featured
                              ? "text-amber-500 fill-amber-500"
                              : "text-muted-foreground/40 hover:text-amber-500"
                          }`}
                        />
                      </button>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setPreviewItem(item)}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                          title="Preview"
                        >
                          <Maximize2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                          title="Edit"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        {canDelete && (
                          <button
                            onClick={() => setDeletingId(item.id)}
                            className="p-1.5 rounded-lg text-red-500/80 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. Form Modal */}
      <GalleryFormModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingItem(null);
        }}
        item={editingItem}
        onSave={handleSave}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
      />

      {/* 5. Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in-50">
          <div className="w-full max-w-md bg-card rounded-3xl border border-border p-6 shadow-2xl space-y-4">
            <div className="h-12 w-12 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center mx-auto">
              <AlertCircle className="h-6 w-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="font-bold text-base text-foreground">Remove from Gallery?</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                This photograph or visual item will be permanently removed from the public visual
                archives. This action cannot be reversed.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setDeletingId(null)}
                className="flex-1 py-2 rounded-xl border border-border text-xs font-bold text-foreground hover:bg-muted transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deletingId)}
                disabled={deleteMutation.isPending}
                className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
              >
                {deleteMutation.isPending ? "Removing..." : "Delete Item"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Quick Preview Lightbox Modal */}
      {previewItem && (
        <div
          onClick={() => setPreviewItem(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in-50 cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-3xl bg-card rounded-3xl border border-border overflow-hidden shadow-2xl cursor-default"
          >
            <div className="aspect-video bg-black flex items-center justify-center relative">
              {previewItem.mediaType === "VIDEO" && previewItem.url.includes("youtube.com") ? (
                <iframe
                  src={previewItem.url.replace("watch?v=", "embed/")}
                  title={previewItem.title || "Video"}
                  className="w-full h-full"
                  allowFullScreen
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={previewItem.url}
                  alt={previewItem.title || "Preview"}
                  className="max-h-full max-w-full object-contain"
                />
              )}
            </div>
            <div className="p-6 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-amber-500 uppercase tracking-wider">
                  {previewItem.org} • {previewItem.category || "Archive"}
                </span>
                <span className="text-xs text-muted-foreground">
                  {new Date(previewItem.createdAt).toLocaleDateString()}
                </span>
              </div>
              <h2 className="text-lg font-bold text-foreground">{previewItem.title}</h2>
              {previewItem.description && (
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {previewItem.description}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

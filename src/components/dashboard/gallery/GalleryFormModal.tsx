"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  X,
  Loader2,
  Sparkles,
  UploadCloud,
  Link as LinkIcon,
  Video,
  Image as ImageIcon,
  Star,
  Eye,
  Layers,
  HelpCircle,
} from "lucide-react";
import {
  IGalleryItem,
  ICreateGalleryItemPayload,
  IUpdateGalleryItemPayload,
  Organization,
  MediaType,
} from "@/types/gallery";
import { useUploadGalleryMedia, useGetGalleryCategories } from "@/hooks/useGallery";
import { ActivityService } from "@/services/event.service";
import { FileUploadDropzone } from "@/components/ui/FileUploadDropzone";
import { CategoryCombobox } from "@/components/ui/CategoryCombobox";
import { ModernSelect } from "@/components/ui/ModernSelect";
import { toast } from "sonner";

interface GalleryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: IGalleryItem | null;
  onSave: (payload: ICreateGalleryItemPayload | IUpdateGalleryItemPayload) => Promise<void>;
  isSubmitting?: boolean;
}

const DEFAULT_CATEGORIES = [
  "Study Halls",
  "Rare Manuscripts",
  "Archives",
  "Operations",
  "Events & Seminars",
  "Exhibitions",
  "Dawah Circles",
  "Calligraphy & Art",
  "General",
];

export function GalleryFormModal({
  isOpen,
  onClose,
  item,
  onSave,
  isSubmitting = false,
}: GalleryFormModalProps) {
  const uploadMediaMutation = useUploadGalleryMedia();
  const { data: dbCategories = [] } = useGetGalleryCategories();

  const [inputMode, setInputMode] = useState<"upload" | "url">("upload");
  const [formData, setFormData] = useState<{
    org: Organization;
    title: string;
    description: string;
    mediaType: MediaType;
    url: string;
    thumbnail: string;
    category: string;
    activityId: number | null;
    isPublished: boolean;
    featured: boolean;
  }>({
    org: "RUIL",
    title: "",
    description: "",
    mediaType: "IMAGE",
    url: "",
    thumbnail: "",
    category: "Study Halls",
    activityId: null,
    isPublished: true,
    featured: false,
  });

  const [activities, setActivities] = useState<{ id: number; title: string }[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(false);

  // Merge predefined and database categories
  const allCategories = Array.from(new Set([...DEFAULT_CATEGORIES, ...dbCategories])).filter(Boolean);

  useEffect(() => {
    if (isOpen) {
      setLoadingActivities(true);
      ActivityService.getAllActivities({ limit: 100 })
        .then((res) => {
          setActivities(
            res.data.map((a) => ({
              id: a.id,
              title: a.title,
            }))
          );
        })
        .catch(() => {})
        .finally(() => setLoadingActivities(false));
    }
  }, [isOpen]);

  useEffect(() => {
    if (item) {
      setFormData({
        org: item.org || "RUIL",
        title: item.title || "",
        description: item.description || "",
        mediaType: item.mediaType || "IMAGE",
        url: item.url || "",
        thumbnail: item.thumbnail || "",
        category: item.category || "Study Halls",
        activityId: item.activityId || null,
        isPublished: item.isPublished !== undefined ? item.isPublished : true,
        featured: item.featured !== undefined ? item.featured : false,
      });
      setInputMode(item.url?.startsWith("http") ? "url" : "upload");
    } else {
      setFormData({
        org: "RUIL",
        title: "",
        description: "",
        mediaType: "IMAGE",
        url: "",
        thumbnail: "",
        category: "Study Halls",
        activityId: null,
        isPublished: true,
        featured: false,
      });
      setInputMode("upload");
    }
  }, [item, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.url.trim()) {
      toast.error("Please provide a media file or URL");
      return;
    }

    try {
      if (item) {
        await onSave({
          id: item.id,
          org: formData.org,
          title: formData.title.trim() || undefined,
          description: formData.description.trim() || undefined,
          mediaType: formData.mediaType,
          url: formData.url.trim(),
          thumbnail: formData.thumbnail.trim() || null,
          category: formData.category || null,
          activityId: formData.activityId,
          isPublished: formData.isPublished,
          featured: formData.featured,
        });
      } else {
        await onSave({
          org: formData.org,
          title: formData.title.trim() || undefined,
          description: formData.description.trim() || undefined,
          mediaType: formData.mediaType,
          url: formData.url.trim(),
          thumbnail: formData.thumbnail.trim() || null,
          category: formData.category || null,
          activityId: formData.activityId,
          isPublished: formData.isPublished,
          featured: formData.featured,
        });
      }
      onClose();
    } catch {
      // error handled by parent mutation
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in-50">
      <div className="relative w-full max-w-2xl bg-card border border-border rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">
                {item ? "Edit Gallery Item" : "Add New Gallery Visual"}
              </h2>
              <p className="text-xs text-muted-foreground">
                Showcase photo archives, study halls, or campus activities
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Organization & Media Type Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <ModernSelect<Organization>
                label="Organization / Circle"
                value={formData.org}
                onChange={(val) => setFormData((prev) => ({ ...prev, org: val }))}
                options={[
                  { value: "RUIL", label: "RUIL", sublabel: "RU Islamic Library" },
                  { value: "RUDC", label: "RUDC", sublabel: "Rajshahi University Dawah Circle" },
                  { value: "BOTH", label: "Joint / Both", sublabel: "RUIL & RUDC combined" },
                ]}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">
                Media Format
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, mediaType: "IMAGE" }))}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                    formData.mediaType === "IMAGE"
                      ? "bg-primary text-primary-foreground border-primary shadow-xs"
                      : "bg-muted/40 text-muted-foreground border-border hover:text-foreground"
                  }`}
                >
                  <ImageIcon className="h-4 w-4" />
                  Photograph
                </button>
                <button
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, mediaType: "VIDEO" }))}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                    formData.mediaType === "VIDEO"
                      ? "bg-primary text-primary-foreground border-primary shadow-xs"
                      : "bg-muted/40 text-muted-foreground border-border hover:text-foreground"
                  }`}
                >
                  <Video className="h-4 w-4" />
                  Video / Stream
                </button>
              </div>
            </div>
          </div>

          {/* Media Source Selector */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-foreground">Media Asset</label>
              <div className="flex items-center gap-1 bg-muted rounded-lg p-0.5 text-[11px]">
                <button
                  type="button"
                  onClick={() => setInputMode("upload")}
                  className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
                    inputMode === "upload"
                      ? "bg-background text-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Upload File
                </button>
                <button
                  type="button"
                  onClick={() => setInputMode("url")}
                  className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
                    inputMode === "url"
                      ? "bg-background text-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  URL Link
                </button>
              </div>
            </div>

            {inputMode === "upload" ? (
              <FileUploadDropzone
                type="image"
                value={formData.url}
                onChange={(url) => setFormData((prev) => ({ ...prev, url }))}
                onUpload={(file) => uploadMediaMutation.mutateAsync(file)}
                label="Click or drag media image"
                helperText="Supports high-res PNG, JPG, WEBP, AVIF up to 15MB"
              />
            ) : (
              <div className="space-y-2">
                <div className="relative">
                  <LinkIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="url"
                    value={formData.url}
                    onChange={(e) => setFormData((prev) => ({ ...prev, url: e.target.value }))}
                    placeholder={
                      formData.mediaType === "VIDEO"
                        ? "https://www.youtube.com/watch?v=... or direct MP4 link"
                        : "https://images.unsplash.com/... or hosted image URL"
                    }
                    className="w-full rounded-xl border border-input bg-background pl-10 pr-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                {formData.url && (
                  <div className="relative aspect-video rounded-xl overflow-hidden border border-border bg-muted/50 max-h-40 flex items-center justify-center">
                    {formData.mediaType === "VIDEO" && formData.url.includes("youtube.com") ? (
                      <iframe
                        src={formData.url.replace("watch?v=", "embed/")}
                        title="Preview"
                        className="w-full h-full"
                        allowFullScreen
                      />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={formData.url}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = "none";
                        }}
                      />
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Title & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">
                Title / Caption
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="e.g. Central Islamic Reading Hall"
                className="w-full rounded-xl border border-input bg-background px-3.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">
                Category
              </label>
              <CategoryCombobox
                categories={allCategories}
                value={formData.category}
                onChange={(val) => setFormData((prev) => ({ ...prev, category: val }))}
                placeholder="Select or enter category..."
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-foreground mb-1.5">
              Description / Archive Context (Optional)
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Provide historical context, date, or study hall details..."
              className="w-full rounded-xl border border-input bg-background p-3 text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
          </div>

          {/* Link to Activity (Optional) */}
          <div>
            <ModernSelect<number | "">
              label="Linked Activity (Optional)"
              value={formData.activityId ?? ""}
              onChange={(val) =>
                setFormData((prev) => ({
                  ...prev,
                  activityId: val === "" ? null : Number(val),
                }))
              }
              searchable
              helperText="Connect this visual with an ongoing campus program"
              options={[
                { value: "" as const, label: "No linked activity", sublabel: "Independent archive" },
                ...activities.map((act) => ({
                  value: act.id as number | "",
                  label: act.title,
                  sublabel: `ID #${act.id}`,
                })),
              ]}
            />
          </div>

          {/* Toggles: Featured & Published */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div
              onClick={() => setFormData((prev) => ({ ...prev, featured: !prev.featured }))}
              className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer select-none transition-all ${
                formData.featured
                  ? "border-amber-500/50 bg-amber-50/50 dark:bg-amber-950/20"
                  : "border-border bg-card hover:bg-muted/30"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Star
                  className={`h-4 w-4 ${
                    formData.featured ? "text-amber-500 fill-amber-500" : "text-muted-foreground"
                  }`}
                />
                <div>
                  <p className="text-xs font-bold text-foreground">Featured Highlight</p>
                  <p className="text-[10px] text-muted-foreground">Prioritized in hero spotlight</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={formData.featured}
                onChange={() => {}}
                className="h-4 w-4 rounded accent-amber-500"
              />
            </div>

            <div
              onClick={() => setFormData((prev) => ({ ...prev, isPublished: !prev.isPublished }))}
              className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer select-none transition-all ${
                formData.isPublished
                  ? "border-emerald-500/50 bg-emerald-50/50 dark:bg-emerald-950/20"
                  : "border-border bg-card hover:bg-muted/30"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Eye
                  className={`h-4 w-4 ${
                    formData.isPublished ? "text-emerald-500" : "text-muted-foreground"
                  }`}
                />
                <div>
                  <p className="text-xs font-bold text-foreground">Published Status</p>
                  <p className="text-[10px] text-muted-foreground">Visible on public gallery</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={formData.isPublished}
                onChange={() => {}}
                className="h-4 w-4 rounded accent-emerald-500"
              />
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border bg-muted/20">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold rounded-xl border border-border text-foreground hover:bg-muted transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-5 py-2 text-xs font-bold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all flex items-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : item ? (
              "Save Changes"
            ) : (
              "Publish to Gallery"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

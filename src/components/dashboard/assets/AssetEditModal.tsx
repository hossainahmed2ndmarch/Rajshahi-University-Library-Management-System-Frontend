"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Loader2,
  Sparkles,
  Link as LinkIcon,
  HelpCircle,
  Activity,
  Trash2,
  Tag,
  Building2,
  Layers,
  FileText,
} from "lucide-react";
import {
  ISiteAssetConfig,
  Organization,
  IGalleryItem,
} from "@/types/gallery";
import { useUploadGalleryMedia, useUpsertSiteAsset, useGetGalleryCategories } from "@/hooks/useGallery";
import { ActivityService } from "@/services/event.service";
import { FileUploadDropzone } from "@/components/ui/FileUploadDropzone";
import { CategoryCombobox } from "@/components/ui/CategoryCombobox";
import { ModernSelect } from "@/components/ui/ModernSelect";
import { toast } from "sonner";

interface AssetEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  assetConfig: ISiteAssetConfig | null;
  existingItem?: IGalleryItem | null;
  currentUrl?: string;
  onSaved?: () => void;
  onDelete?: (key: string) => void;
}

const COMMON_ASSET_CATEGORIES = [
  "ASSET",
  "BRANDING",
  "HERO_BANNER",
  "PAGE_HEADER",
  "FEATURED",
  "FOOTER",
  "PROMOTION",
  "BADGE",
  "BACKGROUND",
];

export function AssetEditModal({
  isOpen,
  onClose,
  assetConfig,
  existingItem,
  currentUrl,
  onSaved,
  onDelete,
}: AssetEditModalProps) {
  const uploadMediaMutation = useUploadGalleryMedia();
  const upsertAssetMutation = useUpsertSiteAsset();
  const { data: dbCategories = [] } = useGetGalleryCategories();

  const [inputMode, setInputMode] = useState<"upload" | "url">("upload");
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("ASSET");
  const [activityId, setActivityId] = useState<number | null>(null);
  const [org, setOrg] = useState<Organization>("RUIL");
  const [customKey, setCustomKey] = useState("");

  const [activities, setActivities] = useState<{ id: number; title: string; slug: string }[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const isCustom = !assetConfig;
  const mergedCategories = Array.from(new Set([...COMMON_ASSET_CATEGORIES, ...dbCategories])).filter(Boolean);

  useEffect(() => {
    if (isOpen) {
      setLoadingActivities(true);
      ActivityService.getAllActivities({ limit: 100 })
        .then((res) => {
          setActivities(
            res.data.map((a) => ({
              id: a.id,
              title: a.title,
              slug: a.slug,
            }))
          );
        })
        .catch(() => setActivities([]))
        .finally(() => setLoadingActivities(false));
    }
  }, [isOpen]);

  useEffect(() => {
    if (assetConfig) {
      setUrl(existingItem?.url || currentUrl || assetConfig.defaultUrl || "");
      setTitle(existingItem?.title || assetConfig.label || "");
      setDescription(existingItem?.description || assetConfig.description || "");
      setCategory(existingItem?.category || "ASSET");
      setActivityId(existingItem?.activityId ?? null);
      setOrg(existingItem?.org || assetConfig.org || "RUIL");
      setCustomKey(assetConfig.key);
    } else {
      setUrl("");
      setTitle("");
      setDescription("");
      setCategory("ASSET");
      setActivityId(null);
      setOrg("RUIL");
      setCustomKey("");
    }
    setInputMode("upload");
    setConfirmDelete(false);
  }, [assetConfig, existingItem, currentUrl, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const finalKey = assetConfig ? assetConfig.key : customKey.trim().toLowerCase().replace(/[^a-z0-9_]/g, "_");

    if (!finalKey) {
      toast.error("Asset key identifier is required");
      return;
    }

    if (!url.trim()) {
      toast.error("Please upload or provide an image URL for this asset");
      return;
    }

    try {
      await upsertAssetMutation.mutateAsync({
        assetKey: finalKey,
        url: url.trim(),
        title: title.trim() || finalKey,
        description: description.trim() || undefined,
        org,
        category: category.trim() || "ASSET",
        activityId: activityId || null,
      });

      onSaved?.();
      onClose();
    } catch {
      // error handled by mutation
    }
  };

  const handleDeleteTrigger = () => {
    const finalKey = assetConfig ? assetConfig.key : customKey;
    if (!finalKey) return;
    if (onDelete) {
      onDelete(finalKey);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in-50">
      <div className="relative w-full max-w-2xl bg-card border border-border rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">
                {assetConfig ? `Update Asset: ${assetConfig.label}` : "Register New Dynamic Site Asset"}
              </h2>
              <p className="text-xs text-muted-foreground">
                {assetConfig ? `Target Identifier: "${assetConfig.key}"` : "Configure artwork, category, and metadata"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Custom Asset Key Definition if custom */}
          {isCustom && (
            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5 flex items-center gap-1.5">
                <Tag className="h-3.5 w-3.5 text-primary" />
                <span>Asset Key (Unique Identifier)</span>
              </label>
              <input
                type="text"
                value={customKey}
                onChange={(e) => setCustomKey(e.target.value)}
                placeholder="e.g. mobile_banner, ramadan_spotlight, footer_bg"
                className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-primary shadow-xs transition-all"
                required
              />
              <p className="text-[11px] text-muted-foreground mt-1">
                Use lowercase letters, numbers, and underscores only.
              </p>
            </div>
          )}

          {/* Aspect & Guidelines Box */}
          {assetConfig && (
            <div className="rounded-2xl border border-border bg-muted/20 p-3.5 flex items-start gap-3">
              <HelpCircle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
              <div className="text-xs space-y-0.5">
                <p className="font-semibold text-foreground">
                  Recommended Dimensions:{" "}
                  <span className="text-primary font-mono">{assetConfig.recommendedDimensions}</span>
                </p>
                <p className="text-muted-foreground">{assetConfig.description}</p>
              </div>
            </div>
          )}

          {/* Upload Method Switcher */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-foreground">Asset Artwork</label>
              <div className="flex items-center gap-1 bg-muted rounded-xl p-0.5 text-[11px]">
                <button
                  type="button"
                  onClick={() => setInputMode("upload")}
                  className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
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
                  className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    inputMode === "url"
                      ? "bg-background text-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Direct URL
                </button>
              </div>
            </div>

            {inputMode === "upload" ? (
              <FileUploadDropzone
                type="image"
                value={url}
                onChange={(newUrl) => setUrl(newUrl)}
                onUpload={(file) => uploadMediaMutation.mutateAsync(file)}
                label="Click or drop replacement artwork"
                helperText="Cloudinary optimized: PNG, JPG, WEBP, SVG up to 15MB"
              />
            ) : (
              <div className="space-y-2">
                <div className="relative">
                  <LinkIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://... direct image link"
                    className="w-full rounded-xl border border-input bg-background pl-10 pr-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary font-mono shadow-xs"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Visual Preview Box */}
          {url && (
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                Live Asset Preview
              </label>
              <div className="grid grid-cols-2 gap-3">
                {/* Light preview */}
                <div className="rounded-2xl border border-border bg-white p-4 flex flex-col items-center justify-center relative overflow-hidden shadow-xs">
                  <span className="absolute top-2 left-2 text-[10px] font-bold text-slate-400 uppercase">
                    Light Mode
                  </span>
                  <div className="h-28 w-full flex items-center justify-center pt-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={url}
                      alt="Preview Light"
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                </div>

                {/* Dark preview */}
                <div className="rounded-2xl border border-border bg-slate-950 p-4 flex flex-col items-center justify-center relative overflow-hidden shadow-xs">
                  <span className="absolute top-2 left-2 text-[10px] font-bold text-slate-500 uppercase">
                    Dark Mode
                  </span>
                  <div className="h-28 w-full flex items-center justify-center pt-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={url}
                      alt="Preview Dark"
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Title & Organization */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5 flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5 text-primary" />
                <span>Title / Display Label</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Main Header Brand Mark"
                className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary shadow-xs transition-all"
              />
            </div>

            <div>
              <ModernSelect<Organization>
                label="Associated Organization"
                icon={<Building2 className="h-3.5 w-3.5 text-primary" />}
                value={org}
                onChange={(val) => setOrg(val)}
                options={[
                  { value: "RUIL", label: "RUIL", sublabel: "RU Islamic Library" },
                  { value: "BOTH", label: "Joint / Both", sublabel: "RUIL & RUDC combined" },
                  { value: "RUDC", label: "RUDC", sublabel: "Dawah Circle" },
                ]}
              />
            </div>
          </div>

          {/* Category & Activity Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <CategoryCombobox
                value={category}
                onChange={(newCat) => setCategory(newCat)}
                categories={mergedCategories}
                label="Asset Category"
                placeholder="e.g. BRANDING, HERO_BANNER, ASSET..."
                helperText="Organize by section or placement"
              />
            </div>

            <div>
              <ModernSelect<number | "">
                label="Linked Activity (Optional)"
                icon={<Activity className="h-3.5 w-3.5 text-primary" />}
                value={activityId ?? ""}
                onChange={(val) => setActivityId(val === "" ? null : Number(val))}
                disabled={loadingActivities}
                searchable
                helperText="Link this asset to an official library event or campaign."
                options={[
                  { value: "" as const, label: "None / Standalone Site Asset" },
                  ...activities.map((act) => ({
                    value: act.id as number | "",
                    label: act.title,
                    sublabel: act.slug,
                  })),
                ]}
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-foreground mb-1.5">
              Description & Usage Guidelines
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Internal usage guidelines, placement rules, or notes for administrators..."
              className="w-full rounded-xl border border-input bg-background p-3 text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary resize-none shadow-xs transition-all"
            />
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-border bg-muted/20">
          <div>
            {onDelete && (assetConfig || existingItem) && (
              <>
                {confirmDelete ? (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleDeleteTrigger}
                      className="px-3 py-1.5 text-xs font-bold rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors cursor-pointer"
                    >
                      Confirm Delete
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(false)}
                      className="px-2.5 py-1.5 text-xs font-semibold rounded-xl border border-border text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl text-destructive hover:bg-destructive/10 border border-destructive/20 transition-colors cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>{isCustom ? "Delete Asset" : "Reset to Default"}</span>
                  </button>
                )}
              </>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold rounded-xl border border-border text-foreground hover:bg-muted transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={upsertAssetMutation.isPending}
              className="px-5 py-2 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all flex items-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
            >
              {upsertAssetMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving Asset...
                </>
              ) : (
                "Save Asset Changes"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

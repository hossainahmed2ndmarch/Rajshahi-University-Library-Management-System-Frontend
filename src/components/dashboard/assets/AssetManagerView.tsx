"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Sparkles,
  Layers,
  Image as ImageIcon,
  Edit2,
  Copy,
  Check,
  ExternalLink,
  Plus,
  RefreshCw,
  Sun,
  Moon,
  Info,
  CheckCircle2,
  SlidersHorizontal,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import {
  ISiteAssetConfig,
  IGalleryItem,
} from "@/types/gallery";
import { useGetSiteAssets, useUpsertSiteAsset, useDeleteSiteAsset } from "@/hooks/useGallery";
import { AssetEditModal } from "./AssetEditModal";
import { toast } from "sonner";

interface AssetManagerViewProps {
  baseRoute: "/dashboard/admin/assets" | "/dashboard/super-admin/assets";
}

export function AssetManagerView({ baseRoute }: AssetManagerViewProps) {
  const [activeTab, setActiveTab] = useState<string>("All Assets");
  const [contrastModes, setContrastModes] = useState<Record<string, "light" | "dark">>({});
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedAssetConfig, setSelectedAssetConfig] = useState<ISiteAssetConfig | null>(null);
  const [isAddingCustom, setIsAddingCustom] = useState(false);
  const [assetToDelete, setAssetToDelete] = useState<{
    key: string;
    label: string;
  } | null>(null);

  const { data: assetsData, isLoading, refetch } = useGetSiteAssets();
  const deleteAssetMutation = useDeleteSiteAsset();
  const dbItems: IGalleryItem[] = assetsData?.items || [];
  const assetMap = assetsData?.assetMap || {};

  // 1. Derive Dynamic Category Tabs directly from DB with explicit type guard
  const dynamicCategories: string[] = Array.from(
    new Set(
      dbItems
        .map((item) => item.category)
        .filter((cat): cat is string => Boolean(cat))
    )
  );
  const sectionTabs: string[] = ["All Assets", ...dynamicCategories];

  // 2. Map Database Items directly to Asset Configurations
  const dbConfigs: ISiteAssetConfig[] = dbItems.map((item) => ({
    key: item.assetKey || String(item.id),
    label: item.title || item.assetKey || "Untitled Asset",
    section: (item.category || "General") as any,
    description: item.description || "Live site asset stored in database.",
    recommendedDimensions: "Flexible resolution",
    aspectRatio: "Custom",
    defaultUrl: item.url,
    org: (item.org as any) || "RUIL",
  }));

  const filteredConfigs =
    activeTab === "All Assets"
      ? dbConfigs
      : dbConfigs.filter((c) => c.section === activeTab);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success(`Copied: "${text}"`);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const toggleContrast = (key: string) => {
    setContrastModes((prev) => ({
      ...prev,
      [key]: prev[key] === "dark" ? "light" : "dark",
    }));
  };

  const handleOpenEdit = (config: ISiteAssetConfig) => {
    setSelectedAssetConfig(config);
    setIsAddingCustom(false);
    setEditModalOpen(true);
  };

  const handleOpenAddCustom = () => {
    setSelectedAssetConfig(null);
    setIsAddingCustom(true);
    setEditModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#003824] via-[#024a30] to-[#012b1c] p-6 sm:p-8 text-white border border-emerald-800/40 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-300 text-xs font-bold tracking-wide uppercase">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Dynamic Media Manager</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Site Asset & Branding Hub
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/70 max-w-xl">
              Central control center to update official logos, homepage hero banners, page
              headers, and section artwork in real-time across the entire platform.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => refetch()}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 text-emerald-100 hover:bg-white/20 text-xs font-bold backdrop-blur-xs transition-colors cursor-pointer"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Sync Assets</span>
            </button>
            <button
              onClick={handleOpenAddCustom}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-lg shadow-amber-950/20 transition-all transform hover:scale-[1.02] cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Register New Asset Key</span>
            </button>
          </div>
        </div>

        {/* Dynamic Category Filter Pills */}
        <div className="relative z-10 flex flex-wrap items-center gap-2 mt-6 pt-6 border-t border-emerald-800/40">
          {sectionTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === tab
                  ? "bg-amber-400 text-slate-950 shadow-md font-black"
                  : "bg-emerald-950/50 text-emerald-200/80 hover:text-white hover:bg-emerald-900/60 border border-emerald-800/40"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Asset Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-80 bg-muted/40 rounded-3xl animate-pulse border border-border"
            />
          ))}
        </div>
      ) : filteredConfigs.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border bg-card p-12 text-center space-y-4">
          <div className="h-16 w-16 rounded-3xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
            <ImageIcon className="h-8 w-8" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-base text-foreground">No assets found</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Click &quot;Register New Asset Key&quot; to create a new live asset record in this category.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredConfigs.map((config) => {
            const liveUrl = assetMap[config.key] || config.defaultUrl;
            const contrast = contrastModes[config.key] || "light";

            return (
              <div
                key={config.key}
                className="bg-card rounded-3xl border border-border overflow-hidden shadow-xs hover:shadow-lg transition-all flex flex-col justify-between"
              >
                {/* Visual Preview Frame */}
                <div
                  className={`relative p-6 flex items-center justify-center h-52 transition-colors border-b border-border ${
                    contrast === "dark"
                      ? "bg-slate-950"
                      : "bg-radial from-slate-100 via-slate-50 to-slate-200/60 dark:from-zinc-900 dark:via-zinc-950 dark:to-zinc-900"
                  }`}
                >
                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 z-10">
                    <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-black/60 text-amber-300 backdrop-blur-xs border border-white/10">
                      {config.org}
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-muted/80 text-foreground border border-border">
                      {config.aspectRatio}
                    </span>
                  </div>

                  {/* Contrast Mode Toggle */}
                  <button
                    onClick={() => toggleContrast(config.key)}
                    className="absolute top-3 right-3 p-1.5 rounded-xl bg-black/50 text-white hover:bg-black/80 backdrop-blur-xs transition-colors z-10 cursor-pointer"
                    title={`Toggle preview contrast (currently ${contrast})`}
                  >
                    {contrast === "dark" ? (
                      <Sun className="h-3.5 w-3.5 text-amber-400" />
                    ) : (
                      <Moon className="h-3.5 w-3.5 text-slate-300" />
                    )}
                  </button>

                  {/* Image Graphic */}
                  <div className="relative h-full w-full flex items-center justify-center p-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={liveUrl}
                      alt={config.label}
                      className="max-h-full max-w-full object-contain filter drop-shadow-sm transition-transform duration-300 hover:scale-105"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = config.defaultUrl;
                      }}
                    />
                  </div>

                  {/* Status Indicator Pill */}
                  <div className="absolute bottom-3 left-3 z-10">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold backdrop-blur-xs bg-emerald-500/90 text-white">
                      <CheckCircle2 className="h-3 w-3" />
                      Active in DB
                    </span>
                  </div>
                </div>

                {/* Content & Actions */}
                <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-black text-sm text-foreground line-clamp-1">
                        {config.label}
                      </h3>
                      <button
                        onClick={() => handleCopy(config.key, config.key)}
                        className="text-[10px] font-mono text-muted-foreground hover:text-foreground flex items-center gap-1 bg-muted px-2 py-0.5 rounded-md border border-border cursor-pointer shrink-0"
                        title="Copy assetKey"
                      >
                        {copiedKey === config.key ? (
                          <>
                            <Check className="h-3 w-3 text-emerald-500" />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3" />
                            <span>{config.key}</span>
                          </>
                        )}
                      </button>
                    </div>

                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                      {config.description}
                    </p>

                    <div className="pt-2 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                      <Info className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span className="truncate">
                        Target: <strong className="text-foreground">{config.recommendedDimensions}</strong>
                      </span>
                    </div>
                  </div>

                  {/* Card Button Actions */}
                  <div className="pt-3 border-t border-border flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEdit(config)}
                      className="flex-1 py-2 px-3 rounded-xl bg-primary text-primary-foreground font-bold text-xs hover:bg-primary/90 transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                      <span>Edit Details</span>
                    </button>
                    <a
                      href={liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                      title="Open full size"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                    <button
                      type="button"
                      onClick={() =>
                        setAssetToDelete({
                          key: config.key,
                          label: config.label,
                        })
                      }
                      className="p-2 rounded-xl border border-destructive/30 text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                      title="Delete asset from DB"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 3. Edit / Register Modal */}
      <AssetEditModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        assetConfig={selectedAssetConfig}
        existingItem={selectedAssetConfig ? dbItems.find((i) => i.assetKey === selectedAssetConfig.key) : undefined}
        currentUrl={selectedAssetConfig ? assetMap[selectedAssetConfig.key] : undefined}
        onSaved={() => {
          refetch();
        }}
        onDelete={async (key) => {
          try {
            await deleteAssetMutation.mutateAsync(key);
            setEditModalOpen(false);
            refetch();
          } catch {
            // error handled by mutation
          }
        }}
      />

      {/* 4. Delete Confirmation Dialog */}
      {assetToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in-50">
          <div className="relative w-full max-w-md bg-card border border-border rounded-3xl shadow-2xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center shrink-0">
                <Trash2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">
                  Delete Asset
                </h3>
                <p className="text-xs text-muted-foreground font-mono">{assetToDelete.key}</p>
              </div>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              Are you sure you want to permanently delete &quot;{assetToDelete.label}&quot;? This asset record will be removed from the database.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setAssetToDelete(null)}
                className="px-4 py-2 text-xs font-bold rounded-xl border border-border text-foreground hover:bg-muted transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  try {
                    await deleteAssetMutation.mutateAsync(assetToDelete.key);
                    setAssetToDelete(null);
                    refetch();
                  } catch {
                    // handled by mutation
                  }
                }}
                disabled={deleteAssetMutation.isPending}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-destructive hover:bg-destructive/90 text-destructive-foreground transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {deleteAssetMutation.isPending ? "Deleting..." : "Delete Permanently"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
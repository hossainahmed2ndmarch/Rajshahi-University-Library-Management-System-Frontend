"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { GalleryService } from "@/services/gallery.service";
import { getErrorMessage } from "@/lib/errorUtils";
import {
  IGalleryItem,
  ICreateGalleryItemPayload,
  IUpdateGalleryItemPayload,
  ISetAssetPayload,
  IGalleryQueryParams,
  Organization,
} from "@/types/gallery";

export const useGetGalleryItems = (params?: IGalleryQueryParams) => {
  return useQuery({
    queryKey: ["gallery-items", params],
    queryFn: () => GalleryService.getAllGalleryItems(params),
    staleTime: 30 * 1000,
  });
};

export const useGetGalleryItem = (id: number) => {
  return useQuery({
    queryKey: ["gallery-item", id],
    queryFn: () => GalleryService.getGalleryItemById(id),
    enabled: Boolean(id),
  });
};

export const useCreateGalleryItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ICreateGalleryItemPayload): Promise<IGalleryItem> => {
      return GalleryService.createGalleryItem(payload);
    },
    onSuccess: (newItem) => {
      queryClient.invalidateQueries({ queryKey: ["gallery-items"] });
      queryClient.invalidateQueries({ queryKey: ["gallery-categories"] });
      queryClient.invalidateQueries({ queryKey: ["site-assets"] });
      toast.success(
        newItem.title
          ? `Gallery item "${newItem.title}" created successfully!`
          : "Gallery item created successfully!"
      );
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to create gallery item."));
    },
  });
};

export const useUpdateGalleryItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: IUpdateGalleryItemPayload): Promise<IGalleryItem> => {
      return GalleryService.updateGalleryItem(payload);
    },
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ["gallery-items"] });
      queryClient.invalidateQueries({ queryKey: ["gallery-item", updated.id] });
      queryClient.invalidateQueries({ queryKey: ["gallery-categories"] });
      queryClient.invalidateQueries({ queryKey: ["site-assets"] });
      toast.success("Gallery item updated successfully!");
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to update gallery item."));
    },
  });
};

export const useDeleteGalleryItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number): Promise<boolean> => {
      return GalleryService.deleteGalleryItem(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gallery-items"] });
      queryClient.invalidateQueries({ queryKey: ["gallery-categories"] });
      queryClient.invalidateQueries({ queryKey: ["site-assets"] });
      toast.success("Gallery item removed successfully.");
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to delete gallery item."));
    },
  });
};

export const useTogglePublishGalleryItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number): Promise<IGalleryItem> => {
      return GalleryService.togglePublish(id);
    },
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ["gallery-items"] });
      queryClient.invalidateQueries({ queryKey: ["gallery-item", updated.id] });
      toast.success(
        updated.isPublished
          ? "Item published to public gallery!"
          : "Item unpublished from public gallery."
      );
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to change publication status."));
    },
  });
};

export const useToggleFeatureGalleryItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number): Promise<IGalleryItem> => {
      return GalleryService.toggleFeature(id);
    },
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ["gallery-items"] });
      queryClient.invalidateQueries({ queryKey: ["gallery-item", updated.id] });
      toast.success(
        updated.featured
          ? "Item marked as Featured!"
          : "Item removed from Featured."
      );
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to change featured status."));
    },
  });
};

export const useUploadGalleryMedia = () => {
  return useMutation({
    mutationFn: (file: File): Promise<string> => {
      return GalleryService.uploadMedia(file);
    },
    onSuccess: () => {
      toast.success("Media file uploaded successfully!");
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to upload media file."));
    },
  });
};

export const useGetGalleryCategories = (org?: string) => {
  return useQuery({
    queryKey: ["gallery-categories", org],
    queryFn: () => GalleryService.getCategories(org),
    staleTime: 5 * 60 * 1000,
  });
};

// ── Site Asset Management Hooks ─────────────────────────────────────────────

export const useGetSiteAssets = (org?: Organization) => {
  return useQuery({
    queryKey: ["site-assets", org],
    queryFn: () => GalleryService.getAllAssets(org),
    staleTime: 0,
  });
};

export const useGetSiteAsset = (key: string) => {
  return useQuery({
    queryKey: ["site-asset", key],
    queryFn: () => GalleryService.getAssetByKey(key),
    enabled: Boolean(key),
  });
};

export const useUpsertSiteAsset = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ISetAssetPayload): Promise<IGalleryItem> => {
      return GalleryService.upsertAsset(payload);
    },
    onSuccess: (asset) => {
      queryClient.invalidateQueries({ queryKey: ["site-assets"] });
      queryClient.invalidateQueries({ queryKey: ["site-asset", asset.assetKey] });
      queryClient.invalidateQueries({ queryKey: ["gallery-items"] });
      toast.success(`Asset "${asset.assetKey}" saved successfully!`);
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to save asset."));
    },
  });
};

export const useDeleteSiteAsset = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (key: string): Promise<boolean> => {
      return GalleryService.deleteAssetByKey(key);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["site-assets"], refetchType: "all" });
      queryClient.invalidateQueries({ queryKey: ["gallery-items"], refetchType: "all" });
      toast.success("Asset removed/reset successfully.");
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to delete asset."));
    },
  });
};

/**
 * Convenient hook for components to dynamically read an asset by its key,
 * falling back gracefully to a provided default static asset.
 */
export const useSiteAsset = (assetKey: string, fallbackUrl?: string) => {
  const { data, isLoading } = useGetSiteAssets();
  const dynamicUrl = data?.assetMap?.[assetKey];
  return {
    url: dynamicUrl || fallbackUrl || "",
    isLoading,
    isDynamic: Boolean(dynamicUrl),
  };
};

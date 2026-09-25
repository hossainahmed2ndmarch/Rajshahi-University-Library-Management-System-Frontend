import { axiosInstance } from '@/lib/axios';
import { ApiResponse } from '@/types/api.types';
import {
  IGalleryItem,
  ICreateGalleryItemPayload,
  IUpdateGalleryItemPayload,
  ISetAssetPayload,
  IGalleryQueryParams,
  Organization,
} from '@/types/gallery';

export const GalleryService = {
  getAllGalleryItems: async (
    params?: IGalleryQueryParams,
  ): Promise<{ data: IGalleryItem[]; total: number }> => {
    const queryParams: Record<string, unknown> = { ...params };

    if (queryParams.isPublished === 'ALL' || queryParams.isPublished === 'all') {
      delete queryParams.isPublished;
    }
    if (queryParams.category === 'ALL' || queryParams.category === 'all') {
      delete queryParams.category;
    }
    if (queryParams.org === 'ALL' || queryParams.org === 'all') {
      delete queryParams.org;
    }
    if (queryParams.mediaType === 'ALL' || queryParams.mediaType === 'all') {
      delete queryParams.mediaType;
    }

    if (queryParams.searchTerm) {
      queryParams.search = queryParams.searchTerm;
      delete queryParams.searchTerm;
    }

    queryParams.limit = params?.limit ?? 1000;

    const response = await axiosInstance.get<ApiResponse<IGalleryItem[]>>('/gallery', {
      params: queryParams,
    });

    const rawData = response.data?.data;
    const list = Array.isArray(rawData) ? rawData : [];
    const total = response.data?.meta?.total ?? list.length;
    return { data: list, total };
  },

  getGalleryItemById: async (id: number): Promise<IGalleryItem> => {
    const response = await axiosInstance.get<ApiResponse<IGalleryItem>>(`/gallery/${id}`);
    return response.data?.data;
  },

  createGalleryItem: async (payload: ICreateGalleryItemPayload): Promise<IGalleryItem> => {
    const response = await axiosInstance.post<ApiResponse<IGalleryItem>>('/gallery', payload);
    return response.data?.data;
  },

  updateGalleryItem: async (payload: IUpdateGalleryItemPayload): Promise<IGalleryItem> => {
    const { id, ...data } = payload;
    const response = await axiosInstance.patch<ApiResponse<IGalleryItem>>(`/gallery/${id}`, data);
    return response.data?.data;
  },

  deleteGalleryItem: async (id: number): Promise<boolean> => {
    await axiosInstance.delete(`/gallery/${id}`);
    return true;
  },

  togglePublish: async (id: number): Promise<IGalleryItem> => {
    const response = await axiosInstance.patch<ApiResponse<IGalleryItem>>(`/gallery/${id}/toggle-publish`);
    return response.data?.data;
  },

  toggleFeature: async (id: number): Promise<IGalleryItem> => {
    const response = await axiosInstance.patch<ApiResponse<IGalleryItem>>(`/gallery/${id}/toggle-feature`);
    return response.data?.data;
  },

  uploadMedia: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axiosInstance.post<ApiResponse<{ url: string }>>(
      '/gallery/upload',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return response.data?.data?.url ?? '';
  },

  getAssetByKey: async (key: string): Promise<IGalleryItem> => {
    const response = await axiosInstance.get<ApiResponse<IGalleryItem>>(`/gallery/asset/${key}`);
    return response.data?.data;
  },

  getAllAssets: async (
    org?: Organization,
  ): Promise<{ items: IGalleryItem[]; assetMap: Record<string, string> }> => {
    const response = await axiosInstance.get<
      ApiResponse<{ items: IGalleryItem[]; assetMap: Record<string, string> }>
    >('/gallery/assets', {
      params: org ? { org } : undefined,
    });
    return response.data?.data ?? { items: [], assetMap: {} };
  },

  upsertAsset: async (payload: ISetAssetPayload): Promise<IGalleryItem> => {
    const { assetKey, ...rest } = payload;
    const response = await axiosInstance.put<ApiResponse<IGalleryItem>>(
      `/gallery/asset/${assetKey}`,
      { ...rest, assetKey },
    );
    return response.data?.data;
  },

  deleteAssetByKey: async (key: string): Promise<boolean> => {
    await axiosInstance.delete(`/gallery/asset/${key}`);
    return true;
  },

  getCategories: async (org?: string): Promise<string[]> => {
    const response = await axiosInstance.get<ApiResponse<string[]>>('/gallery/categories', {
      params: org ? { org } : undefined,
    });
    return response.data?.data ?? [];
  },
};

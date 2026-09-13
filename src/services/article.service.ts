import { axiosInstance } from "@/lib/axios";
import { ApiResponse } from "@/types/api.types";
import {
  IArticle,
  ICreateArticlePayload,
  IUpdateArticlePayload,
  IArticleQueryParams,
  IArticleCategoryCount,
} from "@/types/article";

export const ArticleService = {
  getAllArticles: async (
    params?: IArticleQueryParams
  ): Promise<{ data: IArticle[]; total: number }> => {
    const response = await axiosInstance.get<ApiResponse<IArticle[]>>("/articles", {
      params,
    });
    const rawData = response.data?.data;
    const list = Array.isArray(rawData) ? rawData : [];
    const total = response.data?.meta?.total ?? list.length;
    return { data: list, total };
  },

  getArticleByIdOrSlug: async (idOrSlug: string | number): Promise<IArticle> => {
    const response = await axiosInstance.get<ApiResponse<IArticle>>(`/articles/${idOrSlug}`);
    return response.data?.data;
  },

  createArticle: async (payload: ICreateArticlePayload): Promise<IArticle> => {
    const response = await axiosInstance.post<ApiResponse<IArticle>>("/articles", payload);
    return response.data?.data;
  },

  updateArticle: async (payload: IUpdateArticlePayload): Promise<IArticle> => {
    const { id, ...data } = payload;
    const response = await axiosInstance.patch<ApiResponse<IArticle>>(`/articles/${id}`, data);
    return response.data?.data;
  },

  deleteArticle: async (id: number): Promise<boolean> => {
    await axiosInstance.delete(`/articles/${id}`);
    return true;
  },

  uploadArticleCover: async (file: File, articleId?: number): Promise<string> => {
    const formData = new FormData();
    formData.append("image", file);
    if (articleId) formData.append("articleId", String(articleId));

    const response = await axiosInstance.post<ApiResponse<{ url: string }>>(
      "/articles/upload-cover",
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return response.data?.data?.url ?? "";
  },

  getCategories: async (): Promise<IArticleCategoryCount[]> => {
    const response = await axiosInstance.get<ApiResponse<IArticleCategoryCount[]>>("/articles/categories");
    return response.data?.data ?? [];
  },
};

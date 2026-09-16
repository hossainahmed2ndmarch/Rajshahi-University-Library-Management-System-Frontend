"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArticleService } from "@/services/article.service";
import { getErrorMessage } from "@/lib/errorUtils";
import {
  IArticle,
  ICreateArticlePayload,
  IUpdateArticlePayload,
  IArticleQueryParams,
} from "@/types/article";

export const useGetArticles = (params?: IArticleQueryParams) => {
  const queryParams = { limit: 100, ...params };
  return useQuery({
    queryKey: ["articles", queryParams],
    queryFn: () => ArticleService.getAllArticles(queryParams),
    staleTime: 30 * 1000,
  });
};

export const useGetArticle = (idOrSlug: string | number) => {
  return useQuery({
    queryKey: ["article", idOrSlug],
    queryFn: () => ArticleService.getArticleByIdOrSlug(idOrSlug),
    enabled: Boolean(idOrSlug),
  });
};

export const useCreateArticle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ICreateArticlePayload): Promise<IArticle> => {
      return ArticleService.createArticle(payload);
    },
    onSuccess: (newArticle) => {
      queryClient.invalidateQueries({ queryKey: ["articles"] });
      toast.success(`Publication "${newArticle.title}" created successfully!`);
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to create publication."));
    },
  });
};

export const useUpdateArticle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: IUpdateArticlePayload): Promise<IArticle> => {
      return ArticleService.updateArticle(payload);
    },
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ["articles"] });
      queryClient.invalidateQueries({ queryKey: ["article", updated.id] });
      queryClient.invalidateQueries({ queryKey: ["article", updated.slug] });
      toast.success("Publication updated successfully!");
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to update publication."));
    },
  });
};

export const useDeleteArticle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number): Promise<boolean> => {
      return ArticleService.deleteArticle(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["articles"] });
      toast.success("Publication deleted successfully.");
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to delete publication."));
    },
  });
};

export const useUploadArticleCover = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      file,
      articleId,
    }: {
      file: File;
      articleId?: number;
    }): Promise<string> => ArticleService.uploadArticleCover(file, articleId),
    onSuccess: (_, variables) => {
      if (variables.articleId) {
        queryClient.invalidateQueries({ queryKey: ["articles"] });
        queryClient.invalidateQueries({ queryKey: ["article", variables.articleId] });
      }
      toast.success("Publication cover image uploaded successfully!");
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to upload cover image."));
    },
  });
};

export const useGetArticleCategories = () => {
  return useQuery({
    queryKey: ["article-categories"],
    queryFn: () => ArticleService.getCategories(),
    staleTime: 5 * 60 * 1000,
  });
};

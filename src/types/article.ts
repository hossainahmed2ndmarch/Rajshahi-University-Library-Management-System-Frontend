export interface IArticle {
  id: number;
  title: string;
  slug: string;
  content: string;
  coverImage?: string | null;
  category: string;
  authorUserId?: number | null;
  authorUser?: {
    id: number;
    name: string;
    email: string;
    avatarUrl?: string | null;
  } | null;
  authorName: string;
  authorDesignation?: string | null;
  relatedBookId?: number | null;
  relatedBook?: {
    id: number;
    title: string;
    author: string;
    coverImage?: string | null;
    isbn: string;
  } | null;
  totalViews: number;
  totalReadTime: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ICreateArticlePayload {
  title: string;
  slug?: string;
  content: string;
  coverImage?: string | null;
  category: string;
  authorUserId?: number | null;
  authorName: string;
  authorDesignation?: string | null;
  relatedBookId?: number | null;
  totalReadTime?: number;
  isPublished?: boolean;
}

export interface IUpdateArticlePayload extends Partial<ICreateArticlePayload> {
  id: number;
}

export interface IArticleQueryParams {
  searchTerm?: string;
  search?: string;
  category?: string;
  isPublished?: boolean | string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface IArticleCategoryCount {
  category: string;
  count: number;
}

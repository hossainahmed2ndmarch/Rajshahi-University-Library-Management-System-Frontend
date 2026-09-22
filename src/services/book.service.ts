import { axiosInstance } from "@/lib/axios";
import { ApiResponse } from "@/types/api.types";
import {
  IBook,
  IBookQueryParams,
  ICreateBookPayload,
  IUpdateBookPayload,
  IAuthorItem,
  AuthorRole,
  IBookOptions,
} from "@/types/book";

type RawBook = Record<string, unknown>;

export const normalizeBook = (raw: RawBook): IBook => {
  const rawType = (raw.type as string) || "HYBRID";
  const borrowStock = (raw.borrowStock as number) ?? (raw.stockQuantity as number) ?? 0;
  const sellStock = (raw.sellStock as number) ?? 0;
  const totalStock = (raw.stockQuantity as number) ?? borrowStock + sellStock;
  const availStock = (raw.availableQuantity as number) ?? borrowStock + sellStock;
  const price = (raw.sellPrice as number) ?? (raw.price as number) ?? 0;

  const isBorrowable =
    rawType === "BORROW_ONLY" ||
    rawType === "HYBRID" ||
    Boolean(raw.isBorrowable);

  const isSellable =
    rawType === "SELL_ONLY" ||
    rawType === "HYBRID" ||
    Boolean(raw.isSellable);

  // Parse structured authors
  let authors: IAuthorItem[] = [];
  if (Array.isArray(raw.authors) && raw.authors.length > 0) {
    authors = (raw.authors as any[])
      .map((a) => ({
        name: String(a.name || "").trim(),
        role: (a.role === "TRANSLATOR" ? "TRANSLATOR" : "WRITER") as AuthorRole,
      }))
      .filter((a) => Boolean(a.name));
  } else if (typeof raw.author === "string" && raw.author.trim()) {
    authors = raw.author
      .split(",")
      .map((part) => {
        const trimmed = part.trim();
        const isTrans = trimmed.toLowerCase().includes("(translator)");
        const clean = trimmed.replace(/\(translator\)/i, "").trim();
        return {
          name: clean,
          role: (isTrans ? "TRANSLATOR" : "WRITER") as AuthorRole,
        };
      })
      .filter((a) => Boolean(a.name));
  }

  // Parse structured categories
  let categories: string[] = [];
  if (Array.isArray(raw.categories) && raw.categories.length > 0) {
    categories = (raw.categories as string[])
      .map((c) => String(c).trim())
      .filter(Boolean);
  } else if (typeof raw.category === "string" && raw.category.trim()) {
    categories = raw.category
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean);
  }

  const authorDisplay =
    (raw.author as string) ||
    authors
      .map((a) => (a.role === "TRANSLATOR" ? `${a.name} (Translator)` : a.name))
      .join(", ") ||
    "Unknown Author";

  const categoryDisplay =
    (raw.category as string) || categories.join(", ") || "General";

  return {
    id: String(raw.id),
    title: (raw.title as string) || "Untitled Book",
    author: authorDisplay,
    authors,
    isbn: (raw.isbn as string) || "N/A",
    locationCell: (raw.locationCell as string) || "Cell-Unassigned",
    category: categoryDisplay,
    categories,
    publisher: (raw.publisher as string) || "N/A",
    pages: (raw.pages as number) || 0,
    type: rawType as IBook["type"],
    price,
    sellPrice: price,
    buyPrice: (raw.buyPrice as number) || undefined,
    discount: (raw.discount as number) ?? 0,
    borrowFee: (raw.borrowFee as number) || 0,
    borrowStock,
    sellStock,
    stockQuantity: totalStock,
    availableQuantity: availStock,
    description: (raw.description as string) || "",
    coverImage: raw.coverImage as string | undefined,
    images: Array.isArray(raw.images) ? (raw.images as string[]) : [],
    isBorrowable,
    isSellable,
    isArchived: Boolean(raw.isArchived),
    createdAt: (raw.createdAt as string) || new Date().toISOString(),
    updatedAt: (raw.updatedAt as string) || new Date().toISOString(),
  };
};

export const BookService = {
  getBooks: async (
    params?: IBookQueryParams
  ): Promise<{ data: IBook[]; total: number; meta?: { page: number; limit: number; total: number; totalPage: number } }> => {
    return BookService.getAllBooks(params);
  },

  getAllBooks: async (
    params?: IBookQueryParams
  ): Promise<{ data: IBook[]; total: number; meta?: { page: number; limit: number; total: number; totalPage: number } }> => {
    const apiParams: Record<string, unknown> = {};
    if (params?.searchTerm) apiParams.searchTerm = params.searchTerm;

    // Multi-value filters: join arrays as comma-separated strings for backend
    if (params?.categories && params.categories.length > 0) {
      apiParams.category = params.categories.join(",");
    } else if (params?.category && params.category !== "ALL") {
      apiParams.category = params.category;
    }

    if (params?.authors && params.authors.length > 0) {
      apiParams.author = params.authors.join(",");
    } else if (params?.author) {
      apiParams.author = params.author;
    }

    if (params?.publishers && params.publishers.length > 0) {
      apiParams.publisher = params.publishers.join(",");
    } else if (params?.publisher) {
      apiParams.publisher = params.publisher;
    }

    if (params?.type && (params.type as string) !== "ALL") {
      apiParams.type = params.type;
    }
    if (params?.isBorrowable !== undefined) apiParams.isBorrowable = params.isBorrowable;
    if (params?.isSellable !== undefined) apiParams.isSellable = params.isSellable;
    if (params?.minPrice !== undefined) apiParams.minPrice = params.minPrice;
    if (params?.maxPrice !== undefined) apiParams.maxPrice = params.maxPrice;

    // Proper server-side pagination
    apiParams.page = params?.page ?? 1;
    apiParams.limit = params?.limit ?? 12;

    if (params?.sortBy) apiParams.sortBy = params.sortBy;
    if (params?.sortOrder) apiParams.sortOrder = params.sortOrder;

    const response = await axiosInstance.get<ApiResponse<unknown>>("/books", {
      params: apiParams,
    });

    const rawData = response.data?.data;
    let list: RawBook[] = [];
    let total = 0;

    if (Array.isArray(rawData)) {
      list = rawData as RawBook[];
      total = response.data?.meta?.total || list.length;
    } else if (rawData && typeof rawData === "object") {
      const nested = rawData as Record<string, unknown>;
      list = Array.isArray(nested.data)
        ? (nested.data as RawBook[])
        : Array.isArray(nested.result)
        ? (nested.result as RawBook[])
        : Array.isArray(nested.books)
        ? (nested.books as RawBook[])
        : [];
      total =
        ((nested.meta as Record<string, number>)?.total) ||
        response.data?.meta?.total ||
        list.length;
    }

    const normalizedList = list.map(normalizeBook);
    return { data: normalizedList, total, meta: response.data?.meta };
  },

  getBookById: async (id: string | number): Promise<IBook> => {
    const response = await axiosInstance.get<ApiResponse<RawBook>>(`/books/${id}`);
    const rawData = response.data?.data;
    return normalizeBook(rawData);
  },

  createBook: async (payload: ICreateBookPayload): Promise<IBook> => {
    const response = await axiosInstance.post<ApiResponse<RawBook>>("/books", {
      title: payload.title,
      author: payload.author,
      authors: payload.authors,
      isbn: payload.isbn,
      locationCell: payload.locationCell,
      category: payload.category,
      categories: payload.categories,
      publisher: payload.publisher,
      pages: Number(payload.pages || 0),
      type: payload.type,
      sellPrice: payload.sellPrice ? Number(payload.sellPrice) : null,
      buyPrice: payload.buyPrice ? Number(payload.buyPrice) : null,
      discount: payload.discount ? Number(payload.discount) : 0,
      borrowStock: Number(payload.borrowStock || 0),
      sellStock: Number(payload.sellStock || 0),
      description: payload.description,
      coverImage: payload.coverImage,
      images: payload.images || [],
    });
    return normalizeBook(response.data?.data);
  },

  updateBook: async (payload: IUpdateBookPayload): Promise<IBook> => {
    const { id, ...data } = payload;
    const body: Record<string, unknown> = { ...data };
    if (body.pages !== undefined && body.pages !== null) body.pages = Number(body.pages);
    if (body.sellPrice !== undefined && body.sellPrice !== null) body.sellPrice = Number(body.sellPrice);
    if (body.buyPrice !== undefined && body.buyPrice !== null) body.buyPrice = Number(body.buyPrice);
    if (body.discount !== undefined && body.discount !== null) body.discount = Number(body.discount);
    if (body.borrowStock !== undefined && body.borrowStock !== null) body.borrowStock = Number(body.borrowStock);
    if (body.sellStock !== undefined && body.sellStock !== null) body.sellStock = Number(body.sellStock);

    const response = await axiosInstance.patch<ApiResponse<RawBook>>(`/books/${id}`, body);
    return normalizeBook(response.data?.data);
  },

  deleteBook: async (id: string | number): Promise<boolean> => {
    await axiosInstance.delete(`/books/${id}`);
    return true;
  },

  getCategories: async (): Promise<{ category: string; count: number }[]> => {
    const response = await axiosInstance.get<{ success: boolean; data: { category: string; count: number }[] }>("/books/categories");
    return response.data?.data ?? [];
  },

  getBookOptions: async (): Promise<IBookOptions> => {
    const response = await axiosInstance.get<{ success: boolean; data: IBookOptions }>("/books/options");
    return response.data?.data ?? { categories: [], locationCells: [], publishers: [], authors: [] };
  },

  /**
   * Upload a book cover image to Cloudinary.
   * Returns the secure CDN URL of the uploaded image.
   * Optionally pass a bookId to immediately persist the URL to the book record.
   */
  uploadBookCover: async (file: File, bookId?: string | number): Promise<string> => {
    const formData = new FormData();
    formData.append("image", file);
    if (bookId) formData.append("bookId", String(bookId));

    const response = await axiosInstance.post<ApiResponse<{ url: string }>>(
      "/books/upload-cover",
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return response.data?.data?.url ?? "";
  },

  /**
   * Upload multiple book images (gallery, pages, back cover) to Cloudinary.
   * Returns an array of secure CDN URLs.
   */
  uploadBookImages: async (files: File[], bookId?: string | number): Promise<string[]> => {
    const formData = new FormData();
    files.forEach((file) => formData.append("images", file));
    if (bookId) formData.append("bookId", String(bookId));

    const response = await axiosInstance.post<ApiResponse<{ urls: string[] }>>(
      "/books/upload-images",
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return response.data?.data?.urls ?? [];
  },
};

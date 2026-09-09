export type BookType = "BORROW_ONLY" | "SELL_ONLY" | "HYBRID";

export interface IBook {
  id: string;
  title: string;
  author: string;
  isbn?: string;
  locationCell?: string;
  category: string;
  publisher?: string;
  pages?: number;
  type: BookType;
  price?: number;
  sellPrice?: number;
  buyPrice?: number;
  discount?: number;
  borrowFee?: number;
  stockQuantity?: number;
  availableQuantity?: number;
  borrowStock?: number;
  sellStock?: number;
  description?: string;
  coverImage?: string;
  images?: string[];
  isBorrowable?: boolean;
  isSellable?: boolean;
  isArchived?: boolean;
  addedById?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ICreateBookPayload {
  title: string;
  author: string;
  isbn: string;
  locationCell: string;
  category: string;
  publisher?: string;
  pages: number;
  type: BookType;
  sellPrice?: number;
  buyPrice?: number;
  discount?: number;
  borrowStock?: number;
  sellStock?: number;
  description?: string;
  coverImage?: string;
  images?: string[];
}

export interface IUpdateBookPayload extends Partial<ICreateBookPayload> {
  id: string | number;
}

export interface IBookQueryParams {
  searchTerm?: string;
  category?: string;
  type?: BookType;
  isBorrowable?: boolean;
  isSellable?: boolean;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

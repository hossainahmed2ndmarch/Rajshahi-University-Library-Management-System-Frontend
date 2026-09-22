export type BookType = "BORROW_ONLY" | "SELL_ONLY" | "HYBRID";

export type AuthorRole = "WRITER" | "TRANSLATOR";

export interface IAuthorItem {
  name: string;
  role: AuthorRole;
}

export interface IBookOptions {
  categories: string[];
  locationCells: string[];
  publishers: string[];
  authors: IAuthorItem[];
}

export interface IBook {
  id: string;
  title: string;
  author: string;
  authors?: IAuthorItem[];
  isbn?: string;
  locationCell?: string;
  category: string;
  categories?: string[];
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
  author?: string;
  authors?: IAuthorItem[];
  isbn: string;
  locationCell: string;
  category?: string;
  categories?: string[];
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
  categories?: string[];    // multi-select: sent as comma-joined string
  author?: string;
  authors?: string[];       // multi-select: sent as comma-joined string
  publisher?: string;
  publishers?: string[];    // multi-select: sent as comma-joined string
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

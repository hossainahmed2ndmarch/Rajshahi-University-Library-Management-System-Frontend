import { create } from "zustand";
import { persist, createJSONStorage, StateStorage } from "zustand/middleware";
import { IBook } from "@/types/book";

const memoryStore = new Map<string, string>();
const fallbackStorage: StateStorage = {
  getItem: (key: string) => memoryStore.get(key) ?? null,
  setItem: (key: string, value: string) => {
    memoryStore.set(key, value);
  },
  removeItem: (key: string) => {
    memoryStore.delete(key);
  },
};

export interface WishlistItem {
  bookId: string;
  title: string;
  author: string;
  category: string;
  coverImage?: string;
  price?: number;
  borrowFee?: number;
  type?: "BORROW_ONLY" | "SELL_ONLY" | "HYBRID";
  isBorrowable?: boolean;
  isSellable?: boolean;
  borrowStock?: number;
  sellStock?: number;
  locationCell?: string;
}

interface WishlistState {
  items: WishlistItem[];
  addItem: (book: IBook) => void;
  removeItem: (bookId: string) => void;
  toggleWishlist: (book: IBook) => void;
  isInWishlist: (bookId: string) => boolean;
  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (book) => {
        const items = get().items;
        if (!items.some((i) => i.bookId === book.id)) {
          set({
            items: [
              ...items,
              {
                bookId: book.id,
                title: book.title,
                author: book.author,
                category: book.category,
                coverImage: book.coverImage,
                price: book.sellPrice ?? book.price,
                borrowFee: book.borrowFee,
                type: book.type,
                isBorrowable: book.isBorrowable ?? (book.type === "BORROW_ONLY" || book.type === "HYBRID"),
                isSellable: book.isSellable ?? (book.type === "SELL_ONLY" || book.type === "HYBRID"),
                borrowStock: book.borrowStock,
                sellStock: book.sellStock,
                locationCell: book.locationCell,
              },
            ],
          });
        }
      },

      removeItem: (bookId) => {
        set({ items: get().items.filter((i) => i.bookId !== bookId) });
      },

      toggleWishlist: (book) => {
        const isPresent = get().items.some((i) => i.bookId === book.id);
        if (isPresent) {
          get().removeItem(book.id);
        } else {
          get().addItem(book);
        }
      },

      isInWishlist: (bookId) => {
        return get().items.some((i) => i.bookId === bookId);
      },

      clearWishlist: () => set({ items: [] }),
    }),
    {
      name: "ruil_wishlist_store",
      storage: createJSONStorage(() => (typeof window !== "undefined" ? window.localStorage : fallbackStorage)),
    }
  )
);

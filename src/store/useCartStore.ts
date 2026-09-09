import { create } from "zustand";
import { persist, createJSONStorage, StateStorage } from "zustand/middleware";

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

export interface CartItem {
  bookId: string;
  title: string;
  author?: string;
  category?: string;
  price: number;
  borrowFee?: number;
  quantity: number;
  coverImage?: string;
  type: "BORROW" | "SELL";
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (bookId: string, type: "BORROW" | "SELL") => void;
  updateQuantity: (bookId: string, type: "BORROW" | "SELL", quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (item, quantity = 1) => {
        const currentItems = get().items;
        const existingIndex = currentItems.findIndex(
          (i) => i.bookId === item.bookId && i.type === item.type
        );

        let updatedItems: CartItem[];
        if (existingIndex > -1) {
          updatedItems = [...currentItems];
          updatedItems[existingIndex].quantity += quantity;
        } else {
          updatedItems = [...currentItems, { ...item, quantity }];
        }
        set({ items: updatedItems });
        if (typeof window !== "undefined") {
          localStorage.setItem("cart_items", JSON.stringify(updatedItems));
        }
      },

      removeItem: (bookId, type) => {
        const updatedItems = get().items.filter(
          (i) => !(i.bookId === bookId && i.type === type)
        );
        set({ items: updatedItems });
        if (typeof window !== "undefined") {
          localStorage.setItem("cart_items", JSON.stringify(updatedItems));
        }
      },

      updateQuantity: (bookId, type, quantity) => {
        if (quantity <= 0) {
          get().removeItem(bookId, type);
          return;
        }
        const updatedItems = get().items.map((i) =>
          i.bookId === bookId && i.type === type ? { ...i, quantity } : i
        );
        set({ items: updatedItems });
        if (typeof window !== "undefined") {
          localStorage.setItem("cart_items", JSON.stringify(updatedItems));
        }
      },

      clearCart: () => {
        set({ items: [] });
        if (typeof window !== "undefined") {
          localStorage.removeItem("cart_items");
        }
      },
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

      getTotalPrice: () => {
        return get().items.reduce((total, item) => {
          const itemPrice = item.type === "BORROW" ? item.borrowFee || 0 : item.price;
          return total + itemPrice * item.quantity;
        }, 0);
      },

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },
    }),
    {
      name: "ruil_cart_store",
      storage: createJSONStorage(() => (typeof window !== "undefined" ? window.localStorage : fallbackStorage)),
      partialize: (state) => ({ items: state.items }),
    }
  )
);

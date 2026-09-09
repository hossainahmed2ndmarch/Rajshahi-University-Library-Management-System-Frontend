import { create } from "zustand";
import { IBook } from "@/types/book";

interface ModalState {
  bookDetailModal: {
    isOpen: boolean;
    book: IBook | null;
  };
  startShiftModalOpen: boolean;
  endShiftModalOpen: boolean;
  addBookModalOpen: boolean;

  openBookDetail: (book: IBook) => void;
  closeBookDetail: () => void;
  openStartShift: () => void;
  closeStartShift: () => void;
  openEndShift: () => void;
  closeEndShift: () => void;
  openAddBook: () => void;
  closeAddBook: () => void;
}

export const useModalStore = create<ModalState>((set) => ({
  bookDetailModal: {
    isOpen: false,
    book: null,
  },
  startShiftModalOpen: false,
  endShiftModalOpen: false,
  addBookModalOpen: false,

  openBookDetail: (book) => set({ bookDetailModal: { isOpen: true, book } }),
  closeBookDetail: () => set({ bookDetailModal: { isOpen: false, book: null } }),
  openStartShift: () => set({ startShiftModalOpen: true }),
  closeStartShift: () => set({ startShiftModalOpen: false }),
  openEndShift: () => set({ endShiftModalOpen: true }),
  closeEndShift: () => set({ endShiftModalOpen: false }),
  openAddBook: () => set({ addBookModalOpen: true }),
  closeAddBook: () => set({ addBookModalOpen: false }),
}));

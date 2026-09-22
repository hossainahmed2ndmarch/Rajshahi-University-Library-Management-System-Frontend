"use client";

import React, { useState, useMemo, useCallback } from "react";
import { RUTable } from "@/components/ui/RUTable";
import {
  useGetBooks,
  useCreateBook,
  useUpdateBook,
  useDeleteBook,
  useUploadBookCover,
  useUploadBookImages,
  useGetBookOptions,
} from "@/hooks/useBooks";
import { IBook, ICreateBookPayload, IUpdateBookPayload } from "@/types/book";
import {
  BookCatalogBanner,
  BookTableFilters,
  BookFormModal,
  BookViewModal,
  BookDeleteConfirmModal,
  createBookTableColumns,
} from "./books";

export interface BooksManagementTableProps {
  roleTitle?: string;
  roleBadge?: string;
  allowDelete?: boolean;
}

export function BooksManagementTable({
  roleTitle = "Book Catalog & Inventory Directory",
  roleBadge = "INVENTORY DESK",
  allowDelete = false,
}: BooksManagementTableProps) {
  // ── Data & Mutations ──────────────────────────────────────────────────────
  const { data, isLoading } = useGetBooks({ limit: 1000 });
  const { data: bookOptions } = useGetBookOptions();
  const { mutate: createBook, isPending: isCreating } = useCreateBook();
  const { mutate: updateBook, isPending: isUpdating } = useUpdateBook();
  const { mutate: deleteBook, isPending: isDeleting } = useDeleteBook();
  const { mutateAsync: uploadCover, isPending: isUploadingCover } = useUploadBookCover();
  const { mutateAsync: uploadImages, isPending: isUploadingGallery } = useUploadBookImages();

  // ── Modal State ───────────────────────────────────────────────────────────
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedBookForEdit, setSelectedBookForEdit] = useState<IBook | null>(null);
  const [viewingBook, setViewingBook] = useState<IBook | null>(null);
  const [deletingBook, setDeletingBook] = useState<IBook | null>(null);

  // ── Filters State ─────────────────────────────────────────────────────────
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");

  // ── Normalized Data Extraction ────────────────────────────────────────────
  const booksList: IBook[] = useMemo(() => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (typeof data === "object" && "data" in data && Array.isArray((data as { data: IBook[] }).data)) {
      return (data as { data: IBook[] }).data;
    }
    return [];
  }, [data]);

  // Extract unique category options for filtering
  const categories = useMemo(() => {
    const set = new Set<string>(bookOptions?.categories || []);
    booksList.forEach((b) => {
      if (b.categories && Array.isArray(b.categories)) {
        b.categories.forEach((c) => c && set.add(c.trim()));
      } else if (b.category?.trim()) {
        b.category.split(',').forEach((c) => c && set.add(c.trim()));
      }
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [booksList, bookOptions?.categories]);

  // Filtered dataset for TanStack Table
  const filteredBooks = useMemo(() => {
    return booksList.filter((b) => {
      const matchesType = typeFilter === "ALL" || b.type === typeFilter;
      const matchesCat =
        categoryFilter === "ALL" ||
        b.category === categoryFilter ||
        (Array.isArray(b.categories) && b.categories.includes(categoryFilter)) ||
        b.category.toLowerCase().includes(categoryFilter.toLowerCase());
      return matchesType && matchesCat;
    });
  }, [booksList, typeFilter, categoryFilter]);

  // ── Action Handlers ───────────────────────────────────────────────────────
  const handleOpenAddModal = useCallback(() => {
    setSelectedBookForEdit(null);
    setIsFormModalOpen(true);
  }, []);

  const handleOpenEditModal = useCallback((book: IBook) => {
    setSelectedBookForEdit(book);
    setIsFormModalOpen(true);
  }, []);

  const handleOpenViewModal = useCallback((book: IBook) => {
    setViewingBook(book);
  }, []);

  const handleOpenDeleteModal = useCallback((book: IBook) => {
    setDeletingBook(book);
  }, []);

  const handleCreateSubmit = useCallback(
    (payload: ICreateBookPayload) => {
      createBook(payload, {
        onSuccess: () => setIsFormModalOpen(false),
      });
    },
    [createBook]
  );

  const handleUpdateSubmit = useCallback(
    (payload: IUpdateBookPayload) => {
      updateBook(payload, {
        onSuccess: () => setIsFormModalOpen(false),
      });
    },
    [updateBook]
  );

  const handleDeleteConfirm = useCallback(() => {
    if (deletingBook && allowDelete) {
      deleteBook(deletingBook.id, {
        onSuccess: () => setDeletingBook(null),
      });
    }
  }, [deletingBook, allowDelete, deleteBook]);

  const handleUploadCover = useCallback(
    async (file: File) => {
      return uploadCover({ file });
    },
    [uploadCover]
  );

  const handleUploadImages = useCallback(
    async (files: File[]) => {
      return uploadImages({ files });
    },
    [uploadImages]
  );

  // ── Table Column Definitions ──────────────────────────────────────────────
  const columns = useMemo(
    () =>
      createBookTableColumns({
        allowDelete,
        onView: handleOpenViewModal,
        onEdit: handleOpenEditModal,
        onDelete: handleOpenDeleteModal,
      }),
    [allowDelete, handleOpenViewModal, handleOpenEditModal, handleOpenDeleteModal]
  );

  return (
    <div className="space-y-6">
      {/* ── Top Hero Banner ── */}
      <BookCatalogBanner
        roleBadge={roleBadge}
        roleTitle={roleTitle}
        onAddNewBook={handleOpenAddModal}
      />

      {/* ── Filter Bar ── */}
      <BookTableFilters
        typeFilter={typeFilter}
        categoryFilter={categoryFilter}
        onTypeFilterChange={setTypeFilter}
        onCategoryFilterChange={setCategoryFilter}
        categories={categories}
        totalFiltered={filteredBooks.length}
        totalAll={booksList.length}
      />

      {/* ── Main Books Data Table ── */}
      <RUTable
        columns={columns}
        data={filteredBooks}
        isLoading={isLoading}
        searchPlaceholder="Filter books by title, author, category, or ISBN..."
      />

      {/* ── Modal: Add / Edit Book ── */}
      <BookFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        selectedBook={selectedBookForEdit}
        categories={categories}
        bookOptions={bookOptions}
        onSubmitCreate={handleCreateSubmit}
        onSubmitUpdate={handleUpdateSubmit}
        onUploadCover={handleUploadCover}
        onUploadImages={handleUploadImages}
        isSubmitting={isCreating || isUpdating}
        isUploadingCover={isUploadingCover}
        isUploadingGallery={isUploadingGallery}
      />

      {/* ── Modal: View Book Details ── */}
      <BookViewModal
        book={viewingBook}
        onClose={() => setViewingBook(null)}
      />

      {/* ── Modal: Delete Confirmation ── */}
      <BookDeleteConfirmModal
        isOpen={Boolean(deletingBook) && allowDelete}
        bookTitle={deletingBook?.title}
        isDeleting={isDeleting}
        onClose={() => setDeletingBook(null)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}

export default BooksManagementTable;

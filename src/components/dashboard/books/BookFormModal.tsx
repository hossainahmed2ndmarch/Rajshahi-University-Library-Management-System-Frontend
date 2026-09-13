"use client";

import React, { useState, useMemo } from "react";
import { BookOpen, X } from "lucide-react";
import { RUForm } from "@/components/forms";
import { IBook, ICreateBookPayload, IUpdateBookPayload, IAuthorItem, IBookOptions } from "@/types/book";
import { bookFormSchema, BookFormValues } from "./bookFormSchema";
import { BookFormFields } from "./BookFormFields";

export interface BookFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedBook: IBook | null;
  categories?: string[];
  bookOptions?: IBookOptions;
  onSubmitCreate: (data: ICreateBookPayload) => void;
  onSubmitUpdate: (data: IUpdateBookPayload) => void;
  onUploadCover: (file: File) => Promise<string>;
  onUploadImages: (files: File[]) => Promise<string[]>;
  isSubmitting: boolean;
  isUploadingCover: boolean;
  isUploadingGallery: boolean;
}

interface BookFormModalContentProps {
  onClose: () => void;
  selectedBook: IBook | null;
  categories?: string[];
  bookOptions?: IBookOptions;
  onSubmitCreate: (data: ICreateBookPayload) => void;
  onSubmitUpdate: (data: IUpdateBookPayload) => void;
  onUploadCover: (file: File) => Promise<string>;
  onUploadImages: (files: File[]) => Promise<string[]>;
  isSubmitting: boolean;
  isUploadingCover: boolean;
  isUploadingGallery: boolean;
}

function parseAuthorsFromString(str?: string): IAuthorItem[] {
  if (!str || !str.trim()) return [{ name: "", role: "WRITER" }];
  const parts = str.split(",");
  const result: IAuthorItem[] = [];
  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    const isTrans = trimmed.toLowerCase().includes("(translator)");
    const clean = trimmed.replace(/\(translator\)/i, "").trim();
    if (clean) {
      result.push({
        name: clean,
        role: isTrans ? "TRANSLATOR" : "WRITER",
      });
    }
  }
  return result.length > 0 ? result : [{ name: "", role: "WRITER" }];
}

function parseCategoriesFromString(str?: string): string[] {
  if (!str || !str.trim()) return [];
  return str.split(",").map((s) => s.trim()).filter(Boolean);
}

function BookFormModalContent({
  onClose,
  selectedBook,
  categories = [],
  bookOptions,
  onSubmitCreate,
  onSubmitUpdate,
  onUploadCover,
  onUploadImages,
  isSubmitting,
  isUploadingCover,
  isUploadingGallery,
}: BookFormModalContentProps) {
  // Initialize state directly from selectedBook props
  const [coverImageUrl, setCoverImageUrl] = useState<string>(
    () => selectedBook?.coverImage || ""
  );
  const [additionalImages, setAdditionalImages] = useState<string[]>(
    () => (Array.isArray(selectedBook?.images) ? selectedBook.images : [])
  );

  const handleCoverUpload = async (file: File) => {
    const url = await onUploadCover(file);
    if (url) setCoverImageUrl(url);
  };

  const handleCoverRemove = () => {
    setCoverImageUrl("");
  };

  const handleAdditionalImagesUpload = async (files: File[]) => {
    const urls = await onUploadImages(files);
    if (urls && urls.length > 0) {
      setAdditionalImages((prev) => [...prev, ...urls]);
    }
  };

  const handleAdditionalImageRemove = (index: number) => {
    setAdditionalImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (values: BookFormValues) => {
    const isBorrowOnly = values.type === "BORROW_ONLY";
    const isSellOnly = values.type === "SELL_ONLY";

    const borrowStock = isSellOnly
      ? 0
      : values.borrowStock !== undefined && values.borrowStock !== ""
      ? Number(values.borrowStock)
      : 0;

    const sellStock = isBorrowOnly
      ? 0
      : values.sellStock !== undefined && values.sellStock !== ""
      ? Number(values.sellStock)
      : 0;

    const sellPrice = isBorrowOnly
      ? undefined
      : values.sellPrice !== undefined && values.sellPrice !== ""
      ? Number(values.sellPrice)
      : undefined;

    const buyPrice =
      values.buyPrice !== undefined && values.buyPrice !== "" && values.buyPrice !== null
        ? Number(values.buyPrice)
        : undefined;

    const discount =
      values.discount !== undefined && values.discount !== "" && values.discount !== null
        ? Number(values.discount)
        : 0;

    const pages = values.pages !== undefined && values.pages !== "" ? Number(values.pages) : 0;

    // Sanitize and structure authors
    const validAuthors = (values.authors || [])
      .map((a) => ({ name: a.name.trim(), role: a.role }))
      .filter((a) => Boolean(a.name));

    const authorString =
      validAuthors.length > 0
        ? validAuthors
            .map((a) => (a.role === "TRANSLATOR" ? `${a.name} (Translator)` : a.name))
            .join(", ")
        : values.author?.trim() || "";

    // Sanitize and structure categories
    const validCategories = Array.from(
      new Set(
        (values.categories || [])
          .map((c) => c.trim())
          .filter(Boolean)
      )
    );

    const categoryString =
      validCategories.length > 0
        ? validCategories.join(", ")
        : values.category?.trim() || "General";

    if (selectedBook) {
      onSubmitUpdate({
        id: selectedBook.id,
        title: values.title.trim(),
        author: authorString,
        authors: validAuthors,
        isbn: values.isbn?.trim() || selectedBook.isbn || "",
        locationCell: values.locationCell.trim() || selectedBook.locationCell || "Rack-Unassigned",
        category: categoryString,
        categories: validCategories,
        publisher: values.publisher?.trim() || undefined,
        pages,
        type: values.type,
        sellPrice,
        buyPrice,
        discount,
        borrowStock,
        sellStock,
        description: values.description?.trim() || undefined,
        coverImage: coverImageUrl || undefined,
        images: additionalImages,
      });
    } else {
      onSubmitCreate({
        title: values.title.trim(),
        author: authorString,
        authors: validAuthors,
        isbn: values.isbn?.trim() || `RUIL-${Date.now().toString().slice(-6)}`,
        locationCell: values.locationCell.trim() || "Rack-Unassigned",
        category: categoryString,
        categories: validCategories,
        publisher: values.publisher?.trim() || undefined,
        pages,
        type: values.type,
        sellPrice,
        buyPrice,
        discount,
        borrowStock,
        sellStock,
        description: values.description?.trim() || undefined,
        coverImage: coverImageUrl || undefined,
        images: additionalImages,
      });
    }
  };

  const parsedAuthors: IAuthorItem[] = useMemo(() => {
    if (selectedBook?.authors && Array.isArray(selectedBook.authors) && selectedBook.authors.length > 0) {
      return selectedBook.authors;
    }
    if (selectedBook?.author) {
      return parseAuthorsFromString(selectedBook.author);
    }
    return [{ name: "", role: "WRITER" }];
  }, [selectedBook]);

  const parsedCategories: string[] = useMemo(() => {
    if (selectedBook?.categories && Array.isArray(selectedBook.categories) && selectedBook.categories.length > 0) {
      return selectedBook.categories;
    }
    if (selectedBook?.category) {
      return parseCategoriesFromString(selectedBook.category);
    }
    return [];
  }, [selectedBook]);

  const defaultValues: BookFormValues = {
    title: selectedBook?.title || "",
    authors: parsedAuthors,
    author: selectedBook?.author || "",
    isbn: selectedBook?.isbn || "",
    locationCell: selectedBook?.locationCell || "",
    categories: parsedCategories,
    category: selectedBook?.category || "",
    publisher: selectedBook?.publisher || "",
    pages: selectedBook?.pages || 350,
    type: selectedBook?.type || "HYBRID",
    buyPrice: selectedBook?.buyPrice ?? undefined,
    sellPrice: selectedBook?.sellPrice ?? selectedBook?.price ?? 500,
    discount: selectedBook?.discount ?? 0,
    borrowStock: selectedBook?.borrowStock ?? selectedBook?.availableQuantity ?? 10,
    sellStock: selectedBook?.sellStock ?? selectedBook?.stockQuantity ?? 5,
    description: selectedBook?.description || "",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/65 backdrop-blur-xs p-0 sm:p-4 md:p-6 animate-in fade-in-50">
      <div className="relative w-full sm:max-w-3xl h-[95dvh] sm:max-h-[94vh] sm:h-auto overflow-y-auto rounded-t-3xl sm:rounded-3xl border border-border bg-card p-4 sm:p-6 md:p-8 shadow-2xl text-card-foreground">
        <button
          onClick={onClose}
          className="absolute right-3 top-3 sm:right-4 sm:top-4 p-1 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer transition-colors"
          title="Close dialog"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center space-x-3 pb-4 border-b border-border mb-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-foreground">
              {selectedBook ? "Edit Book Inventory Record" : "Add New Book to Inventory"}
            </h3>
            <p className="text-xs text-muted-foreground">
              Configure multiple authors &amp; translators, categories, shelf cell, publisher, and stock pricing.
            </p>
          </div>
        </div>

        <RUForm<BookFormValues>
          schema={bookFormSchema}
          defaultValues={defaultValues}
          onSubmit={handleSubmit}
        >
          <BookFormFields
            selectedBook={selectedBook}
            categories={categories}
            bookOptions={bookOptions}
            isSubmitting={isSubmitting}
            onCancel={onClose}
            coverImageUrl={coverImageUrl}
            additionalImages={additionalImages}
            onCoverUpload={handleCoverUpload}
            onCoverRemove={handleCoverRemove}
            onAdditionalImagesUpload={handleAdditionalImagesUpload}
            onAdditionalImageRemove={handleAdditionalImageRemove}
            isUploadingCover={isUploadingCover}
            isUploadingGallery={isUploadingGallery}
          />
        </RUForm>
      </div>
    </div>
  );
}

export function BookFormModal(props: BookFormModalProps) {
  if (!props.isOpen) return null;

  // Key the content component by book id or 'new' to naturally reset all local state when opened or switched
  const contentKey = props.selectedBook ? String(props.selectedBook.id) : "new-book";

  return <BookFormModalContent key={contentKey} {...props} />;
}

export default BookFormModal;

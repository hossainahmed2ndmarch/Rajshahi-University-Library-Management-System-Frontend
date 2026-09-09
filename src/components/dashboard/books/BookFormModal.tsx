"use client";

import React, { useState } from "react";
import { BookOpen, X } from "lucide-react";
import { RUForm } from "@/components/forms";
import { IBook, ICreateBookPayload, IUpdateBookPayload } from "@/types/book";
import { bookFormSchema, BookFormValues } from "./bookFormSchema";
import { BookFormFields } from "./BookFormFields";

export interface BookFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedBook: IBook | null;
  categories?: string[];
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
  onSubmitCreate: (data: ICreateBookPayload) => void;
  onSubmitUpdate: (data: IUpdateBookPayload) => void;
  onUploadCover: (file: File) => Promise<string>;
  onUploadImages: (files: File[]) => Promise<string[]>;
  isSubmitting: boolean;
  isUploadingCover: boolean;
  isUploadingGallery: boolean;
}

function BookFormModalContent({
  onClose,
  selectedBook,
  categories = [],
  onSubmitCreate,
  onSubmitUpdate,
  onUploadCover,
  onUploadImages,
  isSubmitting,
  isUploadingCover,
  isUploadingGallery,
}: BookFormModalContentProps) {
  // Initialize state directly from selectedBook props — no synchronous setState inside useEffect needed!
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

    if (selectedBook) {
      onSubmitUpdate({
        id: selectedBook.id,
        title: values.title.trim(),
        author: values.author.trim(),
        isbn: values.isbn?.trim() || selectedBook.isbn || "",
        locationCell: values.locationCell?.trim() || selectedBook.locationCell || "Rack-Unassigned",
        category: values.category.trim(),
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
        author: values.author.trim(),
        isbn: values.isbn?.trim() || `RUIL-${Date.now().toString().slice(-6)}`,
        locationCell: values.locationCell?.trim() || "Rack-Unassigned",
        category: values.category.trim(),
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

  const defaultValues: BookFormValues = {
    title: selectedBook?.title || "",
    author: selectedBook?.author || "",
    isbn: selectedBook?.isbn || "",
    locationCell: selectedBook?.locationCell || "",
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
              Fill in catalog details, shelf placement, stock parameters, and cover photos.
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

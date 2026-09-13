"use client";

import React, { useEffect, useMemo } from "react";
import { useFormContext, Controller } from "react-hook-form";
import { BookOpen, Barcode, MapPin, Building, DollarSign } from "lucide-react";
import { RUInput, RUSelect } from "@/components/forms";
import { IBook, IBookOptions } from "@/types/book";
import { BookFormValues } from "./bookFormSchema";
import { BookImagesUploader } from "./BookImagesUploader";
import { MultiCategorySelector } from "./MultiCategorySelector";
import { MultiAuthorManager } from "./MultiAuthorManager";
import { CreatableCombobox } from "./CreatableCombobox";
import { useGetBookOptions } from "@/hooks/useBooks";

interface BookFormFieldsProps {
  selectedBook: IBook | null;
  categories?: string[];
  bookOptions?: IBookOptions;
  isSubmitting: boolean;
  onCancel: () => void;
  coverImageUrl: string;
  additionalImages: string[];
  onCoverUpload: (file: File) => void;
  onCoverRemove: () => void;
  onAdditionalImagesUpload: (files: File[]) => void;
  onAdditionalImageRemove: (index: number) => void;
  isUploadingCover: boolean;
  isUploadingGallery: boolean;
}

export function BookFormFields({
  selectedBook,
  categories = [],
  bookOptions: passedOptions,
  isSubmitting,
  onCancel,
  coverImageUrl,
  additionalImages,
  onCoverUpload,
  onCoverRemove,
  onAdditionalImagesUpload,
  onAdditionalImageRemove,
  isUploadingCover,
  isUploadingGallery,
}: BookFormFieldsProps) {
  const { watch, setValue, control } = useFormContext<BookFormValues>();
  const accessType = watch("type");

  // Fetch preexisting database options (categories, location cells, publishers, authors)
  const { data: fetchedOptions } = useGetBookOptions();
  const effectiveOptions = passedOptions || fetchedOptions;

  // Sync zero values according to access type
  useEffect(() => {
    if (accessType === "BORROW_ONLY") {
      setValue("sellStock", 0);
      setValue("sellPrice", 0);
      setValue("discount", 0);
    } else if (accessType === "SELL_ONLY") {
      setValue("borrowStock", 0);
    }
  }, [accessType, setValue]);

  // Merge and sort categories
  const dbCategories = useMemo(() => {
    const combined = [...(effectiveOptions?.categories || []), ...(categories || [])];
    const set = new Set<string>();
    combined.forEach((c) => {
      if (c && c.trim()) set.add(c.trim());
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [effectiveOptions?.categories, categories]);

  const dbLocationCells = useMemo(() => {
    return effectiveOptions?.locationCells || [];
  }, [effectiveOptions?.locationCells]);

  const dbPublishers = useMemo(() => {
    return effectiveOptions?.publishers || [];
  }, [effectiveOptions?.publishers]);

  const dbAuthors = useMemo(() => {
    return effectiveOptions?.authors || [];
  }, [effectiveOptions?.authors]);

  const isBorrowOnly = accessType === "BORROW_ONLY";
  const isSellOnly = accessType === "SELL_ONLY";

  return (
    <div className="space-y-4">
      {/* ── Cover & Gallery Images Upload ── */}
      <BookImagesUploader
        coverImageUrl={coverImageUrl}
        additionalImages={additionalImages}
        onCoverUpload={onCoverUpload}
        onCoverRemove={onCoverRemove}
        onAdditionalImagesUpload={onAdditionalImagesUpload}
        onAdditionalImageRemove={onAdditionalImageRemove}
        isUploadingCover={isUploadingCover}
        isUploadingGallery={isUploadingGallery}
      />

      {/* ── Book Title ── */}
      <div className="grid grid-cols-1 gap-3">
        <RUInput
          name="title"
          label="Book Title"
          placeholder="e.g. Tafsir Ibn Kathir Vol 1 (Authentic Darussalam Print)"
          prependIcon={<BookOpen className="h-4 w-4" />}
          required
        />
      </div>

      {/* ── Author / Scholar (Multiple + Roles [Writer / Translator]) ── */}
      <div className="p-3.5 sm:p-4 rounded-xl border border-border/80 bg-muted/20 space-y-3">
        <Controller
          name="authors"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <MultiAuthorManager
              authors={field.value || [{ name: "", role: "WRITER" }]}
              onChange={field.onChange}
              preexistingAuthors={dbAuthors}
              error={error?.message}
            />
          )}
        />
      </div>

      {/* ── Category / Genre (Multiple) ── */}
      <div className="p-3.5 sm:p-4 rounded-xl border border-border/80 bg-muted/20">
        <Controller
          name="categories"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <MultiCategorySelector
              categories={field.value || []}
              onChange={field.onChange}
              preexistingCategories={dbCategories}
              error={error?.message}
            />
          )}
        />
      </div>

      {/* ── Shelf Location Cell, Publisher & ISBN ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
        {/* Shelf Location Cell (Creatable Combobox with DB suggestions) */}
        <Controller
          name="locationCell"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <CreatableCombobox
              label="Shelf Location Cell"
              value={field.value ?? ""}
              onChange={field.onChange}
              options={dbLocationCells}
              placeholder="e.g. Rack-A2-04"
              prependIcon={<MapPin className="h-4 w-4" />}
              error={error?.message}
              required
            />
          )}
        />

        {/* Publisher (Creatable Combobox with DB suggestions) */}
        <Controller
          name="publisher"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <CreatableCombobox
              label="Publisher"
              value={field.value ?? ""}
              onChange={field.onChange}
              options={dbPublishers}
              placeholder="e.g. Darussalam"
              prependIcon={<Building className="h-4 w-4" />}
              error={error?.message}
            />
          )}
        />

        {/* ISBN / Barcode */}
        <RUInput
          name="isbn"
          label="ISBN / Barcode"
          placeholder="e.g. 978-6035000147"
          prependIcon={<Barcode className="h-4 w-4" />}
        />
      </div>

      {/* ── Pages, Access Type ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <RUInput
          name="pages"
          label="Total Pages"
          type="number"
          placeholder="e.g. 450"
        />

        <RUSelect
          name="type"
          label="Access Type"
          options={[
            { label: "Borrow & Sell (HYBRID)", value: "HYBRID" },
            { label: "Borrow Only", value: "BORROW_ONLY" },
            { label: "Sell Only", value: "SELL_ONLY" },
          ]}
          required
        />
      </div>

      {/* ── Inventory Stock & Pricing Section ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3 p-3.5 sm:p-4 rounded-xl border border-border/80 bg-muted/30">
        <RUInput
          name="borrowStock"
          label="Borrow Stock"
          type="number"
          placeholder={isSellOnly ? "0" : "Count"}
          disabled={isSellOnly}
          description={isSellOnly ? "Disabled (Sell Only)" : "Copies for loan"}
        />

        <RUInput
          name="sellStock"
          label="Sell Stock"
          type="number"
          placeholder={isBorrowOnly ? "0" : "Count"}
          disabled={isBorrowOnly}
          description={isBorrowOnly ? "Disabled (Borrow Only)" : "Copies for sale"}
        />

        <RUInput
          name="buyPrice"
          label="Cost (৳)"
          type="number"
          placeholder="0"
          prependIcon={<DollarSign className="h-4 w-4" />}
          description="Purchase cost"
        />

        <RUInput
          name="sellPrice"
          label="Sell Price (৳)"
          type="number"
          placeholder={isBorrowOnly ? "0" : "Price"}
          prependIcon={<DollarSign className="h-4 w-4" />}
          disabled={isBorrowOnly}
          description={isBorrowOnly ? "Disabled (Borrow Only)" : "Customer price"}
        />

        <RUInput
          name="discount"
          label="Discount (%)"
          type="number"
          placeholder="0"
          disabled={isBorrowOnly}
          description={isBorrowOnly ? "Disabled" : "0 - 100% off"}
        />
      </div>

      {/* ── Synopsis / Description ── */}
      <RUInput
        name="description"
        label="Description / Synopsis"
        placeholder="Summary of book contents, volume index, research subject..."
      />

      {/* ── Action Buttons ── */}
      <div className="pt-3 flex justify-end space-x-2 border-t border-border">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-xs font-semibold rounded-lg border border-input bg-background hover:bg-accent text-foreground cursor-pointer transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting || isUploadingCover || isUploadingGallery}
          className="px-5 py-2 text-xs font-bold rounded-lg bg-[#004F32] hover:bg-emerald-900 text-white shadow-2xs disabled:opacity-50 cursor-pointer transition-colors"
        >
          {isUploadingCover
            ? "Uploading Cover…"
            : isUploadingGallery
            ? "Uploading Photos…"
            : isSubmitting
            ? "Saving…"
            : selectedBook
            ? "Update Inventory"
            : "Create Book"}
        </button>
      </div>
    </div>
  );
}

export default BookFormFields;

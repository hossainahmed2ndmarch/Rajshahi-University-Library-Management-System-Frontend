"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useFormContext, Controller } from "react-hook-form";
import { BookOpen, Tag, Barcode, MapPin, DollarSign, Plus, Check } from "lucide-react";
import { RUInput, RUSelect } from "@/components/forms";
import { IBook } from "@/types/book";
import { BookFormValues } from "./bookFormSchema";
import { BookImagesUploader } from "./BookImagesUploader";
import { cn } from "@/lib/utils";

interface BookFormFieldsProps {
  selectedBook: IBook | null;
  categories?: string[];
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
  const currentCategory = watch("category");

  // Determine if user is in custom category input mode
  const [isCustomCategory, setIsCustomCategory] = useState<boolean>(() => {
    if (!currentCategory) return false;
    return !categories.includes(currentCategory);
  });

  useEffect(() => {
    if (accessType === "BORROW_ONLY") {
      setValue("sellStock", 0);
      setValue("sellPrice", 0);
      setValue("discount", 0);
    } else if (accessType === "SELL_ONLY") {
      setValue("borrowStock", 0);
    }
  }, [accessType, setValue]);

  // Unique sorted list of categories
  const sortedCategories = useMemo(() => {
    const set = new Set<string>();
    categories.forEach((c) => {
      if (c && c.trim()) set.add(c.trim());
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [categories]);

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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        <RUInput
          name="title"
          label="Book Title"
          placeholder="e.g. Tafsir Ibn Kathir Vol 1"
          prependIcon={<BookOpen className="h-4 w-4" />}
          required
        />

        <RUInput
          name="author"
          label="Author / Scholar"
          placeholder="e.g. Hafiz Ibn Kathir"
          prependIcon={<Tag className="h-4 w-4" />}
          required
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
        <RUInput
          name="isbn"
          label="ISBN / Barcode"
          placeholder="e.g. 978-6035000147"
          prependIcon={<Barcode className="h-4 w-4" />}
        />

        <RUInput
          name="locationCell"
          label="Shelf Location Cell"
          placeholder="e.g. Rack-A2-04"
          prependIcon={<MapPin className="h-4 w-4" />}
        />

        {/* ── Category / Genre Selection or Custom Input ── */}
        <div className="flex flex-col space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-foreground flex items-center gap-1">
              <span>Category / Genre</span>
              <span className="text-destructive text-xs">*</span>
            </label>
            <button
              type="button"
              onClick={() => {
                setIsCustomCategory((prev) => !prev);
              }}
              className="text-[11px] font-semibold text-primary hover:underline flex items-center gap-0.5 cursor-pointer"
            >
              {isCustomCategory ? (
                <>
                  <Check className="h-3 w-3" /> Select Existing
                </>
              ) : (
                <>
                  <Plus className="h-3 w-3" /> Write New
                </>
              )}
            </button>
          </div>

          <Controller
            name="category"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <div>
                {isCustomCategory ? (
                  <div className="relative flex items-center">
                    <div className="absolute left-3 text-muted-foreground pointer-events-none z-10 flex items-center justify-center">
                      <Tag className="h-4 w-4" />
                    </div>
                    <input
                      id="category"
                      type="text"
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(e.target.value)}
                      placeholder="Type new category (e.g. Islamic Finance)..."
                      className={cn(
                        "flex h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 transition-colors",
                        error && "border-destructive focus-visible:ring-destructive"
                      )}
                    />
                  </div>
                ) : (
                  <div className="relative flex items-center">
                    <div className="absolute left-3 text-muted-foreground pointer-events-none z-10 flex items-center justify-center">
                      <Tag className="h-4 w-4" />
                    </div>
                    <select
                      id="category"
                      value={field.value ?? ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "__NEW_CATEGORY__") {
                          setIsCustomCategory(true);
                          field.onChange("");
                        } else {
                          field.onChange(val);
                        }
                      }}
                      className={cn(
                        "flex h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 transition-colors cursor-pointer",
                        error && "border-destructive focus-visible:ring-destructive"
                      )}
                    >
                      <option value="">Select a category...</option>
                      {sortedCategories.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                      <option value="__NEW_CATEGORY__">+ Write New Category...</option>
                    </select>
                  </div>
                )}
                {error && <p className="text-xs text-destructive mt-1">{error.message}</p>}
              </div>
            )}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
        <RUInput
          name="publisher"
          label="Publisher"
          placeholder="e.g. Darussalam"
        />

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

      {/* ── Inventory Stock & Pricing Section (NO Borrow Fee as per Prisma schema) ── */}
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

      <RUInput
        name="description"
        label="Description / Synopsis"
        placeholder="Summary of book contents..."
      />

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

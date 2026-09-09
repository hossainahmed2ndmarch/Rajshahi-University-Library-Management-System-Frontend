"use client";

import React, { useRef } from "react";
import { Camera, ImageOff, Loader2, Plus, X } from "lucide-react";
import { toast } from "sonner";

interface BookImagesUploaderProps {
  coverImageUrl: string;
  additionalImages: string[];
  onCoverUpload: (file: File) => void;
  onCoverRemove: () => void;
  onAdditionalImagesUpload: (files: File[]) => void;
  onAdditionalImageRemove: (index: number) => void;
  isUploadingCover: boolean;
  isUploadingGallery: boolean;
}

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const MAX_IMAGE_SIZE_BYTES = 8 * 1024 * 1024; // 8MB

export function BookImagesUploader({
  coverImageUrl,
  additionalImages,
  onCoverUpload,
  onCoverRemove,
  onAdditionalImagesUpload,
  onAdditionalImageRemove,
  isUploadingCover,
  isUploadingGallery,
}: BookImagesUploaderProps) {
  const coverInputRef = useRef<HTMLInputElement | null>(null);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);

  const handleCoverFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      toast.error("Only JPEG, PNG, WEBP, or AVIF images are allowed for book covers.");
      return;
    }
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      toast.error("Book cover image must be under 8 MB.");
      return;
    }
    onCoverUpload(file);
    if (coverInputRef.current) coverInputRef.current.value = "";
  };

  const handleGalleryFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const validFiles = files.filter(
      (f) => ALLOWED_IMAGE_TYPES.includes(f.type) && f.size <= MAX_IMAGE_SIZE_BYTES
    );

    if (validFiles.length < files.length) {
      toast.info("Some files were skipped because they exceeded 8MB or had an unsupported format.");
    }

    if (validFiles.length > 0) {
      onAdditionalImagesUpload(validFiles);
    }
    if (galleryInputRef.current) galleryInputRef.current.value = "";
  };

  return (
    <div className="space-y-4 rounded-xl border border-border bg-muted/20 p-4">
      {/* ── Main Cover Image ── */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-foreground uppercase tracking-wide flex items-center justify-between">
          <span>Primary Cover Image</span>
          <span className="text-[10px] text-muted-foreground font-normal">
            Displayed on cards &amp; catalog
          </span>
        </label>

        <div className="flex items-start gap-4">
          {/* Preview box */}
          <div className="relative h-28 w-20 shrink-0 rounded-lg border-2 border-dashed border-border bg-muted/40 overflow-hidden flex items-center justify-center">
            {isUploadingCover ? (
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            ) : coverImageUrl ? (
              <>
                <img
                  src={coverImageUrl}
                  alt="Book cover preview"
                  className="h-full w-full object-cover"
                />
                <button
                  type="button"
                  onClick={onCoverRemove}
                  title="Remove cover image"
                  className="absolute top-1 right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center shadow hover:scale-110 transition-transform cursor-pointer"
                >
                  <X className="h-3 w-3" />
                </button>
              </>
            ) : (
              <ImageOff className="h-7 w-7 text-muted-foreground/50" />
            )}
          </div>

          {/* Upload controls */}
          <div className="flex flex-col gap-2 justify-center pt-1">
            <input
              ref={coverInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              className="hidden"
              onChange={handleCoverFileChange}
            />
            <button
              type="button"
              onClick={() => coverInputRef.current?.click()}
              disabled={isUploadingCover}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background hover:bg-muted px-3 py-1.5 text-xs font-semibold text-foreground transition-colors cursor-pointer disabled:opacity-50"
            >
              {isUploadingCover ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Uploading Cover…
                </>
              ) : (
                <>
                  <Camera className="h-3 w-3 text-primary" />
                  {coverImageUrl ? "Change Main Cover" : "Upload Main Cover"}
                </>
              )}
            </button>
            {coverImageUrl && (
              <button
                type="button"
                onClick={onCoverRemove}
                disabled={isUploadingCover}
                className="inline-flex items-center gap-1 rounded-lg border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 text-red-700 dark:text-red-300 px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
              >
                <X className="h-3 w-3" /> Remove Cover
              </button>
            )}
            <p className="text-[10px] text-muted-foreground leading-tight max-w-[200px]">
              JPEG, PNG, WEBP or AVIF · Max 8 MB
            </p>
          </div>
        </div>
      </div>

      {/* ── Additional Book Images ── */}
      <div className="pt-3 border-t border-border/60 space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <label className="text-xs font-semibold text-foreground uppercase tracking-wide block">
              Additional Book Images
            </label>
            <span className="text-[10px] text-muted-foreground">
              Inside pages, table of contents, back cover previews ({additionalImages.length} attached)
            </span>
          </div>
          <input
            ref={galleryInputRef}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,image/avif"
            className="hidden"
            onChange={handleGalleryFilesChange}
          />
          <button
            type="button"
            onClick={() => galleryInputRef.current?.click()}
            disabled={isUploadingGallery}
            className="inline-flex items-center gap-1.5 rounded-lg border border-primary/40 bg-primary/10 hover:bg-primary/20 text-primary px-3 py-1 text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
          >
            {isUploadingGallery ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin" />
                Uploading…
              </>
            ) : (
              <>
                <Plus className="h-3 w-3" />
                Add Photos
              </>
            )}
          </button>
        </div>

        {additionalImages.length > 0 ? (
          <div className="flex flex-wrap gap-2.5 pt-1">
            {additionalImages.map((url, idx) => (
              <div
                key={idx}
                className="relative h-20 w-16 rounded-lg overflow-hidden border border-border bg-muted/40 group shadow-2xs"
              >
                <img src={url} alt={`Book image ${idx + 1}`} className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => onAdditionalImageRemove(idx)}
                  className="absolute top-1 right-1 h-5 w-5 rounded-full bg-destructive text-white flex items-center justify-center shadow opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  title="Remove this image"
                >
                  <X className="h-3 w-3" />
                </button>
                <span className="absolute bottom-0 inset-x-0 bg-black/60 text-[9px] text-white text-center py-0.5 font-mono">
                  #{idx + 1}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-[11px] text-muted-foreground italic py-1">
            No additional preview photos added yet.
          </div>
        )}
      </div>
    </div>
  );
}

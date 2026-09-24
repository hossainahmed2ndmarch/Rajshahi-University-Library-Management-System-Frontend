"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import {
  UploadCloud,
  FileAudio,
  Image as ImageIcon,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface FileUploadDropzoneProps {
  type: "image" | "audio";
  value?: string | null;
  onChange: (url: string) => void;
  onUpload: (file: File) => Promise<string>;
  label?: string;
  helperText?: string;
  className?: string;
  accept?: string;
}

export function FileUploadDropzone({
  type,
  value,
  onChange,
  onUpload,
  label,
  helperText,
  className,
  accept,
}: FileUploadDropzoneProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const defaultAccept =
    type === "image"
      ? "image/png, image/jpeg, image/webp, image/gif, image/avif"
      : "audio/mp3, audio/mpeg, audio/wav, audio/ogg, audio/aac, audio/m4a, audio/webm";

  const handleFileSelect = async (file: File) => {
    if (!file) return;

    // Check size limit: 10MB for image, 60MB for audio
    const maxSize = type === "image" ? 10 * 1024 * 1024 : 60 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error(
        type === "image"
          ? "Image size must be less than 10MB"
          : "Audio size must be less than 60MB"
      );
      return;
    }

    try {
      setIsUploading(true);
      const uploadedUrl = await onUpload(file);
      if (uploadedUrl) {
        onChange(uploadedUrl);
        toast.success(
          type === "image"
            ? "Image uploaded successfully!"
            : "Audio uploaded successfully!"
        );
      }
    } catch (err: any) {
      toast.error(
        err.response?.data?.message ||
          (type === "image" ? "Failed to upload image" : "Failed to upload audio")
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className={cn("space-y-1.5", className)}>
      {label && (
        <label className="block text-xs font-semibold text-foreground flex items-center justify-between">
          <span>{label}</span>
          <span className="text-[10px] text-muted-foreground font-normal">
            {type === "image" ? "Max 10MB (JPG, PNG, WebP)" : "Max 60MB (MP3, WAV, M4A)"}
          </span>
        </label>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={accept || defaultAccept}
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFileSelect(e.target.files[0]);
          }
        }}
      />

      {value ? (
        <div className="relative rounded-2xl border border-border bg-card p-3 shadow-xs transition-all group">
          {type === "image" ? (
            <div className="relative w-full h-40 sm:h-48 rounded-xl overflow-hidden bg-muted/40 border border-border/50">
              <Image
                src={value}
                alt="Banner preview"
                fill
                className="object-cover"
                unoptimized
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 bg-white/90 hover:bg-white text-zinc-900 rounded-lg text-xs font-semibold shadow-md transition-all"
                >
                  Change Image
                </button>
                <button
                  type="button"
                  onClick={() => onChange("")}
                  className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold shadow-md transition-all"
                >
                  Remove
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 rounded-xl bg-muted/30 border border-border">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                    <FileAudio className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <span>Audio File Attached</span>
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                    </p>
                    <p className="text-[10px] text-muted-foreground truncate max-w-[240px]">
                      {value}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-2.5 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 rounded-lg transition-colors"
                  >
                    Change
                  </button>
                  <button
                    type="button"
                    onClick={() => onChange("")}
                    className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
                    title="Remove"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <audio controls src={value} className="w-full h-9 rounded-lg" />
            </div>
          )}

          {/* Value URL indicator */}
          <div className="mt-2 flex items-center justify-between px-1">
            <span className="text-[10px] text-muted-foreground font-mono truncate max-w-[80%]">
              {value}
            </span>
            <button
              type="button"
              onClick={() => onChange("")}
              className="text-[11px] text-red-500 hover:underline"
            >
              Clear
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !isUploading && fileInputRef.current?.click()}
          className={cn(
            "relative border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-2",
            isDragging
              ? "border-emerald-500 bg-emerald-500/10 scale-[0.99]"
              : "border-border hover:border-emerald-500/60 bg-muted/20 hover:bg-muted/40",
            isUploading && "pointer-events-none opacity-80"
          )}
        >
          {isUploading ? (
            <div className="py-4 space-y-2 flex flex-col items-center">
              <Loader2 className="h-8 w-8 text-emerald-600 animate-spin" />
              <p className="text-xs font-semibold text-foreground">
                Uploading {type}...
              </p>
              <p className="text-[11px] text-muted-foreground">
                Uploading to Cloudinary CDN, please wait
              </p>
            </div>
          ) : (
            <>
              <div className="h-11 w-11 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-xs">
                {type === "image" ? (
                  <ImageIcon className="h-5 w-5" />
                ) : (
                  <FileAudio className="h-5 w-5" />
                )}
              </div>
              <div>
                <p className="text-xs font-semibold text-foreground">
                  <span className="text-emerald-700 dark:text-emerald-400 underline">
                    Click to browse
                  </span>{" "}
                  or drag and drop
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {type === "image"
                    ? "PNG, JPG, WEBP, AVIF up to 10MB"
                    : "MP3, WAV, AAC, M4A, WEBM up to 60MB"}
                </p>
              </div>
            </>
          )}
        </div>
      )}

      {helperText && (
        <p className="text-[11px] text-muted-foreground">{helperText}</p>
      )}
    </div>
  );
}

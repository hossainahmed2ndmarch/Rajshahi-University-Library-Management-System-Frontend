"use client";

import React from "react";
import { AlertTriangle, Trash2, X, Loader2 } from "lucide-react";
import { IArticle } from "@/types/article";

interface PublicationDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  article: IArticle | null;
  onConfirm: (id: number) => void;
  isDeleting: boolean;
}

export function PublicationDeleteModal({
  isOpen,
  onClose,
  article,
  onConfirm,
  isDeleting,
}: PublicationDeleteModalProps) {
  if (!isOpen || !article) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in-0">
      <div className="relative w-full max-w-md bg-card text-card-foreground border border-border rounded-3xl shadow-2xl p-6 space-y-4">
        <button
          onClick={onClose}
          disabled={isDeleting}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-red-500/10 text-red-600 dark:text-red-400">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground">Delete Publication</h3>
            <p className="text-xs text-muted-foreground">Permanent removal from library records</p>
          </div>
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed">
          Are you sure you want to permanently delete the publication{" "}
          <strong className="text-foreground">"{article.title}"</strong>? This action cannot be
          undone and the article will be removed from the public portal.
        </p>

        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 text-xs font-semibold rounded-xl border border-input bg-background hover:bg-muted text-foreground transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onConfirm(article.id)}
            disabled={isDeleting}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-red-600 hover:bg-red-700 text-white shadow-xs disabled:opacity-50 transition-colors cursor-pointer"
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Deleting…</span>
              </>
            ) : (
              <>
                <Trash2 className="h-3.5 w-3.5" />
                <span>Delete Publication</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

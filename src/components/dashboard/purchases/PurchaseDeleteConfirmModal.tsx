"use client";

import React from "react";
import { AlertTriangle } from "lucide-react";

interface PurchaseDeleteConfirmModalProps {
  isOpen: boolean;
  orderCode?: string;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function PurchaseDeleteConfirmModal({
  isOpen,
  orderCode,
  isDeleting,
  onClose,
  onConfirm,
}: PurchaseDeleteConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in-50">
      <div className="relative w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-2xl text-card-foreground text-center space-y-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-destructive mx-auto">
          <AlertTriangle className="h-6 w-6" />
        </div>

        <div>
          <h3 className="font-bold text-base text-foreground">Delete Purchase Order?</h3>
          <p className="text-xs text-muted-foreground mt-1">
            {orderCode ? (
              <>
                Are you sure you want to permanently remove order{" "}
                <span className="font-mono font-semibold text-foreground">{orderCode}</span>?
              </>
            ) : (
              "This administrative action will permanently remove this purchase order from library sales records."
            )}
          </p>
        </div>

        <div className="flex justify-center space-x-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 text-xs font-semibold rounded-lg border border-input bg-background hover:bg-accent text-foreground cursor-pointer transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-4 py-2 text-xs font-bold rounded-lg bg-destructive hover:bg-red-700 text-destructive-foreground shadow-2xs disabled:opacity-50 cursor-pointer transition-colors"
          >
            {isDeleting ? "Deleting..." : "Confirm Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

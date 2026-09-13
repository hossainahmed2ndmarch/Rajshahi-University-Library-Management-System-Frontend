"use client";

import React, { useMemo } from "react";
import { UserCheck, Plus, Trash2, Languages, Sparkles, PenTool } from "lucide-react";
import { AuthorRole, IAuthorItem } from "@/types/book";
import { CreatableCombobox } from "./CreatableCombobox";
import { cn } from "@/lib/utils";

export interface MultiAuthorManagerProps {
  authors: IAuthorItem[];
  onChange: (authors: IAuthorItem[]) => void;
  preexistingAuthors?: IAuthorItem[];
  error?: string;
  disabled?: boolean;
}

export function MultiAuthorManager({
  authors = [{ name: "", role: "WRITER" }],
  onChange,
  preexistingAuthors = [],
  error,
  disabled = false,
}: MultiAuthorManagerProps) {
  // Extract unique author names for autocomplete
  const authorNames = useMemo(() => {
    const set = new Set<string>();
    preexistingAuthors.forEach((a) => {
      if (a.name?.trim()) set.add(a.name.trim());
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [preexistingAuthors]);

  const handleUpdateAuthor = (index: number, updatedFields: Partial<IAuthorItem>) => {
    const next = [...authors];
    next[index] = { ...next[index], ...updatedFields };
    onChange(next);
  };

  const handleAddAuthorRow = (defaultRole: AuthorRole = "WRITER") => {
    onChange([...authors, { name: "", role: defaultRole }]);
  };

  const handleRemoveAuthorRow = (index: number) => {
    if (authors.length <= 1) {
      // Don't remove the last row, just clear it
      onChange([{ name: "", role: "WRITER" }]);
      return;
    }
    onChange(authors.filter((_, idx) => idx !== index));
  };

  const handleQuickAdd = (item: IAuthorItem) => {
    const trimmed = item.name.trim();
    if (!trimmed) return;

    // If first row is empty, fill it
    if (authors.length === 1 && !authors[0].name.trim()) {
      onChange([{ name: trimmed, role: item.role }]);
      return;
    }

    // Otherwise add new row if not already added
    const alreadyExists = authors.some(
      (a) => a.name.trim().toLowerCase() === trimmed.toLowerCase()
    );
    if (!alreadyExists) {
      onChange([...authors, { name: trimmed, role: item.role }]);
    }
  };

  return (
    <div className="flex flex-col space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-foreground flex items-center gap-1.5">
          <UserCheck className="h-4 w-4 text-primary" />
          <span>Authors &amp; Translators</span>
          <span className="text-destructive text-xs">*</span>
        </label>
        <span className="text-[11px] text-muted-foreground">
          {authors.length} contributor{authors.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="space-y-2.5">
        {authors.map((author, index) => (
          <div
            key={index}
            className="p-3 rounded-xl border border-border/80 bg-muted/20 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 transition-colors focus-within:border-primary"
          >
            {/* Contributor Index Badge */}
            <div className="flex items-center gap-2 shrink-0">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-[11px] font-bold text-muted-foreground">
                {index + 1}
              </span>
            </div>

            {/* Author Name with CreatableCombobox */}
            <div className="flex-1 min-w-0">
              <CreatableCombobox
                label=""
                value={author.name}
                onChange={(val) => handleUpdateAuthor(index, { name: val })}
                options={authorNames}
                placeholder="Select existing scholar or write new name..."
                prependIcon={<PenTool className="h-3.5 w-3.5 text-muted-foreground" />}
                disabled={disabled}
              />
            </div>

            {/* Role Toggle Selector */}
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                disabled={disabled}
                onClick={() => handleUpdateAuthor(index, { role: "WRITER" })}
                className={cn(
                  "flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer",
                  author.role === "WRITER"
                    ? "bg-[#004F32] border-[#004F32] text-white shadow-xs"
                    : "border-border bg-background text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
                title="Mark as Author / Writer"
              >
                <PenTool className="h-3 w-3" />
                <span>Writer</span>
              </button>

              <button
                type="button"
                disabled={disabled}
                onClick={() => handleUpdateAuthor(index, { role: "TRANSLATOR" })}
                className={cn(
                  "flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer",
                  author.role === "TRANSLATOR"
                    ? "bg-blue-600 border-blue-600 text-white shadow-xs"
                    : "border-border bg-background text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
                title="Mark as Translator"
              >
                <Languages className="h-3 w-3" />
                <span>Translator</span>
              </button>

              {/* Remove Row Button */}
              {authors.length > 1 && (
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => handleRemoveAuthorRow(index)}
                  className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer transition-colors"
                  title="Remove this contributor"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {error && (
        <p className="text-xs font-medium text-destructive animate-in fade-in-50">
          {error}
        </p>
      )}

      {/* Actions: Add Author / Add Translator */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        <button
          type="button"
          disabled={disabled}
          onClick={() => handleAddAuthorRow("WRITER")}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-input bg-background hover:bg-muted text-xs font-semibold text-foreground transition-colors cursor-pointer"
        >
          <Plus className="h-3.5 w-3.5 text-primary" />
          <span>Add Another Writer</span>
        </button>

        <button
          type="button"
          disabled={disabled}
          onClick={() => handleAddAuthorRow("TRANSLATOR")}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-blue-500/30 bg-blue-500/5 hover:bg-blue-500/10 text-xs font-semibold text-blue-700 dark:text-blue-300 transition-colors cursor-pointer"
        >
          <Languages className="h-3.5 w-3.5 text-blue-600" />
          <span>Add Translator</span>
        </button>
      </div>

      {/* Preexisting Authors Quick Add Chips */}
      {preexistingAuthors.length > 0 && (
        <div className="pt-1">
          <div className="flex items-center gap-1 text-[11px] text-muted-foreground mb-1">
            <Sparkles className="h-3 w-3 text-amber-500" />
            <span>Quick add scholar from database:</span>
          </div>
          <div className="flex flex-wrap gap-1 max-h-16 overflow-y-auto pr-1">
            {preexistingAuthors.slice(0, 8).map((auth, idx) => (
              <button
                key={idx}
                type="button"
                disabled={disabled}
                onClick={() => handleQuickAdd(auth)}
                className="inline-flex items-center gap-1 rounded-md border border-border bg-muted/40 hover:bg-muted px-2 py-0.5 text-[11px] text-foreground hover:text-primary transition-colors cursor-pointer"
                title={`Add ${auth.name} (${auth.role})`}
              >
                <Plus className="h-2.5 w-2.5 text-primary" />
                <span>{auth.name}</span>
                {auth.role === "TRANSLATOR" && (
                  <span className="text-[9px] text-blue-600 dark:text-blue-400 font-mono">(Tr.)</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default MultiAuthorManager;

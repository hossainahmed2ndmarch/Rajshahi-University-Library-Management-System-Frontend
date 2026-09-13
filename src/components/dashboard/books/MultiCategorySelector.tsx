"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { Tag, Plus, X, Check, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export interface MultiCategorySelectorProps {
  categories: string[];
  onChange: (categories: string[]) => void;
  preexistingCategories?: string[];
  error?: string;
  disabled?: boolean;
}

export function MultiCategorySelector({
  categories = [],
  onChange,
  preexistingCategories = [],
  error,
  disabled = false,
}: MultiCategorySelectorProps) {
  const [inputValue, setInputValue] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter available preexisting categories (excluding those already selected)
  const availablePreexisting = useMemo(() => {
    const selectedLower = new Set(categories.map((c) => c.trim().toLowerCase()));
    return preexistingCategories.filter(
      (c) => Boolean(c?.trim()) && !selectedLower.has(c.trim().toLowerCase())
    );
  }, [categories, preexistingCategories]);

  // Filter based on input query
  const filteredSuggestions = useMemo(() => {
    const query = inputValue.trim().toLowerCase();
    if (!query) return availablePreexisting;
    return availablePreexisting.filter((c) => c.toLowerCase().includes(query));
  }, [availablePreexisting, inputValue]);

  const canAddNew = useMemo(() => {
    const trimmed = inputValue.trim();
    if (!trimmed) return false;
    const lower = trimmed.toLowerCase();
    const alreadyInSelected = categories.some((c) => c.toLowerCase() === lower);
    return !alreadyInSelected;
  }, [inputValue, categories]);

  const handleAddCategory = (categoryToAdd: string) => {
    const trimmed = categoryToAdd.trim();
    if (!trimmed) return;
    const lower = trimmed.toLowerCase();
    if (!categories.some((c) => c.toLowerCase() === lower)) {
      onChange([...categories, trimmed]);
    }
    setInputValue("");
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const handleRemoveCategory = (indexToRemove: number) => {
    onChange(categories.filter((_, idx) => idx !== indexToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (filteredSuggestions.length > 0 && inputValue.trim()) {
        const exactMatch = filteredSuggestions.find(
          (s) => s.toLowerCase() === inputValue.trim().toLowerCase()
        );
        if (exactMatch) {
          handleAddCategory(exactMatch);
          return;
        }
      }
      if (canAddNew) {
        handleAddCategory(inputValue.trim());
      }
    } else if (e.key === "Backspace" && !inputValue && categories.length > 0) {
      handleRemoveCategory(categories.length - 1);
    }
  };

  return (
    <div ref={containerRef} className="flex flex-col space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-foreground flex items-center gap-1">
          <Tag className="h-3.5 w-3.5 text-primary" />
          <span>Category / Genre (Multiple)</span>
          <span className="text-destructive text-xs">*</span>
        </label>
        <span className="text-[11px] text-muted-foreground">
          {categories.length} selected
        </span>
      </div>

      {/* Selected tags pill list */}
      <div
        className={cn(
          "min-h-[42px] p-1.5 flex flex-wrap items-center gap-1.5 rounded-xl border border-input bg-background transition-colors focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-1",
          error && "border-destructive focus-within:ring-destructive"
        )}
        onClick={() => inputRef.current?.focus()}
      >
        {categories.map((cat, idx) => (
          <span
            key={idx}
            className="inline-flex items-center gap-1 rounded-lg bg-[#004F32]/10 dark:bg-emerald-950/60 border border-[#004F32]/30 dark:border-emerald-800 px-2.5 py-1 text-xs font-semibold text-[#004F32] dark:text-emerald-300 animate-in zoom-in-95"
          >
            <span>{cat}</span>
            <button
              type="button"
              disabled={disabled}
              onClick={(e) => {
                e.stopPropagation();
                handleRemoveCategory(idx);
              }}
              className="rounded-full p-0.5 hover:bg-[#004F32]/20 text-[#004F32] dark:text-emerald-400 cursor-pointer transition-colors"
              title={`Remove ${cat}`}
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}

        {/* Text Input inside tag box */}
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          disabled={disabled}
          onChange={(e) => {
            setInputValue(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={categories.length === 0 ? "Select or write categories (press Enter)..." : "Add another..."}
          className="flex-1 min-w-[140px] bg-transparent text-xs py-1 px-1.5 focus:outline-none placeholder:text-muted-foreground"
        />
      </div>

      {error && (
        <p className="text-xs font-medium text-destructive animate-in fade-in-50">
          {error}
        </p>
      )}

      {/* Suggestion Dropdown Popover */}
      {isOpen && (
        <div className="relative">
          <div className="absolute left-0 right-0 top-0 z-50 max-h-56 overflow-y-auto rounded-xl border border-border bg-popover text-popover-foreground shadow-xl animate-in fade-in-50 zoom-in-95 p-1.5 space-y-0.5">
            {/* Action to create new typed category */}
            {canAddNew && (
              <button
                type="button"
                onClick={() => handleAddCategory(inputValue.trim())}
                className="w-full text-left flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-primary bg-primary/10 hover:bg-primary/20 transition-colors cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">Add new category: &quot;{inputValue.trim()}&quot;</span>
              </button>
            )}

            <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border/50 flex items-center justify-between">
              <span>Preexisting Database Categories</span>
              <span className="text-[9px] font-normal lowercase opacity-75">Click to add</span>
            </div>

            {filteredSuggestions.length > 0 ? (
              filteredSuggestions.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => handleAddCategory(cat)}
                  className="w-full text-left flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs text-foreground hover:bg-muted/70 transition-colors cursor-pointer"
                >
                  <span className="truncate">{cat}</span>
                  <Plus className="h-3 w-3 text-muted-foreground shrink-0 ml-2" />
                </button>
              ))
            ) : (
              !canAddNew && (
                <div className="px-2.5 py-3 text-center text-xs text-muted-foreground">
                  No matching categories. Type a name and press Enter to write a new one.
                </div>
              )
            )}
          </div>
        </div>
      )}

      {/* Quick click suggestions pill bar */}
      {availablePreexisting.length > 0 && (
        <div className="pt-0.5">
          <div className="flex items-center gap-1 text-[11px] text-muted-foreground mb-1">
            <Sparkles className="h-3 w-3 text-amber-500" />
            <span>Quick add from database:</span>
          </div>
          <div className="flex flex-wrap gap-1 max-h-16 overflow-y-auto pr-1">
            {availablePreexisting.slice(0, 10).map((cat) => (
              <button
                key={cat}
                type="button"
                disabled={disabled}
                onClick={() => handleAddCategory(cat)}
                className="inline-flex items-center gap-1 rounded-md border border-border bg-muted/40 hover:bg-muted px-2 py-0.5 text-[11px] text-foreground hover:text-primary transition-colors cursor-pointer"
                title={`Add ${cat}`}
              >
                <Plus className="h-2.5 w-2.5 text-primary" />
                <span>{cat}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default MultiCategorySelector;

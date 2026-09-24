"use client";

import React, { useState, useRef, useEffect } from "react";
import { Check, ChevronsUpDown, Plus, X, Tag } from "lucide-react";
import { cn } from "@/lib/utils";

interface CategoryComboboxProps {
  value: string;
  onChange: (value: string) => void;
  categories: string[];
  placeholder?: string;
  label?: string;
  helperText?: string;
}

export function CategoryCombobox({
  value,
  onChange,
  categories,
  placeholder = "Select or type a category...",
  label = "Category",
  helperText,
}: CategoryComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value || "");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setInputValue(value || "");
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredCategories = categories.filter((c) =>
    c.toLowerCase().includes(inputValue.toLowerCase().trim())
  );

  const isExactMatch = categories.some(
    (c) => c.toLowerCase() === inputValue.toLowerCase().trim()
  );

  const handleSelect = (category: string) => {
    onChange(category);
    setInputValue(category);
    setIsOpen(false);
  };

  const handleCreateNew = () => {
    const trimmed = inputValue.trim();
    if (trimmed) {
      onChange(trimmed);
      setIsOpen(false);
    }
  };

  const handleClear = () => {
    onChange("");
    setInputValue("");
  };

  return (
    <div className="space-y-1.5" ref={containerRef}>
      {label && (
        <label className="block text-xs font-semibold text-foreground flex items-center justify-between">
          <span>{label}</span>
          <span className="text-[10px] text-muted-foreground font-normal">
            Choose existing or type new
          </span>
        </label>
      )}

      <div className="relative">
        <div className="relative flex items-center">
          <Tag className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              onChange(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            placeholder={placeholder}
            className="w-full pl-9 pr-16 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all shadow-xs"
          />

          <div className="absolute right-2.5 flex items-center gap-1">
            {inputValue && (
              <button
                type="button"
                onClick={handleClear}
                className="p-1 text-muted-foreground hover:text-foreground rounded-md transition-colors"
                title="Clear"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="p-1 text-muted-foreground hover:text-foreground rounded-md transition-colors"
            >
              <ChevronsUpDown className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute z-50 left-0 right-0 mt-1 max-h-56 overflow-auto rounded-xl border border-border bg-card shadow-xl p-1.5 animate-in fade-in-50 zoom-in-95">
            {/* Quick Pills if category list exists */}
            {categories.length > 0 && (
              <div className="p-1.5 border-b border-border/60 mb-1">
                <p className="text-[11px] font-semibold text-muted-foreground mb-1.5">
                  Existing Categories:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {categories.slice(0, 8).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => handleSelect(cat)}
                      className={cn(
                        "text-xs px-2.5 py-1 rounded-lg border transition-all text-left",
                        value === cat
                          ? "bg-emerald-600 text-white border-emerald-600 font-medium"
                          : "bg-muted/50 hover:bg-muted text-foreground border-border"
                      )}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Filtered list items */}
            <div className="space-y-0.5">
              {filteredCategories.map((cat) => {
                const isSelected = value === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => handleSelect(cat)}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg transition-colors text-left",
                      isSelected
                        ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-semibold"
                        : "hover:bg-muted text-foreground"
                    )}
                  >
                    <span>{cat}</span>
                    {isSelected && <Check className="h-3.5 w-3.5 text-emerald-600" />}
                  </button>
                );
              })}

              {/* Add New Option if typed value does not match exactly */}
              {inputValue.trim() && !isExactMatch && (
                <button
                  type="button"
                  onClick={handleCreateNew}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs rounded-lg text-amber-700 dark:text-amber-400 bg-amber-50/70 dark:bg-amber-950/30 hover:bg-amber-100/70 transition-colors font-medium text-left"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>
                    Add <strong className="underline">"{inputValue.trim()}"</strong> as new category
                  </span>
                </button>
              )}

              {filteredCategories.length === 0 && !inputValue.trim() && (
                <p className="text-center py-3 text-xs text-muted-foreground">
                  No existing categories. Type to add a new one.
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {helperText && (
        <p className="text-[11px] text-muted-foreground">{helperText}</p>
      )}
    </div>
  );
}

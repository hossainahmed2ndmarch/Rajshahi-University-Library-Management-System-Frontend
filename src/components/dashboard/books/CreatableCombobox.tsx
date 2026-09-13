"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { Check, ChevronsUpDown, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CreatableComboboxProps {
  label: string;
  name?: string;
  value: string;
  onChange: (val: string) => void;
  options: string[];
  placeholder?: string;
  required?: boolean;
  prependIcon?: React.ReactNode;
  description?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
}

export function CreatableCombobox({
  label,
  value = "",
  onChange,
  options = [],
  placeholder = "Select or write new...",
  required = false,
  prependIcon,
  description,
  error,
  disabled = false,
  className,
}: CreatableComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync internal search with external value when dropdown opens or value changes
  useEffect(() => {
    setSearchQuery(value);
  }, [value]);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter existing options
  const filteredOptions = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return options;
    return options.filter((opt) => opt.toLowerCase().includes(query));
  }, [options, searchQuery]);

  const exactMatchExists = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return true;
    return options.some((opt) => opt.toLowerCase() === query);
  }, [options, searchQuery]);

  const handleSelectOption = (opt: string) => {
    onChange(opt);
    setSearchQuery(opt);
    setIsOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    onChange(val);
    if (!isOpen) setIsOpen(true);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
    setSearchQuery("");
    inputRef.current?.focus();
  };

  return (
    <div ref={containerRef} className={cn("relative flex flex-col space-y-1.5", className)}>
      <label className="text-sm font-medium text-foreground flex items-center justify-between">
        <span>{label}</span>
        {required && <span className="text-destructive text-xs">*</span>}
      </label>

      <div className="relative flex items-center">
        {prependIcon && (
          <div className="absolute left-3 text-muted-foreground pointer-events-none z-10 flex items-center justify-center">
            {prependIcon}
          </div>
        )}

        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 transition-colors pr-16",
            prependIcon && "pl-9",
            error && "border-destructive focus-visible:ring-destructive"
          )}
        />

        <div className="absolute right-2 flex items-center gap-1 z-10">
          {searchQuery && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 rounded-sm text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer transition-colors"
              title="Clear text"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            className="p-1 rounded-sm text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer transition-colors"
            title="Toggle suggestions list"
          >
            <ChevronsUpDown className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {description && !error && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}

      {error && (
        <p className="text-xs font-medium text-destructive animate-in fade-in-50">
          {error}
        </p>
      )}

      {/* Suggestion Dropdown Popover */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1 z-50 max-h-56 overflow-y-auto rounded-xl border border-border bg-popover text-popover-foreground shadow-xl animate-in fade-in-50 zoom-in-95">
          <div className="p-1.5 space-y-0.5">
            <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border/50 mb-1 flex items-center justify-between">
              <span>Database Suggestions</span>
              <span className="text-[9px] font-normal lowercase opacity-75">Click to select or type new</span>
            </div>

            {/* Custom typed option if not exact match */}
            {searchQuery.trim() && !exactMatchExists && (
              <button
                type="button"
                onClick={() => {
                  onChange(searchQuery.trim());
                  setIsOpen(false);
                }}
                className="w-full text-left flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-primary bg-primary/10 hover:bg-primary/20 transition-colors cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">Write new: &quot;{searchQuery.trim()}&quot;</span>
              </button>
            )}

            {/* Preexisting items */}
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => {
                const isSelected = opt.toLowerCase() === value.trim().toLowerCase();
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => handleSelectOption(opt)}
                    className={cn(
                      "w-full text-left flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer",
                      isSelected
                        ? "bg-accent font-semibold text-accent-foreground"
                        : "text-foreground hover:bg-muted/70"
                    )}
                  >
                    <span className="truncate">{opt}</span>
                    {isSelected && <Check className="h-3.5 w-3.5 text-primary shrink-0 ml-2" />}
                  </button>
                );
              })
            ) : (
              !searchQuery.trim() && (
                <div className="px-2.5 py-3 text-center text-xs text-muted-foreground">
                  No preexisting entries found in database.
                </div>
              )
            )}

            {filteredOptions.length === 0 && searchQuery.trim() && exactMatchExists && (
              <div className="px-2.5 py-2 text-center text-xs text-muted-foreground">
                Matches current selection.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default CreatableCombobox;

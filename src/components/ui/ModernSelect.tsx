"use client";

import React, { useState, useRef, useEffect, useId } from "react";
import { ChevronDown, Check, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ModernSelectOption<T = string | number> {
  value: T;
  label: string;
  sublabel?: string;
  icon?: React.ReactNode;
  badge?: string;
}

export interface ModernSelectProps<T = string | number> {
  value: T | null | undefined;
  onChange: (value: T) => void;
  options: ModernSelectOption<T>[];
  placeholder?: string;
  label?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  searchable?: boolean;
  className?: string;
  helperText?: string;
  required?: boolean;
}

export function ModernSelect<T extends string | number = string>({
  value,
  onChange,
  options,
  placeholder = "Select an option...",
  label,
  icon,
  disabled = false,
  searchable = false,
  className,
  helperText,
  required,
}: ModernSelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const id = useId();

  // Selected option
  const selectedOption = options.find((opt) => opt.value === value);

  // Filter options if searchable
  const filteredOptions = searchQuery.trim()
    ? options.filter(
        (opt) =>
          opt.label.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
          opt.sublabel?.toLowerCase().includes(searchQuery.toLowerCase().trim())
      )
    : options;

  // Auto-enable search if there are more than 6 options
  const shouldShowSearch = searchable || options.length > 7;

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearchQuery("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Focus search input when opened
  useEffect(() => {
    if (isOpen && shouldShowSearch) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [isOpen, shouldShowSearch]);

  const handleSelect = (val: T) => {
    onChange(val);
    setIsOpen(false);
    setSearchQuery("");
  };

  return (
    <div className={cn("space-y-1.5", className)} ref={containerRef}>
      {label && (
        <label
          htmlFor={id}
          className="block text-xs font-bold text-foreground flex items-center justify-between"
        >
          <span className="flex items-center gap-1.5">
            {icon}
            <span>{label}</span>
          </span>
          {required && <span className="text-destructive text-xs">*</span>}
        </label>
      )}

      <div className="relative">
        {/* Trigger Button */}
        <button
          type="button"
          id={id}
          disabled={disabled}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className={cn(
            "w-full flex items-center justify-between gap-2.5 rounded-xl border border-border/80 bg-background/90 px-3.5 py-2.5 text-xs sm:text-sm font-medium shadow-xs transition-all text-left outline-none cursor-pointer",
            "hover:border-emerald-600/50 hover:bg-background focus-visible:ring-2 focus-visible:ring-emerald-600/30 focus-visible:border-emerald-600",
            "dark:bg-card/60 dark:hover:bg-card dark:border-emerald-900/40",
            isOpen && "border-emerald-600 ring-2 ring-emerald-600/30 dark:border-emerald-500",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        >
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            {selectedOption?.icon && (
              <span className="shrink-0 text-primary">{selectedOption.icon}</span>
            )}
            <div className="min-w-0 flex-1">
              <span
                className={cn(
                  "block truncate",
                  selectedOption ? "text-foreground font-semibold" : "text-muted-foreground"
                )}
              >
                {selectedOption ? selectedOption.label : placeholder}
              </span>
              {selectedOption?.sublabel && (
                <span className="block truncate text-[10px] text-muted-foreground">
                  {selectedOption.sublabel}
                </span>
              )}
            </div>
            {selectedOption?.badge && (
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-primary/10 text-primary uppercase">
                {selectedOption.badge}
              </span>
            )}
          </div>

          <ChevronDown
            className={cn(
              "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
              isOpen && "rotate-180 text-primary"
            )}
          />
        </button>

        {/* Dropdown Menu Panel */}
        {isOpen && (
          <div className="absolute left-0 right-0 top-full mt-1.5 z-50 rounded-2xl border border-border/80 bg-card/98 dark:bg-zinc-950/98 text-card-foreground shadow-2xl backdrop-blur-md overflow-hidden animate-in fade-in-0 zoom-in-95 origin-top duration-150">
            {/* Search Input when enabled */}
            {shouldShowSearch && (
              <div className="p-2 border-b border-border/60 bg-muted/20">
                <div className="relative flex items-center">
                  <Search className="absolute left-2.5 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search options..."
                    className="w-full rounded-lg bg-background/80 pl-8 pr-7 py-1.5 text-xs text-foreground placeholder:text-muted-foreground border border-border/60 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2 p-0.5 text-muted-foreground hover:text-foreground rounded"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Options List */}
            <div className="max-h-60 overflow-y-auto p-1.5 space-y-0.5">
              {filteredOptions.length === 0 ? (
                <div className="py-4 px-3 text-center text-xs text-muted-foreground">
                  No matching options found
                </div>
              ) : (
                filteredOptions.map((opt) => {
                  const isSelected = opt.value === value;
                  return (
                    <button
                      key={String(opt.value)}
                      type="button"
                      onClick={() => handleSelect(opt.value)}
                      className={cn(
                        "w-full flex items-center justify-between gap-2.5 px-3 py-2 rounded-xl text-xs sm:text-sm text-left transition-all cursor-pointer select-none",
                        isSelected
                          ? "bg-emerald-500/15 text-emerald-900 dark:text-emerald-200 font-bold"
                          : "text-foreground/90 hover:bg-muted/70 hover:text-foreground dark:hover:bg-zinc-900/80"
                      )}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        {opt.icon && (
                          <span
                            className={cn(
                              "shrink-0",
                              isSelected ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"
                            )}
                          >
                            {opt.icon}
                          </span>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="truncate leading-snug">{opt.label}</p>
                          {opt.sublabel && (
                            <p className="truncate text-[10px] text-muted-foreground font-normal">
                              {opt.sublabel}
                            </p>
                          )}
                        </div>
                        {opt.badge && (
                          <span className="px-1.5 py-0.5 text-[9px] font-bold rounded-md bg-muted text-muted-foreground uppercase">
                            {opt.badge}
                          </span>
                        )}
                      </div>

                      {isSelected && (
                        <div className="h-4 w-4 rounded-full bg-emerald-600 dark:bg-emerald-500 text-white flex items-center justify-center shrink-0">
                          <Check className="h-2.5 w-2.5 stroke-[3]" />
                        </div>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {helperText && <p className="text-[10px] text-muted-foreground">{helperText}</p>}
    </div>
  );
}

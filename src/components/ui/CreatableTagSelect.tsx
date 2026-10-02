"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { Plus, X, Check, ChevronsUpDown } from "lucide-react";

export interface CreatableTagSelectProps {
  label?: string;
  values: string[];
  onChange: (values: string[]) => void;
  options: readonly string[] | string[];
  placeholder?: string;
  disabled?: boolean;
}

export function CreatableTagSelect({
  label,
  values = [],
  onChange,
  options = [],
  placeholder = "Type new skill and press Enter, or choose...",
  disabled = false,
}: CreatableTagSelectProps) {
  const [inputVal, setInputVal] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const addTag = (tag: string) => {
    const trimmed = tag.trim();
    if (!trimmed) return;
    if (!values.includes(trimmed)) {
      onChange([...values, trimmed]);
    }
    setInputVal("");
    setIsOpen(false);
  };

  const removeTag = (tagToRemove: string) => {
    onChange(values.filter((t) => t !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (inputVal.trim()) {
        addTag(inputVal);
      }
    } else if (e.key === "Backspace" && !inputVal && values.length > 0) {
      removeTag(values[values.length - 1]);
    }
  };

  const filteredOptions = useMemo(() => {
    const q = inputVal.trim().toLowerCase();
    const available = options.filter((o) => !values.includes(o));
    if (!q) return available;
    return available.filter((o) => o.toLowerCase().includes(q));
  }, [options, values, inputVal]);

  const isNewEntry =
    inputVal.trim().length > 0 &&
    !options.some((o) => o.toLowerCase() === inputVal.trim().toLowerCase()) &&
    !values.some((v) => v.toLowerCase() === inputVal.trim().toLowerCase());

  return (
    <div className="space-y-1.5" ref={containerRef}>
      {label && <label className="text-xs font-semibold text-foreground">{label}</label>}

      {/* Selected tags list */}
      <div className="flex flex-wrap gap-1.5 min-h-[32px] p-2 rounded-xl border border-input bg-background items-center">
        {values.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-medium border border-emerald-300/40"
          >
            <span>{tag}</span>
            {!disabled && (
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="hover:text-red-500 rounded p-0.5 cursor-pointer"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </span>
        ))}

        {!disabled && (
          <div className="relative flex-1 min-w-[140px]">
            <input
              ref={inputRef}
              type="text"
              value={inputVal}
              onChange={(e) => {
                setInputVal(e.target.value);
                setIsOpen(true);
              }}
              onFocus={() => setIsOpen(true)}
              onKeyDown={handleKeyDown}
              placeholder={values.length === 0 ? placeholder : "Add more..."}
              className="w-full text-xs bg-transparent border-none outline-none focus:ring-0 p-0 text-foreground placeholder:text-muted-foreground"
            />
          </div>
        )}
      </div>

      {/* Dropdown Options */}
      {isOpen && !disabled && (
        <div className="relative z-50">
          <div className="absolute top-1 left-0 right-0 max-h-52 overflow-y-auto rounded-xl border border-border bg-popover p-1 shadow-lg text-xs space-y-0.5">
            {isNewEntry && (
              <button
                type="button"
                onClick={() => addTag(inputVal)}
                className="w-full text-left px-3 py-1.5 rounded-lg text-emerald-600 dark:text-emerald-400 font-bold hover:bg-emerald-50 dark:hover:bg-emerald-950/40 flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add &quot;{inputVal.trim()}&quot; (New Skill)</span>
              </button>
            )}

            {filteredOptions.length === 0 && !isNewEntry ? (
              <p className="px-3 py-2 text-muted-foreground text-center text-[11px]">
                No matching skills found. Type to add a new one.
              </p>
            ) : (
              filteredOptions.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => addTag(opt)}
                  className="w-full text-left px-3 py-1.5 rounded-lg text-foreground hover:bg-accent flex items-center justify-between cursor-pointer"
                >
                  <span>{opt}</span>
                  <Plus className="h-3 w-3 text-muted-foreground" />
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

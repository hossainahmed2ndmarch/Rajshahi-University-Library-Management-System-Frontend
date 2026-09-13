"use client";

import React, {
  useState,
  useRef,
  useEffect,
  useId,
  useCallback,
} from "react";
import { ChevronDown, Check, X as XIcon, Search } from "lucide-react";

export interface SearchableSelectProps {
  /** Current value – can be a predefined option OR any custom string. */
  value: string;
  onChange: (value: string) => void;
  /** Predefined options shown in the dropdown. */
  options: readonly string[];
  placeholder?: string;
  /** Icon rendered on the left side of the trigger (optional). */
  icon?: React.ReactNode;
  /** Extra classes applied to the trigger button wrapper. */
  className?: string;
  id?: string;
  disabled?: boolean;
  /** Label shown at the top of the dropdown list section. */
  listLabel?: string;
}

/**
 * SearchableSelect
 *
 * A fully accessible combobox that lets the user:
 *  • Click to open a dropdown and pick from the predefined option list.
 *  • Type to filter the list in real-time.
 *  • Submit any custom/free-text value not in the list.
 *  • Clear the current value with the × button.
 *
 * Keyboard: Arrow keys navigate the list, Enter selects, Escape closes.
 */
export function SearchableSelect({
  value,
  onChange,
  options,
  placeholder = "Select or type…",
  icon,
  className = "",
  id: externalId,
  disabled = false,
  listLabel,
}: SearchableSelectProps) {
  const generatedId = useId();
  const id = externalId ?? generatedId;

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [highlightedIdx, setHighlightedIdx] = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // ── Filtered options ──────────────────────────────────────────────────────
  const filtered = query.trim()
    ? options.filter((o) =>
        o.toLowerCase().includes(query.trim().toLowerCase()),
      )
    : options;

  // Whether the typed query is a brand-new custom value (not in list)
  const isCustomValue =
    query.trim().length > 0 &&
    !options.some((o) => o.toLowerCase() === query.trim().toLowerCase());

  // ── Open / close helpers ──────────────────────────────────────────────────
  const openDropdown = useCallback(() => {
    if (disabled) return;
    setQuery("");
    setHighlightedIdx(-1);
    setOpen(true);
    // Focus the search input on next tick
    setTimeout(() => inputRef.current?.focus(), 0);
  }, [disabled]);

  const closeDropdown = useCallback(() => {
    setOpen(false);
    setQuery("");
    setHighlightedIdx(-1);
  }, []);

  const selectOption = useCallback(
    (opt: string) => {
      onChange(opt);
      closeDropdown();
    },
    [onChange, closeDropdown],
  );

  // ── Click-outside to close ────────────────────────────────────────────────
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        closeDropdown();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, closeDropdown]);

  // ── Scroll highlighted item into view ────────────────────────────────────
  useEffect(() => {
    if (!listRef.current || highlightedIdx < 0) return;
    const item = listRef.current.children[highlightedIdx] as HTMLElement | undefined;
    item?.scrollIntoView({ block: "nearest" });
  }, [highlightedIdx]);

  // ── Keyboard navigation ───────────────────────────────────────────────────
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
        e.preventDefault();
        openDropdown();
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIdx((i) => Math.min(i + 1, filtered.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIdx((i) => Math.max(i - 1, -1));
        break;
      case "Enter":
        e.preventDefault();
        if (highlightedIdx >= 0 && filtered[highlightedIdx]) {
          selectOption(filtered[highlightedIdx]);
        } else if (isCustomValue) {
          selectOption(query.trim());
        }
        break;
      case "Escape":
        e.preventDefault();
        closeDropdown();
        break;
    }
  };

  // ── Display label ─────────────────────────────────────────────────────────
  const displayValue = value || "";
  const isSelected = !!displayValue;

  return (
    <div ref={containerRef} className={`relative ${className}`} id={id}>
      {/* ── Trigger ── */}
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-labelledby={`${id}-label`}
        disabled={disabled}
        onClick={() => (open ? closeDropdown() : openDropdown())}
        onKeyDown={handleKeyDown}
        className={[
          "flex w-full items-center gap-2 rounded-xl border border-input bg-background",
          "px-3 py-2 text-xs text-left transition-colors",
          "focus:outline-none focus:ring-2 focus:ring-primary",
          open ? "ring-2 ring-primary" : "",
          disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:bg-accent/40",
          icon ? "pl-9" : "pl-3",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {/* Leading icon slot */}
        {icon && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {icon}
          </span>
        )}

        {/* Value / placeholder */}
        <span
          className={`flex-1 truncate ${isSelected ? "text-foreground font-medium" : "text-muted-foreground"}`}
        >
          {displayValue || placeholder}
        </span>

        {/* Clear button */}
        {isSelected && !disabled && (
          <span
            role="button"
            aria-label="Clear selection"
            tabIndex={0}
            onClick={(e) => {
              e.stopPropagation();
              onChange("");
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.stopPropagation();
                onChange("");
              }
            }}
            className="shrink-0 rounded-md p-0.5 text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
          >
            <XIcon className="h-3 w-3" />
          </span>
        )}

        {/* Chevron */}
        <ChevronDown
          className={`h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* ── Dropdown panel ── */}
      {open && (
        <div className="absolute z-[60] mt-1 w-full min-w-[200px] rounded-2xl border border-border bg-popover shadow-xl overflow-hidden animate-in fade-in-0 zoom-in-95 slide-in-from-top-1">
          {/* Search input */}
          <div className="flex items-center gap-2 border-b border-border px-3 py-2 bg-muted/30">
            <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setHighlightedIdx(-1);
              }}
              onKeyDown={handleKeyDown}
              placeholder="Search or type new…"
              className="flex-1 bg-transparent text-xs outline-none placeholder:text-muted-foreground text-foreground"
              aria-label="Search options"
            />
          </div>

          {/* Use custom value hint */}
          {isCustomValue && (
            <button
              type="button"
              onClick={() => selectOption(query.trim())}
              className="flex w-full items-center gap-2 px-3 py-2 text-xs text-left bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border-b border-border transition-colors cursor-pointer"
            >
              <span className="font-semibold shrink-0">Use:</span>
              <span className="truncate italic">"{query.trim()}"</span>
            </button>
          )}

          {/* Options list */}
          <ul
            ref={listRef}
            role="listbox"
            aria-label={listLabel ?? "Options"}
            className="max-h-52 overflow-y-auto py-1"
          >
            {filtered.length === 0 && !isCustomValue ? (
              <li className="px-3 py-4 text-center text-xs text-muted-foreground italic">
                No matches — type to create a custom entry
              </li>
            ) : (
              filtered.map((opt, idx) => {
                const isActive = value === opt;
                const isHighlighted = highlightedIdx === idx;
                return (
                  <li
                    key={opt}
                    role="option"
                    aria-selected={isActive}
                    onClick={() => selectOption(opt)}
                    className={[
                      "flex items-center gap-2 px-3 py-2 text-xs cursor-pointer transition-colors select-none",
                      isHighlighted ? "bg-accent text-accent-foreground" : "hover:bg-accent/60",
                      isActive ? "font-semibold text-foreground" : "text-foreground/80",
                    ].join(" ")}
                  >
                    <span
                      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${isActive ? "border-[#004F32] bg-[#004F32]" : "border-input"}`}
                    >
                      {isActive && <Check className="h-2.5 w-2.5 text-white" />}
                    </span>
                    <span className="truncate">{opt}</span>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

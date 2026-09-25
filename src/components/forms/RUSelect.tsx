"use client";

import React, { SelectHTMLAttributes } from "react";
import { useFormContext, Controller } from "react-hook-form";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface RUSelectOption {
  label: string;
  value: string | number;
  disabled?: boolean;
}

export interface RUSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  name: string;
  label?: string;
  options?: RUSelectOption[];
  placeholder?: string;
  description?: string;
  containerClassName?: string;
}

export function RUSelect({
  name,
  label,
  options = [],
  placeholder = "Select an option...",
  description,
  disabled,
  className,
  containerClassName,
  children,
  ...props
}: RUSelectProps) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <div className={cn("flex flex-col space-y-1.5", containerClassName)}>
          {label && (
            <label
              htmlFor={name}
              className="text-sm font-medium text-foreground flex items-center justify-between"
            >
              <span>{label}</span>
              {props.required && <span className="text-destructive text-xs">*</span>}
            </label>
          )}

          <div className="relative flex items-center group">
            <select
              {...field}
              {...props}
              id={name}
              value={field.value ?? ""}
              onChange={(e) => field.onChange(e.target.value)}
              disabled={disabled}
              className={cn(
                "flex h-11 w-full appearance-none rounded-xl border border-border/80 bg-background/90 px-3.5 py-2.5 pr-10 text-xs sm:text-sm font-medium shadow-xs transition-all cursor-pointer placeholder:text-muted-foreground hover:border-emerald-600/50 hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600/30 focus-visible:border-emerald-600 dark:bg-card/60 dark:hover:bg-card dark:border-emerald-900/40 disabled:cursor-not-allowed disabled:opacity-50",
                error && "border-destructive focus-visible:ring-destructive focus-visible:border-destructive",
                className
              )}
            >
              {placeholder && (
                <option value="" disabled hidden>
                  {placeholder}
                </option>
              )}
              {options.map((opt) => (
                <option key={String(opt.value)} value={opt.value} disabled={opt.disabled}>
                  {opt.label}
                </option>
              ))}
              {children}
            </select>

            <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/70 pointer-events-none transition-colors group-hover:text-foreground" />
          </div>

          {description && !error && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}

          {error && (
            <p className="text-xs font-medium text-destructive animate-in fade-in-50">
              {error.message}
            </p>
          )}
        </div>
      )}
    />
  );
}

export default RUSelect;

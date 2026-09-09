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

          <div className="relative flex items-center">
            <select
              {...field}
              {...props}
              id={name}
              value={field.value ?? ""}
              onChange={(e) => field.onChange(e.target.value)}
              disabled={disabled}
              className={cn(
                "flex h-10 w-full appearance-none rounded-md border border-input bg-background px-3 py-2 pr-8 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 transition-colors",
                error && "border-destructive focus-visible:ring-destructive",
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

            <ChevronDown className="absolute right-3 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
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

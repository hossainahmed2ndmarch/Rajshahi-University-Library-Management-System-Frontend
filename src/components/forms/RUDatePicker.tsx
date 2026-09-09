"use client";

import React, { InputHTMLAttributes } from "react";
import { useFormContext, Controller } from "react-hook-form";
import { Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

export interface RUDatePickerProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange"> {
  name: string;
  label?: string;
  description?: string;
  minDate?: string;
  maxDate?: string;
  containerClassName?: string;
}

export function RUDatePicker({
  name,
  label,
  description,
  disabled,
  minDate,
  maxDate,
  className,
  containerClassName,
  required,
  ...props
}: RUDatePickerProps) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => {
        const formattedValue =
          field.value instanceof Date
            ? field.value.toISOString().split("T")[0]
            : typeof field.value === "string"
            ? field.value.split("T")[0]
            : "";

        return (
          <div className={cn("flex flex-col space-y-1.5", containerClassName)}>
            {label && (
              <label
                htmlFor={name}
                className="text-sm font-medium text-foreground flex items-center justify-between"
              >
                <span>{label}</span>
                {required && <span className="text-destructive text-xs">*</span>}
              </label>
            )}

            <div className="relative flex items-center">
              <div className="absolute left-3 text-muted-foreground pointer-events-none z-10 flex items-center justify-center">
                <Calendar className="h-4 w-4" />
              </div>

              <input
                {...props}
                id={name}
                type="date"
                min={minDate}
                max={maxDate}
                value={formattedValue}
                onChange={(e) => {
                  field.onChange(e.target.value);
                }}
                onBlur={field.onBlur}
                disabled={disabled}
                className={cn(
                  "flex h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 transition-colors",
                  error && "border-destructive focus-visible:ring-destructive",
                  className
                )}
              />
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
        );
      }}
    />
  );
}

export default RUDatePicker;

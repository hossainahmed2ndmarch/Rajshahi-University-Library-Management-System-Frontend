"use client";

import React, { InputHTMLAttributes, useState } from "react";
import { useFormContext, Controller } from "react-hook-form";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

export interface RUInputProps extends InputHTMLAttributes<HTMLInputElement> {
  name: string;
  label?: string;
  description?: string;
  prependIcon?: React.ReactNode;
  appendIcon?: React.ReactNode;
  containerClassName?: string;
}

export function RUInput({
  name,
  label,
  description,
  type = "text",
  placeholder,
  disabled,
  prependIcon,
  appendIcon,
  className,
  containerClassName,
  ...props
}: RUInputProps) {
  const { control } = useFormContext();
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === "password";
  const resolvedType = isPassword ? (showPassword ? "text" : "password") : type;

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
            {prependIcon && (
              <div className="absolute left-3 text-muted-foreground pointer-events-none z-10 flex items-center justify-center">
                {prependIcon}
              </div>
            )}

            <input
              {...field}
              {...props}
              id={name}
              type={resolvedType}
              value={field.value ?? ""}
              onChange={(e) => {
                const val =
                  type === "number"
                    ? e.target.value === ""
                      ? ""
                      : Number(e.target.value)
                    : e.target.value;
                field.onChange(val);
              }}
              placeholder={placeholder}
              disabled={disabled}
              className={cn(
                "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 transition-colors",
                prependIcon && "pl-9",
                (appendIcon || isPassword) && "pr-9",
                error && "border-destructive focus-visible:ring-destructive",
                className
              )}
            />

            {/* Password toggle takes priority over appendIcon when type=password */}
            {isPassword ? (
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 z-10 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            ) : (
              appendIcon && (
                <div className="absolute right-3 text-muted-foreground pointer-events-none z-10 flex items-center justify-center">
                  {appendIcon}
                </div>
              )
            )}
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

export default RUInput;

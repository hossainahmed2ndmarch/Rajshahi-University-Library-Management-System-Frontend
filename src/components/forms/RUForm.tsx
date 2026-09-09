"use client";

import React from "react";
import {
  useForm,
  UseFormReturn,
  FieldValues,
  SubmitHandler,
  UseFormProps,
  FormProvider,
  Resolver,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { cn } from "@/lib/utils";

export interface RUFormProps<TFieldValues extends FieldValues = FieldValues> {
  schema?: z.ZodType<TFieldValues, any, any>;
  defaultValues?: UseFormProps<TFieldValues>["defaultValues"];
  onSubmit: SubmitHandler<TFieldValues>;
  children: React.ReactNode | ((methods: UseFormReturn<TFieldValues>) => React.ReactNode);
  className?: string;
  form?: UseFormReturn<TFieldValues>;
}

export function RUForm<TFieldValues extends FieldValues = FieldValues>({
  schema,
  defaultValues,
  onSubmit,
  children,
  className,
  form: externalForm,
}: RUFormProps<TFieldValues>) {
  const resolver = schema
    ? (zodResolver(schema as any) as Resolver<TFieldValues>)
    : undefined;

  const internalForm = useForm<TFieldValues>({
    defaultValues,
    resolver,
  });

  const form = externalForm || internalForm;

  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn("space-y-4", className)}
        noValidate
      >
        {typeof children === "function" ? children(form) : children}
      </form>
    </FormProvider>
  );
}

export default RUForm;

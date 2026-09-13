import { z } from "zod";

export const authorItemSchema = z.object({
  name: z.string().min(1, "Author name is required"),
  role: z.enum(["WRITER", "TRANSLATOR"]).default("WRITER"),
});

export type AuthorItemFormValue = z.infer<typeof authorItemSchema>;

// ── Zod schema for Book Creation / Editing ──────────────────────────────────
export const bookFormSchema = z.object({
  title: z.string().min(2, "Book title is required (at least 2 characters)"),
  authors: z
    .array(authorItemSchema)
    .min(1, "At least one author / scholar is required"),
  author: z.string().optional(),
  isbn: z.string().optional(),
  locationCell: z.string().min(1, "Shelf location cell is required"),
  categories: z
    .array(z.string().min(1, "Category cannot be empty"))
    .min(1, "At least one category is required"),
  category: z.string().optional(),
  publisher: z.string().optional(),
  pages: z.union([z.number().min(0, "Pages cannot be negative"), z.literal("")]).optional(),
  type: z.enum(["BORROW_ONLY", "SELL_ONLY", "HYBRID"] as const),
  buyPrice: z.union([z.number().min(0, "Buy price cannot be negative"), z.literal("")]).optional(),
  sellPrice: z.union([z.number().min(0, "Sell price cannot be negative"), z.literal("")]).optional(),
  discount: z.union([z.number().min(0, "Discount cannot be negative").max(100, "Discount cannot exceed 100%"), z.literal("")]).optional(),
  borrowStock: z.union([z.number().min(0, "Borrow stock cannot be negative"), z.literal("")]).optional(),
  sellStock: z.union([z.number().min(0, "Sell stock cannot be negative"), z.literal("")]).optional(),
  description: z.string().optional(),
});

export type BookFormValues = z.infer<typeof bookFormSchema>;

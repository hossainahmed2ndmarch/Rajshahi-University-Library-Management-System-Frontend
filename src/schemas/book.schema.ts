import { z } from "zod";

const BookTypeEnum = z.enum(["BORROW_ONLY", "SELL_ONLY", "HYBRID"]);

export const baseBookSchema = z.object({
  title: z.string().min(1, "Book title is required").max(255, "Title too long"),
  author: z.string().min(1, "Author name is required").max(255, "Author name too long"),
  isbn: z.string().min(3, "ISBN is required"),
  locationCell: z.string().min(1, "Library cell location is required"),
  category: z.string().min(1, "Category is required"),
  publisher: z.string().optional(),
  pages: z.coerce.number().int().min(0, "Pages must be a non-negative integer").optional(),
  type: BookTypeEnum,
  sellPrice: z.coerce.number().min(0, "Sell price must be ≥ 0").optional(),
  borrowStock: z.coerce.number().int().min(0, "Borrow stock must be ≥ 0").optional(),
  sellStock: z.coerce.number().int().min(0, "Sell stock must be ≥ 0").optional(),
  borrowFee: z.coerce.number().min(0, "Borrow fee must be ≥ 0").optional(),
  description: z.string().max(2000, "Description too long").optional(),
  coverImage: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  images: z.array(z.string()).optional(),
});

export const createBookSchema = baseBookSchema.superRefine((data, ctx) => {
  if ((data.type === "SELL_ONLY" || data.type === "HYBRID") && !data.sellPrice) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["sellPrice"],
      message: "Sell price is required for sellable books",
    });
  }
  if ((data.type === "SELL_ONLY" || data.type === "HYBRID") && !data.sellStock) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["sellStock"],
      message: "Sell stock is required for sellable books",
    });
  }
  if ((data.type === "BORROW_ONLY" || data.type === "HYBRID") && !data.borrowStock) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["borrowStock"],
      message: "Borrow stock is required for borrowable books",
    });
  }
});

export const updateBookSchema = baseBookSchema.partial().extend({
  id: z.union([z.string(), z.number()]),
});

export const bookFilterSchema = z.object({
  searchTerm: z.string().optional(),
  category: z.string().optional(),
  type: BookTypeEnum.optional(),
  isBorrowable: z.boolean().optional(),
  isSellable: z.boolean().optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});

export type CreateBookFormValues = z.infer<typeof createBookSchema>;
export type UpdateBookFormValues = z.infer<typeof updateBookSchema>;
export type BookFilterValues = z.infer<typeof bookFilterSchema>;

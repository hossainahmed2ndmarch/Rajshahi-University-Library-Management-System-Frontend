import { z } from "zod";

// ── Zod schema for Book Creation / Editing ──────────────────────────────────
// Notice: There is NO borrowFee in Prisma Book model. Removed borrowFee completely.
export const bookFormSchema = z.object({
  title: z.string().min(2, "Book title is required (at least 2 characters)"),
  author: z.string().min(2, "Author is required (at least 2 characters)"),
  isbn: z.string().optional(),
  locationCell: z.string().optional(),
  category: z.string().min(1, "Category is required"),
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

import { z } from "zod";

export const donationSubmitSchema = z.object({
  bookTitle: z.string().min(1, "Book title is required").max(255, "Title too long"),
  author: z.string().max(255, "Author name too long").optional(),
  category: z.string().optional(),
  quantity: z.coerce
    .number()
    .int("Quantity must be a whole number")
    .min(1, "At least 1 book must be donated")
    .max(100, "Cannot donate more than 100 at once"),
  donorName: z.string().max(150).optional(),
  donorEmail: z.string().email("Invalid email address").optional().or(z.literal("")),
  /** Canonical Prisma field: contactPhone */
  contactPhone: z.string().optional(),
  /** Canonical Prisma field: donorNote */
  donorNote: z.string().max(1000, "Notes too long").optional(),
  isAnonymous: z.boolean().optional().default(false),
});

export const approveDonationSchema = z.object({
  id: z.string().min(1),
  locationCell: z.string().min(1, "Library cell location is required"),
  assignedCategory: z.string().optional(),
  borrowStock: z.coerce.number().int().min(0).optional(),
  sellStock: z.coerce.number().int().min(0).optional(),
});

export const rejectDonationSchema = z.object({
  id: z.string().min(1),
  rejectionReason: z
    .string()
    .min(10, "Reason must be at least 10 characters")
    .max(500, "Reason too long"),
});

export type DonationSubmitFormValues = z.infer<typeof donationSubmitSchema>;
export type ApproveDonationFormValues = z.infer<typeof approveDonationSchema>;
export type RejectDonationFormValues = z.infer<typeof rejectDonationSchema>;

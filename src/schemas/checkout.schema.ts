import { z } from "zod";

const PaymentMethodEnum = z.enum(["CASH", "ONLINE"]);

const checkoutItemSchema = z.object({
  bookId: z.union([z.string(), z.number()]),
  quantity: z.coerce
    .number()
    .int("Quantity must be a whole number")
    .min(1, "Quantity must be at least 1"),
  type: z.enum(["BORROW", "SELL"]),
  dueDate: z.string().optional(), // ISO date string for borrow
});

export const memberCheckoutSchema = z.object({
  items: z.array(checkoutItemSchema).min(1, "Cart must have at least one item"),
  paymentMethod: PaymentMethodEnum,
  shippingAddress: z.string().min(5, "Delivery address must be at least 5 characters"),
});

export const guestCheckoutSchema = z.object({
  items: z.array(checkoutItemSchema).min(1, "Cart must have at least one item"),
  paymentMethod: PaymentMethodEnum,
  guestName: z
    .string()
    .min(2, "Full name must be at least 2 characters")
    .max(150, "Name too long"),
  guestPhone: z
    .string()
    .min(10, "Valid phone number required")
    .max(20, "Phone number too long"),
  guestEmail: z
    .string()
    .min(1, "Email address is required for guest checkout")
    .email("Please provide a valid email address for order confirmation & tracking"),
  shippingAddress: z.string().min(5, "Delivery address must be at least 5 characters"),
});

export const guestOrdersLookupSchema = z.object({
  email: z
    .string()
    .min(1, "Email address is required to view your guest orders")
    .email("Invalid email format"),
  phone: z.string().optional(),
  transactionId: z.string().optional(),
});

export const guestCancelOrderSchema = z.object({
  transactionId: z.string().min(1, "Transaction reference is required"),
  email: z.string().email("Valid email address is required to confirm cancellation"),
  reason: z.string().max(300, "Reason too long").optional(),
});

export const borrowRequestSchema = z.object({
  bookId: z.union([z.string(), z.number()]),
  dueDate: z.string().optional(),
});

export type MemberCheckoutFormValues = z.infer<typeof memberCheckoutSchema>;
export type GuestCheckoutFormValues = z.infer<typeof guestCheckoutSchema>;
export type GuestOrdersLookupFormValues = z.infer<typeof guestOrdersLookupSchema>;
export type GuestCancelOrderFormValues = z.infer<typeof guestCancelOrderSchema>;
export type BorrowRequestFormValues = z.infer<typeof borrowRequestSchema>;


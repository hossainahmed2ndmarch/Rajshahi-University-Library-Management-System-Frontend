import { z } from "zod";

export const startShiftSchema = z.object({
  openingCash: z.coerce
    .number()
    .min(0, "Opening cash float cannot be negative")
    .max(500_000, "Cash amount too large"),
  notes: z.string().max(500, "Notes too long").optional(),
});

export const endShiftSchema = z.object({
  closingCash: z.coerce
    .number()
    .min(0, "Closing cash cannot be negative")
    .max(500_000, "Cash amount too large"),
  tasksCompleted: z
    .string()
    .min(3, "Please detail the tasks completed during your duty shift"),
  handoverNotes: z.string().max(1000, "Handover notes too long").optional(),
});

export const scheduleShiftSchema = z.object({
  date: z.string().min(1, "Duty date is required"),
  slot: z.enum(["MORNING", "AFTERNOON", "EVENING", "CUSTOM"]),
  customStartTime: z.string().optional(),
  customEndTime: z.string().optional(),
  openingCash: z.coerce.number().min(0).default(500),
  notifyRecipients: z.enum(["ALL", "SHIFTER", "ADMIN", "SUPER_ADMIN"]).default("ALL"),
  notificationMethod: z.enum(["EMAIL", "SMS", "SOCIAL_MEDIA", "ALL"]).default("EMAIL"),
  socialPlatform: z.enum(["WHATSAPP", "MESSENGER", "TELEGRAM"]).default("WHATSAPP"),
  notes: z.string().max(500, "Notes too long").optional(),
});

export const cancelShiftSchema = z.object({
  reason: z
    .string()
    .min(3, "Please provide a descriptive reason for cancelling your scheduled shift"),
  notifyRecipients: z.enum(["ALL", "SHIFTER", "ADMIN", "SUPER_ADMIN"]).default("ALL"),
  notificationMethod: z.enum(["EMAIL", "SMS", "SOCIAL_MEDIA", "ALL"]).default("EMAIL"),
  socialPlatform: z.enum(["WHATSAPP", "MESSENGER", "TELEGRAM"]).default("WHATSAPP"),
});

export type StartShiftFormValues = z.infer<typeof startShiftSchema>;
export type EndShiftFormValues = z.infer<typeof endShiftSchema>;
export type ScheduleShiftFormValues = z.infer<typeof scheduleShiftSchema>;
export type CancelShiftFormValues = z.infer<typeof cancelShiftSchema>;

import { z } from "zod";

export const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  avatarUrl: z.string().optional(),
  phone: z.string().optional(),
  institution: z.string().optional(),
  department: z.string().optional(),
  session: z.string().optional(),
});

export const credentialsSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  studentOrVoterId: z.string().min(1, "Student/Voter ID is required"),
});

export const passwordSchema = z
  .object({
    currentPassword: z.string().min(6, "Current password is required"),
    newPassword: z.string().min(8, "New password must be at least 8 characters"),
    confirmPassword: z.string().min(8, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type ProfileFormValues = z.infer<typeof profileSchema>;
export type CredentialsFormValues = z.infer<typeof credentialsSchema>;
export type PasswordFormValues = z.infer<typeof passwordSchema>;

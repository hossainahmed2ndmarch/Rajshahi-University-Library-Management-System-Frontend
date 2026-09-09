"use client";

import React, { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { BookOpen, Lock, ArrowRight, ArrowLeft, CheckCircle2, AlertTriangle } from "lucide-react";
import { RUForm, RUInput } from "@/components/forms";
import { AuthService } from "@/services/auth.service";
import { resetPasswordSchema, type ResetPasswordFormValues } from "@/schemas";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/errorUtils";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const token = searchParams.get("token");

  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  if (!id || !token) {
    return (
      <div className="text-center space-y-4 py-4">
        <div className="flex justify-center">
          <div className="h-16 w-16 bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-full flex items-center justify-center">
            <AlertTriangle className="h-8 w-8" />
          </div>
        </div>
        <h3 className="text-lg font-bold text-foreground">Invalid Reset Link</h3>
        <p className="text-xs text-muted-foreground leading-relaxed">
          The password reset token is missing or malformed. Please request a new link.
        </p>
        <div className="pt-4">
          <Link
            href="/forgot-password"
            className="inline-flex items-center text-xs font-bold text-[#004F32] dark:text-emerald-400 hover:underline gap-1"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Request New Link
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (values: ResetPasswordFormValues) => {
    try {
      setIsLoading(true);
      const res = await AuthService.resetPassword(
        {
          id: Number(id),
          newPassword: values.newPassword,
        },
        token
      );
      setIsSuccess(true);
      toast.success(res.message || "Password has been reset successfully!");
      setTimeout(() => {
        router.push("/login");
      }, 2500);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="text-center space-y-4 py-4">
        <div className="flex justify-center">
          <div className="h-16 w-16 bg-emerald-100 dark:bg-emerald-950/40 text-[#004F32] dark:text-emerald-400 rounded-full flex items-center justify-center">
            <CheckCircle2 className="h-8 w-8" />
          </div>
        </div>
        <h3 className="text-lg font-bold text-foreground">Password Reset Successful!</h3>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Your account password has been updated. You will be redirected to the sign-in page shortly.
        </p>
        <div className="pt-4">
          <Link
            href="/login"
            className="inline-flex items-center text-xs font-bold text-[#004F32] dark:text-emerald-400 hover:underline gap-1"
          >
            <ArrowRight className="h-3.5 w-3.5" /> Go to Sign In Now
          </Link>
        </div>
      </div>
    );
  }

  return (
    <RUForm
      schema={resetPasswordSchema}
      onSubmit={handleSubmit}
      defaultValues={{ newPassword: "", confirmPassword: "" }}
    >
      <div className="space-y-4">
        <RUInput
          name="newPassword"
          label="New Password"
          type="password"
          placeholder="••••••••"
          prependIcon={<Lock className="h-4 w-4 text-amber-500" />}
          required
        />

        <RUInput
          name="confirmPassword"
          label="Confirm New Password"
          type="password"
          placeholder="••••••••"
          prependIcon={<Lock className="h-4 w-4 text-amber-500" />}
          required
        />

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center space-x-2 rounded-xl bg-[#004F32] hover:bg-emerald-900 py-3 px-4 text-xs font-bold text-white shadow-md focus:ring-2 focus:ring-emerald-400 disabled:opacity-50 transition-all cursor-pointer"
        >
          <span>{isLoading ? "Resetting Password..." : "Update Password"}</span>
          <ArrowRight className="h-4 w-4 ml-1" />
        </button>

        <div className="text-center pt-2">
          <Link
            href="/login"
            className="inline-flex items-center text-xs text-muted-foreground hover:text-foreground font-medium gap-1"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Sign In
          </Link>
        </div>
      </div>
    </RUForm>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-background transition-colors relative overflow-hidden">
      <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-[#004F32]/15 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-[#C78700]/15 blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3 z-10">
        <Link href="/" className="inline-flex items-center space-x-3 group">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#004F32] text-white shadow-lg group-hover:scale-105 transition-transform">
            <BookOpen className="h-7 w-7 text-amber-400" />
          </div>
          <div className="text-left">
            <span className="text-xl font-extrabold tracking-tight text-foreground block">
              RU Islamic Library
            </span>
            <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400 tracking-wider uppercase block">
              Rajshahi University
            </span>
          </div>
        </Link>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          Set New Password
        </h2>
        <p className="text-xs text-muted-foreground max-w-xs mx-auto">
          Please enter and confirm your new secure account password.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10">
        <div className="bg-card py-8 px-6 shadow-xl border border-border/70 rounded-3xl sm:px-10">
          <Suspense fallback={<div className="text-center text-xs py-4">Loading secure portal...</div>}>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  Mail,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";
import { RUForm, RUInput } from "@/components/forms";
import { AuthService } from "@/services/auth.service";
import { forgotPasswordSchema, type ForgotPasswordFormValues } from "@/schemas";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/errorUtils";
import Image from "next/image";
import logo from "../../assets/logo/Version 3- Multi transparent.png";
import logoDark from "../../assets/logo/white-version.png";
import { useLanguageStore } from "@/store/useLanguageStore";

export default function ForgotPasswordPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");

  const handleSubmit = async (values: ForgotPasswordFormValues) => {
    try {
      setIsLoading(true);
      const res = await AuthService.forgotPassword({ email: values.email });
      setSubmittedEmail(values.email);
      setIsSubmitted(true);
      toast.success(res.message || "Password reset email sent!");
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };
  const { t } = useLanguageStore();
  const logoTitle = t("nav.logoTitle");
  const logoSubTitle = t("nav.logoSubTitle");

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-background transition-colors relative overflow-hidden">
      <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-[#004F32]/15 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-[#C78700]/15 blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3 z-10">
        <Link href="/" className="inline-flex items-center space-x-3 group">
          <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl">
            <Image
              src={logo}
              alt="RUIL Logo"
              priority
              className="h-11 w-11 object-contain dark:hidden"
            />
            <Image
              src={logoDark}
              alt="RUIL Logo"
              priority
              className="hidden h-11 w-11 object-contain dark:block"
            />
          </div>
          <div className="text-left">
            <span className="text-xl font-extrabold tracking-tight text-foreground block">
              {logoTitle}
            </span>
            <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400 tracking-wider uppercase block">
              {logoSubTitle}
            </span>
          </div>
        </Link>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          Forgot Your Password?
        </h2>
        <p className="text-xs text-muted-foreground max-w-xs mx-auto">
          Enter your registered email address and we'll send you a password
          reset link.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10">
        <div className="bg-card py-8 px-6 shadow-xl border border-border/70 rounded-3xl sm:px-10">
          {isSubmitted ? (
            <div className="text-center space-y-4 py-4">
              <div className="flex justify-center">
                <div className="h-16 w-16 bg-emerald-100 dark:bg-emerald-950/40 text-[#004F32] dark:text-emerald-400 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-foreground">
                Check your inbox
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                If an account exists for{" "}
                <span className="font-semibold text-foreground">
                  {submittedEmail}
                </span>
                , we have sent a secure link to reset your password. It will
                expire in 5 minutes.
              </p>
              <div className="pt-4">
                <Link
                  href="/login"
                  className="inline-flex items-center text-xs font-bold text-[#004F32] dark:text-emerald-400 hover:underline gap-1"
                >
                  <ArrowLeft className="h-3.5 w-3.5" /> Return to Login
                </Link>
              </div>
            </div>
          ) : (
            <RUForm
              schema={forgotPasswordSchema}
              onSubmit={handleSubmit}
              defaultValues={{ email: "" }}
            >
              <div className="space-y-4">
                <RUInput
                  name="email"
                  label="Registered Email Address"
                  type="email"
                  placeholder="name@ru.ac.bd"
                  prependIcon={<Mail className="h-4 w-4 text-amber-500" />}
                  required
                />

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center space-x-2 rounded-xl bg-[#004F32] hover:bg-emerald-900 py-3 px-4 text-xs font-bold text-white shadow-md focus:ring-2 focus:ring-emerald-400 disabled:opacity-50 transition-all cursor-pointer"
                >
                  <span>
                    {isLoading ? "Sending Link..." : "Send Reset Link"}
                  </span>
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
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { BookOpen, LogIn, Mail, Lock, ArrowRight, Sparkles, ShieldCheck, UserCheck } from "lucide-react";
import { RUForm, RUInput } from "@/components/forms";
import { useLogin } from "@/hooks/useAuth";
import { loginSchema, type LoginFormValues } from "@/schemas";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect");

  const { mutate: loginUser, isPending } = useLogin();

  const handleSubmit = (values: LoginFormValues) => {
    loginUser(
      {
        email: values.email,
        password: values.password,
      },
      {
        onSuccess: (res) => {
          const userRole = res.data?.user?.role || "MEMBER";
          if (redirectPath) {
            router.push(redirectPath);
          } else if (userRole === "SUPER_ADMIN") {
            router.push("/dashboard/super-admin");
          } else if (userRole === "ADMIN") {
            router.push("/dashboard/admin");
          } else if (userRole === "SHIFTER") {
            router.push("/dashboard/shifter");
          } else {
            router.push("/dashboard/member");
          }
        },
      }
    );
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-background transition-colors relative overflow-hidden">
      {/* Dynamic Aesthetic Background Gradients */}
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

        <h2 className="text-2xl font-extrabold text-foreground tracking-tight pt-2">
          Sign In to Library Portal
        </h2>
        <p className="text-xs text-muted-foreground max-w-xs mx-auto">
          Enter your registered email address and password to access your member or administrative dashboard.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10">
        <div className="rounded-3xl border border-border bg-card/95 backdrop-blur-md p-8 shadow-2xl text-card-foreground">
          <RUForm<LoginFormValues>
            schema={loginSchema}
            defaultValues={{ email: "", password: "" }}
            onSubmit={handleSubmit}
          >
            <div className="space-y-5">
              <RUInput
                name="email"
                label="Email Address"
                type="email"
                placeholder="e.g. member@ru.ac.bd"
                prependIcon={<Mail className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />}
                required
              />

              <RUInput
                name="password"
                label="Password"
                type="password"
                placeholder="••••••••"
                prependIcon={<Lock className="h-4 w-4 text-amber-500" />}
                required
              />

              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="rounded border-input text-[#004F32] focus:ring-[#004F32] h-4 w-4"
                  />
                  <span className="text-muted-foreground font-medium">Remember session</span>
                </label>
                <Link href="/forgot-password" className="font-semibold text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="w-full flex items-center justify-center space-x-2 rounded-xl bg-[#004F32] hover:bg-emerald-900 py-3 px-4 text-xs font-bold text-white shadow-md focus:ring-2 focus:ring-emerald-400 disabled:opacity-50 transition-all cursor-pointer"
              >
                <LogIn className="h-4 w-4 text-amber-300" />
                <span>{isPending ? "Signing In..." : "Sign In to Portal"}</span>
                <ArrowRight className="h-4 w-4 ml-1" />
              </button>
            </div>
          </RUForm>

          {/* Quick Demo Roles Section */}
          <div className="mt-6 pt-5 border-t border-border/80 text-xs text-muted-foreground space-y-2">
            <div className="flex items-center space-x-1.5 font-bold text-foreground">
              <Sparkles className="h-4 w-4 text-amber-500" />
              <span>Registered System Demo Accounts:</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-950/20 p-2.5 space-y-0.5">
                <div className="flex items-center gap-1 font-bold text-[#004F32] dark:text-emerald-400">
                  <UserCheck className="h-3 w-3" /> Member Account
                </div>
                <div className="font-mono text-[10px] text-muted-foreground">member@ru.ac.bd</div>
              </div>

              <div className="rounded-xl border border-amber-500/20 bg-amber-50/50 dark:bg-amber-950/20 p-2.5 space-y-0.5">
                <div className="flex items-center gap-1 font-bold text-amber-700 dark:text-amber-400">
                  <ShieldCheck className="h-3 w-3" /> Shifter Account
                </div>
                <div className="font-mono text-[10px] text-muted-foreground">shifter.hasan@ru.ac.bd</div>
              </div>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-muted-foreground">
            Don't have a library account yet?{" "}
            <Link href="/register" className="font-bold text-primary hover:underline">
              Register as New Member
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#004F32] border-t-transparent" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}

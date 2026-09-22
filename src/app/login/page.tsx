"use client";

import Image from "next/image";
import React, { Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  LogIn,
  Mail,
  Lock,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import { RUForm, RUInput } from "@/components/forms";
import { useLogin } from "@/hooks/useAuth";
import { loginSchema, type LoginFormValues } from "@/schemas";
import logo from "../../assets/logo/Version 3- Multi transparent.png";
import logoDark from "../../assets/logo/white-version.png";

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
      },
    );
  };

  return (
    <div className="min-h-screen flex bg-background transition-colors relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -left-32 h-80 w-80 rounded-full bg-[#004F32]/12 blur-3xl" />
        <div className="absolute top-1/2 -right-40 h-96 w-96 rounded-full bg-[#C78700]/10 blur-3xl" />
        <div className="absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-[#004F32]/8 blur-3xl" />
        {/* Decorative Islamic geometric pattern */}
        <svg
          className="absolute right-0 top-0 h-full w-1/2 opacity-[0.025] dark:opacity-[0.04] text-[#004F32]"
          viewBox="0 0 400 800"
          fill="currentColor"
          aria-hidden="true"
        >
          <pattern id="geo" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
            <polygon points="40,5 75,25 75,55 40,75 5,55 5,25" fill="none" stroke="currentColor" strokeWidth="1" />
            <polygon points="40,20 60,30 60,50 40,60 20,50 20,30" fill="none" stroke="currentColor" strokeWidth="0.5" />
          </pattern>
          <rect width="400" height="800" fill="url(#geo)" />
        </svg>
      </div>

      <div className="flex flex-1 flex-col justify-center items-center px-4 sm:px-6 lg:px-8 py-12 z-10">
        <div className="w-full max-w-md space-y-8">
          {/* Logo & Brand */}
          <div className="text-center space-y-4">
            <Link
              href="/"
              className="inline-flex items-center gap-3 group"
            >
              <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#004F32] to-[#003824] shadow-lg shadow-[#004F32]/30 group-hover:shadow-[#004F32]/50 transition-shadow">
                <Image
                  src={logo}
                  alt="RUIL Logo"
                  priority
                  className="h-9 w-9 object-contain dark:hidden"
                />
                <Image
                  src={logoDark}
                  alt="RUIL Logo"
                  priority
                  className="hidden h-9 w-9 object-contain dark:block"
                />
              </div>
              <div className="text-left">
                <span className="text-lg font-black tracking-tight text-[#004F32] dark:text-emerald-400 block leading-tight">
                  রাবি ইসলামিক পাঠাগার
                </span>
                <span className="text-[11px] font-bold text-[#C78700] dark:text-amber-400 tracking-widest uppercase block">
                  Rajshahi University
                </span>
              </div>
            </Link>

            <div className="space-y-1.5">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                Welcome back
              </h1>
              <p className="text-sm text-muted-foreground">
                Sign in to access your library portal
              </p>
            </div>
          </div>

          {/* Card */}
          <div className="relative rounded-3xl border border-border/80 bg-card/90 backdrop-blur-xl shadow-xl shadow-black/5 dark:shadow-black/30 overflow-hidden">
            {/* Card top accent */}
            <div className="h-1 w-full bg-gradient-to-r from-[#004F32] via-[#006640] to-[#C78700]" />

            <div className="p-7 sm:p-8">
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
                    prependIcon={
                      <Mail className="h-4 w-4 text-[#004F32] dark:text-emerald-400" />
                    }
                    required
                  />

                  <RUInput
                    name="password"
                    label="Password"
                    type="password"
                    placeholder="Enter your password"
                    prependIcon={<Lock className="h-4 w-4 text-[#C78700] dark:text-amber-400" />}
                    required
                  />

                  <div className="flex items-center justify-between text-xs">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <div className="relative">
                        <input
                          type="checkbox"
                          defaultChecked
                          className="peer sr-only"
                        />
                        <div className="h-4 w-4 rounded border border-input bg-background peer-checked:bg-[#004F32] peer-checked:border-[#004F32] transition-colors flex items-center justify-center">
                          <span className="hidden peer-checked:block text-white text-[10px] font-bold leading-none">✓</span>
                        </div>
                      </div>
                      <span className="text-muted-foreground font-medium group-hover:text-foreground transition-colors">
                        Remember session
                      </span>
                    </label>
                    <Link
                      href="/forgot-password"
                      className="font-semibold text-[#004F32] dark:text-emerald-400 hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>

                  <button
                    type="submit"
                    disabled={isPending}
                    className="w-full flex items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-[#004F32] to-[#005a3a] hover:from-[#003d27] hover:to-[#004F32] py-3 px-4 text-sm font-bold text-white shadow-lg shadow-[#004F32]/30 hover:shadow-[#004F32]/50 focus:ring-2 focus:ring-[#004F32]/50 focus:ring-offset-2 disabled:opacity-50 transition-all duration-200 cursor-pointer active:scale-[0.98]"
                  >
                    <LogIn className="h-4 w-4 text-amber-300 shrink-0" />
                    <span>{isPending ? "Signing In..." : "Sign In to Portal"}</span>
                    <ArrowRight className="h-4 w-4 ml-auto shrink-0" />
                  </button>
                </div>
              </RUForm>

              {/* Demo accounts */}
              <div className="mt-6 pt-5 border-t border-border/60 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                  <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                  <span>Demo Accounts</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="rounded-xl border border-[#004F32]/20 bg-gradient-to-br from-emerald-50/60 to-green-50/30 dark:from-emerald-950/30 dark:to-green-950/20 p-3 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-[#004F32] dark:text-emerald-400">
                      <UserCheck className="h-3 w-3" /> Member
                    </div>
                    <div className="font-mono text-[10px] text-muted-foreground">
                      member@ru.ac.bd
                    </div>
                  </div>
                  <div className="rounded-xl border border-amber-500/20 bg-gradient-to-br from-amber-50/60 to-yellow-50/30 dark:from-amber-950/30 dark:to-yellow-950/20 p-3 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-amber-700 dark:text-amber-400">
                      <ShieldCheck className="h-3 w-3" /> Shifter
                    </div>
                    <div className="font-mono text-[10px] text-muted-foreground">
                      shifter.hasan@ru.ac.bd
                    </div>
                  </div>
                </div>
              </div>

              {/* Register link */}
              <p className="mt-6 text-center text-xs text-muted-foreground">
                Don&apos;t have a library account?{" "}
                <Link
                  href="/register"
                  className="font-bold text-[#004F32] dark:text-emerald-400 hover:underline"
                >
                  Register as New Member
                </Link>
              </p>
            </div>
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

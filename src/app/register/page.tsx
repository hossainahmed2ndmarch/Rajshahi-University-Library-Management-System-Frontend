"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  UserPlus,
  Mail,
  Lock,
  Phone,
  User,
  Hash,
  Building,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { RUForm, RUInput, RUSelect } from "@/components/forms";
import { useRegister } from "@/hooks/useAuth";
import { registerSchema, type RegisterFormValues } from "@/schemas";
import logo from "../../assets/logo/Version 3- Multi transparent.png";
import logoDark from "../../assets/logo/white-version.png";
import { useLanguageStore } from "@/store/useLanguageStore";

export default function RegisterPage() {
  const router = useRouter();
  const { mutate: registerUser, isPending } = useRegister();
  const { t } = useLanguageStore();
  const logoTitle = t("nav.logoTitle");
  const logoSubTitle = t("nav.logoSubTitle");

  const handleSubmit = (values: RegisterFormValues) => {
    registerUser(
      {
        name: values.name,
        email: values.email,
        phone: values.phone,
        password: values.password,
        studentOrVoterId: values.studentOrVoterId,
        department: values.department || "Islamic Studies",
        session: values.session || "2024-2025",
        institution: "Rajshahi University",
        paymentMethod: values.paymentMethod,
      },
      {
        onSuccess: () => {
          router.push("/login");
        },
      },
    );
  };

  return (
    <div className="min-h-screen flex bg-background transition-colors relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-32 h-96 w-96 rounded-full bg-[#004F32]/12 blur-3xl" />
        <div className="absolute top-1/3 -left-40 h-80 w-80 rounded-full bg-[#C78700]/10 blur-3xl" />
        <div className="absolute -bottom-40 right-1/4 h-80 w-80 rounded-full bg-[#004F32]/8 blur-3xl" />
        {/* Decorative geometric pattern */}
        <svg
          className="absolute left-0 top-0 h-full w-1/2 opacity-[0.025] dark:opacity-[0.04] text-[#004F32]"
          viewBox="0 0 400 800"
          fill="currentColor"
          aria-hidden="true"
        >
          <pattern id="geo2" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
            <polygon points="40,5 75,25 75,55 40,75 5,55 5,25" fill="none" stroke="currentColor" strokeWidth="1" />
            <polygon points="40,20 60,30 60,50 40,60 20,50 20,30" fill="none" stroke="currentColor" strokeWidth="0.5" />
          </pattern>
          <rect width="400" height="800" fill="url(#geo2)" />
        </svg>
      </div>

      <div className="flex flex-1 flex-col justify-center items-center px-4 sm:px-6 lg:px-8 py-12 z-10">
        <div className="w-full max-w-lg space-y-8">
          {/* Logo & Brand */}
          <div className="text-center space-y-4">
            <Link
              href="/"
              className="inline-flex items-center gap-3 group"
            >
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
                <span className="text-lg font-black tracking-tight text-[#004F32] dark:text-emerald-400 block leading-tight">
                  {logoTitle}
                </span>
                <span className="text-[11px] font-bold text-[#C78700] dark:text-amber-400 tracking-widest uppercase block">
                  {logoSubTitle}
                </span>
              </div>
            </Link>

            <div className="space-y-1.5">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                Apply for Membership
              </h1>
              <p className="text-sm text-muted-foreground">
                Fill in your details to create your library member profile
              </p>
            </div>
          </div>

          {/* Card */}
          <div className="relative rounded-3xl border border-border/80 bg-card/90 backdrop-blur-xl shadow-xl shadow-black/5 dark:shadow-black/30 overflow-hidden">
            {/* Card top accent */}
            <div className="h-1 w-full bg-gradient-to-r from-[#C78700] via-[#004F32] to-[#C78700]" />

            <div className="p-7 sm:p-8">
              {/* Steps indicator */}
              <div className="flex items-center gap-2 mb-6 p-3 rounded-xl bg-[#004F32]/5 dark:bg-emerald-950/30 border border-[#004F32]/10">
                <ShieldCheck className="h-4 w-4 text-[#004F32] dark:text-emerald-400 shrink-0" />
                <p className="text-xs text-muted-foreground">
                  Your information is securely stored and only accessible to authorized library staff.
                </p>
              </div>

              <RUForm<RegisterFormValues>
                schema={registerSchema}
                defaultValues={{
                  name: "",
                  email: "",
                  phone: "",
                  studentOrVoterId: "",
                  password: "",
                  confirmPassword: "",
                  department: "Islamic Studies",
                  session: "2024-2025",
                  paymentMethod: "CASH",
                }}
                onSubmit={handleSubmit}
              >
                <div className="space-y-4">
                  {/* Full Name */}
                  <RUInput
                    name="name"
                    label="Full Name"
                    placeholder="e.g. Abdullah Al Mamun"
                    prependIcon={<User className="h-4 w-4 text-[#004F32] dark:text-emerald-400" />}
                    required
                  />

                  {/* Email + Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <RUInput
                      name="email"
                      label="Email Address"
                      type="email"
                      placeholder="e.g. member@ru.ac.bd"
                      prependIcon={<Mail className="h-4 w-4 text-[#004F32] dark:text-emerald-400" />}
                      required
                    />

                    <RUInput
                      name="phone"
                      label="Phone Number"
                      placeholder="e.g. 01712345678"
                      prependIcon={<Phone className="h-4 w-4 text-[#004F32] dark:text-emerald-400" />}
                      required
                    />
                  </div>

                  {/* Student ID */}
                  <RUInput
                    name="studentOrVoterId"
                    label="Student Reg # / NID / Voter ID"
                    placeholder="e.g. RU-2024-8891"
                    prependIcon={<Hash className="h-4 w-4 text-[#C78700] dark:text-amber-400" />}
                    required
                  />

                  {/* Divider */}
                  <div className="flex items-center gap-3 py-1">
                    <div className="flex-1 h-px bg-border" />
                    <span className="text-[11px] text-muted-foreground font-medium">Account Security</span>
                    <div className="flex-1 h-px bg-border" />
                  </div>

                  {/* Password + Confirm Password */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <RUInput
                      name="password"
                      label="Password"
                      type="password"
                      placeholder="Min. 6 characters"
                      prependIcon={<Lock className="h-4 w-4 text-[#C78700] dark:text-amber-400" />}
                      required
                    />

                    <RUInput
                      name="confirmPassword"
                      label="Confirm Password"
                      type="password"
                      placeholder="Re-enter password"
                      prependIcon={<Lock className="h-4 w-4 text-[#C78700] dark:text-amber-400" />}
                      required
                    />
                  </div>

                  {/* Divider */}
                  <div className="flex items-center gap-3 py-1">
                    <div className="flex-1 h-px bg-border" />
                    <span className="text-[11px] text-muted-foreground font-medium">Academic Details</span>
                    <div className="flex-1 h-px bg-border" />
                  </div>

                  {/* Department + Session + Payment */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <RUInput
                      name="department"
                      label="Department"
                      placeholder="e.g. Islamic Studies"
                      prependIcon={<Building className="h-4 w-4 text-muted-foreground" />}
                    />

                    <RUInput
                      name="session"
                      label="Academic Session"
                      placeholder="e.g. 2024-2025"
                    />

                    <RUSelect
                      name="paymentMethod"
                      label="Membership Fee"
                      options={[
                        { label: "Cash (At Library Desk)", value: "CASH" },
                        { label: "Online (bKash/Nagad)", value: "ONLINE" },
                      ]}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isPending}
                    className="mt-2 w-full flex items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-[#004F32] to-[#005a3a] hover:from-[#003d27] hover:to-[#004F32] py-3 px-4 text-sm font-bold text-white shadow-lg shadow-[#004F32]/30 hover:shadow-[#004F32]/50 focus:ring-2 focus:ring-[#004F32]/50 focus:ring-offset-2 disabled:opacity-50 transition-all duration-200 cursor-pointer active:scale-[0.98]"
                  >
                    <UserPlus className="h-4 w-4 text-amber-300 shrink-0" />
                    <span>
                      {isPending ? "Creating Account..." : "Submit Registration Application"}
                    </span>
                    <ArrowRight className="h-4 w-4 ml-auto shrink-0" />
                  </button>
                </div>
              </RUForm>

              <p className="mt-6 text-center text-xs text-muted-foreground">
                Already registered as a member?{" "}
                <Link
                  href="/login"
                  className="font-bold text-[#004F32] dark:text-emerald-400 hover:underline"
                >
                  Sign In Here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

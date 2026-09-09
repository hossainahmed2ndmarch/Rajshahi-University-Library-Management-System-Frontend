"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookOpen, UserPlus, Mail, Lock, Phone, User, Hash, Building, ArrowRight } from "lucide-react";
import { RUForm, RUInput, RUSelect } from "@/components/forms";
import { useRegister } from "@/hooks/useAuth";
import { registerSchema, type RegisterFormValues } from "@/schemas";

export default function RegisterPage() {
  const router = useRouter();
  const { mutate: registerUser, isPending } = useRegister();

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
      }
    );
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-background transition-colors relative overflow-hidden">
      {/* Background Aesthetic Gradients */}
      <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-[#004F32]/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-[#C78700]/10 blur-3xl pointer-events-none" />

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
          Apply for Library Membership
        </h2>
        <p className="text-xs text-muted-foreground">
          Fill in your details to create your member profile and borrow books.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg z-10">
        <div className="rounded-3xl border border-border bg-card p-8 shadow-xl text-card-foreground">
          <RUForm<RegisterFormValues>
            schema={registerSchema}
            defaultValues={{
              name: "",
              email: "",
              phone: "",
              studentOrVoterId: "",
              password: "",
              department: "Islamic Studies",
              session: "2024-2025",
              paymentMethod: "CASH",
            }}
            onSubmit={handleSubmit}
          >
            <div className="space-y-4">
              <RUInput
                name="name"
                label="Full Name"
                placeholder="e.g. Abdullah Al Mamun"
                prependIcon={<User className="h-4 w-4 text-[#004F32]" />}
                required
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <RUInput
                  name="email"
                  label="Email Address"
                  type="email"
                  placeholder="e.g. member@ru.ac.bd"
                  prependIcon={<Mail className="h-4 w-4 text-[#004F32]" />}
                  required
                />

                <RUInput
                  name="phone"
                  label="Phone Number"
                  placeholder="e.g. 01712345678"
                  prependIcon={<Phone className="h-4 w-4 text-[#004F32]" />}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <RUInput
                  name="studentOrVoterId"
                  label="Student Reg # / NID / Voter ID"
                  placeholder="e.g. RU-2024-8891"
                  prependIcon={<Hash className="h-4 w-4 text-amber-500" />}
                  required
                />

                <RUInput
                  name="password"
                  label="Account Password"
                  type="password"
                  placeholder="••••••••"
                  prependIcon={<Lock className="h-4 w-4 text-amber-500" />}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <RUInput
                  name="department"
                  label="Department"
                  placeholder="e.g. Islamic Studies"
                  prependIcon={<Building className="h-4 w-4" />}
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
                className="mt-2 w-full flex items-center justify-center space-x-2 rounded-xl bg-[#004F32] hover:bg-emerald-900 py-3 px-4 text-xs font-bold text-white shadow-md focus:ring-2 focus:ring-emerald-400 disabled:opacity-50 transition-all cursor-pointer"
              >
                <UserPlus className="h-4 w-4 text-amber-300" />
                <span>{isPending ? "Creating Account..." : "Submit Registration Application"}</span>
                <ArrowRight className="h-4 w-4 ml-1" />
              </button>
            </div>
          </RUForm>

          <div className="mt-6 text-center text-xs text-muted-foreground">
            Already registered as a member?{" "}
            <Link href="/login" className="font-bold text-primary hover:underline">
              Sign In Here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

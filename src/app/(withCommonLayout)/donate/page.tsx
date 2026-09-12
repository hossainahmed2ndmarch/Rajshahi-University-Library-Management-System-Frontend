"use client";

import React, { useState } from "react";
import { z } from "zod";
import {
  HeartHandshake,
  Gift,
  CheckCircle2,
  ShieldCheck,
  Building2,
  Truck,
  Package,
  MapPin,
  Info,
  Quote,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { RUForm, RUInput, RUSelect } from "@/components/forms";
import { useCreateDonation } from "@/hooks/useDonations";
import { useGetMe } from "@/hooks/useAuth";
import { DonationMethod, IDonationPayload } from "@/types/donation";

const donationSchema = z
  .object({
    bookTitle: z.string().min(2, "Book title is required (at least 2 characters)"),
    author: z.string().optional(),
    category: z.string().optional(),
    quantity: z.coerce.number().int().min(1, "Quantity must be at least 1"),
    condition: z.enum(["NEW", "LIKE_NEW", "GOOD", "ACCEPTABLE"]),
    method: z.enum(["LIBRARY_DROP_OFF", "PICKUP", "COURIER"]),
    isAnonymous: z.boolean().optional(),
    donorName: z.string().optional(),
    donorEmail: z.string().email("Invalid email address").optional().or(z.literal("")),
    contactPhone: z.string().min(6, "Contact phone number is required for coordination"),
    pickupAddress: z.string().optional(),
    scheduledAt: z.string().optional(),
    donorNote: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.method === "PICKUP") {
      if (!data.pickupAddress || data.pickupAddress.trim().length < 5) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["pickupAddress"],
          message: "Pickup address is mandatory (e.g. Hall name, room number, or campus address)",
        });
      }
      if (!data.scheduledAt || data.scheduledAt.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["scheduledAt"],
          message: "Scheduled pickup date & time is mandatory for collection",
        });
      }
    }

    if (data.method === "COURIER") {
      if (!data.donorNote || data.donorNote.trim().length < 5) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["donorNote"],
          message: "Courier service details / consignment notes are mandatory",
        });
      }
    }
  });

type DonationFormValues = z.infer<typeof donationSchema>;

export default function DonateBookPage() {
  const { data: user } = useGetMe();
  const { mutate: createDonation, isPending } = useCreateDonation();
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<DonationMethod>("LIBRARY_DROP_OFF");

  const defaultValues: DonationFormValues = {
    bookTitle: "",
    author: "",
    category: "General",
    quantity: 1,
    condition: "GOOD",
    method: "LIBRARY_DROP_OFF",
    isAnonymous: false,
    donorName: user?.name || "",
    donorEmail: user?.email || "",
    contactPhone: user?.phoneNumber || user?.phone || "",
    pickupAddress: "",
    scheduledAt: "",
    donorNote: "",
  };

  const handleSubmit = (data: DonationFormValues) => {
    const payload: IDonationPayload = {
      bookTitle: data.bookTitle,
      author: data.author || undefined,
      category: data.category || "General",
      quantity: Number(data.quantity) || 1,
      method: data.method,
      isAnonymous,
      donorName: isAnonymous ? "Anonymous Donor" : data.donorName || user?.name || "Anonymous",
      donorEmail: !isAnonymous && data.donorEmail ? data.donorEmail : undefined,
      contactPhone: data.contactPhone,
      pickupAddress: data.method === "PICKUP" ? data.pickupAddress : undefined,
      scheduledAt: data.method === "PICKUP" && data.scheduledAt ? data.scheduledAt : undefined,
      donorNote: data.donorNote || undefined,
    };

    createDonation(payload);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      {/* Aesthetic Hero Banner */}
      <div className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-br from-[#004F32] via-[#003824] to-[#040D09] p-6 sm:p-10 text-white shadow-2xl border border-emerald-800/80 dark:border-emerald-700/60">
        <div className="pointer-events-none absolute -left-16 -top-16 h-64 w-64 rounded-full bg-emerald-500/15 blur-3xl" />
        <div className="pointer-events-none absolute -right-16 -bottom-16 h-64 w-64 rounded-full bg-[#C78700]/15 blur-3xl" />

        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#C78700]/20 px-3.5 py-1 text-xs font-bold text-amber-300 border border-[#C78700]/35 shadow-2xs">
            <HeartHandshake className="h-4 w-4 text-amber-400" />
            <span>সদকায়ে জারিয়া ও কিতাব ওয়াকফ প্রকল্প</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight text-white">
            Donate Books to RU Islamic Library
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed font-light">
            Contribute Islamic literature, academic texts, commentary, or research journals. Upon receipt and verification by our staff, your donated books are barcoded and made freely accessible to university members.
          </p>

          <div className="pt-1">
            <div className="inline-flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 px-3.5 py-2 text-[11px] text-emerald-50 italic">
              <Quote className="h-3.5 w-3.5 text-amber-400/80 shrink-0" />
              <span>«মানুষ যখন মারা যায়, তার সমস্ত আমল বন্ধ হয়ে যায়—কেবল তিনটি ছাড়া: সদকায়ে জারিয়া, উপকারী জ্ঞান, অথবা নেক সন্তান...» (সহিহ মুসলিম: ১৬৩১)</span>
            </div>
          </div>
        </div>

        <div className="absolute right-0 bottom-0 top-0 hidden lg:flex items-center justify-center p-8 opacity-10 pointer-events-none">
          <HeartHandshake className="h-60 w-60 text-amber-300" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Donation Form Card */}
        <div className="md:col-span-2 rounded-2xl border border-border bg-card p-6 shadow-2xs">
          <div className="flex items-center space-x-3 pb-4 border-b border-border mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <HeartHandshake className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Book Donation Form</h2>
              <p className="text-xs text-muted-foreground">Select how you want to hand over the book.</p>
            </div>
          </div>

          <RUForm<DonationFormValues>
            schema={donationSchema}
            defaultValues={defaultValues}
            onSubmit={handleSubmit}
          >
            {({ setValue, watch }) => {
              const currentMethod = (watch ? watch("method") : selectedMethod) as DonationMethod;

              return (
                <div className="space-y-5">
                  {/* Step 1: Donation Method Selection */}
                  <div>
                    <label className="text-xs font-bold text-foreground block mb-2">
                      1. Select Donation Handover Method <span className="text-destructive">*</span>
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {/* LIBRARY_DROP_OFF */}
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedMethod("LIBRARY_DROP_OFF");
                          setValue("method", "LIBRARY_DROP_OFF");
                        }}
                        className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                          currentMethod === "LIBRARY_DROP_OFF"
                            ? "border-[#004F32] bg-[#004F32]/10 ring-2 ring-[#004F32]/40"
                            : "border-border bg-card hover:bg-muted/40"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <Building2
                            className={`h-5 w-5 ${
                              currentMethod === "LIBRARY_DROP_OFF" ? "text-[#004F32]" : "text-muted-foreground"
                            }`}
                          />
                          {currentMethod === "LIBRARY_DROP_OFF" && (
                            <CheckCircle2 className="h-4 w-4 text-[#004F32]" />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-xs text-foreground">Library Drop-Off</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">
                            Drop off at library desk. Duty shifter or admin receives it.
                          </p>
                        </div>
                      </button>

                      {/* PICKUP */}
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedMethod("PICKUP");
                          setValue("method", "PICKUP");
                        }}
                        className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                          currentMethod === "PICKUP"
                            ? "border-[#004F32] bg-[#004F32]/10 ring-2 ring-[#004F32]/40"
                            : "border-border bg-card hover:bg-muted/40"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <Truck
                            className={`h-5 w-5 ${
                              currentMethod === "PICKUP" ? "text-[#004F32]" : "text-muted-foreground"
                            }`}
                          />
                          {currentMethod === "PICKUP" && (
                            <CheckCircle2 className="h-4 w-4 text-[#004F32]" />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-xs text-foreground">Campus Pickup</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">
                            Staff travels to your address at a scheduled time.
                          </p>
                        </div>
                      </button>

                      {/* COURIER */}
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedMethod("COURIER");
                          setValue("method", "COURIER");
                        }}
                        className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                          currentMethod === "COURIER"
                            ? "border-[#004F32] bg-[#004F32]/10 ring-2 ring-[#004F32]/40"
                            : "border-border bg-card hover:bg-muted/40"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <Package
                            className={`h-5 w-5 ${
                              currentMethod === "COURIER" ? "text-[#004F32]" : "text-muted-foreground"
                            }`}
                          />
                          {currentMethod === "COURIER" && (
                            <CheckCircle2 className="h-4 w-4 text-[#004F32]" />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-xs text-foreground">Courier / Parcel</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">
                            Send via Sundarban/SA Paribahan/Courier.
                          </p>
                        </div>
                      </button>
                    </div>

                    {/* Method Contextual Explanations */}
                    {currentMethod === "LIBRARY_DROP_OFF" && (
                      <div className="mt-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 flex items-start gap-2 text-xs text-emerald-800 dark:text-emerald-300 animate-in fade-in-50">
                        <Info className="h-4 w-4 shrink-0 mt-0.5 text-emerald-600" />
                        <div>
                          <strong>Library Drop-Off Instructions:</strong> You can visit the RU Islamic Library desk during opening hours (Saturday - Thursday). Any active Shifter, Admin, or Super Admin on duty will verify and receive your books on the spot.
                        </div>
                      </div>
                    )}

                    {currentMethod === "PICKUP" && (
                      <div className="mt-3 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 flex items-start gap-2 text-xs text-amber-800 dark:text-amber-300 animate-in fade-in-50">
                        <Info className="h-4 w-4 shrink-0 mt-0.5 text-amber-600" />
                        <div>
                          <strong>Pickup Service Instructions:</strong> Please provide your exact address and convenient pickup date/time below. A library shifter or administrator will visit your location to collect the books.
                        </div>
                      </div>
                    )}

                    {currentMethod === "COURIER" && (
                      <div className="mt-3 rounded-xl border border-blue-500/20 bg-blue-500/5 p-3 space-y-1 text-xs text-blue-800 dark:text-blue-300 animate-in fade-in-50">
                        <div className="flex items-center gap-2 font-bold">
                          <Package className="h-4 w-4 text-blue-600" />
                          <span>Official Courier Delivery Address:</span>
                        </div>
                        <p className="text-[11px] font-mono bg-card p-2 rounded-lg border border-border/80 text-foreground">
                          RU Islamic Library, 2nd Floor, Central Cafeteria Complex, University of Rajshahi, Rajshahi-6205. Phone: +880 1700-000000
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Dynamic Fields for PICKUP */}
                  {currentMethod === "PICKUP" && (
                    <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 space-y-4 animate-in fade-in-50">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300 flex items-center gap-1.5">
                        <MapPin className="h-4 w-4" />
                        <span>Pickup Location &amp; Schedule Details (Mandatory)</span>
                      </h3>

                      <RUInput
                        name="pickupAddress"
                        label="Pickup Address / Hall & Room Number"
                        placeholder="e.g. Shaheed Habibur Rahman Hall, Room 312, Rajshahi University"
                        required
                      />

                      <RUInput
                        name="scheduledAt"
                        label="Scheduled Pickup Date & Time"
                        type="datetime-local"
                        required
                      />
                    </div>
                  )}

                  {/* Step 2: Book Details */}
                  <div className="pt-2 border-t border-border/60 space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      2. Donated Book Details
                    </h3>

                    <RUInput
                      name="bookTitle"
                      label="Book Title"
                      placeholder="e.g. Tafsir Ibn Kathir Vol 1"
                      required
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <RUInput
                        name="author"
                        label="Author / Compiler"
                        placeholder="e.g. Ibn Kathir"
                      />

                      <RUInput
                        name="category"
                        label="Category / Genre"
                        placeholder="e.g. Tafsir, Fiqh, Seerah, General..."
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <RUInput
                        name="quantity"
                        label="Quantity of Copies"
                        type="number"
                        placeholder="1"
                        required
                      />

                      <RUSelect
                        name="condition"
                        label="Book Condition"
                        options={[
                          { label: "New (Brand New)", value: "NEW" },
                          { label: "Like New (Minimal Use)", value: "LIKE_NEW" },
                          { label: "Good (Minor Wear)", value: "GOOD" },
                          { label: "Acceptable (Readable)", value: "ACCEPTABLE" },
                        ]}
                      />
                    </div>
                  </div>

                  {/* Anonymous Checkbox */}
                  <div className="rounded-lg border border-border/80 bg-muted/40 p-3 my-2">
                    <label className="flex items-center space-x-2 text-xs font-semibold text-foreground cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isAnonymous}
                        onChange={(e) => setIsAnonymous(e.target.checked)}
                        className="rounded border-input text-primary focus:ring-primary h-4 w-4"
                      />
                      <span>Donate Anonymously (Hide my donor identity from public listings)</span>
                    </label>
                  </div>

                  {/* Step 3: Donor Contact Info */}
                  <div className="space-y-4 pt-2 border-t border-border/60">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      3. Donor Contact &amp; Coordination Details
                    </h3>

                    {!isAnonymous && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <RUInput
                          name="donorName"
                          label="Donor Full Name"
                          placeholder="Your Full Name"
                        />

                        <RUInput
                          name="donorEmail"
                          label="Email Address"
                          type="email"
                          placeholder="name@example.com"
                        />
                      </div>
                    )}

                    <RUInput
                      name="contactPhone"
                      label="Contact Phone Number (Required for handover coordination)"
                      placeholder="+880 1700-000000"
                      required
                    />

                    <RUInput
                      name="donorNote"
                      label={
                        currentMethod === "COURIER"
                          ? "Courier Service & Tracking Consignment Details (Mandatory for Courier)"
                          : "Additional Notes / Special Instructions"
                      }
                      placeholder={
                        currentMethod === "COURIER"
                          ? "e.g. Sent via Sundarban Courier, CN No: 12345678, From Dhaka"
                          : "Any special remarks or instructions for library staff..."
                      }
                      required={currentMethod === "COURIER"}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isPending}
                    className="mt-6 w-full flex items-center justify-center space-x-2 rounded-xl bg-[#004F32] hover:bg-emerald-900 py-3.5 px-4 text-sm font-bold text-white shadow-md focus:ring-2 focus:ring-emerald-400 disabled:opacity-50 transition-all cursor-pointer"
                  >
                    <HeartHandshake className="h-5 w-5 text-amber-300" />
                    <span>{isPending ? "Submitting Donation..." : "Submit Book Donation"}</span>
                  </button>
                </div>
              );
            }}
          </RUForm>
        </div>

        {/* Sidebar Info Cards */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-2xs space-y-4">
            <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
              <ShieldCheck className="h-4.5 w-4.5 text-[#C78700]" />
              <span>Donation Lifecycle &amp; Rules</span>
            </h3>
            <ul className="space-y-3.5 text-xs text-muted-foreground">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-foreground">Automatic Cataloging:</strong> Once received and verified by our staff, the book is automatically added to the digital catalog as a borrowable item.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-foreground">Continuous Sadaqah:</strong> Earn ongoing reward as students, faculty, and scholars borrow and read your contributed literature.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-foreground">Multiple Handover Options:</strong> Drop off at Central Library desk, request free campus pickup, or courier from anywhere in Bangladesh.
                </span>
              </li>
            </ul>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-foreground">
              <Building2 className="h-4 w-4 text-primary" />
              <span>Central Collection Desk</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              2nd Floor, Counter 3, Central Library Bhaban, Rajshahi University Campus.
            </p>
            <div className="pt-2 border-t border-border/60">
              <Link
                href="/guest/dashboard"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:text-[#C78700] transition-colors"
              >
                <span>Track your previous donations</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


"use client";

import React, { useState } from "react";
import { z } from "zod";
import {
  HeartHandshake,
  X,
  Building2,
  Truck,
  Package,
  CheckCircle2,
  Info,
  MapPin,
  PhoneCall,
  Gift,
} from "lucide-react";
import { RUForm, RUInput, RUSelect } from "@/components/forms";
import { useCreateDonation } from "@/hooks/useDonations";
import { useGetMe } from "@/hooks/useAuth";
import { DonationMethod, IDonationPayload } from "@/types/donation";

const donationSchema = z
  .object({
    bookTitle: z.string().min(2, "Book title is required"),
    author: z.string().optional(),
    category: z.string().optional(),
    quantity: z.coerce.number().int().min(1, "Quantity must be at least 1"),
    condition: z.enum(["NEW", "LIKE_NEW", "GOOD", "ACCEPTABLE"]),
    method: z.enum(["LIBRARY_DROP_OFF", "PICKUP", "COURIER"]),
    donorName: z.string().optional(),
    donorEmail: z.string().email("Invalid email").optional().or(z.literal("")),
    contactPhone: z.string().min(6, "Contact phone is required"),
    pickupAddress: z.string().optional(),
    scheduledAt: z.string().optional(),
    donorNote: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.method === "PICKUP") {
      if (!data.pickupAddress || data.pickupAddress.trim().length < 5) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["pickupAddress"], message: "Pickup address is required" });
      }
      if (!data.scheduledAt || data.scheduledAt.trim().length === 0) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["scheduledAt"], message: "Scheduled date & time is required" });
      }
    }
    if (data.method === "COURIER") {
      if (!data.donorNote || data.donorNote.trim().length < 5) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["donorNote"], message: "Courier tracking details are required" });
      }
    }
  });

type DonationFormValues = z.infer<typeof donationSchema>;

interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DonationModal({ isOpen, onClose }: DonationModalProps) {
  const { data: user } = useGetMe();
  const { mutate: createDonation, isPending } = useCreateDonation();
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<DonationMethod>("LIBRARY_DROP_OFF");

  if (!isOpen) return null;

  const defaultValues: DonationFormValues = {
    bookTitle: "",
    author: "",
    category: "General",
    quantity: 1,
    condition: "GOOD",
    method: "LIBRARY_DROP_OFF",
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
      condition: data.condition,
      method: data.method,
      isAnonymous,
      donorName: isAnonymous ? "Anonymous Donor" : (data.donorName || user?.name || "Anonymous"),
      donorEmail: !isAnonymous && data.donorEmail ? data.donorEmail : (user?.email || undefined),
      contactPhone: data.contactPhone,
      pickupAddress: data.method === "PICKUP" ? data.pickupAddress : undefined,
      scheduledAt: data.method === "PICKUP" && data.scheduledAt ? data.scheduledAt : undefined,
      donorNote: data.donorNote || undefined,
    };

    createDonation(payload, {
      onSuccess: () => {
        onClose();
        setIsAnonymous(false);
        setSelectedMethod("LIBRARY_DROP_OFF");
      },
    });
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in-50"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="relative w-full max-w-2xl max-h-[92vh] flex flex-col rounded-3xl border border-border bg-card shadow-2xl text-card-foreground overflow-hidden animate-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-gradient-to-r from-[#003824] to-[#004F32] shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-400/20">
              <Gift className="h-5 w-5 text-amber-300" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Donate a Book to RUIL</h3>
              <p className="text-xs text-emerald-200/80">Sadaqah Jariyah — earn continuous reward</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Form */}
        <div className="overflow-y-auto px-6 py-5 flex-1">
          <RUForm<DonationFormValues>
            schema={donationSchema}
            defaultValues={defaultValues}
            onSubmit={handleSubmit}
          >
            {({ setValue, watch }) => {
              const currentMethod = (watch ? watch("method") : selectedMethod) as DonationMethod;
              return (
                <div className="space-y-5">
                  {/* Step 1: Method */}
                  <div>
                    <label className="text-xs font-bold text-foreground block mb-2">
                      1. How will you hand over the book? <span className="text-destructive">*</span>
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {[
                        { value: "LIBRARY_DROP_OFF", label: "Library Drop-Off", sub: "Visit the library desk directly.", icon: Building2 },
                        { value: "PICKUP", label: "Campus Pickup", sub: "Staff collects from your location.", icon: Truck },
                        { value: "COURIER", label: "Courier / Parcel", sub: "Send via Sundarban or SA Paribahan.", icon: Package },
                      ].map(({ value, label, sub, icon: Icon }) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => { setSelectedMethod(value as DonationMethod); setValue("method", value as "LIBRARY_DROP_OFF" | "PICKUP" | "COURIER"); }}
                          className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-1.5 ${
                            currentMethod === value
                              ? "border-[#004F32] bg-[#004F32]/10 ring-2 ring-[#004F32]/40"
                              : "border-border bg-card hover:bg-muted/40"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <Icon className={`h-5 w-5 ${currentMethod === value ? "text-[#004F32]" : "text-muted-foreground"}`} />
                            {currentMethod === value && <CheckCircle2 className="h-4 w-4 text-[#004F32]" />}
                          </div>
                          <p className="font-bold text-xs text-foreground">{label}</p>
                          <p className="text-[10px] text-muted-foreground leading-tight">{sub}</p>
                        </button>
                      ))}
                    </div>

                    {currentMethod === "LIBRARY_DROP_OFF" && (
                      <div className="mt-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 flex items-start gap-2 text-xs text-emerald-800 dark:text-emerald-300">
                        <Info className="h-4 w-4 shrink-0 mt-0.5 text-emerald-600" />
                        <span><strong>Drop-Off:</strong> Visit the library desk (Sat–Thu). Any on-duty shifter or admin will receive your book on the spot.</span>
                      </div>
                    )}
                    {currentMethod === "PICKUP" && (
                      <div className="mt-3 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 flex items-start gap-2 text-xs text-amber-800 dark:text-amber-300">
                        <Info className="h-4 w-4 shrink-0 mt-0.5 text-amber-600" />
                        <span><strong>Pickup:</strong> Provide your campus address and a convenient pickup time below.</span>
                      </div>
                    )}
                    {currentMethod === "COURIER" && (
                      <div className="mt-3 rounded-xl border border-blue-500/20 bg-blue-500/5 p-3 text-xs text-blue-800 dark:text-blue-300 space-y-1">
                        <div className="flex items-center gap-2 font-bold"><Package className="h-4 w-4 text-blue-600" /> Official Courier Address:</div>
                        <p className="font-mono text-[11px] bg-card p-2 rounded-lg border border-border/80 text-foreground">
                          RU Islamic Library, 2nd Floor, Central Cafeteria Complex, Rajshahi University, Rajshahi-6205. Phone: +880 1700-000000
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Pickup-specific */}
                  {currentMethod === "PICKUP" && (
                    <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 space-y-4 animate-in fade-in-50">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300 flex items-center gap-1.5">
                        <MapPin className="h-4 w-4" /> Pickup Details (Required)
                      </h3>
                      <RUInput name="pickupAddress" label="Pickup Address / Hall & Room" placeholder="e.g. Shaheed Habibur Rahman Hall, Room 312" required />
                      <RUInput name="scheduledAt" label="Scheduled Pickup Date & Time" type="datetime-local" required />
                    </div>
                  )}

                  {/* Step 2: Book Details */}
                  <div className="pt-2 border-t border-border/60 space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">2. Book Details</h3>
                    <RUInput name="bookTitle" label="Book Title" placeholder="e.g. Tafsir Ibn Kathir Vol 1" required />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <RUInput name="author" label="Author / Compiler" placeholder="e.g. Ibn Kathir" />
                      <RUInput
                        name="category"
                        label="Category / Genre"
                        placeholder="e.g. Tafsir, Fiqh, Seerah, General..."
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <RUInput name="quantity" label="Number of Copies" type="number" placeholder="1" required />
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

                  {/* Anonymous */}
                  <div className="rounded-lg border border-border/80 bg-muted/40 p-3">
                    <label className="flex items-center space-x-2 text-xs font-semibold text-foreground cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isAnonymous}
                        onChange={(e) => setIsAnonymous(e.target.checked)}
                        className="rounded border-input h-4 w-4"
                      />
                      <span>Donate Anonymously (hide my name from public listings)</span>
                    </label>
                  </div>

                  {/* Step 3: Contact */}
                  <div className="space-y-4 pt-2 border-t border-border/60">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">3. Contact & Coordination</h3>
                    {!isAnonymous && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <RUInput name="donorName" label="Donor Full Name" placeholder="Your Full Name" />
                        <RUInput name="donorEmail" label="Email Address" type="email" placeholder="name@example.com" />
                      </div>
                    )}
                    <RUInput
                      name="contactPhone"
                      label="Contact Phone (Required for coordination)"
                      placeholder="+880 1700-000000"
                      prependIcon={<PhoneCall className="h-4 w-4" />}
                      required
                    />
                    <RUInput
                      name="donorNote"
                      label={currentMethod === "COURIER" ? "Courier Tracking Details (Required for Courier)" : "Additional Notes / Special Instructions"}
                      placeholder={currentMethod === "COURIER" ? "e.g. Sent via Sundarban Courier, CN No: 12345678" : "Any remarks for library staff..."}
                      required={currentMethod === "COURIER"}
                    />
                  </div>

                  {/* Buttons */}
                  <div className="flex justify-end gap-3 pt-3 border-t border-border">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-5 py-2.5 text-xs font-semibold rounded-xl border border-input bg-background hover:bg-accent text-foreground cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isPending}
                      className="flex items-center gap-2 px-6 py-2.5 text-xs font-bold rounded-xl bg-[#004F32] hover:bg-emerald-900 text-white shadow-xs disabled:opacity-50 transition-all cursor-pointer"
                    >
                      <HeartHandshake className="h-4 w-4 text-amber-300" />
                      {isPending ? "Submitting..." : "Submit Book Donation"}
                    </button>
                  </div>
                </div>
              );
            }}
          </RUForm>
        </div>
      </div>
    </div>
  );
}

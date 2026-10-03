"use client";

import React from "react";
import { User, Phone, Mail, MapPin, Building, FileText } from "lucide-react";
import { RUInput } from "@/components/forms";

interface AddressFormProps {
  isGuest: boolean;
}

export function AddressForm({ isGuest }: AddressFormProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-bold text-foreground mb-1">
          {isGuest ? "Guest Contact & Delivery Address" : "Delivery Address & Special Notes"}
        </h3>
        <p className="text-xs text-muted-foreground">
          Enter your delivery address, contact info, and special instructions for the library desk.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {isGuest && (
          <>
            <RUInput
              name="guestName"
              label="Full Name"
              placeholder="e.g. Dr. Muhammad Abdullah"
              prependIcon={<User className="h-4 w-4" />}
              required
            />
            <RUInput
              name="guestPhone"
              label="Phone Number"
              placeholder="e.g. 01712345678"
              prependIcon={<Phone className="h-4 w-4" />}
              required
            />
            <div className="sm:col-span-2">
              <RUInput
                name="guestEmail"
                label="Email Address (Mandatory for Order Confirmation & Guest Portal)"
                type="email"
                placeholder="e.g. abdullah@example.com"
                prependIcon={<Mail className="h-4 w-4" />}
                description="Required to access your Dedicated Guest Dashboard, live delivery progress, and digital receipts."
                required
              />
            </div>
          </>
        )}

        <div className="sm:col-span-2">
          <RUInput
            name="shippingAddress"
            label="Delivery Address / Hall / Department"
            placeholder="e.g. Room 314, Shahid Ziaur Rahman Hall, Rajshahi University"
            prependIcon={<MapPin className="h-4 w-4" />}
            required
          />
        </div>

        <div className="sm:col-span-2">
          <RUInput
            name="notes"
            label="Special Delivery Notes (Optional)"
            placeholder="e.g. Call upon arrival at faculty entrance or handover to floor attendant"
            prependIcon={<FileText className="h-4 w-4" />}
          />
        </div>
      </div>

      {/* Campus Handover Selector / Preferences */}
      <div className="rounded-xl border border-border bg-card p-4 sm:p-5 space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <Building className="h-4 w-4 text-primary" />
          Campus Handover & Collection Point
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <label className="flex items-start gap-3 p-3.5 rounded-xl border border-primary bg-primary/5 cursor-pointer">
            <input
              type="radio"
              name="handoverLocation"
              defaultChecked
              className="mt-0.5 text-primary accent-primary"
            />
            <div>
              <p className="font-bold text-foreground">RU Central Islamic Library Counter</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Main Campus, 2nd Floor — Desk 3
              </p>
              <span className="inline-block mt-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded">
                Ready in 2-4 Hours
              </span>
            </div>
          </label>

          <label className="flex items-start gap-3 p-3.5 rounded-xl border border-border hover:border-primary/50 bg-background cursor-pointer transition-colors">
            <input
              type="radio"
              name="handoverLocation"
              className="mt-0.5 text-primary accent-primary"
            />
            <div>
              <p className="font-bold text-foreground">Campus Dormitory / Department Delivery</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Dispatched directly to the address specified above
              </p>
              <span className="inline-block mt-1 text-[10px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/60 px-2 py-0.5 rounded">
                Next-Day Delivery
              </span>
            </div>
          </label>
        </div>
      </div>
    </div>
  );
}

export default AddressForm;

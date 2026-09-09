"use client";

import React, { useState } from "react";
import {
  Square,
  DollarSign,
  X,
  AlertCircle,
  CheckCircle2,
  ListChecks,
  ArrowRightLeft,
  AlertTriangle,
} from "lucide-react";
import { RUForm, RUInput } from "@/components/forms";
import { useEndShift } from "@/hooks/useShifts";
import { endShiftSchema, EndShiftFormValues } from "@/schemas/shift.schema";
import { IShift } from "@/types/shift";

export function EndShiftModal({
  isOpen,
  onClose,
  activeShift,
}: {
  isOpen: boolean;
  onClose: () => void;
  activeShift: IShift | null;
}) {
  const { mutate: endShift, isPending } = useEndShift();
  const openingCash = activeShift?.openingCash ?? activeShift?.startingCash ?? 0;
  const collectedCash = activeShift?.cashCollected ?? activeShift?.totalCashCollected ?? 0;
  const expectedCash = openingCash + collectedCash;

  const [enteredClosingCash, setEnteredClosingCash] = useState<number>(expectedCash || 500);

  if (!isOpen) return null;

  const variance = enteredClosingCash - expectedCash;

  const handleSubmit = (values: EndShiftFormValues) => {
    endShift(
      {
        closingCash: values.closingCash,
        cashCollected: collectedCash,
        tasksCompleted: values.tasksCompleted,
        handoverNotes: values.handoverNotes,
      },
      {
        onSuccess: () => onClose(),
      }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in-50 overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-3xl border border-border bg-card p-6 shadow-2xl text-card-foreground my-8">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-muted-foreground hover:text-foreground cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center space-x-3 pb-4 border-b border-border mb-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
            <Square className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-foreground">End Duty Shift &amp; Reconcile</h3>
            <p className="text-xs text-muted-foreground">
              Close counter desk, record completed tasks, and handover remaining tasks.
            </p>
          </div>
        </div>

        {/* Shift Cash Calculation Summary */}
        <div className="mb-4 rounded-2xl border border-border/80 bg-muted/40 p-4 space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Opening Cash Float:</span>
            <span className="font-mono font-semibold text-foreground">৳{openingCash}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Desk Transactions Collected:</span>
            <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">+৳{collectedCash}</span>
          </div>
          <div className="flex justify-between pt-1 border-t border-border/60 font-bold">
            <span className="text-foreground">Expected Drawer Cash:</span>
            <span className="font-mono text-primary text-sm">৳{expectedCash}</span>
          </div>

          {/* Variance Status Indicator */}
          <div className="pt-2 flex items-center justify-between">
            <span className="font-semibold text-muted-foreground">Cash Variance:</span>
            {variance === 0 ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-950 px-2.5 py-0.5 font-semibold text-emerald-800 dark:text-emerald-300">
                <CheckCircle2 className="h-3.5 w-3.5" /> Perfectly Balanced (৳0)
              </span>
            ) : variance > 0 ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 dark:bg-amber-950 px-2.5 py-0.5 font-semibold text-amber-800 dark:text-amber-300">
                Surplus (+৳{variance})
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-red-100 dark:bg-red-950 px-2.5 py-0.5 font-semibold text-red-800 dark:text-red-300">
                <AlertCircle className="h-3.5 w-3.5" /> Shortage (-৳{Math.abs(variance)})
              </span>
            )}
          </div>
        </div>

        <RUForm<EndShiftFormValues>
          schema={endShiftSchema}
          defaultValues={{
            closingCash: expectedCash,
            tasksCompleted: "",
            handoverNotes: "",
          }}
          onSubmit={handleSubmit}
        >
          <div className="space-y-4">
            <RUInput
              name="closingCash"
              label="Closing Physical Cash Count in Drawer (৳) *"
              type="number"
              placeholder="Count total physical cash in drawer"
              prependIcon={<DollarSign className="h-4 w-4 text-primary" />}
              onChange={(e) => {
                const val = Number(e.target.value);
                setEnteredClosingCash(isNaN(val) ? 0 : val);
              }}
              required
            />

            <div className="space-y-1">
              <RUInput
                name="tasksCompleted"
                label="Completed Tasks during Duty Shift *"
                placeholder="e.g. Issued 4 books, returned 2 books, shelved 5 new donations, verified 1 cash membership"
                prependIcon={<ListChecks className="h-4 w-4 text-emerald-600" />}
                required
              />
              <p className="text-[10px] text-muted-foreground">
                Document all operations, checkouts, returns, or cataloging executed during this shift.
              </p>
            </div>

            <div className="space-y-1">
              <RUInput
                name="handoverNotes"
                label="Remaining Tasks & Handover Notes (If any)"
                placeholder="e.g. 2 books on shelf A3 need repair, student RU-482 arriving for pickup at 4 PM"
                prependIcon={<ArrowRightLeft className="h-4 w-4 text-amber-600" />}
              />
              <p className="text-[10px] text-muted-foreground">
                Mention any pending tasks, unresolved borrower requests, or handover instructions for the next shifter / admin.
              </p>
            </div>

            <div className="pt-2 flex justify-end space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold rounded-xl border border-input bg-background hover:bg-accent text-foreground cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold rounded-xl bg-[#C78700] hover:bg-amber-600 text-white shadow-xs disabled:opacity-50 cursor-pointer"
              >
                <Square className="h-3.5 w-3.5" />
                <span>{isPending ? "Ending Shift..." : "End Duty Shift & Reconcile"}</span>
              </button>
            </div>
          </div>
        </RUForm>
      </div>
    </div>
  );
}

export default EndShiftModal;

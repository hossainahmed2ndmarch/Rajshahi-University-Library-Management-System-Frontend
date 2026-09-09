"use client";

import React, { useState } from "react";
import { Play, DollarSign, X, Clock, ShieldCheck, FileText } from "lucide-react";
import { RUForm, RUInput } from "@/components/forms";
import { useStartShift } from "@/hooks/useShifts";
import { startShiftSchema, StartShiftFormValues } from "@/schemas/shift.schema";

export function StartShiftModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { mutate: startShift, isPending } = useStartShift();
  const [cashFloat, setCashFloat] = useState<number>(500);

  if (!isOpen) return null;

  const handleSubmit = (values: StartShiftFormValues) => {
    startShift(
      {
        openingCash: values.openingCash,
        notes: values.notes,
      },
      {
        onSuccess: () => onClose(),
      }
    );
  };

  const quickFloatOptions = [0, 200, 500, 1000, 2000];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in-50">
      <div className="relative w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl text-card-foreground space-y-4">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-muted-foreground hover:text-foreground cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center space-x-3 pb-4 border-b border-border">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
            <Play className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-foreground">Start Counter Duty Shift</h3>
            <p className="text-xs text-muted-foreground">
              Shift status will become <strong className="text-emerald-600 dark:text-emerald-400">ACTIVE</strong>.
            </p>
          </div>
        </div>

        {/* Status Notice Banner */}
        <div className="rounded-xl border border-emerald-300/40 bg-emerald-500/10 p-3 text-xs space-y-1 text-emerald-950 dark:text-emerald-200">
          <div className="flex items-center gap-1.5 font-bold">
            <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span>Shift Initialization Rules</span>
          </div>
          <p className="text-[11px] opacity-90 leading-relaxed">
            Opening cash float must be counted and recorded accurately before issuing books or collecting fees.
          </p>
        </div>

        <RUForm<StartShiftFormValues>
          schema={startShiftSchema}
          defaultValues={{ openingCash: cashFloat, notes: "" }}
          onSubmit={handleSubmit}
        >
          <div className="space-y-4">
            <div className="space-y-2">
              <RUInput
                name="openingCash"
                label="Opening Cash Float in Drawer (৳) *"
                type="number"
                placeholder="e.g. 500"
                prependIcon={<DollarSign className="h-4 w-4 text-emerald-600" />}
                required
              />

              {/* Quick preset buttons */}
              <div className="flex items-center gap-1.5 pt-0.5 flex-wrap">
                <span className="text-[10px] text-muted-foreground font-medium">Presets:</span>
                {quickFloatOptions.map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setCashFloat(amt)}
                    className="px-2 py-0.5 rounded-md border border-input bg-muted/40 hover:bg-muted text-[10px] font-mono font-bold text-foreground transition-colors cursor-pointer"
                  >
                    ৳{amt}
                  </button>
                ))}
              </div>
            </div>

            <RUInput
              name="notes"
              label="Opening Handover / Attendance Notes (Optional)"
              placeholder="e.g. Handover received from morning shifter, float counted"
              prependIcon={<FileText className="h-4 w-4" />}
            />

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
                className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold rounded-xl bg-[#004F32] hover:bg-emerald-900 text-white shadow-xs disabled:opacity-50 cursor-pointer"
              >
                <Play className="h-3.5 w-3.5 text-amber-300" />
                <span>{isPending ? "Starting Duty..." : "Confirm & Start Shift (ACTIVE)"}</span>
              </button>
            </div>
          </div>
        </RUForm>
      </div>
    </div>
  );
}

export default StartShiftModal;

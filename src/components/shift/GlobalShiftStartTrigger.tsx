"use client";

import React from "react";
import { useShiftStartTrigger } from "@/hooks/useShiftStartTrigger";
import { ShiftStartModal } from "./ShiftStartModal";

export function GlobalShiftStartTrigger() {
  const { modalOpen, triggerSchedule, linkedShiftId, setModalOpen } = useShiftStartTrigger();

  if (!triggerSchedule) return null;

  return (
    <ShiftStartModal
      open={modalOpen}
      onOpenChange={setModalOpen}
      schedule={triggerSchedule}
      linkedShiftId={linkedShiftId}
    />
  );
}

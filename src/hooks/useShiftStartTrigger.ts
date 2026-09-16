"use client";

import { useEffect, useState } from "react";
import { useMySchedule, useGetAllShiftLogs, useActiveShift } from "./useShifts";
import { IShifterSchedule } from "@/types/shift";

const MODAL_SHOWN_KEY = "ruil_shift_modal_shown";

export const useShiftStartTrigger = () => {
  const { data: schedules = [] } = useMySchedule();
  const { data: shiftLogs = [] } = useGetAllShiftLogs({ limit: 30 });
  const { data: activeShift } = useActiveShift();

  const [triggerSchedule, setTriggerSchedule] = useState<IShifterSchedule | null>(null);
  const [linkedShiftId, setLinkedShiftId] = useState<number | string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (!schedules || schedules.length === 0) return;

    // If user already has an active duty shift session right now, do not trigger start modal
    if (activeShift && activeShift.status === "ACTIVE") {
      setModalOpen(false);
      return;
    }

    const check = () => {
      const now = new Date();
      const todayDayOfWeek = now.getDay(); // 0=Sun ... 6=Sat
      const todayDateStr = now.toDateString();

      const todaySchedules = schedules.filter(
        (s) => s.isActive && s.dayOfWeek === todayDayOfWeek
      );

      for (const schedule of todaySchedules) {
        if (!schedule.startTime) continue;
        const [hours, minutes] = schedule.startTime.split(":").map(Number);
        const shiftStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, 0, 0);

        let shiftEnd = new Date(shiftStart.getTime() + 2.5 * 60 * 60 * 1000); // default 2.5 hours
        if (schedule.endTime) {
          const [endHours, endMinutes] = schedule.endTime.split(":").map(Number);
          shiftEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), endHours, endMinutes, 0, 0);
        }

        // Check if there is already a shift log for today for this schedule
        const matchingLogToday = shiftLogs.find((l) => {
          const logDate = l.startTime ? new Date(l.startTime).toDateString() : "";
          if (logDate !== todayDateStr) return false;
          const matchesShifter =
            l.shifterId === schedule.shifterId ||
            l.shifter?.id === schedule.shifterId;
          const matchesSlot =
            !l.shiftSlotName ||
            !schedule.slotName ||
            l.shiftSlotName.includes(schedule.slotName) ||
            schedule.slotName.includes(l.shiftSlotName);
          return matchesShifter && matchesSlot;
        });

        // If today's shift log is already COMPLETED, CANCELLED, or ACTIVE, skip
        if (
          matchingLogToday &&
          (matchingLogToday.status === "COMPLETED" ||
            matchingLogToday.status === "CANCELLED" ||
            matchingLogToday.status === "ACTIVE")
        ) {
          continue;
        }

        // Window: From 10 minutes before start time until shift end time
        const windowStart = new Date(shiftStart.getTime() - 10 * 60 * 1000);
        const isWithinShiftWindow = now >= windowStart && now <= shiftEnd;

        if (isWithinShiftWindow) {
          const shownKey = `${MODAL_SHOWN_KEY}_${schedule.id}_${todayDateStr}`;
          const alreadyDismissed = sessionStorage.getItem(shownKey);
          if (!alreadyDismissed) {
            setTriggerSchedule(schedule);
            setLinkedShiftId(matchingLogToday?.id ?? null);
            setModalOpen(true);
            break;
          }
        }
      }
    };

    check();
    const interval = setInterval(check, 15 * 1000); // Poll check every 15s
    return () => clearInterval(interval);
  }, [schedules, shiftLogs, activeShift]);

  const handleDismiss = (open: boolean) => {
    setModalOpen(open);
    if (!open && triggerSchedule) {
      const now = new Date();
      const shownKey = `${MODAL_SHOWN_KEY}_${triggerSchedule.id}_${now.toDateString()}`;
      sessionStorage.setItem(shownKey, "1");
    }
  };

  return {
    modalOpen,
    triggerSchedule,
    linkedShiftId,
    setModalOpen: handleDismiss,
  };
};

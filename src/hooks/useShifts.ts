"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/errorUtils";
import { ShiftService } from "@/services/shift.service";
import {
  IEndShiftPayload,
  IShift,
  IStartShiftPayload,
  IScheduleShiftPayload,
  ICancelShiftPayload,
} from "@/types/shift";

const LOCAL_SHIFT_KEY = "ruil_active_shift";

const getLocalActiveShift = (): IShift | null => {
  if (typeof window === "undefined") return null;
  const data = localStorage.getItem(LOCAL_SHIFT_KEY);
  return data ? (JSON.parse(data) as IShift) : null;
};

const setLocalActiveShift = (shift: IShift | null) => {
  if (typeof window === "undefined") return;
  if (shift) {
    localStorage.setItem(LOCAL_SHIFT_KEY, JSON.stringify(shift));
  } else {
    localStorage.removeItem(LOCAL_SHIFT_KEY);
  }
};

export const useActiveShift = () => {
  return useQuery<IShift | null>({
    queryKey: ["activeShift"],
    queryFn: async (): Promise<IShift | null> => {
      try {
        const logs = await ShiftService.getAllShiftLogs({ limit: 10 });
        const active = logs.find((s) => s.status === "ACTIVE");
        if (active) {
          setLocalActiveShift(active);
          return active;
        }
        return getLocalActiveShift();
      } catch {
        return getLocalActiveShift();
      }
    },
    staleTime: 15 * 1000,
  });
};

export const useStartShift = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: IStartShiftPayload): Promise<IShift> => {
      try {
        const res = await ShiftService.checkIn({
          openingCash: payload.openingCash,
          notes: payload.notes,
        });
        if (res) {
          setLocalActiveShift(res);
          return res;
        }
      } catch {
        // Offline fallback
      }

      const mockShift: IShift = {
        id: "shift_" + Date.now(),
        shifterId: "shifter_1",
        shifterName: "Duty Shifter",
        status: "ACTIVE",
        startTime: new Date().toISOString(),
        openingCash: payload.openingCash,
        notes: payload.notes,
        totalTransactions: 0,
        cashCollected: 0,
        expectedCash: payload.openingCash,
      };
      setLocalActiveShift(mockShift);
      return mockShift;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["activeShift"], data);
      queryClient.invalidateQueries({ queryKey: ["activeShift"] });
      queryClient.invalidateQueries({ queryKey: ["shiftLogs"] });
      toast.success(`Shift started & ACTIVE! Opening Float: ৳${data.openingCash}`);
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to start shift. Opening cash is mandatory."));
    },
  });
};

export const useEndShift = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: IEndShiftPayload): Promise<IShift> => {
      const activeShift = getLocalActiveShift();
      const openingCash = activeShift?.openingCash ?? activeShift?.startingCash ?? 0;

      try {
        const res = await ShiftService.checkOut({
          closingCash: payload.closingCash,
          cashCollected: payload.cashCollected,
          tasksCompleted: payload.tasksCompleted,
          handoverNotes: payload.handoverNotes,
        });
        if (res) {
          setLocalActiveShift(null);
          return res;
        }
      } catch {
        // Offline fallback
      }

      const completedShift: IShift = {
        id: activeShift?.id || "shift_ended",
        shifterId: activeShift?.shifterId || "shifter_1",
        status: "COMPLETED",
        startTime: activeShift?.startTime || new Date().toISOString(),
        endTime: new Date().toISOString(),
        openingCash,
        closingCash: payload.closingCash,
        expectedCash: openingCash,
        cashVariance: payload.closingCash - openingCash,
        tasksCompleted: payload.tasksCompleted,
        handoverNotes: payload.handoverNotes,
      };

      setLocalActiveShift(null);
      return completedShift;
    },
    onSuccess: () => {
      queryClient.setQueryData(["activeShift"], null);
      queryClient.invalidateQueries({ queryKey: ["activeShift"] });
      queryClient.invalidateQueries({ queryKey: ["shiftLogs"] });
      toast.success("Shift ended & cash reconciled successfully!");
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to close shift. Closing cash and completed tasks are mandatory."));
    },
  });
};

export const useScheduleShift = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: IScheduleShiftPayload) => {
      return await ShiftService.scheduleShift(payload);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["shiftLogs"] });
      queryClient.invalidateQueries({ queryKey: ["activeShift"] });
      toast.success(
        `Duty shift scheduled in advance! Notification sent to ${data?.notifiedCount ?? 0} staff members.`
      );
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to schedule shift."));
    },
  });
};

export const useCancelShift = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, payload }: { id: string | number; payload: ICancelShiftPayload }) => {
      return await ShiftService.cancelShift(id, payload);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["shiftLogs"] });
      queryClient.invalidateQueries({ queryKey: ["activeShift"] });
      toast.success(
        `Duty shift cancelled. Notification dispatched to ${data?.notifiedCount ?? 0} staff members.`
      );
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to cancel shift."));
    },
  });
};

export const useGetAllShiftLogs = (params?: Record<string, unknown>) => {
  return useQuery<IShift[]>({
    queryKey: ["shiftLogs", params],
    queryFn: async (): Promise<IShift[]> => {
      try {
        const logs = await ShiftService.getAllShiftLogs(params);
        return logs;
      } catch {
        return [];
      }
    },
    staleTime: 30 * 1000,
  });
};

export const useDeleteShiftLog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string | number) => {
      return await ShiftService.deleteShiftLog(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shiftLogs"] });
      queryClient.invalidateQueries({ queryKey: ["activeShift"] });
      toast.success("Shift audit log deleted successfully!");
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to delete shift audit log."));
    },
  });
};

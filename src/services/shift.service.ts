import { axiosInstance } from "@/lib/axios";
import { ApiResponse } from "@/types/api.types";
import {
  IShift,
  IStartShiftPayload,
  IEndShiftPayload,
  IScheduleShiftPayload,
  ICancelShiftPayload,
  IShifterSchedule,
  IRescheduleShiftPayload,
  ICompleteOfflinePayload,
  ICreateSchedulePayload,
} from "@/types/shift";

export const ShiftService = {
  startShift: async (payload: IStartShiftPayload): Promise<IShift> => {
    return ShiftService.checkIn(payload);
  },

  checkIn: async (payload: IStartShiftPayload): Promise<IShift> => {
    const response = await axiosInstance.post<ApiResponse<IShift>>("/shift-logs/check-in", payload);
    return response.data?.data;
  },

  endShift: async (payload: IEndShiftPayload): Promise<IShift> => {
    return ShiftService.checkOut(payload);
  },

  checkOut: async (payload: IEndShiftPayload): Promise<IShift> => {
    const response = await axiosInstance.post<ApiResponse<IShift>>("/shift-logs/check-out", payload);
    return response.data?.data;
  },

  scheduleShift: async (payload: IScheduleShiftPayload): Promise<{ shift: IShift; notifiedCount: number }> => {
    const response = await axiosInstance.post<ApiResponse<{ shift: IShift; notifiedCount: number }>>(
      "/shift-logs/schedule",
      payload
    );
    return response.data?.data;
  },

  cancelShift: async (
    id: string | number,
    payload: ICancelShiftPayload
  ): Promise<{ shift: IShift; notifiedCount: number }> => {
    const response = await axiosInstance.patch<ApiResponse<{ shift: IShift; notifiedCount: number }>>(
      `/shift-logs/cancel/${id}`,
      payload
    );
    return response.data?.data;
  },

  getActiveShift: async (): Promise<IShift | null> => {
    const response = await axiosInstance.get<ApiResponse<IShift | null>>("/shift-logs/active");
    return response.data?.data || null;
  },

  getShiftLogs: async (params?: Record<string, unknown>): Promise<IShift[]> => {
    return ShiftService.getAllShiftLogs(params);
  },

  getAllShiftLogs: async (params?: Record<string, unknown>): Promise<IShift[]> => {
    const response = await axiosInstance.get<ApiResponse<IShift[]>>("/shift-logs", {
      params: { limit: 10000, ...params },
    });
    const raw = response.data?.data;
    return Array.isArray(raw) ? raw : (raw as unknown as { result: IShift[] })?.result || [];
  },

  deleteShiftLog: async (id: string | number): Promise<IShift> => {
    const response = await axiosInstance.delete<ApiResponse<IShift>>(`/shift-logs/${id}`);
    return response.data?.data;
  },

  getPublicActiveShift: async (): Promise<IShift | null> => {
    const response = await axiosInstance.get<ApiResponse<IShift | null>>("/shift-logs/active");
    return response.data?.data || null;
  },

  getWeeklyRoster: async (): Promise<IShifterSchedule[]> => {
    const response = await axiosInstance.get<ApiResponse<IShifterSchedule[]>>("/shifter-schedules");
    const raw = response.data?.data;
    return Array.isArray(raw) ? raw : [];
  },

  getTodayRoster: async (): Promise<IShifterSchedule[]> => {
    const response = await axiosInstance.get<ApiResponse<IShifterSchedule[]>>("/shifter-schedules/today");
    const raw = response.data?.data;
    return Array.isArray(raw) ? raw : [];
  },

  getMySchedule: async (): Promise<IShifterSchedule[]> => {
    const response = await axiosInstance.get<ApiResponse<IShifterSchedule[]>>("/shifter-schedules/my-schedule");
    const raw = response.data?.data;
    return Array.isArray(raw) ? raw : [];
  },

  createSchedule: async (payload: ICreateSchedulePayload): Promise<IShifterSchedule> => {
    const response = await axiosInstance.post<ApiResponse<IShifterSchedule>>("/shifter-schedules", payload);
    return response.data?.data;
  },

  updateSchedule: async (id: number, payload: Partial<ICreateSchedulePayload>): Promise<IShifterSchedule> => {
    const response = await axiosInstance.patch<ApiResponse<IShifterSchedule>>(`/shifter-schedules/${id}`, payload);
    return response.data?.data;
  },

  deleteSchedule: async (id: number): Promise<IShifterSchedule> => {
    const response = await axiosInstance.delete<ApiResponse<IShifterSchedule>>(`/shifter-schedules/${id}`);
    return response.data?.data;
  },

  rescheduleShift: async (
    id: number | string,
    payload: IRescheduleShiftPayload
  ): Promise<{ shift: IShift; notifiedCount: number }> => {
    const response = await axiosInstance.patch<ApiResponse<{ shift: IShift; notifiedCount: number }>>(
      `/shift-logs/reschedule/${id}`,
      payload
    );
    return response.data?.data;
  },

  completeOfflineShift: async (
    id: number | string,
    payload: ICompleteOfflinePayload
  ): Promise<IShift> => {
    const response = await axiosInstance.patch<ApiResponse<IShift>>(
      `/shift-logs/complete-offline/${id}`,
      payload
    );
    return response.data?.data;
  },

  emailActionShift: async (
    payload: { token: string; action: 'START' | 'CANCEL'; cancelReason?: string; openingCash?: number }
  ): Promise<IShift> => {
    const response = await axiosInstance.post<ApiResponse<IShift>>(
      '/shift-logs/email-action',
      payload
    );
    return response.data?.data;
  },

  verifyShiftLog: async (id: number | string): Promise<IShift> => {
    const response = await axiosInstance.patch<ApiResponse<IShift>>(
      `/shift-logs/verify/${id}`
    );
    return response.data?.data;
  },
};

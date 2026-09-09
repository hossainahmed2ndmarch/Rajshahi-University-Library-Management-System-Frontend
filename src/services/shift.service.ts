import { axiosInstance } from "@/lib/axios";
import { ApiResponse } from "@/types/api.types";
import {
  IShift,
  IStartShiftPayload,
  IEndShiftPayload,
  IScheduleShiftPayload,
  ICancelShiftPayload,
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
    const response = await axiosInstance.get<ApiResponse<IShift[]>>("/shift-logs", { params });
    const raw = response.data?.data;
    return Array.isArray(raw) ? raw : (raw as unknown as { result: IShift[] })?.result || [];
  },

  deleteShiftLog: async (id: string | number): Promise<IShift> => {
    const response = await axiosInstance.delete<ApiResponse<IShift>>(`/shift-logs/${id}`);
    return response.data?.data;
  },
};

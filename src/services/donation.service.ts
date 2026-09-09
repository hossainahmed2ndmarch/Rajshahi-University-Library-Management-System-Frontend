import { axiosInstance } from "@/lib/axios";
import { ApiResponse } from "@/types/api.types";
import { IDonation, IDonationPayload } from "@/types/donation";

type RawDonation = Record<string, unknown>;

const normalizeDonation = (raw: RawDonation): IDonation => raw as unknown as IDonation;

export const DonationService = {
  createDonation: async (payload: IDonationPayload): Promise<IDonation> => {
    const response = await axiosInstance.post<ApiResponse<RawDonation>>("/donations", payload);
    return normalizeDonation(response.data?.data);
  },

  createPOSDonation: async (
    payload: import("@/types/donation").ICreatePOSDonationPayload
  ): Promise<IDonation> => {
    const response = await axiosInstance.post<ApiResponse<RawDonation>>("/donations/pos", payload);
    return normalizeDonation(response.data?.data);
  },

  getDonations: async (params?: Record<string, string | number>): Promise<IDonation[]> => {
    return DonationService.getAllDonations(params);
  },

  getAllDonations: async (params?: Record<string, string | number>): Promise<IDonation[]> => {
    const response = await axiosInstance.get<ApiResponse<unknown>>("/donations", { params });
    const raw = response.data?.data;
    const list = Array.isArray(raw)
      ? (raw as RawDonation[])
      : Array.isArray((raw as Record<string, unknown>)?.result)
      ? ((raw as Record<string, RawDonation[]>).result)
      : [];
    return list.map(normalizeDonation);
  },

  approveDonation: async (
    id: string | number,
    payload?: Partial<{
      locationCell: string;
      assignedCategory: string;
      pages: number;
      isbn: string;
      borrowStock: number;
      sellStock: number;
    }>
  ): Promise<IDonation> => {
    const response = await axiosInstance.patch<ApiResponse<RawDonation>>(
      `/donations/${id}/approve`,
      payload || {}
    );
    return normalizeDonation(response.data?.data);
  },

  rejectDonation: async (id: string | number, rejectionReason?: string): Promise<IDonation> => {
    const response = await axiosInstance.patch<ApiResponse<RawDonation>>(
      `/donations/${id}/reject`,
      { rejectionReason }
    );
    return normalizeDonation(response.data?.data);
  },

  convertDonationToStock: async (
    id: string | number,
    payload: {
      locationCell: string;
      borrowStock: number;
      sellStock: number;
      sellPrice?: number;
    }
  ): Promise<ApiResponse<RawDonation>> => {
    const response = await axiosInstance.post<ApiResponse<RawDonation>>(
      `/donations/${id}/convert`,
      payload
    );
    return response.data;
  },

  deleteDonation: async (id: string | number): Promise<boolean> => {
    await axiosInstance.delete(`/donations/${id}`);
    return true;
  },
};


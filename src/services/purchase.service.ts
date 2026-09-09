import { axiosInstance } from "@/lib/axios";
import { ApiResponse } from "@/types/api.types";
import {
  ICreateGuestPurchasePayload,
  ICreateMemberPurchasePayload,
  IGuestCancelOrderPayload,
  IGuestOrdersLookupPayload,
  IPurchase,
} from "@/types/purchase";

export const PurchaseService = {
  createPurchase: async (
    payload: ICreateMemberPurchasePayload
  ): Promise<IPurchase> => {
    return PurchaseService.createMemberPurchase(payload);
  },

  createMemberPurchase: async (
    payload: ICreateMemberPurchasePayload
  ): Promise<IPurchase> => {
    const response = await axiosInstance.post<ApiResponse<IPurchase>>("/purchases", payload);
    return response.data?.data;
  },

  createGuestPurchase: async (
    payload: ICreateGuestPurchasePayload
  ): Promise<IPurchase> => {
    const response = await axiosInstance.post<ApiResponse<IPurchase>>("/purchases/guest", payload);
    return response.data?.data;
  },

  createPOSSale: async (
    payload: import("@/types/purchase").ICreatePOSSalePayload
  ): Promise<IPurchase> => {
    const response = await axiosInstance.post<ApiResponse<IPurchase>>("/purchases/pos", payload);
    return response.data?.data;
  },

  getMyPurchases: async (): Promise<IPurchase[]> => {
    const response = await axiosInstance.get<ApiResponse<IPurchase[]>>("/purchases/my-purchases");
    const raw = response.data?.data;
    return Array.isArray(raw) ? raw : (raw as unknown as { result: IPurchase[] })?.result || [];
  },

  getAllPurchases: async (params?: Record<string, unknown>): Promise<IPurchase[]> => {
    const response = await axiosInstance.get<ApiResponse<IPurchase[]>>("/purchases", { params });
    const raw = response.data?.data;
    return Array.isArray(raw) ? raw : (raw as unknown as { result: IPurchase[] })?.result || [];
  },

  getGuestOrders: async (payload: IGuestOrdersLookupPayload): Promise<IPurchase[]> => {
    const response = await axiosInstance.post<ApiResponse<IPurchase[]>>("/purchases/guest/orders", payload);
    const raw = response.data?.data;
    return Array.isArray(raw) ? raw : (raw as unknown as { result: IPurchase[] })?.result || [];
  },

  trackGuestOrder: async (transactionId: string, email?: string): Promise<IPurchase> => {
    const response = await axiosInstance.get<ApiResponse<IPurchase>>(
      `/purchases/guest/track/${encodeURIComponent(transactionId)}`,
      {
        params: email ? { email } : undefined,
      }
    );
    return response.data?.data;
  },

  cancelGuestOrder: async (payload: IGuestCancelOrderPayload): Promise<IPurchase> => {
    const response = await axiosInstance.post<ApiResponse<IPurchase>>("/purchases/guest/cancel", payload);
    return response.data?.data;
  },

  cancelMemberOrder: async (purchaseId: number | string, reason?: string): Promise<IPurchase> => {
    const response = await axiosInstance.patch<ApiResponse<IPurchase>>(
      `/purchases/${purchaseId}/cancel`,
      { reason }
    );
    return response.data?.data;
  },

  updatePurchaseStatus: async (
    purchaseId: number | string,
    payload: { orderStatus?: string; paymentStatus?: string }
  ): Promise<IPurchase> => {
    const response = await axiosInstance.patch<ApiResponse<IPurchase>>(
      `/purchases/${purchaseId}/status`,
      payload
    );
    return response.data?.data;
  },

  deletePurchase: async (purchaseId: number | string): Promise<boolean> => {
    await axiosInstance.delete(`/purchases/${purchaseId}`);
    return true;
  },
};



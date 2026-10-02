import { axiosInstance } from '@/lib/axios';
import { ApiResponse } from '@/types/api.types';
import { IRudcIyanot } from '@/types/rudc';

export const RudcIyanotService = {
  getRudcIyanotRecords: async (params?: Record<string, any>) => {
    const response = await axiosInstance.get<ApiResponse<IRudcIyanot[]>>('/rudc/iyanot', {
      params,
    });
    return {
      data: response.data?.data || [],
      meta: response.data?.meta,
    };
  },

  recordIyanotPayment: async (payload: {
    userId: number;
    month: number;
    year: number;
    amount?: number;
    paymentMethod: string;
    transactionId?: string;
    remarks?: string;
  }) => {
    const response = await axiosInstance.post<ApiResponse<IRudcIyanot>>(
      '/rudc/iyanot/record',
      payload
    );
    return response.data?.data;
  },
};

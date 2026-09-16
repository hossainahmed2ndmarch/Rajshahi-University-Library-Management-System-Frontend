import { axiosInstance } from "@/lib/axios";
import { ApiResponse } from "@/types/api.types";
import { IBorrow, ICreateBorrowPayload } from "@/types/borrow";

export const BorrowService = {
  requestBorrow: async (payload: ICreateBorrowPayload): Promise<IBorrow> => {
    return BorrowService.createBorrow(payload);
  },

  createBorrow: async (payload: ICreateBorrowPayload): Promise<IBorrow> => {
    const response = await axiosInstance.post<ApiResponse<IBorrow>>("/borrows", {
      bookId: Number(payload.bookId),
      dueDate: payload.dueDate,
    });
    return response.data?.data;
  },

  issueBook: async (payload: import("@/types/borrow").IIssueBorrowPayload): Promise<IBorrow> => {
    const response = await axiosInstance.post<ApiResponse<IBorrow>>("/borrows/issue", payload);
    return response.data?.data;
  },

  getMyBorrows: async (): Promise<IBorrow[]> => {
    const response = await axiosInstance.get<ApiResponse<IBorrow[]>>("/borrows/my-borrows");
    const raw = response.data?.data;
    return Array.isArray(raw) ? raw : (raw as unknown as { result: IBorrow[] })?.result || [];
  },

  getAllBorrows: async (params?: Record<string, unknown>): Promise<IBorrow[]> => {
    const response = await axiosInstance.get<ApiResponse<IBorrow[]>>("/borrows", {
      params: { limit: 10000, ...params },
    });
    const raw = response.data?.data;
    return Array.isArray(raw) ? raw : (raw as unknown as { result: IBorrow[] })?.result || [];
  },

  approveBorrow: async (borrowId: string | number): Promise<ApiResponse<IBorrow>> => {
    const response = await axiosInstance.patch<ApiResponse<IBorrow>>(
      `/borrows/approve/${borrowId}`
    );
    return response.data;
  },

  rejectBorrow: async (borrowId: string | number): Promise<ApiResponse<IBorrow>> => {
    const response = await axiosInstance.patch<ApiResponse<IBorrow>>(
      `/borrows/reject/${borrowId}`
    );
    return response.data;
  },

  returnBook: async (borrowId: string | number, fineAmount?: number): Promise<ApiResponse<IBorrow>> => {
    const response = await axiosInstance.patch<ApiResponse<IBorrow>>(
      `/borrows/return/${borrowId}`,
      { fineAmount }
    );
    return response.data;
  },

  checkOverdueBorrows: async (): Promise<ApiResponse<{ totalChecked: number; overdueList: any[] }>> => {
    const response = await axiosInstance.post<ApiResponse<{ totalChecked: number; overdueList: any[] }>>(
      "/borrows/check-overdue"
    );
    return response.data;
  },

  deleteBorrow: async (borrowId: string | number): Promise<boolean> => {
    await axiosInstance.delete(`/borrows/${borrowId}`);
    return true;
  },
};


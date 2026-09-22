import { axiosInstance } from "@/lib/axios";
import { ApiResponse } from "@/types/api.types";
import { IUser, PaymentMethod, UserRole, UserStatus, IUserOptions } from "@/types/auth";

type RawUser = Record<string, unknown>;

const normalizeUser = (u: RawUser): IUser => ({
  ...(u as unknown as IUser),
  id: String(u.id),
  phoneNumber: (u.phone as string) || (u.phoneNumber as string),
  isActive: u.status === "ACTIVE",
});

export const UserService = {
  getAllUsers: async (params?: Record<string, string | number | boolean>): Promise<IUser[]> => {
    const response = await axiosInstance.get<ApiResponse<unknown>>("/users", {
      params: { limit: 10000, ...params },
    });
    const raw = response.data?.data;
    const list = Array.isArray(raw)
      ? (raw as RawUser[])
      : Array.isArray((raw as Record<string, unknown>)?.data)
      ? ((raw as Record<string, RawUser[]>).data)
      : Array.isArray((raw as Record<string, unknown>)?.result)
      ? ((raw as Record<string, RawUser[]>).result)
      : [];
    return list.map(normalizeUser);
  },

  /** Lightweight call to get the true total count from meta.total (limit=1). */
  getTotalCount: async (): Promise<number> => {
    const response = await axiosInstance.get<ApiResponse<unknown>>("/users", {
      params: { limit: 1, page: 1 },
    });
    return response.data?.meta?.total ?? 0;
  },

  getUserById: async (id: string | number): Promise<IUser> => {
    const response = await axiosInstance.get<ApiResponse<RawUser>>(`/users/${id}`);
    return normalizeUser(response.data?.data);
  },

  updateUser: async (
    id: string | number,
    payload: {
      name?: string;
      phone?: string;
      email?: string;
      studentOrVoterId?: string;
      institution?: string;
      department?: string;
      session?: string;
      role?: UserRole;
      status?: UserStatus;
      isPaid?: boolean;
      membershipStartedAt?: string;
      membershipExpiresAt?: string;
      paymentMethod?: PaymentMethod;
    }
  ): Promise<IUser> => {
    const response = await axiosInstance.patch<ApiResponse<RawUser>>(`/users/${id}`, payload);
    return normalizeUser(response.data?.data);
  },

  approveCashPayment: async (
    userId: string | number,
    amount?: number
  ): Promise<ApiResponse<null>> => {
    const response = await axiosInstance.patch<ApiResponse<null>>(
      `/users/${userId}/approve-cash`,
      { amount }
    );
    return response.data;
  },

  approveMembership: async (userId: string | number): Promise<IUser> => {
    const response = await axiosInstance.patch<ApiResponse<RawUser>>(
      `/users/${userId}`,
      { status: "ACTIVE" }
    );
    return normalizeUser(response.data?.data);
  },

  registerMemberByStaff: async (payload: {
    name: string;
    email: string;
    phone: string;
    password: string;
    studentOrVoterId: string;
    department?: string;
    session?: string;
    institution?: string;
    paymentMethod?: string;
    status?: UserStatus;
    isPaid?: boolean;
    membershipStartedAt?: string;
    membershipExpiresAt?: string;
  }): Promise<IUser> => {
    const response = await axiosInstance.post<ApiResponse<RawUser>>(
      `/users/register`,
      payload
    );
    return normalizeUser(response.data?.data);
  },

  updateProfile: async (
    payload: {
      name?: string;
      avatarUrl?: string;
      department?: string;
      session?: string;
      institution?: string;
      phone?: string;
      email?: string;
      studentOrVoterId?: string;
    }
  ): Promise<IUser> => {
    const response = await axiosInstance.patch<ApiResponse<RawUser>>("/users/profile", payload);
    return normalizeUser(response.data?.data);
  },

  uploadAvatar: async (file: File): Promise<IUser> => {
    const formData = new FormData();
    formData.append("avatar", file);
    const response = await axiosInstance.post<ApiResponse<RawUser>>("/users/avatar", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return normalizeUser(response.data?.data);
  },

  renewMembership: async (
    payload: {
      paymentMethod?: PaymentMethod;
      amount?: number;
      months?: number;
    }
  ): Promise<{ user: IUser; payment: Record<string, unknown> }> => {
    const response = await axiosInstance.post<ApiResponse<{ user: RawUser; payment: Record<string, unknown> }>>(
      "/users/renew-membership",
      payload
    );
    return {
      user: normalizeUser(response.data?.data?.user),
      payment: response.data?.data?.payment,
    };
  },

  sendNoticeToUser: async (
    userId: string | number,
    payload: { subject?: string; message: string }
  ): Promise<boolean> => {
    await axiosInstance.post(`/users/${userId}/send-notice`, payload);
    return true;
  },

  deleteUser: async (userId: string | number): Promise<boolean> => {
    await axiosInstance.delete(`/users/${userId}`);
    return true;
  },

  getUserOptions: async (): Promise<IUserOptions> => {
    try {
      const response = await axiosInstance.get<{ success: boolean; data: IUserOptions }>("/users/options");
      return response.data?.data ?? { departments: [], sessions: [], institutions: [] };
    } catch {
      return { departments: [], sessions: [], institutions: [] };
    }
  },
};


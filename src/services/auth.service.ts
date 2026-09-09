import { axiosInstance } from "@/lib/axios";
import { ApiResponse } from "@/types/api.types";
import { IAuthResponse, ILoginPayload, IRegisterPayload } from "@/types/auth";
import Cookies from "js-cookie";

export const AuthService = {
  login: async (payload: ILoginPayload): Promise<IAuthResponse> => {
    const response = await axiosInstance.post<IAuthResponse>("/auth/login", {
      email: payload.email,
      password: payload.password,
    });
    return response.data;
  },

  register: async (payload: IRegisterPayload): Promise<IAuthResponse> => {
    const response = await axiosInstance.post<IAuthResponse>("/users/register", payload);
    return response.data;
  },

  refreshToken: async (): Promise<string | null> => {
    try {
      const refreshToken = Cookies.get("refreshToken");
      const response = await axiosInstance.post<IAuthResponse>("/auth/refresh-token", {
        refreshToken,
      });
      const newToken = response.data?.data?.accessToken;
      if (newToken) {
        Cookies.set("accessToken", newToken, { expires: 7, path: "/" });
        localStorage.setItem("accessToken", newToken);
      }
      return newToken || null;
    } catch {
      return null;
    }
  },

  getMe: async (): Promise<IAuthResponse> => {
    // Backend canonical endpoint: GET /users/me
    // The /auth/me route does not exist; user profile is fetched via /users/:id in useAuth.ts
    const response = await axiosInstance.get<IAuthResponse>("/users/me");
    return response.data;
  },

  changePassword: async (payload: {
    oldPassword: string;
    newPassword: string;
  }): Promise<ApiResponse<null>> => {
    const response = await axiosInstance.post<ApiResponse<null>>(
      "/auth/change-password",
      payload
    );
    return response.data;
  },

  forgotPassword: async (payload: { email: string }): Promise<ApiResponse<null>> => {
    const response = await axiosInstance.post<ApiResponse<null>>(
      "/auth/forgot-password",
      payload
    );
    return response.data;
  },

  resetPassword: async (
    payload: { id: number; newPassword: string },
    token: string
  ): Promise<ApiResponse<null>> => {
    const response = await axiosInstance.post<ApiResponse<null>>(
      `/auth/reset-password?token=${token}`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  },
};

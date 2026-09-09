"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { toast } from "sonner";
import { clearAuthState, getStoredToken } from "@/lib/axios";
import { getErrorMessage } from "@/lib/errorUtils";
import { AuthService } from "@/services/auth.service";
import { UserService } from "@/services/user.service";
import { IAuthResponse, ILoginPayload, IRegisterPayload, IUser } from "@/types/auth";

export const fetchUserProfile = async (): Promise<IUser | null> => {
  const token = getStoredToken();
  if (!token) return null;

  try {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const user = JSON.parse(storedUser) as IUser;
      if (user?.id) {
        try {
          const freshUser = await UserService.getUserById(user.id);
          if (freshUser) {
            localStorage.setItem("user", JSON.stringify(freshUser));
            return freshUser;
          }
        } catch {
          // Keep cached user if network fails
        }
      }
      return user;
    }
    return null;
  } catch {
    return null;
  }
};

export const useGetMe = () => {
  return useQuery<IUser | null>({
    queryKey: ["user"],
    queryFn: fetchUserProfile,
    staleTime: 5 * 60 * 1000,
    retry: false,
    enabled: typeof window !== "undefined" && Boolean(getStoredToken()),
  });
};

export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: ILoginPayload): Promise<IAuthResponse> => {
      return await AuthService.login(payload);
    },
    onSuccess: (response) => {
      const token = response.data?.accessToken || response.data?.token;

      if (token) {
        Cookies.set("accessToken", token, { expires: 7, path: "/" });
        localStorage.setItem("accessToken", token);

        if (response.data.refreshToken) {
          Cookies.set("refreshToken", response.data.refreshToken, { expires: 30, path: "/" });
        }

        if (response.data.user) {
          localStorage.setItem("user", JSON.stringify(response.data.user));
        }
      }

      queryClient.invalidateQueries({ queryKey: ["user"] });
      toast.success(response.message || "Welcome back to RU Islamic Library!");
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Login failed. Please check your email and password."));
    },
  });
};

export const useRegister = () => {
  return useMutation({
    mutationFn: async (payload: IRegisterPayload): Promise<IAuthResponse> => {
      return await AuthService.register(payload);
    },
    onSuccess: (response) => {
      toast.success(response.message || "Registration successful! You can now log in.");
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Registration failed. Please check your details."));
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  const logout = () => {
    clearAuthState();
    queryClient.clear();
    toast.info("Logged out successfully.");
    router.push("/login");
  };

  return { logout };
};

export const useChangePassword = () => {
  return useMutation({
    mutationFn: async (payload: { oldPassword: string; newPassword: string }) => {
      return await AuthService.changePassword(payload);
    },
    onSuccess: () => {
      toast.success("Password changed successfully!");
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to change password. Please check your current password."));
    },
  });
};

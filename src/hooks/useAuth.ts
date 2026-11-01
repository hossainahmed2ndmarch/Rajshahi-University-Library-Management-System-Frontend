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
import { authClient } from "@/lib/auth-client";

export const fetchUserProfile = async (): Promise<IUser | null> => {
  let token = getStoredToken();

  // If no bearer token in localStorage/cookie, check Better Auth session
  if (!token) {
    try {
      const sessionResult = await authClient.getSession();
      if (sessionResult?.data?.session?.token) {
        token = sessionResult.data.session.token;
        Cookies.set("accessToken", token, { expires: 7, path: "/" });
        localStorage.setItem("accessToken", token);
        if (sessionResult.data.user) {
          localStorage.setItem("user", JSON.stringify(sessionResult.data.user));
          return sessionResult.data.user as unknown as IUser;
        }
      }
    } catch {
      // Better-auth session not present
    }
  }

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
    enabled: typeof window !== "undefined",
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

  const logout = async () => {
    try {
      await authClient.signOut();
    } catch {
      // Ignore if session was already invalidated
    }
    clearAuthState();
    queryClient.clear();
    toast.info("Logged out successfully.");
    router.push("/login");
  };

  return { logout };
};

// The frontend origin — after Google/Facebook OAuth, Better Auth redirects here
const getFrontendOrigin = (): string => {
  if (typeof window !== "undefined") return window.location.origin;
  return process.env.NEXT_PUBLIC_APP_URL || "https://www.rudclibrary.com";
};

export const useGoogleLogin = () => {
  return useMutation({
    mutationFn: async (callbackURL?: string) => {
      return await authClient.signIn.social({
        provider: "google",
        callbackURL: callbackURL || getFrontendOrigin(),
      });
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to initiate Google sign in."));
    },
  });
};

export const useGithubLogin = () => {
  return useMutation({
    mutationFn: async (callbackURL?: string) => {
      return await authClient.signIn.social({
        provider: "github",
        callbackURL: callbackURL || getFrontendOrigin(),
      });
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to initiate GitHub sign in."));
    },
  });
};

export const useFacebookLogin = () => {
  return useMutation({
    mutationFn: async (callbackURL?: string) => {
      return await authClient.signIn.social({
        provider: "facebook",
        callbackURL: callbackURL || getFrontendOrigin(),
      });
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to initiate Facebook sign in."));
    },
  });
};

export const useSendPhoneOtp = () => {
  return useMutation({
    mutationFn: async (phoneNumber: string) => {
      return await authClient.phoneNumber.sendOtp({
        phoneNumber,
      });
    },
    onSuccess: () => {
      toast.success("Verification code sent to your phone!");
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to send verification code."));
    },
  });
};

export const useVerifyPhoneOtp = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ phoneNumber, code }: { phoneNumber: string; code: string }) => {
      return await authClient.phoneNumber.verify({
        phoneNumber,
        code,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
      toast.success("Phone verified successfully!");
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Invalid or expired verification code."));
    },
  });
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

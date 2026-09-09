import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from "axios";
import Cookies from "js-cookie";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000/api/v1";

export const axiosInstance: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

/**
 * Helper function to retrieve the current auth token from cookies or localStorage
 */
export const getStoredToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return (
    Cookies.get("accessToken") ||
    Cookies.get("token") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("token") ||
    null
  );
};

/**
 * Helper function to clear authentication cookies and storage
 */
export const clearAuthState = (): void => {
  if (typeof window !== "undefined") {
    Cookies.remove("accessToken");
    Cookies.remove("refreshToken");
    Cookies.remove("token");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }
};

// Request Interceptor: Automatically attach Authorization: Bearer <token>
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getStoredToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Catch 401 errors on protected routes only
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      clearAuthState();
      if (
        typeof window !== "undefined" &&
        window.location.pathname.startsWith("/dashboard")
      ) {
        const currentPath = encodeURIComponent(window.location.pathname + window.location.search);
        window.location.href = `/login?redirect=${currentPath}`;
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;

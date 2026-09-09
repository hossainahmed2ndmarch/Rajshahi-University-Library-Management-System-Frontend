import { AxiosError } from "axios";
import { GenericErrorResponse } from "@/types/api.types";

/**
 * Extracts a human-readable error message from an Axios error or generic Error.
 * Safe to call from TanStack Query `onError` callbacks.
 */
export function getErrorMessage(
  error: unknown,
  fallback = "An unexpected error occurred."
): string {
  if (error instanceof AxiosError) {
    const data = error.response?.data as GenericErrorResponse | undefined;
    return data?.message || error.message || fallback;
  }
  if (error instanceof Error) {
    return error.message || fallback;
  }
  return fallback;
}

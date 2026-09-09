"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { PurchaseService } from "@/services/purchase.service";
import { getErrorMessage } from "@/lib/errorUtils";
import {
  ICreateGuestPurchasePayload,
  ICreateMemberPurchasePayload,
  IPurchase,
} from "@/types/purchase";

export const useCreateMemberPurchase = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ICreateMemberPurchasePayload): Promise<IPurchase> => {
      return PurchaseService.createMemberPurchase(payload);
    },
    onSuccess: (order) => {
      queryClient.invalidateQueries({ queryKey: ["myPurchases"] });
      queryClient.invalidateQueries({ queryKey: ["purchases"] });
      queryClient.invalidateQueries({ queryKey: ["books"] });
      toast.success(`Order ${order.transactionId || "#" + order.id} placed successfully!`);
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to place order. Please check your details and try again."));
    },
  });
};

export const useCreateGuestPurchase = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ICreateGuestPurchasePayload): Promise<IPurchase> => {
      return PurchaseService.createGuestPurchase(payload);
    },
    onSuccess: (order) => {
      queryClient.invalidateQueries({ queryKey: ["purchases"] });
      queryClient.invalidateQueries({ queryKey: ["books"] });
      toast.success(`Order ${order.transactionId || "#" + order.id} placed successfully!`);
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to place guest order. Please check your details and try again."));
    },
  });
};

export const useGetMyPurchases = () => {
  return useQuery<IPurchase[]>({
    queryKey: ["myPurchases"],
    queryFn: () => PurchaseService.getMyPurchases(),
    staleTime: 60 * 1000,
    retry: 1,
  });
};

export const useGetAllPurchases = (params?: Record<string, unknown>) => {
  return useQuery<IPurchase[]>({
    queryKey: ["purchases", params],
    queryFn: async (): Promise<IPurchase[]> => {
      try {
        return await PurchaseService.getAllPurchases(params);
      } catch {
        return [];
      }
    },
    staleTime: 60 * 1000,
  });
};

export const useGetGuestOrders = (email?: string, phone?: string) => {
  return useQuery<IPurchase[]>({
    queryKey: ["guestOrders", email, phone],
    queryFn: () => {
      if (!email && !phone) return Promise.resolve([]);
      return PurchaseService.getGuestOrders({ email: email || "", phone });
    },
    enabled: Boolean(email && email.includes("@")),
    staleTime: 30 * 1000,
  });
};

export const useTrackGuestOrder = (transactionId?: string, email?: string) => {
  return useQuery<IPurchase | null>({
    queryKey: ["trackOrder", transactionId, email],
    queryFn: () => {
      if (!transactionId) return Promise.resolve(null);
      return PurchaseService.trackGuestOrder(transactionId, email);
    },
    enabled: Boolean(transactionId && transactionId.trim().length > 0),
    staleTime: 15 * 1000,
    retry: 1,
  });
};

export const useCancelGuestOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { transactionId: string; email: string; reason?: string }) => {
      return PurchaseService.cancelGuestOrder(payload);
    },
    onSuccess: (order) => {
      queryClient.invalidateQueries({ queryKey: ["guestOrders"] });
      queryClient.invalidateQueries({ queryKey: ["trackOrder"] });
      queryClient.invalidateQueries({ queryKey: ["books"] });
      toast.success(`Order #${order.transactionId || order.id} has been cancelled successfully.`);
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to cancel guest order. Only pending orders can be cancelled."));
    },
  });
};

export const useCancelMemberOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ purchaseId, reason }: { purchaseId: number | string; reason?: string }) => {
      return PurchaseService.cancelMemberOrder(purchaseId, reason);
    },
    onSuccess: (order) => {
      queryClient.invalidateQueries({ queryKey: ["myPurchases"] });
      queryClient.invalidateQueries({ queryKey: ["purchases"] });
      queryClient.invalidateQueries({ queryKey: ["books"] });
      toast.success(`Order #${order.transactionId || order.id} cancelled successfully.`);
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to cancel order."));
    },
  });
};

export const useUpdatePurchaseStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      purchaseId,
      orderStatus,
      paymentStatus,
    }: {
      purchaseId: number | string;
      orderStatus?: string;
      paymentStatus?: string;
    }) => {
      return PurchaseService.updatePurchaseStatus(purchaseId, { orderStatus, paymentStatus });
    },
    onSuccess: (order) => {
      queryClient.invalidateQueries({ queryKey: ["purchases"] });
      queryClient.invalidateQueries({ queryKey: ["myPurchases"] });
      queryClient.invalidateQueries({ queryKey: ["books"] });
      toast.success(`Order #${order.transactionId || order.id} status updated successfully.`);
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to update order status."));
    },
  });
};

export const useCreatePOSSale = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: import("@/types/purchase").ICreatePOSSalePayload): Promise<IPurchase> => {
      return PurchaseService.createPOSSale(payload);
    },
    onSuccess: (order) => {
      queryClient.invalidateQueries({ queryKey: ["purchases"] });
      queryClient.invalidateQueries({ queryKey: ["books"] });
      queryClient.invalidateQueries({ queryKey: ["myPurchases"] });
      toast.success(`POS Sale ${order.transactionId || "#" + order.id} completed successfully!`);
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to complete POS sale. Please verify inputs and stock."));
    },
  });
};

export const useDeletePurchase = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (purchaseId: number | string) => {
      return await PurchaseService.deletePurchase(purchaseId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchases"] });
      queryClient.invalidateQueries({ queryKey: ["myPurchases"] });
      queryClient.invalidateQueries({ queryKey: ["books"] });
      toast.success("Purchase order deleted from registry.");
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to delete purchase record."));
    },
  });
};




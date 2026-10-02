"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { RudcIyanotService } from "@/services/rudc/rudcIyanot.service";
import { getErrorMessage } from "@/lib/errorUtils";

export const useRudcIyanot = (params?: Record<string, any>) => {
  return useQuery({
    queryKey: ["rudcIyanot", params],
    queryFn: () => RudcIyanotService.getRudcIyanotRecords(params),
  });
};

export const useRecordIyanotPayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: {
      userId: number;
      month: number;
      year: number;
      amount?: number;
      paymentMethod: string;
      transactionId?: string;
      remarks?: string;
    }) => {
      return RudcIyanotService.recordIyanotPayment(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rudcIyanot"] });
      queryClient.invalidateQueries({ queryKey: ["rudcStats"] });
      queryClient.invalidateQueries({ queryKey: ["myRudcProfile"] });
      toast.success("Iyanot payment recorded successfully.");
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to record iyanot payment."));
    },
  });
};

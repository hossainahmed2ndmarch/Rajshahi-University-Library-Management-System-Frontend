"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { RudcMemberService } from "@/services/rudc/rudcMember.service";
import { getErrorMessage } from "@/lib/errorUtils";
import { IRudcApplyForm } from "@/types/rudc";

export const useRudcStats = () => {
  return useQuery({
    queryKey: ["rudcStats"],
    queryFn: () => RudcMemberService.getPublicRudcStats(),
    staleTime: 30 * 1000,
  });
};

export const useMyRudcProfile = () => {
  return useQuery({
    queryKey: ["myRudcProfile"],
    queryFn: () => RudcMemberService.getMyRudcProfile(),
  });
};

export const useRudcMembers = (params?: Record<string, any>) => {
  return useQuery({
    queryKey: ["rudcMembers", params],
    queryFn: () => RudcMemberService.getAllRudcMembers(params),
  });
};

export const useRudcMember = (id: number | string) => {
  return useQuery({
    queryKey: ["rudcMember", id],
    queryFn: () => RudcMemberService.getRudcMemberById(id),
    enabled: Boolean(id),
  });
};

export const useApplyRudcVolunteer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: IRudcApplyForm) => {
      return RudcMemberService.applyRudcVolunteer(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rudcStats"] });
      queryClient.invalidateQueries({ queryKey: ["rudcMembers"] });
      queryClient.invalidateQueries({ queryKey: ["myRudcProfile"] });
      toast.success("Alhamdulillah! Your RUDC volunteer application has been submitted.");
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to submit volunteer application."));
    },
  });
};

export const useUpdateRudcMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number | string; data: Partial<any> }) => {
      return RudcMemberService.updateRudcMember(id, data);
    },
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ["rudcMembers"] });
      queryClient.invalidateQueries({ queryKey: ["rudcMember", updated.id] });
      queryClient.invalidateQueries({ queryKey: ["rudcStats"] });
      toast.success("RUDC member details updated successfully.");
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to update RUDC member."));
    },
  });
};

export const useSendInterviewEmail = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: {
      userIds: number[];
      interviewDate: string;
      interviewTime?: string;
      venueOrLink: string;
      instructions?: string;
      subject?: string;
    }) => {
      return RudcMemberService.sendInterviewEmail(payload);
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["rudcMembers"] });
      toast.success(
        `Interview emails processed: ${res.successCount} sent successfully, ${res.failedCount} failed.`
      );
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to send interview notifications."));
    },
  });
};

export const useCreatePreExistedRudcMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: any) => {
      return RudcMemberService.createPreExistedRudcMember(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rudcMembers"] });
      queryClient.invalidateQueries({ queryKey: ["rudcStats"] });
      toast.success("Pre-existed RUDC member record created successfully.");
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to create pre-existed member."));
    },
  });
};

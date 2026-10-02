"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { RudcTeamService } from "@/services/rudc/rudcTeam.service";
import { getErrorMessage } from "@/lib/errorUtils";

export const useRudcTeams = () => {
  return useQuery({
    queryKey: ["rudcTeams"],
    queryFn: () => RudcTeamService.getAllRudcTeams(),
  });
};

export const useCreateRudcTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { name: string; description?: string }) => {
      return RudcTeamService.createRudcTeam(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rudcTeams"] });
      queryClient.invalidateQueries({ queryKey: ["rudcStats"] });
      toast.success("New working team created successfully.");
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to create team."));
    },
  });
};

export const useUpdateRudcTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number | string; data: { name?: string; description?: string } }) => {
      return RudcTeamService.updateRudcTeam(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rudcTeams"] });
      toast.success("Team updated successfully.");
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to update team."));
    },
  });
};

export const useDeleteRudcTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number | string) => {
      return RudcTeamService.deleteRudcTeam(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rudcTeams"] });
      queryClient.invalidateQueries({ queryKey: ["rudcStats"] });
      toast.success("Team removed successfully.");
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to delete team."));
    },
  });
};

export const useAssignTeamMembers = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { teamId: number; userIds: number[]; role?: string }) => {
      return RudcTeamService.assignTeamMembers(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rudcTeams"] });
      queryClient.invalidateQueries({ queryKey: ["rudcMembers"] });
      toast.success("Members assigned to team successfully.");
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to assign team members."));
    },
  });
};

export const useRemoveTeamMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ teamId, userId }: { teamId: number | string; userId: number | string }) => {
      return RudcTeamService.removeTeamMember(teamId, userId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rudcTeams"] });
      queryClient.invalidateQueries({ queryKey: ["rudcMembers"] });
      toast.success("Member removed from team successfully.");
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to remove member from team."));
    },
  });
};

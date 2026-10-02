import { axiosInstance } from '@/lib/axios';
import { ApiResponse } from '@/types/api.types';
import { IRudcTeam } from '@/types/rudc';

export const RudcTeamService = {
  getAllRudcTeams: async (): Promise<IRudcTeam[]> => {
    const response = await axiosInstance.get<ApiResponse<IRudcTeam[]>>('/rudc/teams');
    return response.data?.data || [];
  },

  createRudcTeam: async (payload: { name: string; description?: string }) => {
    const response = await axiosInstance.post<ApiResponse<IRudcTeam>>('/rudc/teams', payload);
    return response.data?.data;
  },

  updateRudcTeam: async (id: number | string, payload: { name?: string; description?: string }) => {
    const response = await axiosInstance.patch<ApiResponse<IRudcTeam>>(`/rudc/teams/${id}`, payload);
    return response.data?.data;
  },

  deleteRudcTeam: async (id: number | string) => {
    const response = await axiosInstance.delete<ApiResponse<any>>(`/rudc/teams/${id}`);
    return response.data?.data;
  },

  assignTeamMembers: async (payload: { teamId: number; userIds: number[]; role?: string }) => {
    const response = await axiosInstance.post<ApiResponse<IRudcTeam>>('/rudc/teams/assign', payload);
    return response.data?.data;
  },

  removeTeamMember: async (teamId: number | string, userId: number | string) => {
    const response = await axiosInstance.delete<ApiResponse<any>>(
      `/rudc/teams/${teamId}/members/${userId}`
    );
    return response.data?.data;
  },
};

import { axiosInstance } from '@/lib/axios';
import { ApiResponse } from '@/types/api.types';
import { IRudcApplyForm, IRudcMember, IRudcStats } from '@/types/rudc';

export const RudcMemberService = {
  applyRudcVolunteer: async (payload: IRudcApplyForm) => {
    const response = await axiosInstance.post<ApiResponse<any>>('/rudc/apply', payload);
    return response.data?.data;
  },

  getPublicRudcStats: async (): Promise<IRudcStats> => {
    const response = await axiosInstance.get<ApiResponse<IRudcStats>>('/rudc/stats');
    return (
      response.data?.data || {
        volunteersCount: 0,
        permanentMembersCount: 0,
        totalMembers: 0,
        teamsCount: 0,
        iyanotTotal: 0,
      }
    );
  },

  getMyRudcProfile: async (): Promise<IRudcMember | null> => {
    const response = await axiosInstance.get<ApiResponse<IRudcMember>>('/rudc/my-profile');
    return response.data?.data || null;
  },

  getAllRudcMembers: async (params?: Record<string, any>) => {
    const response = await axiosInstance.get<ApiResponse<IRudcMember[]>>('/rudc/members', {
      params,
    });
    return {
      data: response.data?.data || [],
      meta: response.data?.meta,
    };
  },

  getRudcMemberById: async (id: number | string): Promise<IRudcMember> => {
    const response = await axiosInstance.get<ApiResponse<IRudcMember>>(`/rudc/members/${id}`);
    return response.data?.data;
  },

  updateRudcMember: async (id: number | string, payload: Partial<any>) => {
    const response = await axiosInstance.patch<ApiResponse<IRudcMember>>(
      `/rudc/members/${id}`,
      payload
    );
    return response.data?.data;
  },

  sendInterviewEmail: async (payload: {
    userIds: number[];
    interviewDate: string;
    interviewTime?: string;
    venueOrLink: string;
    instructions?: string;
    subject?: string;
  }) => {
    const response = await axiosInstance.post<ApiResponse<any>>(
      '/rudc/send-interview-email',
      payload
    );
    return response.data?.data;
  },

  createPreExistedRudcMember: async (payload: any) => {
    const response = await axiosInstance.post<ApiResponse<IRudcMember>>(
      '/rudc/members/pre-existed',
      payload
    );
    return response.data?.data;
  },
};

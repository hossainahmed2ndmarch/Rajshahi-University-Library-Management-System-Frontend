import { axiosInstance } from '@/lib/axios';
import { ApiResponse } from '@/types/api.types';
import {
  IActivity,
  IEvent,
  IEventSession,
  IEventMemberRecord,
  IAttendanceStats,
  AttendanceStatus,
  ActivityStatus,
  EventStatus,
  Organization,
} from '@/types/event';

export interface IActivityQueryParams {
  searchTerm?: string;
  status?: string;
  org?: string;
  page?: number;
  limit?: number;
}

export interface IEventQueryParams {
  searchTerm?: string;
  status?: string;
  org?: string;
  activityId?: number;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export const ActivityService = {
  getAllActivities: async (
    params?: IActivityQueryParams,
  ): Promise<{ data: IActivity[]; meta?: { total: number; page: number; limit: number; totalPage: number } }> => {
    const res = await axiosInstance.get<ApiResponse<IActivity[]>>('/activities', {
      params,
    });
    return {
      data: res.data?.data || [],
      meta: res.data?.meta,
    };
  },

  getActivityBySlug: async (idOrSlug: string | number): Promise<IActivity> => {
    const res = await axiosInstance.get<ApiResponse<IActivity>>(`/activities/${idOrSlug}`);
    return res.data?.data;
  },

  createActivity: async (payload: {
    org?: Organization;
    title: string;
    category?: string;
    description?: string;
    bannerImage?: string;
    status?: ActivityStatus;
  }): Promise<IActivity> => {
    const res = await axiosInstance.post<ApiResponse<IActivity>>('/activities', payload);
    return res.data?.data;
  },

  updateActivity: async (
    id: number,
    payload: Partial<{
      org: Organization;
      title: string;
      category: string;
      description: string;
      bannerImage: string;
      status: ActivityStatus;
    }>,
  ): Promise<IActivity> => {
    const res = await axiosInstance.patch<ApiResponse<IActivity>>(`/activities/${id}`, payload);
    return res.data?.data;
  },

  deleteActivity: async (id: number): Promise<boolean> => {
    await axiosInstance.delete(`/activities/${id}`);
    return true;
  },

  uploadBanner: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('banner', file);
    const res = await axiosInstance.post<ApiResponse<{ url: string }>>(
      '/activities/upload-banner',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return res.data?.data?.url ?? '';
  },

  getCategories: async (): Promise<string[]> => {
    const res = await axiosInstance.get<ApiResponse<string[]>>('/activities/categories');
    return res.data?.data || [];
  },
};

export const EventService = {
  getAllEvents: async (
    params?: IEventQueryParams,
  ): Promise<{ data: IEvent[]; meta?: { total: number; page: number; limit: number; totalPage: number } }> => {
    const res = await axiosInstance.get<ApiResponse<IEvent[]>>('/events', {
      params,
    });
    return {
      data: res.data?.data || [],
      meta: res.data?.meta,
    };
  },

  getEventBySlug: async (idOrSlug: string | number): Promise<IEvent> => {
    const res = await axiosInstance.get<ApiResponse<IEvent>>(`/events/${idOrSlug}`);
    return res.data?.data;
  },

  createEvent: async (payload: {
    org?: Organization;
    activityId?: number | null;
    title: string;
    category?: string;
    status?: EventStatus;
    scheduleText?: string;
    location?: string;
    bannerImage?: string;
    startDate?: string | null;
    endDate?: string | null;
    currentChapter?: string;
    metadata?: Record<string, unknown>;
    isActive?: boolean;
  }): Promise<IEvent> => {
    const res = await axiosInstance.post<ApiResponse<IEvent>>('/events', payload);
    return res.data?.data;
  },

  updateEvent: async (
    id: number,
    payload: Partial<{
      org: Organization;
      activityId: number | null;
      title: string;
      category: string;
      status: EventStatus;
      scheduleText: string;
      location: string;
      bannerImage: string;
      startDate: string | null;
      endDate: string | null;
      currentChapter: string;
      metadata: Record<string, unknown>;
      isActive: boolean;
    }>,
  ): Promise<IEvent> => {
    const res = await axiosInstance.patch<ApiResponse<IEvent>>(`/events/${id}`, payload);
    return res.data?.data;
  },

  deleteEvent: async (id: number): Promise<boolean> => {
    await axiosInstance.delete(`/events/${id}`);
    return true;
  },

  uploadBanner: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('banner', file);
    const res = await axiosInstance.post<ApiResponse<{ url: string }>>(
      '/events/upload-banner',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return res.data?.data?.url ?? '';
  },

  getCategories: async (): Promise<string[]> => {
    const res = await axiosInstance.get<ApiResponse<string[]>>('/events/categories');
    return res.data?.data || [];
  },
};

export const EventSessionService = {
  getSessionsByEvent: async (eventId: number): Promise<IEventSession[]> => {
    const res = await axiosInstance.get<ApiResponse<IEventSession[]>>(`/event-sessions/event/${eventId}`);
    return res.data?.data || [];
  },

  getSessionById: async (id: number): Promise<IEventSession> => {
    const res = await axiosInstance.get<ApiResponse<IEventSession>>(`/event-sessions/${id}`);
    return res.data?.data;
  },

  createSession: async (payload: {
    eventId: number;
    sessionDate: string;
    chapter?: string;
    summary?: string;
    audioUrl?: string;
  }): Promise<IEventSession> => {
    const res = await axiosInstance.post<ApiResponse<IEventSession>>('/event-sessions', payload);
    return res.data?.data;
  },

  updateSession: async (
    id: number,
    payload: Partial<{
      eventId: number;
      sessionDate: string;
      chapter: string;
      summary: string;
      audioUrl: string;
    }>,
  ): Promise<IEventSession> => {
    const res = await axiosInstance.patch<ApiResponse<IEventSession>>(`/event-sessions/${id}`, payload);
    return res.data?.data;
  },

  deleteSession: async (id: number): Promise<boolean> => {
    await axiosInstance.delete(`/event-sessions/${id}`);
    return true;
  },

  uploadAudio: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('audio', file);
    const res = await axiosInstance.post<ApiResponse<{ url: string }>>(
      '/event-sessions/upload-audio',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return res.data?.data?.url ?? '';
  },
};

export const EventMemberRecordService = {
  bulkMarkAttendance: async (
    records: Array<{
      eventId: number;
      userId: number;
      sessionId?: number | null;
      sessionDate?: string | null;
      status: AttendanceStatus;
    }>,
  ): Promise<IEventMemberRecord[]> => {
    const res = await axiosInstance.post<ApiResponse<IEventMemberRecord[]>>(
      '/event-member-records/bulk-attendance',
      { records },
    );
    return res.data?.data || [];
  },

  submitFeedback: async (payload: {
    eventId: number;
    sessionId?: number | null;
    sessionDate?: string | null;
    rating?: number;
    comment: string;
  }): Promise<IEventMemberRecord> => {
    const res = await axiosInstance.post<ApiResponse<IEventMemberRecord>>(
      '/event-member-records/feedback',
      payload,
    );
    return res.data?.data;
  },

  recordSelfAttendance: async (payload: {
    eventId: number;
    sessionId?: number | null;
    sessionDate?: string | null;
    status?: AttendanceStatus;
  }): Promise<{ message: string; record: IEventMemberRecord; alreadyRecorded: boolean }> => {
    const res = await axiosInstance.post<ApiResponse<{ message: string; record: IEventMemberRecord; alreadyRecorded: boolean }>>(
      '/event-member-records/self-attendance',
      payload,
    );
    return res.data?.data;
  },

  approveFeedback: async (recordId: number, isApproved: boolean): Promise<IEventMemberRecord> => {
    const res = await axiosInstance.patch<ApiResponse<IEventMemberRecord>>(
      `/event-member-records/approve/${recordId}`,
      { isApproved },
    );
    return res.data?.data;
  },

  getRecordsByEvent: async (
    eventId: number,
    params?: {
      status?: string;
      isApproved?: string | boolean;
      hasFeedback?: boolean;
      page?: number;
      limit?: number;
    },
  ): Promise<{ data: IEventMemberRecord[]; meta?: { total: number; page: number; limit: number; totalPage: number } }> => {
    const res = await axiosInstance.get<ApiResponse<IEventMemberRecord[]>>(
      `/event-member-records/event/${eventId}`,
      { params },
    );
    return {
      data: res.data?.data || [],
      meta: res.data?.meta,
    };
  },

  getMyRecords: async (eventId?: number): Promise<IEventMemberRecord[]> => {
    const res = await axiosInstance.get<ApiResponse<IEventMemberRecord[]>>(
      '/event-member-records/my-records',
      { params: { eventId } },
    );
    return res.data?.data || [];
  },

  getEventStats: async (eventId: number): Promise<IAttendanceStats> => {
    const res = await axiosInstance.get<ApiResponse<IAttendanceStats>>(
      `/event-member-records/stats/${eventId}`,
    );
    return res.data?.data;
  },
};

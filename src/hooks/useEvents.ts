"use client";

import { useQuery } from "@tanstack/react-query";
import {
  ActivityService,
  EventService,
  IActivityQueryParams,
  IEventQueryParams,
} from "@/services/event.service";

export const useGetActivities = (params?: IActivityQueryParams) => {
  return useQuery({
    queryKey: ["activities", params],
    queryFn: () => ActivityService.getAllActivities(params),
    staleTime: 60 * 1000,
  });
};

export const useGetActivityBySlug = (slug: string | number) => {
  return useQuery({
    queryKey: ["activity", slug],
    queryFn: () => ActivityService.getActivityBySlug(slug),
    enabled: Boolean(slug),
  });
};

export const useGetEvents = (params?: IEventQueryParams) => {
  return useQuery({
    queryKey: ["events", params],
    queryFn: () => EventService.getAllEvents(params),
    staleTime: 60 * 1000,
  });
};

export const useGetEventBySlug = (slug: string) => {
  return useQuery({
    queryKey: ["event", slug],
    queryFn: () => EventService.getEventBySlug(slug),
    enabled: Boolean(slug),
  });
};

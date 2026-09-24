"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Plus,
  Search,
  Filter,
  Trash2,
  Edit,
  CalendarDays,
  Sparkles,
  Layers,
  UserCheck,
  MessageSquare,
  Loader2,
  Clock,
  MapPin,
  Building2,
  Tag,
} from "lucide-react";
import { EventService, ActivityService } from "@/services/event.service";
import { IEvent, IActivity, EventStatus } from "@/types/event";
import { EventFormModal } from "./EventFormModal";
import { EventSessionsManager } from "./EventSessionsManager";
import { BulkAttendanceModal } from "./BulkAttendanceModal";
import { FeedbackManagementTable } from "./FeedbackManagementTable";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export interface EventsManagementTableProps {
  roleTitle?: string;
  roleBadge?: string;
  allowDelete?: boolean;
}

export function EventsManagementTable({
  roleTitle = "Events & Study Circles Management",
  roleBadge = "ADMIN DESK",
  allowDelete = false,
}: EventsManagementTableProps) {
  const [events, setEvents] = useState<IEvent[]>([]);
  const [activities, setActivities] = useState<IActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters (modern tab & chip based)
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [activityFilter, setActivityFilter] = useState("ALL");

  // Modals state
  const [isEventFormOpen, setIsEventFormOpen] = useState(false);
  const [selectedEventForEdit, setSelectedEventForEdit] = useState<IEvent | null>(null);

  const [sessionManagerEvent, setSessionManagerEvent] = useState<IEvent | null>(null);
  const [bulkAttendanceEvent, setBulkAttendanceEvent] = useState<IEvent | null>(null);
  const [feedbackEvent, setFeedbackEvent] = useState<IEvent | null>(null);

  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      const [eventsRes, activitiesRes] = await Promise.all([
        EventService.getAllEvents({ limit: 100 }),
        ActivityService.getAllActivities({ limit: 100 }),
      ]);
      setEvents(eventsRes.data);
      setActivities(activitiesRes.data);
    } catch {
      toast.error("ইভেন্ট তালিকা লোড করতে ব্যর্থ হয়েছে");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleDeleteEvent = async (event: IEvent) => {
    if (!allowDelete) {
      toast.error("শুধুমাত্র Super Admin ইভেন্ট ডিলিট করতে পারবেন");
      return;
    }

    if (!confirm(`আপনি কি নিশ্চিত যে "${event.title}" ইভেন্টটি মুছে ফেলতে চান?`)) {
      return;
    }

    try {
      setDeletingId(event.id);
      await EventService.deleteEvent(event.id);
      toast.success("ইভেন্ট সফলভাবে মুছে ফেলা হয়েছে");
      fetchEvents();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "ইভেন্ট মুছতে ব্যর্থ হয়েছে");
    } finally {
      setDeletingId(null);
    }
  };

  // Status Counts
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {
      ALL: events.length,
      UPCOMING: 0,
      ONGOING: 0,
      COMPLETED: 0,
      CANCELLED: 0,
    };
    events.forEach((ev) => {
      if (counts[ev.status] !== undefined) counts[ev.status]++;
    });
    return counts;
  }, [events]);

  const filteredEvents = useMemo(() => {
    return events.filter((ev) => {
      const matchSearch =
        ev.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (ev.location && ev.location.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (ev.category && ev.category.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchStatus = statusFilter === "ALL" || ev.status === statusFilter;
      const matchActivity =
        activityFilter === "ALL" || String(ev.activityId) === activityFilter;

      return matchSearch && matchStatus && matchActivity;
    });
  }, [events, searchQuery, statusFilter, activityFilter]);

  const getStatusBadge = (status: EventStatus) => {
    switch (status) {
      case "ONGOING":
        return "bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-500/30";
      case "UPCOMING":
        return "bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/30";
      case "COMPLETED":
        return "bg-gray-500/15 text-gray-800 dark:text-gray-300 border-gray-500/30";
      default:
        return "bg-red-500/15 text-red-800 dark:text-red-300 border-red-500/30";
    }
  };

  const statusTabs = [
    { key: "ALL", label: "সকল ইভেন্ট", count: statusCounts.ALL },
    { key: "UPCOMING", label: "Upcoming", count: statusCounts.UPCOMING },
    { key: "ONGOING", label: "Ongoing", count: statusCounts.ONGOING },
    { key: "COMPLETED", label: "Completed", count: statusCounts.COMPLETED },
    { key: "CANCELLED", label: "Cancelled", count: statusCounts.CANCELLED },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-[#003824] rounded-3xl p-6 sm:p-8 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-800/60 border border-emerald-700/50 text-emerald-200 text-[11px] font-bold uppercase tracking-wider mb-1">
            <Sparkles className="h-3 w-3 text-amber-400" />
            <span>{roleBadge}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black">{roleTitle}</h1>
          <p className="text-xs sm:text-sm text-emerald-100/80">
            ইভেন্ট তৈরি, ধারাবাহিক সেশন ব্যবস্থাপনা, বাল্ক উপস্থিতি এবং ফিডব্যাক মডারেশন করুন।
            {!allowDelete && " (মুছে ফেলার অনুমতি শুধুমাত্র Super Admin এর রয়েছে)"}
          </p>
        </div>

        <button
          onClick={() => {
            setSelectedEventForEdit(null);
            setIsEventFormOpen(true);
          }}
          className="inline-flex items-center gap-2 bg-[#C78700] hover:bg-amber-600 text-white font-bold text-xs px-5 py-3 rounded-2xl transition-all shadow-md shrink-0 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>নতুন ইভেন্ট তৈরি করুন</span>
        </button>
      </div>

      {/* Modern Filter & Search Bar */}
      <div className="bg-card border border-border rounded-3xl p-4 sm:p-5 space-y-4 shadow-xs">
        {/* Search input and Status Tabs */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="ইভেন্ট বা বিষয় খুঁজুন..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-2xs"
            />
          </div>

          {/* Status Tabs (Segmented layout instead of select) */}
          <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            {statusTabs.map((tab) => {
              const isActive = statusFilter === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setStatusFilter(tab.key)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 border",
                    isActive
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                      : "bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground border-border/80"
                  )}
                >
                  <span>{tab.label}</span>
                  <span
                    className={cn(
                      "px-1.5 py-0.2 rounded-md text-[10px] font-mono",
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Activity Filter Chips Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto border-t border-border/60 pt-3">
          <div className="flex items-center gap-1 text-[11px] font-semibold text-muted-foreground mr-2 shrink-0">
            <Layers className="h-3.5 w-3.5 text-emerald-600" />
            <span>কার্যক্রম:</span>
          </div>

          <button
            type="button"
            onClick={() => setActivityFilter("ALL")}
            className={cn(
              "px-3 py-1 rounded-xl text-xs font-medium transition-all shrink-0 border",
              activityFilter === "ALL"
                ? "bg-[#003824] text-white border-[#003824] shadow-xs"
                : "bg-muted/30 hover:bg-muted text-muted-foreground hover:text-foreground border-border/70"
            )}
          >
            সকল কার্যক্রম
          </button>

          {activities.map((act) => {
            const isActive = activityFilter === String(act.id);
            return (
              <button
                key={act.id}
                type="button"
                onClick={() => setActivityFilter(String(act.id))}
                className={cn(
                  "px-3 py-1 rounded-xl text-xs font-medium transition-all shrink-0 border",
                  isActive
                    ? "bg-[#003824] text-white border-[#003824] shadow-xs"
                    : "bg-muted/30 hover:bg-muted text-muted-foreground hover:text-foreground border-border/70"
                )}
              >
                {act.title}
              </button>
            );
          })}
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-foreground">
            <thead className="bg-muted/70 text-muted-foreground uppercase text-[10px] font-bold border-b border-border">
              <tr>
                <th className="px-5 py-3.5">ইভেন্টের নাম ও বিবরণ</th>
                <th className="px-4 py-3.5">কার্যক্রম / সংগঠন</th>
                <th className="px-4 py-3.5">স্ট্যাটাস</th>
                <th className="px-4 py-3.5">সেশনসমূহ</th>
                <th className="px-4 py-3.5">উপস্থিতি ও মতামত</th>
                <th className="px-5 py-3.5 text-right">পদক্ষেপ (Actions)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                    <p className="text-xs text-muted-foreground mt-2">ইভেন্ট লোড হচ্ছে...</p>
                  </td>
                </tr>
              ) : filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-muted-foreground">
                    <CalendarDays className="h-8 w-8 mx-auto text-muted-foreground/60 mb-2" />
                    <p>কোনো ইভেন্ট পাওয়া যায়নি</p>
                  </td>
                </tr>
              ) : (
                filteredEvents.map((ev) => {
                  const meta = (ev.metadata as any) || {};
                  const isOpenFeedback = Boolean(
                    meta.allowOpenFeedback || meta.allowFeedbackWithoutAttendance
                  );

                  return (
                    <tr
                      key={ev.id}
                      className="hover:bg-muted/40 transition-colors group"
                    >
                      <td className="px-5 py-4 font-semibold">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-foreground text-xs sm:text-sm">
                              {ev.title}
                            </p>
                            {isOpenFeedback && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.2 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold border border-emerald-500/20">
                                <MessageSquare className="h-2.5 w-2.5" />
                                <span>Open Feedback</span>
                              </span>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-2.5 text-[11px] text-muted-foreground font-normal">
                            {ev.location && (
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3 text-emerald-600" />
                                <span>{ev.location}</span>
                              </span>
                            )}
                            {ev.scheduleText && (
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3 text-amber-600" />
                                <span>{ev.scheduleText}</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <div className="space-y-0.5">
                          <p className="font-medium text-foreground">
                            {ev.activity?.title || "স্বতন্ত্র ইভেন্ট"}
                          </p>
                          <span className="font-mono text-[10px] text-muted-foreground px-1.5 py-0.5 rounded bg-muted">
                            {ev.org}
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={cn(
                            "inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border",
                            getStatusBadge(ev.status)
                          )}
                        >
                          {ev.status}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <button
                          onClick={() => setSessionManagerEvent(ev)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-background hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-xs font-bold text-emerald-700 dark:text-emerald-400 transition-colors cursor-pointer shadow-2xs"
                          title="সেশন পরিচালনা করুন"
                        >
                          <Layers className="h-3.5 w-3.5" />
                          <span>{ev._count?.sessions || 0} টি সেশন</span>
                        </button>
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          {/* Bulk Attendance Trigger */}
                          <button
                            onClick={() => setBulkAttendanceEvent(ev)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-600/10 text-emerald-700 dark:text-emerald-300 border border-emerald-600/20 font-bold text-[10px] hover:bg-emerald-600 hover:text-white transition-colors cursor-pointer"
                            title="বাল্ক উপস্থিতি প্রদান"
                          >
                            <UserCheck className="h-3 w-3" />
                            <span>হাজিরা ({ev._count?.memberRecords || 0})</span>
                          </button>

                          {/* Feedback Trigger */}
                          <button
                            onClick={() => setFeedbackEvent(ev)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 font-bold text-[10px] hover:bg-amber-500 hover:text-white transition-colors cursor-pointer"
                            title="মতামত মডারেশন"
                          >
                            <MessageSquare className="h-3 w-3" />
                            <span>মতামত</span>
                          </button>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Edit Button */}
                          <button
                            onClick={() => {
                              setSelectedEventForEdit(ev);
                              setIsEventFormOpen(true);
                            }}
                            className="p-1.5 rounded-xl border border-border bg-background hover:bg-blue-50 dark:hover:bg-blue-950/40 text-blue-600 dark:text-blue-400 transition-colors cursor-pointer"
                            title="সম্পাদনা করুন"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </button>

                          {/* Delete Button (Super Admin only) */}
                          {allowDelete && (
                            <button
                              disabled={deletingId === ev.id}
                              onClick={() => handleDeleteEvent(ev)}
                              className="p-1.5 rounded-xl border border-border bg-background hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 transition-colors cursor-pointer disabled:opacity-50"
                              title="মুছে ফেলুন (Super Admin Only)"
                            >
                              {deletingId === ev.id ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <Trash2 className="h-3.5 w-3.5" />
                              )}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {isEventFormOpen && (
        <EventFormModal
          isOpen={isEventFormOpen}
          onClose={() => setIsEventFormOpen(false)}
          event={selectedEventForEdit}
          onSuccess={fetchEvents}
        />
      )}

      {sessionManagerEvent && (
        <EventSessionsManager
          isOpen={Boolean(sessionManagerEvent)}
          onClose={() => setSessionManagerEvent(null)}
          event={sessionManagerEvent}
          allowDelete={allowDelete}
          onUpdate={fetchEvents}
        />
      )}

      {bulkAttendanceEvent && (
        <BulkAttendanceModal
          isOpen={Boolean(bulkAttendanceEvent)}
          onClose={() => setBulkAttendanceEvent(null)}
          event={bulkAttendanceEvent}
          onSuccess={fetchEvents}
        />
      )}

      {feedbackEvent && (
        <FeedbackManagementTable
          isOpen={Boolean(feedbackEvent)}
          onClose={() => setFeedbackEvent(null)}
          event={feedbackEvent}
          onUpdate={fetchEvents}
        />
      )}
    </div>
  );
}

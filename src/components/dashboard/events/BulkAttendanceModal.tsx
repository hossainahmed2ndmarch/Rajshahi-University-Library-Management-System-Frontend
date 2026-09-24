"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  UserCheck,
  Check,
  Search,
  Loader2,
  Calendar,
} from "lucide-react";
import { IEvent, AttendanceStatus } from "@/types/event";
import {
  EventMemberRecordService,
  EventSessionService,
} from "@/services/event.service";
import { axiosInstance } from "@/lib/axios";
import { toast } from "sonner";

interface BulkAttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: IEvent;
  onSuccess: () => void;
}

interface MemberUser {
  id: number;
  name: string;
  email: string;
  phone?: string;
  studentOrVoterId?: string;
}

export function BulkAttendanceModal({
  isOpen,
  onClose,
  event,
  onSuccess,
}: BulkAttendanceModalProps) {
  const [members, setMembers] = useState<MemberUser[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(true);
  const [searchMember, setSearchMember] = useState("");

  // Attendance configuration
  const [sessionDate, setSessionDate] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );
  const [selectedSessionId, setSelectedSessionId] = useState<string>("");
  const [eventSessions, setEventSessions] = useState<any[]>([]);

  // Attendance map: userId -> AttendanceStatus
  const [attendanceMap, setAttendanceMap] = useState<
    Record<number, AttendanceStatus>
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    // Fetch members
    setIsLoadingMembers(true);
    axiosInstance
      .get("/users", { params: { limit: 200 } })
      .then((res) => {
        const list = res.data?.data || [];
        setMembers(list);
      })
      .catch(() => {})
      .finally(() => setIsLoadingMembers(false));

    // Fetch sessions for this event
    EventSessionService.getSessionsByEvent(event.id)
      .then((sessions) => {
        setEventSessions(sessions);
        if (sessions.length > 0) {
          setSelectedSessionId(String(sessions[0].id));
          setSessionDate(sessions[0].sessionDate.slice(0, 10));
        }
      })
      .catch(() => {});
  }, [isOpen, event.id]);

  // Set all members to PRESENT
  const handleMarkAllPresent = () => {
    const updated: Record<number, AttendanceStatus> = {};
    members.forEach((m) => {
      updated[m.id] = "PRESENT";
    });
    setAttendanceMap(updated);
    toast.success("সকল সদস্যকে PRESENT হিসেবে চিহ্নিত করা হয়েছে");
  };

  // Set individual member status
  const handleStatusChange = (userId: number, status: AttendanceStatus) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [userId]: status,
    }));
  };

  // Submit bulk attendance
  const handleSubmitBulk = async () => {
    const entries = Object.entries(attendanceMap);
    if (entries.length === 0) {
      toast.error("অন্তত একজন সদস্যের উপস্থিতি নির্বাচন করুন");
      return;
    }

    try {
      setIsSubmitting(true);
      const records = entries.map(([userIdStr, status]) => ({
        eventId: event.id,
        userId: Number(userIdStr),
        sessionId: selectedSessionId ? Number(selectedSessionId) : null,
        sessionDate: sessionDate || null,
        status,
      }));

      await EventMemberRecordService.bulkMarkAttendance(records);
      toast.success(
        `${records.length} জন সদস্যের উপস্থিতি সফলভাবে সংরক্ষণ করা হয়েছে!`
      );
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "উপস্থিতি সংরক্ষণ করতে ব্যর্থ হয়েছে"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredMembers = members.filter((m) => {
    return (
      m.name?.toLowerCase().includes(searchMember.toLowerCase()) ||
      m.email?.toLowerCase().includes(searchMember.toLowerCase()) ||
      (m.studentOrVoterId &&
        m.studentOrVoterId.toLowerCase().includes(searchMember.toLowerCase()))
    );
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-card w-full max-w-3xl rounded-3xl border border-border shadow-2xl flex flex-col max-h-[90vh] animate-in fade-in-50 zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div>
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-primary" />
              <span>বাল্ক উপস্থিতি প্রদান (Bulk Attendance)</span>
            </h2>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              ইভেন্ট: <span className="font-bold text-foreground">{event.title}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Configuration Bar */}
        <div className="p-4 bg-muted/40 border-b border-border grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <label className="block font-bold text-foreground mb-1">
              সেশনের তারিখ *
            </label>
            <input
              type="date"
              required
              value={sessionDate}
              onChange={(e) => setSessionDate(e.target.value)}
              className="w-full px-3 py-1.5 bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block font-bold text-foreground mb-1">
              সংযুক্ত সেশন (ঐচ্ছিক)
            </label>
            <select
              value={selectedSessionId}
              onChange={(e) => {
                setSelectedSessionId(e.target.value);
                const match = eventSessions.find(
                  (s) => String(s.id) === e.target.value
                );
                if (match) setSessionDate(match.sessionDate.slice(0, 10));
              }}
              className="w-full px-3 py-1.5 bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">কোনো সেশন নির্দিষ্ট নয়</option>
              {eventSessions.map((s) => (
                <option key={s.id} value={String(s.id)}>
                  {s.chapter || `সেশন: ${s.sessionDate.slice(0, 10)}`}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="button"
              onClick={handleMarkAllPresent}
              className="w-full py-2 px-3 rounded-xl bg-emerald-600/15 text-emerald-800 dark:text-emerald-300 border border-emerald-600/30 text-xs font-bold hover:bg-emerald-600/25 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Check className="h-4 w-4" />
              <span>সকলকে Present করুন</span>
            </button>
          </div>
        </div>

        {/* Member Search Bar */}
        <div className="px-5 pt-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="সদস্যের নাম, আইডি বা ইমেইল দিয়ে ফিল্টার করুন..."
              value={searchMember}
              onChange={(e) => setSearchMember(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Members List Table */}
        <div className="p-5 overflow-y-auto flex-1">
          {isLoadingMembers ? (
            <div className="text-center py-12">
              <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
              <p className="text-xs text-muted-foreground mt-2">সদস্য তালিকা লোড হচ্ছে...</p>
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              কোনো সদস্য পাওয়া যায়নি।
            </div>
          ) : (
            <div className="divide-y divide-border border border-border rounded-2xl overflow-hidden text-xs">
              {filteredMembers.map((m) => {
                const currentStatus = attendanceMap[m.id];
                return (
                  <div
                    key={m.id}
                    className="p-3 bg-card hover:bg-muted/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <p className="font-bold text-foreground">{m.name}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {m.email} {m.studentOrVoterId ? `• ID: ${m.studentOrVoterId}` : ""}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 overflow-x-auto">
                      {(
                        [
                          "PRESENT",
                          "ABSENT",
                          "EXCUSED",
                          "INTERESTED",
                          "COMPLETED",
                        ] as AttendanceStatus[]
                      ).map((st) => (
                        <button
                          key={st}
                          type="button"
                          onClick={() => handleStatusChange(m.id, st)}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-colors cursor-pointer ${
                            currentStatus === st
                              ? st === "PRESENT"
                                ? "bg-emerald-600 text-white border-emerald-600"
                                : st === "ABSENT"
                                ? "bg-red-600 text-white border-red-600"
                                : st === "EXCUSED"
                                ? "bg-amber-600 text-white border-amber-600"
                                : "bg-primary text-primary-foreground border-primary"
                              : "border-border text-muted-foreground hover:bg-muted"
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            চিহ্নিত করা হয়েছে: <span className="font-bold text-foreground">{Object.keys(attendanceMap).length}</span> জন
          </span>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-border text-xs font-bold hover:bg-muted transition-colors cursor-pointer"
            >
              বাতিল
            </button>
            <button
              type="button"
              onClick={handleSubmitBulk}
              disabled={isSubmitting || Object.keys(attendanceMap).length === 0}
              className="px-5 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              <span>{isSubmitting ? "সংরক্ষণ হচ্ছে..." : "বাল্ক উপস্থিতি নিশ্চিত করুন"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

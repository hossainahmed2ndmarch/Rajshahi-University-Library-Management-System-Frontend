"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Loader2,
  CalendarDays,
  Sparkles,
  Building2,
  Layers,
  MessageSquare,
  Check,
} from "lucide-react";
import { IEvent, IActivity, EventStatus, Organization } from "@/types/event";
import { EventService, ActivityService } from "@/services/event.service";
import { CategoryCombobox } from "@/components/ui/CategoryCombobox";
import { FileUploadDropzone } from "@/components/ui/FileUploadDropzone";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface EventFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: IEvent | null;
  onSuccess: () => void;
}

export function EventFormModal({
  isOpen,
  onClose,
  event,
  onSuccess,
}: EventFormModalProps) {
  const [activities, setActivities] = useState<IActivity[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    activityId: "" as string | number,
    org: "RUIL" as Organization,
    category: "",
    status: "UPCOMING" as EventStatus,
    scheduleText: "",
    location: "",
    bannerImage: "",
    startDate: "",
    endDate: "",
    currentChapter: "",
    isActive: true,
    allowOpenFeedback: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      Promise.all([
        ActivityService.getAllActivities({ limit: 100 }),
        EventService.getCategories(),
      ])
        .then(([actRes, cats]) => {
          setActivities(actRes.data);
          setCategories(cats);
        })
        .catch(() => {});
    }
  }, [isOpen]);

  useEffect(() => {
    if (event) {
      const meta = (event.metadata as any) || {};
      setFormData({
        title: event.title || "",
        activityId: event.activityId || "",
        org: event.org || "RUIL",
        category: event.category || "",
        status: event.status || "UPCOMING",
        scheduleText: event.scheduleText || "",
        location: event.location || "",
        bannerImage: event.bannerImage || "",
        startDate: event.startDate ? event.startDate.slice(0, 10) : "",
        endDate: event.endDate ? event.endDate.slice(0, 10) : "",
        currentChapter: event.currentChapter || "",
        isActive: event.isActive ?? true,
        allowOpenFeedback: Boolean(
          meta.allowOpenFeedback || meta.allowFeedbackWithoutAttendance
        ),
      });
    } else {
      setFormData({
        title: "",
        activityId: "",
        org: "RUIL",
        category: "",
        status: "UPCOMING",
        scheduleText: "",
        location: "",
        bannerImage: "",
        startDate: "",
        endDate: "",
        currentChapter: "",
        isActive: true,
        allowOpenFeedback: false,
      });
    }
  }, [event, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error("ইভেন্টের শিরোনাম আবশ্যক");
      return;
    }

    try {
      setIsSubmitting(true);
      const existingMeta = (event?.metadata as any) || {};
      const payload: any = {
        title: formData.title,
        activityId: formData.activityId ? Number(formData.activityId) : null,
        org: formData.org,
        category: formData.category || undefined,
        status: formData.status,
        scheduleText: formData.scheduleText || undefined,
        location: formData.location || undefined,
        bannerImage: formData.bannerImage || undefined,
        startDate: formData.startDate || null,
        endDate: formData.endDate || null,
        currentChapter: formData.currentChapter || undefined,
        isActive: formData.isActive,
        metadata: {
          ...existingMeta,
          allowOpenFeedback: formData.allowOpenFeedback,
          allowFeedbackWithoutAttendance: formData.allowOpenFeedback,
        },
      };

      if (event) {
        await EventService.updateEvent(event.id, payload);
        toast.success("ইভেন্ট সফলভাবে আপডেট করা হয়েছে!");
      } else {
        await EventService.createEvent(payload);
        toast.success("নতুন ইভেন্ট সফলভাবে তৈরি করা হয়েছে!");
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "ইভেন্ট সংরক্ষণ করতে ব্যর্থ হয়েছে");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const orgOptions: Organization[] = ["RUIL", "RUDC", "BOTH"];
  const statusOptions: { value: EventStatus; label: string }[] = [
    { value: "UPCOMING", label: "Upcoming (আসন্ন)" },
    { value: "ONGOING", label: "Ongoing (চলমান)" },
    { value: "COMPLETED", label: "Completed (সম্পন্ন)" },
    { value: "CANCELLED", label: "Cancelled (বাতিল)" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-card w-full max-w-2xl rounded-3xl border border-border shadow-2xl flex flex-col max-h-[92vh] animate-in fade-in-50 zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border bg-muted/20">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <CalendarDays className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">
                {event ? "ইভেন্ট সম্পাদনা করুন" : "নতুন ইভেন্ট যুক্ত করুন"}
              </h2>
              <p className="text-[11px] text-muted-foreground">
                সেমিনার, পাঠচক্র ও লাইব্রেরি ইভেন্টের তথ্য ও সেটিংস
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form
          id="event-form"
          onSubmit={handleSubmit}
          className="p-5 overflow-y-auto space-y-4"
        >
          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-foreground mb-1">
              ইভেন্টের শিরোনাম (Title) *
            </label>
            <input
              type="text"
              required
              placeholder="e.g., শনিবারের পাঠচক্র - সেশন ১, তাফসীর সেমিনার"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
            />
          </div>

          {/* Activity Selector & Organization */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-foreground mb-1">
                কার্যক্রম নির্বাচন (Parent Activity)
              </label>
              <select
                value={formData.activityId}
                onChange={(e) => setFormData({ ...formData, activityId: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
              >
                <option value="">কোনো কার্যক্রমের আওতাধীন নয় (স্বাধীন ইভেন্ট)</option>
                {activities.map((act) => (
                  <option key={act.id} value={act.id}>
                    {act.title} ({act.org})
                  </option>
                ))}
              </select>
            </div>

            {/* Org Segmented Pills */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-foreground flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                <span>সংগঠন (Organization)</span>
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {orgOptions.map((org) => {
                  const isSelected = formData.org === org;
                  return (
                    <button
                      key={org}
                      type="button"
                      onClick={() => setFormData({ ...formData, org })}
                      className={cn(
                        "py-2 px-2 rounded-xl border text-xs font-semibold transition-all text-center",
                        isSelected
                          ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                          : "bg-muted/30 hover:bg-muted text-foreground border-border"
                      )}
                    >
                      {org}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Status Modernized Pill Selection */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-foreground flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-muted-foreground" />
              <span>ইভেন্টের অবস্থা (Status)</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {statusOptions.map((st) => {
                const isSelected = formData.status === st.value;
                return (
                  <button
                    key={st.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, status: st.value })}
                    className={cn(
                      "py-2 px-2.5 rounded-xl border text-[11px] font-semibold transition-all text-center",
                      isSelected
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                        : "bg-muted/30 hover:bg-muted text-muted-foreground hover:text-foreground border-border"
                    )}
                  >
                    {st.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Category Combobox */}
          <CategoryCombobox
            value={formData.category}
            onChange={(val) => setFormData({ ...formData, category: val })}
            categories={categories}
            label="ক্যাটাগরি (Category)"
            placeholder="ক্যাটাগরি নির্বাচন করুন বা নতুন লিখুন..."
          />

          {/* Schedule & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-foreground mb-1">
                সময়সূচি (Schedule Text)
              </label>
              <input
                type="text"
                placeholder="e.g., প্রতি শনিবার আসরের পর"
                value={formData.scheduleText}
                onChange={(e) => setFormData({ ...formData, scheduleText: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground mb-1">
                স্থান (Location)
              </label>
              <input
                type="text"
                placeholder="e.g., রাবি কেন্দ্রীয় জামে মসজিদ / পাঠাগার সেল"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
              />
            </div>
          </div>

          {/* Start and End Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-foreground mb-1">
                শুরুর তারিখ (Start Date)
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground mb-1">
                সমাপ্তির তারিখ (End Date)
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
              />
            </div>
          </div>

          {/* Current Chapter or Book focus */}
          <div>
            <label className="block text-xs font-bold text-foreground mb-1">
              বর্তমান পাঠ বা বিষয়বস্তু (Current Chapter / Subject)
            </label>
            <input
              type="text"
              placeholder="e.g., অধ্যায় ৩: সালাতের গুরুত্ব ও একাগ্রতা"
              value={formData.currentChapter}
              onChange={(e) => setFormData({ ...formData, currentChapter: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
            />
          </div>

          {/* Direct Banner Image Upload */}
          <FileUploadDropzone
            type="image"
            value={formData.bannerImage}
            onChange={(url) => setFormData({ ...formData, bannerImage: url })}
            onUpload={EventService.uploadBanner}
            label="ইভেন্ট ব্যানার (Banner Image)"
            helperText="সরাসরি ছবি আপলোড করুন অথবা পূর্বে সংরক্ষিত ব্যানার পরিবর্তন করুন"
          />

          {/* Feedback Permissions Option (Open Feedback toggle) */}
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-50/40 dark:bg-emerald-950/20 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-emerald-600" />
                <div>
                  <p className="text-xs font-bold text-foreground">
                    উপস্থিতি ব্যতিরেকেই সরাসরি ফিডব্যাক উন্মুক্ত রাখুন
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    সক্রিয় থাকলে যেকোনো ব্যবহারকারী হাজিরা রেকর্ড ছাড়াও এই ইভেন্টে মতামত ও রেটিং দিতে পারবেন
                  </p>
                </div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.allowOpenFeedback}
                  onChange={(e) =>
                    setFormData({ ...formData, allowOpenFeedback: e.target.checked })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="p-4 border-t border-border flex items-center justify-end gap-3 bg-muted/20">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-border text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
          >
            বাতিল
          </button>
          <button
            type="submit"
            form="event-form"
            disabled={isSubmitting}
            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm disabled:opacity-60 cursor-pointer"
          >
            {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            <span>{event ? "আপডেট করুন" : "তৈরি করুন"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

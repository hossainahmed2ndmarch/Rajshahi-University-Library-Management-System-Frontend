"use client";

import React, { useState, useEffect } from "react";
import { X, Loader2, Sparkles, Building2, Activity } from "lucide-react";
import { IActivity, ActivityStatus, Organization } from "@/types/event";
import { ActivityService } from "@/services/event.service";
import { CategoryCombobox } from "@/components/ui/CategoryCombobox";
import { FileUploadDropzone } from "@/components/ui/FileUploadDropzone";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ActivityFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  activity: IActivity | null;
  onSuccess: () => void;
}

export function ActivityFormModal({
  isOpen,
  onClose,
  activity,
  onSuccess,
}: ActivityFormModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    org: "RUIL" as Organization,
    category: "",
    description: "",
    bannerImage: "",
    status: "ONGOING" as ActivityStatus,
  });
  const [categories, setCategories] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      ActivityService.getCategories()
        .then((cats) => setCategories(cats))
        .catch(() => {});
    }
  }, [isOpen]);

  useEffect(() => {
    if (activity) {
      setFormData({
        title: activity.title || "",
        org: activity.org || "RUIL",
        category: activity.category || "",
        description: activity.description || "",
        bannerImage: activity.bannerImage || "",
        status: activity.status || "ONGOING",
      });
    } else {
      setFormData({
        title: "",
        org: "RUIL",
        category: "",
        description: "",
        bannerImage: "",
        status: "ONGOING",
      });
    }
  }, [activity, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error("কার্যক্রমের শিরোনাম (Title) আবশ্যক");
      return;
    }

    try {
      setIsSubmitting(true);
      if (activity) {
        await ActivityService.updateActivity(activity.id, {
          title: formData.title,
          org: formData.org,
          category: formData.category || undefined,
          description: formData.description || undefined,
          bannerImage: formData.bannerImage || undefined,
          status: formData.status,
        });
        toast.success("কার্যক্রম সফলভাবে আপডেট করা হয়েছে!");
      } else {
        await ActivityService.createActivity({
          title: formData.title,
          org: formData.org,
          category: formData.category || undefined,
          description: formData.description || undefined,
          bannerImage: formData.bannerImage || undefined,
          status: formData.status,
        });
        toast.success("নতুন কার্যক্রম সফলভাবে তৈরি করা হয়েছে!");
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "কার্যক্রম সংরক্ষণ করতে ব্যর্থ হয়েছে"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const orgOptions: Organization[] = ["RUIL", "RUDC", "BOTH"];
  const statusOptions: { value: ActivityStatus; label: string; color: string }[] = [
    { value: "ONGOING", label: "Ongoing (চলমান)", color: "emerald" },
    { value: "UPCOMING", label: "Upcoming (আসন্ন)", color: "amber" },
    { value: "COMPLETED", label: "Completed (সম্পন্ন)", color: "slate" },
    { value: "PAUSED", label: "Paused (স্থগিত)", color: "orange" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-card w-full max-w-xl rounded-3xl border border-border shadow-2xl flex flex-col max-h-[90vh] animate-in fade-in-50 zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border bg-muted/20">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">
                {activity ? "কার্যক্রম সম্পাদনা করুন" : "নতুন কার্যক্রম যুক্ত করুন"}
              </h2>
              <p className="text-[11px] text-muted-foreground">
                লাইব্রেরি ও দাওয়াহ সার্কেলের প্রাতিষ্ঠানিক কার্যক্রম
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
          id="activity-form"
          onSubmit={handleSubmit}
          className="p-5 overflow-y-auto space-y-4"
        >
          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-foreground mb-1">
              শিরোনাম (Title) *
            </label>
            <input
              type="text"
              required
              placeholder="e.g., সাপ্তাহিক পাঠচক্র, বার্ষিক বইমেলা ও দাওয়াহ সপ্তাহ"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all shadow-xs"
            />
          </div>

          {/* Organization Pill Selection */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-foreground flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
              <span>সংগঠন (Organization)</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {orgOptions.map((org) => {
                const isSelected = formData.org === org;
                return (
                  <button
                    key={org}
                    type="button"
                    onClick={() => setFormData({ ...formData, org })}
                    className={cn(
                      "py-2 px-3 rounded-xl border text-xs font-semibold transition-all text-center",
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

          {/* Status Modernized Pill Selection */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-foreground flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-muted-foreground" />
              <span>অবস্থা (Status)</span>
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

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-foreground mb-1">
              বিবরণ (Description)
            </label>
            <textarea
              rows={3}
              placeholder="কার্যক্রমের পটভূমি, লক্ষ্য ও উদ্দেশ্য বর্ণনা করুন..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3.5 py-2 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none transition-all shadow-xs"
            />
          </div>

          {/* Direct Banner Image Upload */}
          <FileUploadDropzone
            type="image"
            value={formData.bannerImage}
            onChange={(url) => setFormData({ ...formData, bannerImage: url })}
            onUpload={ActivityService.uploadBanner}
            label="ব্যানার ছবি (Banner Image)"
            helperText="সরাসরি ছবি আপলোড করুন অথবা পূর্বে সংরক্ষিত ব্যানার পরিবর্তন করুন"
          />
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
            form="activity-form"
            disabled={isSubmitting}
            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm disabled:opacity-60 cursor-pointer"
          >
            {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            <span>{activity ? "আপডেট করুন" : "তৈরি করুন"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

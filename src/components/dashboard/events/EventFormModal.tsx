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
  BookOpen,
  Trash2,
  Plus,
  ArrowUp,
  ArrowDown,
  Users,
  Copy,
  FileText,
  AlertCircle,
} from "lucide-react";
import {
  IEvent,
  IActivity,
  EventStatus,
  Organization,
  ICampaignConfig,
  ICampaignFormField,
  IEventSpeaker,
} from "@/types/event";
import { EventService, ActivityService } from "@/services/event.service";
import { BookService } from "@/services/book.service";
import { IBook } from "@/types/book";
import { CategoryCombobox } from "@/components/ui/CategoryCombobox";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { FileUploadDropzone } from "@/components/ui/FileUploadDropzone";
import { PRESET_CAMPAIGN_TEMPLATES } from "@/lib/campaignTemplates";
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
  const [booksList, setBooksList] = useState<IBook[]>([]);
  const [allEvents, setAllEvents] = useState<IEvent[]>([]);
  const [selectedBookIds, setSelectedBookIds] = useState<number[]>([]);

  // Speakers / আলোচকবৃন্দ list
  const [speakers, setSpeakers] = useState<IEventSpeaker[]>([]);

  // Google Forms-like Campaign Configuration
  const [campaignConfig, setCampaignConfig] = useState<ICampaignConfig>({
    enabled: false,
    title: "",
    description: "",
    rules: [],
    fields: [],
  });

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
    allowComments: true,
    allowOpenFeedback: false,
    campaignType: "NONE",
    trainer: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      Promise.all([
        ActivityService.getAllActivities({ limit: 100 }),
        EventService.getCategories(),
        BookService.getAllBooks({ limit: 100 }),
        EventService.getAllEvents({ limit: 100 }),
      ])
        .then(([actRes, cats, booksRes, eventsRes]) => {
          setActivities(actRes.data);
          setCategories(cats);
          setBooksList(booksRes.data || []);
          setAllEvents(eventsRes.data || []);
        })
        .catch(() => {});
    }
  }, [isOpen]);

  useEffect(() => {
    if (event) {
      const meta = (event.metadata as any) || {};
      setSelectedBookIds(
        event.books?.map((b) => b.id) || (event as any).bookIds || []
      );

      // Load speakers
      if (Array.isArray(meta.speakers)) {
        setSpeakers(meta.speakers);
      } else {
        setSpeakers([]);
      }

      // Load campaign config
      if (meta.campaign && typeof meta.campaign === "object") {
        setCampaignConfig({
          enabled: Boolean(meta.campaign.enabled),
          title: meta.campaign.title || "",
          description: meta.campaign.description || "",
          rules: Array.isArray(meta.campaign.rules) ? meta.campaign.rules : [],
          fields: Array.isArray(meta.campaign.fields) ? meta.campaign.fields : [],
        });
      } else if (meta.campaignType && meta.campaignType !== "NONE") {
        // Fallback for legacy campaign
        const isJummah = meta.campaignType === "JUMMAH";
        const matchedTpl = PRESET_CAMPAIGN_TEMPLATES.find(
          (t) => t.id === (isJummah ? "jummah_khutba" : "general_survey")
        );
        if (matchedTpl) {
          setCampaignConfig({
            ...matchedTpl.config,
            enabled: meta.campaignEnabled !== false,
          });
        }
      } else {
        setCampaignConfig({
          enabled: false,
          title: "",
          description: "",
          rules: [],
          fields: [],
        });
      }

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
        allowComments: meta.allowComments !== false,
        allowOpenFeedback: Boolean(
          meta.allowOpenFeedback || meta.allowFeedbackWithoutAttendance
        ),
        campaignType: meta.campaignType || "NONE",
        trainer: meta.trainer || meta.speaker || "",
      });
    } else {
      setSelectedBookIds([]);
      setSpeakers([]);
      setCampaignConfig({
        enabled: false,
        title: "",
        description: "",
        rules: [],
        fields: [],
      });
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
        allowComments: true,
        allowOpenFeedback: false,
        campaignType: "NONE",
        trainer: "",
      });
    }
  }, [event, isOpen]);

  // Campaign Form Actions
  const handleApplyPresetTemplate = (templateId: string) => {
    const template = PRESET_CAMPAIGN_TEMPLATES.find((t) => t.id === templateId);
    if (!template) return;
    setCampaignConfig({
      ...template.config,
      enabled: true,
    });
    setFormData((prev) => ({
      ...prev,
      campaignType: template.id === "jummah_khutba" ? "JUMMAH" : "CAMPAIGN",
    }));
    toast.success(`"${template.name}" টেমপ্লেটটি প্রয়োগ করা হয়েছে!`);
  };

  const handleCopyFromEvent = (sourceEventId: number) => {
    const sourceEv = allEvents.find((e) => e.id === sourceEventId);
    if (!sourceEv) return;
    const meta = (sourceEv.metadata as any) || {};
    if (meta.campaign && Array.isArray(meta.campaign.fields)) {
      setCampaignConfig({
        enabled: true,
        title: meta.campaign.title || sourceEv.title,
        description: meta.campaign.description || "",
        rules: Array.isArray(meta.campaign.rules) ? meta.campaign.rules : [],
        fields: JSON.parse(JSON.stringify(meta.campaign.fields)),
      });
      toast.success(`"${sourceEv.title}" থেকে ফর্ম কপি করা হয়েছে!`);
    } else {
      toast.error("এই ইভেন্টে কোনো কাস্টম ক্যাম্পেইন ফর্ম পাওয়া যায়নি!");
    }
  };

  const handleAddCampaignField = () => {
    const newField: ICampaignFormField = {
      id: `fld_${Date.now()}`,
      label: "নতুন প্রশ্নের নাম",
      type: "text",
      placeholder: "এখানে লিখুন...",
      required: true,
    };
    setCampaignConfig((prev) => ({
      ...prev,
      fields: [...prev.fields, newField],
    }));
  };

  const handleUpdateCampaignField = (
    index: number,
    fieldUpdates: Partial<ICampaignFormField>
  ) => {
    setCampaignConfig((prev) => {
      const nextFields = [...prev.fields];
      nextFields[index] = { ...nextFields[index], ...fieldUpdates };
      return { ...prev, fields: nextFields };
    });
  };

  const handleRemoveCampaignField = (index: number) => {
    setCampaignConfig((prev) => {
      const nextFields = prev.fields.filter((_, i) => i !== index);
      return { ...prev, fields: nextFields };
    });
  };

  const handleMoveCampaignField = (index: number, direction: "up" | "down") => {
    setCampaignConfig((prev) => {
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= prev.fields.length) return prev;
      const nextFields = [...prev.fields];
      const temp = nextFields[index];
      nextFields[index] = nextFields[targetIndex];
      nextFields[targetIndex] = temp;
      return { ...prev, fields: nextFields };
    });
  };

  const handleDeleteCampaignForm = () => {
    if (!confirm("আপনি কি নিশ্চিত যে এই ইভেন্ট থেকে ক্যাম্পেইন ফর্মটি পুরোপুরি মুছে ফেলতে চান?")) {
      return;
    }
    setCampaignConfig({
      enabled: false,
      title: "",
      description: "",
      rules: [],
      fields: [],
    });
    setFormData((prev) => ({ ...prev, campaignType: "NONE" }));
    toast.success("ক্যাম্পেইন ফর্ম ডিলিট ও রিসেট করা হয়েছে!");
  };

  // Speakers Actions
  const handleAddSpeaker = () => {
    const newSpeaker: IEventSpeaker = {
      id: `spk_${Date.now()}`,
      name: "",
      designation: "",
      topic: "",
      imageUrl: "",
    };
    setSpeakers((prev) => [...prev, newSpeaker]);
  };

  const handleUpdateSpeaker = (
    index: number,
    updates: Partial<IEventSpeaker>
  ) => {
    setSpeakers((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], ...updates };
      return next;
    });
  };

  const handleRemoveSpeaker = (index: number) => {
    setSpeakers((prev) => prev.filter((_, i) => i !== index));
    toast.info("আলোচক মুছে ফেলা হয়েছে");
  };

  const handleClearAllMetadata = () => {
    if (!confirm("আপনি কি নিশ্চিত যে সকল আলোচক ও মেটাডাটা মুছে ফেলতে চান?")) {
      return;
    }
    setSpeakers([]);
    setFormData((prev) => ({ ...prev, trainer: "" }));
    toast.success("সকল আলোচক ও মেটাডাটা মুছে ফেলা হয়েছে!");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error("ইভেন্টের শিরোনাম আবশ্যক");
      return;
    }

    try {
      setIsSubmitting(true);
      const existingMeta = (event?.metadata as any) || {};

      // Prepare clean speakers array (filtering out empty names)
      const validSpeakers = speakers.filter((s) => s.name.trim() !== "");

      // Prepare clean campaign config
      const cleanCampaignConfig: ICampaignConfig = {
        enabled: campaignConfig.enabled,
        title: campaignConfig.title.trim() || formData.title,
        description: campaignConfig.description?.trim() || "",
        rules: campaignConfig.rules || [],
        fields: campaignConfig.fields.map((f, idx) => ({
          ...f,
          id: f.id || `fld_${idx + 1}`,
          label: f.label.trim() || `প্রশ্ন #${idx + 1}`,
        })),
      };

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
        bookIds: selectedBookIds,
        isActive: formData.isActive,
        metadata: {
          ...existingMeta,
          allowComments: formData.allowComments,
          allowOpenFeedback: formData.allowOpenFeedback,
          allowFeedbackWithoutAttendance: formData.allowOpenFeedback,
          campaignType: campaignConfig.enabled
            ? formData.campaignType !== "NONE"
              ? formData.campaignType
              : "CAMPAIGN"
            : "NONE",
          campaign: cleanCampaignConfig,
          speakers: validSpeakers,
          trainer:
            validSpeakers.length > 0
              ? validSpeakers[0].name
              : formData.trainer.trim() || undefined,
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

  // Filter events that have campaign forms
  const eventsWithCampaign = allEvents.filter((ev) => {
    if (ev.id === event?.id) return false;
    const meta = (ev.metadata as any) || {};
    return meta.campaign && Array.isArray(meta.campaign.fields) && meta.campaign.fields.length > 0;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-card w-full max-w-3xl rounded-3xl border border-border shadow-2xl flex flex-col max-h-[92vh] animate-in fade-in-50 zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border bg-muted/20">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <CalendarDays className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">
                {event ? "ইভেন্ট ও ক্যাম্পেইন সম্পাদনা" : "নতুন ইভেন্ট ও ক্যাম্পেইন তৈরি"}
              </h2>
              <p className="text-[11px] text-muted-foreground">
                গুগল ফর্মের মতো কাস্টম ফিল্ড, আলোচকবৃন্দ ও মেটাডাটা সম্পূর্ণ নিয়ন্ত্রণ করুন
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
          className="p-5 overflow-y-auto space-y-5"
        >
          {/* Section 1: Basic Information */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-600 flex items-center gap-1.5 border-b border-border pb-1.5">
              <CalendarDays className="h-4 w-4" />
              <span>১. মৌলিক তথ্য (Basic Info)</span>
            </h3>

            {/* Title */}
            <div>
              <label className="block text-xs font-bold text-foreground mb-1">
                ইভেন্টের শিরোনাম (Title) *
              </label>
              <input
                type="text"
                required
                placeholder="যেমন: জুমুআ পাঠচক্র - পর্ব ১, বিশেষ সাহিত্য আড্ডা"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
              />
            </div>

            {/* Activity Selector & Organization */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-foreground mb-1">
                  মূল অ্যাক্টিভিটি (Parent Activity)
                </label>
                <SearchableSelect
                  value={
                    formData.activityId
                      ? (() => {
                          const act = activities.find(
                            (a) => String(a.id) === String(formData.activityId)
                          );
                          return act ? `${act.title} (${act.org})` : "";
                        })()
                      : ""
                  }
                  onChange={(val) => {
                    if (!val) {
                      setFormData({ ...formData, activityId: "" });
                      return;
                    }
                    const found = activities.find(
                      (a) => `${a.title} (${a.org})` === val
                    );
                    if (found) {
                      setFormData({
                        ...formData,
                        activityId: found.id,
                        org: found.org,
                      });
                    }
                  }}
                  options={activities.map((a) => `${a.title} (${a.org})`)}
                  placeholder="অ্যাক্টিভিটি বাছাই করুন..."
                  listLabel="নির্ধারিত অ্যাক্টিভিটি"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1">
                  সংস্থা (Organization)
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
                          "py-2 px-2 rounded-xl border text-xs font-semibold transition-all text-center cursor-pointer",
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

            {/* Status Selection */}
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
                        "py-2 px-2.5 rounded-xl border text-[11px] font-semibold transition-all text-center cursor-pointer",
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
              placeholder="ক্যাটাগরি নির্ধারণ করুন..."
            />

            {/* Schedule & Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-foreground mb-1">
                  সময়সূচি (Schedule Text)
                </label>
                <input
                  type="text"
                  placeholder="যেমন: প্রতি শুক্রবার সকাল ৯:০০ টা"
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
                  placeholder="যেমন: কেন্দ্রীয় জামে মসজিদ লাইব্রেরি কক্ষ"
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

            {/* Books Connection */}
            <div className="space-y-2 border border-border/80 rounded-2xl p-4 bg-muted/20">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <BookOpen className="h-4 w-4 text-emerald-600" />
                  <span>ইভেন্টের সাথে সংযুক্ত বইসমূহ (Connected Books)</span>
                </label>
                <span className="text-[11px] text-muted-foreground font-mono">
                  {selectedBookIds.length} টি বই যুক্ত
                </span>
              </div>

              <SearchableSelect
                value=""
                onChange={(val) => {
                  if (!val) return;
                  const found = booksList.find((b) => `${b.title} - ${b.author}` === val);
                  if (found && !selectedBookIds.includes(Number(found.id))) {
                    setSelectedBookIds([...selectedBookIds, Number(found.id)]);
                  }
                }}
                options={booksList
                  .filter((b) => !selectedBookIds.includes(Number(b.id)))
                  .map((b) => `${b.title} - ${b.author}`)}
                placeholder="+ বই অনুসন্ধান করে যুক্ত করুন..."
                listLabel="লাইব্রেরির বইসমূহ"
              />

              {selectedBookIds.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                  {selectedBookIds.map((id) => {
                    const book = booksList.find((b) => Number(b.id) === id);
                    return (
                      <div
                        key={id}
                        className="flex items-center justify-between p-2 rounded-xl bg-background border border-border text-xs gap-2 shadow-2xs"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          {book?.coverImage ? (
                            <img
                              src={book.coverImage}
                              alt={book.title}
                              className="h-8 w-6 rounded object-cover shrink-0"
                            />
                          ) : (
                            <div className="h-8 w-6 rounded bg-emerald-600/10 text-emerald-600 flex items-center justify-center font-bold text-[9px] shrink-0">
                              <BookOpen className="h-3 w-3" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-bold text-foreground truncate">
                              {book?.title || `বই #${id}`}
                            </p>
                            <p className="text-[10px] text-muted-foreground truncate">
                              {book?.author || "লেখক অজ্ঞাত"}
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            setSelectedBookIds(selectedBookIds.filter((bId) => bId !== id))
                          }
                          className="p-1 rounded-lg text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition-colors shrink-0 cursor-pointer"
                          title="বই বাদ দিন"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Current Chapter */}
            <div>
              <label className="block text-xs font-bold text-foreground mb-1">
                বর্তমান পাঠ বা বিষয়বস্তু (Current Chapter / Subject)
              </label>
              <input
                type="text"
                placeholder="যেমন: অধ্যায় ৩: অন্তরের ব্যাধি ও তার নিরাময়"
                value={formData.currentChapter}
                onChange={(e) => setFormData({ ...formData, currentChapter: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
              />
            </div>

            {/* Banner Image Upload */}
            <FileUploadDropzone
              type="image"
              value={formData.bannerImage}
              onChange={(url) => setFormData({ ...formData, bannerImage: url })}
              onUpload={EventService.uploadBanner}
              label="ইভেন্ট ব্যানার (Banner Image)"
              helperText="সরাসরি ছবি আপলোড করুন অথবা পূর্বে সংরক্ষিত ব্যানার পরিবর্তন করুন"
            />
          </div>

          {/* Section 2: Google Forms-like Campaign Form Builder */}
          <div className="space-y-4 border-2 border-emerald-500/30 rounded-3xl p-5 bg-gradient-to-b from-emerald-500/5 to-transparent">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
              <div>
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-emerald-600" />
                  <span>২. গুগল ফর্ম স্টাইল ক্যাম্পেইন বিল্ডার (Campaign Form Builder)</span>
                </h3>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  ইউজার ও নন-ইউজারদের কাছ থেকে কাস্টমাইজড প্রশ্ন ও লেখা সংগ্রহের জন্য ফর্ম তৈরি করুন
                </p>
              </div>

              {/* Master Campaign Toggle */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-foreground">
                  {campaignConfig.enabled ? "ক্যাম্পেইন সক্রিয়" : "ক্যাম্পেইন বন্ধ"}
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={campaignConfig.enabled}
                    onChange={(e) =>
                      setCampaignConfig((prev) => ({ ...prev, enabled: e.target.checked }))
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>
            </div>

            {campaignConfig.enabled && (
              <div className="space-y-4 animate-in fade-in-50">
                {/* Preexisting Templates & Reusability */}
                <div className="rounded-2xl bg-background border border-border p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <Copy className="h-3.5 w-3.5 text-emerald-600" />
                      <span>প্রস্তুতকৃত ফর্ম টেমপ্লেট বেছে নিন (Preexisting Templates)</span>
                    </span>
                    <span className="text-[10px] text-muted-foreground">ফুল ফ্লেক্সিবিলিটি</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {PRESET_CAMPAIGN_TEMPLATES.map((tpl) => (
                      <button
                        key={tpl.id}
                        type="button"
                        onClick={() => handleApplyPresetTemplate(tpl.id)}
                        className="p-2.5 rounded-xl border border-border hover:border-emerald-500/50 bg-muted/20 hover:bg-emerald-500/5 text-left transition-all group cursor-pointer"
                      >
                        <p className="text-xs font-bold text-foreground group-hover:text-emerald-600 transition-colors">
                          {tpl.name}
                        </p>
                        <p className="text-[10px] text-muted-foreground line-clamp-1 mt-0.5">
                          {tpl.description}
                        </p>
                      </button>
                    ))}
                  </div>

                  {/* Copy from another existing event */}
                  {eventsWithCampaign.length > 0 && (
                    <div className="pt-2 border-t border-border/60">
                      <label className="block text-[11px] font-bold text-muted-foreground mb-1">
                        অন্য কোনো ইভেন্ট থেকে ফর্ম কপি করুন:
                      </label>
                      <select
                        defaultValue=""
                        onChange={(e) => {
                          if (e.target.value) {
                            handleCopyFromEvent(Number(e.target.value));
                            e.target.value = "";
                          }
                        }}
                        className="w-full px-3 py-2 bg-muted/30 border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      >
                        <option value="">-- পূর্বের ইভেন্ট নির্বাচন করুন --</option>
                        {eventsWithCampaign.map((ev) => (
                          <option key={ev.id} value={ev.id}>
                            {ev.title} ({(ev.metadata as any)?.campaign?.fields?.length || 0} টি ফিল্ড)
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* Campaign Title & Description */}
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1">
                      ক্যাম্পেইনের নাম / শিরোনাম *
                    </label>
                    <input
                      type="text"
                      placeholder="যেমন: জুমুআ খুতবা নোট ও শিক্ষণীয় পয়েন্ট ক্যাম্পেইন"
                      value={campaignConfig.title}
                      onChange={(e) =>
                        setCampaignConfig((prev) => ({ ...prev, title: e.target.value }))
                      }
                      className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1">
                      ক্যাম্পেইনের বিবরণ ও নির্দেশনা (Description)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="অংশগ্রহণকারীদের জন্য নিয়ম ও দিকনির্দেশনা সংক্ষেপে লিখুন..."
                      value={campaignConfig.description || ""}
                      onChange={(e) =>
                        setCampaignConfig((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs resize-none"
                    />
                  </div>
                </div>

                {/* Dynamic Form Fields List */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-border/80 pb-2">
                    <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <FileText className="h-4 w-4 text-emerald-600" />
                      <span>ফর্মের ফিল্ডসমূহ ({campaignConfig.fields.length} টি)</span>
                    </span>
                    <button
                      type="button"
                      onClick={handleAddCampaignField}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>+ ফিল্ড যোগ করুন</span>
                    </button>
                  </div>

                  {campaignConfig.fields.length === 0 ? (
                    <div className="p-6 text-center border border-dashed border-border rounded-2xl bg-muted/10">
                      <p className="text-xs text-muted-foreground">
                        বর্তমানে কোনো কাস্টম ফিল্ড নেই। উপরের টেমপ্লেট বেছে নিন অথবা &quot;ফিল্ড যোগ করুন&quot; চাপুন।
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {campaignConfig.fields.map((field, idx) => (
                        <div
                          key={field.id || idx}
                          className="p-4 rounded-2xl bg-background border border-border space-y-3 shadow-xs"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-2">
                            <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                              <span className="h-5 w-5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 flex items-center justify-center text-[10px]">
                                {idx + 1}
                              </span>
                              <span>ফিল্ড #{idx + 1}</span>
                            </span>

                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                disabled={idx === 0}
                                onClick={() => handleMoveCampaignField(idx, "up")}
                                className="p-1 rounded-lg text-muted-foreground hover:bg-muted disabled:opacity-30 cursor-pointer"
                                title="উপরে নিন"
                              >
                                <ArrowUp className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                disabled={idx === campaignConfig.fields.length - 1}
                                onClick={() => handleMoveCampaignField(idx, "down")}
                                className="p-1 rounded-lg text-muted-foreground hover:bg-muted disabled:opacity-30 cursor-pointer"
                                title="নিচে নিন"
                              >
                                <ArrowDown className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemoveCampaignField(idx)}
                                className="p-1 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                                title="ফিল্ডটি মুছুন"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="sm:col-span-2">
                              <label className="block text-[11px] font-bold text-muted-foreground mb-1">
                                প্রশ্নের শিরোনাম / লেবেল (Label) *
                              </label>
                              <input
                                type="text"
                                value={field.label}
                                onChange={(e) =>
                                  handleUpdateCampaignField(idx, { label: e.target.value })
                                }
                                placeholder="যেমন: আপনার খুতবার মূল বিষয় বা বার্তা"
                                className="w-full px-3 py-2 bg-muted/20 border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500"
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] font-bold text-muted-foreground mb-1">
                                ফিল্ডের ধরণ (Type)
                              </label>
                              <select
                                value={field.type}
                                onChange={(e) =>
                                  handleUpdateCampaignField(idx, {
                                    type: e.target.value as any,
                                  })
                                }
                                className="w-full px-3 py-2 bg-muted/20 border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500"
                              >
                                <option value="text">এক লাইনের টেক্সট (Short Text)</option>
                                <option value="textarea">প্যারাগ্রাফ / বিস্তারিত (Textarea)</option>
                                <option value="number">সংখ্যা (Number)</option>
                                <option value="select">ড্রপডাউন মেনু (Select)</option>
                                <option value="radio">একক পছন্দ (Radio Button)</option>
                                <option value="checkbox">একাধিক পছন্দ (Checkbox)</option>
                                <option value="rating">রেটিং স্টার (Rating 1-5)</option>
                              </select>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[11px] font-bold text-muted-foreground mb-1">
                                প্লেসহোল্ডার টেক্সট (Placeholder)
                              </label>
                              <input
                                type="text"
                                value={field.placeholder || ""}
                                onChange={(e) =>
                                  handleUpdateCampaignField(idx, {
                                    placeholder: e.target.value,
                                  })
                                }
                                placeholder="যেমন: সংক্ষেপে লিখুন..."
                                className="w-full px-3 py-2 bg-muted/20 border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500"
                              />
                            </div>

                            <div className="flex items-center justify-between sm:justify-end gap-3 pt-4 sm:pt-6">
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={field.required ?? true}
                                  onChange={(e) =>
                                    handleUpdateCampaignField(idx, {
                                      required: e.target.checked,
                                    })
                                  }
                                  className="h-4 w-4 rounded border-border text-emerald-600 focus:ring-emerald-500"
                                />
                                <span className="text-xs font-bold text-foreground">
                                  উত্তর দেওয়া আবশ্যক (Required)
                                </span>
                              </label>
                            </div>
                          </div>

                          {/* Options editor for select, radio, checkbox */}
                          {(field.type === "select" ||
                            field.type === "radio" ||
                            field.type === "checkbox") && (
                            <div className="pt-2 border-t border-border/50 space-y-2">
                              <label className="block text-[11px] font-bold text-muted-foreground">
                                অপশনসমূহ (কমা দিয়ে আলাদা করুন অথবা নতুন লিখুন):
                              </label>
                              <input
                                type="text"
                                value={(field.options || []).join(", ")}
                                onChange={(e) =>
                                  handleUpdateCampaignField(idx, {
                                    options: e.target.value
                                      .split(",")
                                      .map((s) => s.trim())
                                      .filter(Boolean),
                                  })
                                }
                                placeholder="যেমন: হ্যাঁ, না, নিশ্চিত নয়"
                                className="w-full px-3 py-2 bg-muted/20 border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500"
                              />
                              <p className="text-[10px] text-muted-foreground">
                                প্রতিটি অপশনের মাঝে কমা (,) দিন
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Delete Campaign Form Button */}
                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={handleDeleteCampaignForm}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-500/30 text-rose-500 hover:bg-rose-500/10 text-xs font-bold transition-all cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>ক্যাম্পেইন ফর্ম ডিলিট / রিসেট করুন</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Section 3: Event Metadata - Speakers / আলোচকবৃন্দ Builder */}
          <div className="space-y-4 border-2 border-amber-500/30 rounded-3xl p-5 bg-gradient-to-b from-amber-500/5 to-transparent">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
              <div>
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Users className="h-4 w-4 text-amber-500" />
                  <span>৩. ইভেন্ট মেটাডাটা ও আলোচকবৃন্দ (Speakers & Discussants)</span>
                </h3>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  আমন্ত্রিত একাধিক আলোচকের নাম, পদবী, আলোচনার বিষয় ও ছবি আপলোড করে সাজান
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleAddSpeaker}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>+ আলোচক যোগ করুন</span>
                </button>
              </div>
            </div>

            {speakers.length === 0 ? (
              <div className="p-6 text-center border border-dashed border-border rounded-2xl bg-muted/10 space-y-2">
                <p className="text-xs text-muted-foreground">
                  বর্তমানে কোনো নির্দিষ্ট আলোচক যুক্ত নেই।
                </p>
                <button
                  type="button"
                  onClick={handleAddSpeaker}
                  className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 hover:underline cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>নতুন আলোচক যোগ করুন</span>
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {speakers.map((spk, sIdx) => (
                  <div
                    key={spk.id || sIdx}
                    className="p-4 rounded-2xl bg-background border border-border space-y-3 shadow-xs"
                  >
                    <div className="flex items-center justify-between border-b border-border/60 pb-2">
                      <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5 text-amber-500" />
                        <span>আলোচক #{sIdx + 1}</span>
                      </span>

                      <button
                        type="button"
                        onClick={() => handleRemoveSpeaker(sIdx)}
                        className="p-1 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                        title="এই আলোচক মুছুন"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-muted-foreground mb-1">
                          আলোচকের নাম *
                        </label>
                        <input
                          type="text"
                          value={spk.name}
                          onChange={(e) =>
                            handleUpdateSpeaker(sIdx, { name: e.target.value })
                          }
                          placeholder="যেমন: শাইখ ড. মুহাম্মদ সাইফুল্লাহ"
                          className="w-full px-3 py-2 bg-muted/20 border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-muted-foreground mb-1">
                          নির্দিষ্ট পদবী / প্রতিষ্ঠান *
                        </label>
                        <input
                          type="text"
                          value={spk.designation}
                          onChange={(e) =>
                            handleUpdateSpeaker(sIdx, { designation: e.target.value })
                          }
                          placeholder="যেমন: সহযোগী অধ্যাপক, ইসলামিক স্টাডিজ বিভাগ, রাবি"
                          className="w-full px-3 py-2 bg-muted/20 border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-muted-foreground mb-1">
                        আলোচনার নির্দিষ্ট বিষয় (Topic of Discussion)
                      </label>
                      <input
                        type="text"
                        value={spk.topic || ""}
                        onChange={(e) =>
                          handleUpdateSpeaker(sIdx, { topic: e.target.value })
                        }
                        placeholder="যেমন: পবিত্র কুরআন ও আধুনিক যুগে জীবনগঠনের মূলসূত্র"
                        className="w-full px-3 py-2 bg-muted/20 border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>

                    {/* Speaker Image Dropzone */}
                    <div>
                      <FileUploadDropzone
                        type="image"
                        value={spk.imageUrl || ""}
                        onChange={(url) =>
                          handleUpdateSpeaker(sIdx, { imageUrl: url })
                        }
                        onUpload={EventService.uploadBanner}
                        label="আলোচকের ছবি (Speaker Image Upload)"
                        helperText="আলোচকের পাসপোর্ট সাইজ বা পোর্ট্রেট ছবি আপলোড করুন"
                      />
                    </div>
                  </div>
                ))}

                {/* Reset all metadata and speakers */}
                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={handleClearAllMetadata}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-500/30 text-rose-500 hover:bg-rose-500/10 text-xs font-bold transition-all cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>সকল আলোচক ও মেটাডাটা মুছুন / রিসেট</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Section 4: Comments & Feedback Permissions */}
          <div className="space-y-3 border border-border/80 rounded-3xl p-5 bg-muted/20">
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5 border-b border-border/60 pb-2">
              <MessageSquare className="h-4 w-4 text-emerald-600" />
              <span>৪. মন্তব্য ও ফিডব্যাক নিয়ন্ত্রণ (Comments & Feedback Controls)</span>
            </h3>

            {/* Enable Comments toggle */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-background border border-border">
              <div>
                <p className="text-xs font-bold text-foreground">
                  সাধারণ মন্তব্য / ফিডব্যাক অপশন চালু রাখুন
                </p>
                <p className="text-[11px] text-muted-foreground">
                  বন্ধ রাখলে ইভেন্ট পেজে কোনো মন্তব্য বা ফিডব্যাক সেকশন দেখাবে না
                </p>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.allowComments}
                  onChange={(e) =>
                    setFormData({ ...formData, allowComments: e.target.checked })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>

            {/* Open Feedback toggle */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-background border border-border">
              <div>
                <p className="text-xs font-bold text-foreground">
                  উপস্থিতি যাচাই ছাড়াই সরাসরি ওপেন ফিডব্যাক উন্মুক্ত রাখুন
                </p>
                <p className="text-[11px] text-muted-foreground">
                  সক্রিয় থাকলে অ্যাডমিন কর্তৃক উপস্থিতি রেকর্ড না থাকলেও সাধারণ লগইন করা ইউজাররা মন্তব্য দিতে পারবেন
                </p>
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
            <span>{event ? "আপডেট সংরক্ষণ করুন" : "ইভেন্ট তৈরি করুন"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

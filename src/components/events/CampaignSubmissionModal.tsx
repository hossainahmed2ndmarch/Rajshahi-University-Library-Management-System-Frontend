"use client";

import React, { useState } from "react";
import {
  X,
  Sparkles,
  Send,
  Loader2,
  User,
  Phone,
  Building,
  GraduationCap,
  MapPin,
  BookOpen,
  MessageSquare,
  Star,
  CheckCircle2,
} from "lucide-react";
import { IEvent } from "@/types/event";
import { EventMemberRecordService } from "@/services/event.service";
import { useGetMe } from "@/hooks/useAuth";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface CampaignSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: IEvent;
  onSuccess?: () => void;
}

export function CampaignSubmissionModal({
  isOpen,
  onClose,
  event,
  onSuccess,
}: CampaignSubmissionModalProps) {
  const { data: user } = useGetMe();

  // Guest details (only used if !user)
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [contactMethod, setContactMethod] = useState("");
  const [institution, setInstitution] = useState("");
  const [subject, setSubject] = useState("");
  const [previousPlatform, setPreviousPlatform] = useState("");
  const [writingInterest, setWritingInterest] = useState("");

  // Campaign specific details
  const [title, setTitle] = useState("");
  const [masjidName, setMasjidName] = useState("");
  const [khutbaTopic, setKhutbaTopic] = useState("");
  const [khutbaLesson, setKhutbaLesson] = useState("");
  const [story, setStory] = useState("");
  const [rating, setRating] = useState<number>(5);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const eventMetadata = (event.metadata as Record<string, any>) || {};
  const campaignType = eventMetadata.campaignType || "CAMPAIGN";
  const isJummahCampaign =
    campaignType === "JUMMAH" ||
    event.title.toLowerCase().includes("জুমুআ") ||
    event.title.toLowerCase().includes("jumma");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      if (!name.trim()) {
        toast.error("অনুগ্রহ করে আপনার নাম লিখুন");
        return;
      }
      if (!phone.trim()) {
        toast.error("অনুগ্রহ করে মোবাইল নম্বর প্রদান করুন");
        return;
      }
      if (!institution.trim()) {
        toast.error("প্রতিষ্ঠান বা শিক্ষা প্রতিষ্ঠানের নাম আবশ্যক");
        return;
      }
    }

    if (!story.trim() && !khutbaLesson.trim()) {
      toast.error("অনুগ্রহ করে আপনার লেখা বা শিক্ষণীয় বক্তব্য লিখুন");
      return;
    }

    try {
      setIsSubmitting(true);

      const submissionData: Record<string, any> = {
        name: user ? user.name : name.trim(),
        phone: user ? (user.phone || phone.trim()) : phone.trim(),
        email: user?.email || undefined,
        contactMethod: contactMethod.trim() || undefined,
        institution: institution.trim() || undefined,
        subject: subject.trim() || undefined,
        previousPlatform: previousPlatform.trim() || undefined,
        writingInterest: writingInterest.trim() || undefined,
        title: title.trim() || khutbaTopic.trim() || undefined,
        masjidName: masjidName.trim() || undefined,
        khutbaTopic: khutbaTopic.trim() || undefined,
        khutbaLesson: khutbaLesson.trim() || undefined,
        story: story.trim() || khutbaLesson.trim() || undefined,
        campaignType,
        submittedAt: new Date().toISOString(),
      };

      await EventMemberRecordService.submitCampaign({
        eventId: event.id,
        rating,
        comment: (title.trim() ? `[${title.trim()}] ` : "") + (story.trim() || khutbaLesson.trim()),
        submissionData,
      });

      setIsSuccess(true);
      toast.success("আপনার লেখা সফলভাবে জমা হয়েছে!");
      if (onSuccess) onSuccess();
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "লেখা জমা দিতে ব্যর্থ হয়েছে। পুনরায় চেষ্টা করুন।"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setIsSuccess(false);
    setName("");
    setPhone("");
    setContactMethod("");
    setInstitution("");
    setSubject("");
    setPreviousPlatform("");
    setWritingInterest("");
    setTitle("");
    setMasjidName("");
    setKhutbaTopic("");
    setKhutbaLesson("");
    setStory("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-card w-full max-w-2xl rounded-3xl border border-border shadow-2xl flex flex-col max-h-[92vh] animate-in fade-in-50 zoom-in-95 overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-border bg-emerald-500/10">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-foreground">
                {isJummahCampaign ? "জুমুআ ক্যাম্পেইন প্রতিক্রিয়া" : "ক্যাম্পেইনে অংশ নিন"}
              </h2>
              <p className="text-xs text-muted-foreground line-clamp-1">
                ইভেন্ট: <span className="font-semibold text-foreground">{event.title}</span>
              </p>
            </div>
          </div>
          <button
            onClick={handleResetAndClose}
            className="p-1.5 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        {isSuccess ? (
          <div className="p-8 text-center space-y-4">
            <div className="h-16 w-16 mx-auto rounded-full bg-emerald-500/20 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <h3 className="text-xl font-bold text-foreground">
              জাযাকাল্লাহু খাইরান! আপনার লেখাটি জমা হয়েছে
            </h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
              আপনার মতামত ও শিক্ষণীয় বক্তব্য মডারেশনের জন্য পাঠানো হয়েছে। অ্যাডমিন পর্যালোচনা শেষে সেরা লেখাগুলো (১ম, ২য়, ৩য়) স্বতন্ত্র আর্টিকেল হিসেবে ওয়েবসাইটে প্রকাশিত হতে পারে।
            </p>
            <div className="pt-4">
              <button
                type="button"
                onClick={handleResetAndClose}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
              >
                সম্পন্ন করুন
              </button>
            </div>
          </div>
        ) : (
          <form
            id="campaign-submission-form"
            onSubmit={handleSubmit}
            className="p-6 overflow-y-auto space-y-4 text-xs"
          >
            {/* User status banner */}
            {user ? (
              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-foreground">{user.name}</p>
                    <p className="text-[10px] text-muted-foreground font-mono">{user.email}</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-full">
                  লগইনকৃত সদস্য
                </span>
              </div>
            ) : (
              <div className="rounded-2xl border border-amber-500/30 bg-amber-50/60 dark:bg-amber-950/20 p-4 space-y-3">
                <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold">
                  <User className="h-4 w-4" />
                  <span>নন-ইউজার / শুভাকাঙ্ক্ষী তথ্য (Non-member Information)</span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  যেহেতু আপনি লগইন করেননি, ফলাফল ও স্বীকৃতি জানাতে আপনার যোগাযোগের তথ্য প্রয়োজন।
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-bold text-foreground mb-1">
                      আপনার পূর্ণ নাম *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                      <input
                        type="text"
                        required
                        placeholder="e.g., আবদুল্লাহ আল মামুন"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-foreground mb-1">
                      মোবাইল নম্বর *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                      <input
                        type="tel"
                        required
                        placeholder="01XXXXXXXXX"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-foreground mb-1">
                      প্রতিষ্ঠান / বিশ্ববিদ্যালয় *
                    </label>
                    <div className="relative">
                      <Building className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                      <input
                        type="text"
                        required
                        placeholder="e.g., রাজশাহী বিশ্ববিদ্যালয়"
                        value={institution}
                        onChange={(e) => setInstitution(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-foreground mb-1">
                      বিভাগ / বিষয় (Department / Profession)
                    </label>
                    <div className="relative">
                      <GraduationCap className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="e.g., অর্থনীতি / সমাজবিজ্ঞান / পেশাজীবী"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-foreground mb-1">
                      যোগাযোগের বিকল্প মাধ্যম (ইমেইল / হোয়াটসঅ্যাপ / সোশ্যাল)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., user@example.com বা WhatsApp: 017..."
                      value={contactMethod}
                      onChange={(e) => setContactMethod(e.target.value)}
                      className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-foreground mb-1">
                      পূর্বে কোনো প্ল্যাটফর্মে লেখা জমা দিয়েছেন কিনা?
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., হ্যাঁ, স্থানীয় পত্রিকায় / ফেসবুক ব্লগে / না, প্রথমবার"
                      value={previousPlatform}
                      onChange={(e) => setPreviousPlatform(e.target.value)}
                      className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-foreground mb-1">
                      লেখালেখি নিয়ে কোনো বিশেষ আগ্রহ রয়েছে কি?
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., গল্প, প্রবন্ধ, অনুবাদ, ইসলামি কলাম ইত্যাদি বিষয়ে লেখার আগ্রহ রয়েছে"
                      value={writingInterest}
                      onChange={(e) => setWritingInterest(e.target.value)}
                      className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Campaign Form Inputs */}
            <div className="space-y-3 pt-2">
              {/* Submission Title */}
              <div>
                <label className="block text-[11px] font-bold text-foreground mb-1">
                  লেখার শিরোনাম (Title) *
                </label>
                <div className="relative">
                  <BookOpen className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                  <input
                    type="text"
                    required
                    placeholder="e.g., 'রোযার স্মৃতি নিয়ে কিছু কথা বা অনুভূতি' বা 'খুতবা থেকে প্রাপ্ত অমূল্য শিক্ষা'"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                  />
                </div>
              </div>

              {isJummahCampaign && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-foreground mb-1">
                      মসজিদের নাম ও অবস্থান (খুতবা শুনেছেন যেখান থেকে)
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="e.g., রাবি কেন্দ্রীয় জামে মসজিদ"
                        value={masjidName}
                        onChange={(e) => setMasjidName(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-foreground mb-1">
                      খুতবার মূল বিষয়
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., হালাল রিযিকের গুরুত্ব ও সুদের কুফল"
                      value={khutbaTopic}
                      onChange={(e) => setKhutbaTopic(e.target.value)}
                      className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              )}

              {/* Main Lessons / Story (up to 300 words) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-bold text-foreground">
                    আপনার লেখা / অভিজ্ঞতা / শিক্ষণীয় বিষয় (সর্বোচ্চ ৩০০ শব্দ) *
                  </label>
                  <span className="text-[10px] text-muted-foreground">
                    {story.trim() ? story.trim().split(/\s+/).length : 0} / ৩০০ শব্দ
                  </span>
                </div>
                <textarea
                  rows={5}
                  required
                  placeholder="আপনার রোযার বা ক্যাম্পেইনের অভিজ্ঞতা, শিক্ষণীয় ঘটনা বা অনুভূতি সুন্দরভাবে লিখে প্রকাশ করুন (সর্বোচ্চ ৩০০ শব্দের মধ্যে)..."
                  value={story}
                  onChange={(e) => setStory(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500 leading-relaxed"
                />
              </div>

              {isJummahCampaign && (
                <div>
                  <label className="block text-[11px] font-bold text-foreground mb-1">
                    অতিরিক্ত গুরুত্বপূর্ণ পয়েন্ট বা তথ্য
                  </label>
                  <textarea
                    rows={3}
                    placeholder="অন্যকে উদ্বুদ্ধ করার মতো কিছু তথ্যপূর্ণ পয়েন্ট তুলে ধরুন..."
                    value={khutbaLesson}
                    onChange={(e) => setKhutbaLesson(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500 leading-relaxed"
                  />
                </div>
              )}

              {/* Star Rating */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-muted/40 border border-border">
                <span className="font-bold text-foreground">ইভেন্ট বা ক্যাম্পেইন রেটিং:</span>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1 text-amber-500 hover:scale-110 transition-transform cursor-pointer"
                    >
                      <Star
                        className={cn(
                          "h-4 w-4",
                          star <= rating ? "fill-amber-500 text-amber-500" : "text-muted-foreground"
                        )}
                      />
                    </button>
                  ))}
                  <span className="ml-1 text-xs font-bold text-foreground">{rating}/5</span>
                </div>
              </div>
            </div>
          </form>
        )}

        {/* Modal Footer */}
        {!isSuccess && (
          <div className="p-4 border-t border-border flex items-center justify-end gap-3 bg-muted/20">
            <button
              type="button"
              onClick={handleResetAndClose}
              className="px-4 py-2 rounded-xl border border-border text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
            >
              বাতিল
            </button>
            <button
              type="submit"
              form="campaign-submission-form"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-md disabled:opacity-60 cursor-pointer"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              <span>জমা দিন</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

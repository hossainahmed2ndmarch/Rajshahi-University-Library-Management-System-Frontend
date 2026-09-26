"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Star,
  Check,
  XCircle,
  Clock,
  Loader2,
  Sparkles,
  FileText,
  Building,
  Phone,
  User,
  MapPin,
  BookOpen,
} from "lucide-react";
import { IEvent, IEventMemberRecord } from "@/types/event";
import { EventMemberRecordService } from "@/services/event.service";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface FeedbackManagementTableProps {
  isOpen: boolean;
  onClose: () => void;
  event: IEvent;
  onUpdate: () => void;
}

export function FeedbackManagementTable({
  isOpen,
  onClose,
  event,
  onUpdate,
}: FeedbackManagementTableProps) {
  const [records, setRecords] = useState<IEventMemberRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [approvalFilter, setApprovalFilter] = useState<string>("ALL");
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [publishingId, setPublishingId] = useState<number | null>(null);
  const [publishingRecord, setPublishingRecord] = useState<IEventMemberRecord | null>(null);
  const [publishTitle, setPublishTitle] = useState("");
  const [publishPosition, setPublishPosition] = useState("১ম স্থান বিজয়ী");
  const [publishCategory, setPublishCategory] = useState("ক্যাম্পেইন");

  const fetchRecords = async () => {
    try {
      setIsLoading(true);
      const res = await EventMemberRecordService.getRecordsByEvent(event.id, {
        hasFeedback: true,
        limit: 100,
      });
      setRecords(res.data);
    } catch {
      toast.error("ফিডব্যাক তালিকা লোড করতে ব্যর্থ হয়েছে");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchRecords();
    }
  }, [isOpen, event.id]);

  const handleApprove = async (recordId: number, isApproved: boolean) => {
    try {
      setProcessingId(recordId);
      await EventMemberRecordService.approveFeedback(recordId, isApproved);
      toast.success(
        isApproved
          ? "মতামত অনুমোদিত হয়েছে এবং পাবলিকলি দৃশ্যমান হবে!"
          : "মতামত প্রত্যাখ্যাত/লুকানো হয়েছে!"
      );
      fetchRecords();
      onUpdate();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "স্ট্যাটাস পরিবর্তন ব্যর্থ হয়েছে");
    } finally {
      setProcessingId(null);
    }
  };

  const openPublishModal = (record: IEventMemberRecord) => {
    const subData = (record.submissionData as Record<string, any>) || {};
    const suggestedTitle =
      subData.title ||
      subData.khutbaTopic ||
      subData.topic ||
      `${event.title} - শিক্ষণীয় প্রবন্ধ`;
    setPublishTitle(suggestedTitle);
    setPublishPosition("১ম স্থান বিজয়ী");
    setPublishCategory("ক্যাম্পেইন");
    setPublishingRecord(record);
  };

  const handleConfirmPublish = async () => {
    if (!publishingRecord) return;
    try {
      setPublishingId(publishingRecord.id);
      const subData = (publishingRecord.submissionData as Record<string, any>) || {};
      const baseDesig =
        subData.institution ||
        subData.subject ||
        (publishingRecord.user ? "RUIL সদস্য" : "ক্যাম্পেইন অংশগ্রহণকারী");
      const fullDesignation = publishPosition
        ? `${publishPosition} | ${baseDesig}`
        : baseDesig;

      await EventMemberRecordService.publishRecordAsArticle(publishingRecord.id, {
        title: publishTitle.trim() || `${event.title} - শিক্ষণীয় প্রবন্ধ`,
        authorDesignation: fullDesignation,
        category: publishCategory || "ক্যাম্পেইন",
      });
      toast.success("লেখাটি সফলভাবে নতুন আর্টিকেল হিসেবে প্রকাশ করা হয়েছে!");
      setPublishingRecord(null);
      fetchRecords();
      onUpdate();
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "আর্টিকেল হিসেবে প্রকাশ করতে ব্যর্থ হয়েছে"
      );
    } finally {
      setPublishingId(null);
    }
  };

  const filtered = records.filter((r) => {
    if (approvalFilter === "APPROVED") return r.isApproved;
    if (approvalFilter === "PENDING") return !r.isApproved;
    if (approvalFilter === "CAMPAIGN") return Boolean(r.submissionData);
    return true;
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-card w-full max-w-3xl rounded-3xl border border-border shadow-2xl flex flex-col max-h-[90vh] animate-in fade-in-50 zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div>
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-500" />
              <span>মতামত ও ফিডব্যাক মডারেশন</span>
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

        {/* Filter Pills */}
        <div className="p-4 bg-muted/40 border-b border-border flex items-center justify-between text-xs">
          <div className="inline-flex rounded-xl bg-background p-1 border border-border">
            {[
              { key: "ALL", label: "সকল মতামত" },
              { key: "CAMPAIGN", label: "ক্যাম্পেইন জমা" },
              { key: "PENDING", label: "অনুমোদনের অপেক্ষায়" },
              { key: "APPROVED", label: "অনুমোদিত" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setApprovalFilter(tab.key)}
                className={`px-3 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                  approvalFilter === tab.key
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <span className="text-muted-foreground font-medium">
            মোট ফলাফল: <span className="font-bold text-foreground">{filtered.length}</span> টি
          </span>
        </div>

        {/* Body Content */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1 text-xs">
          {isLoading ? (
            <div className="text-center py-12">
              <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
              <p className="text-xs text-muted-foreground mt-2">মতামত লোড হচ্ছে...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground border border-dashed border-border rounded-2xl">
              কোনো তথ্য বা মতামত পাওয়া যায়নি।
            </div>
          ) : (
            filtered.map((r) => {
              const subData = (r.submissionData as Record<string, any>) || {};
              const isGuest = !r.user;
              const displayName = r.user?.name || subData.name || "অজ্ঞাতনামা শুভাকাঙ্ক্ষী";
              const displayPhone = r.user?.phone || subData.phone;
              const displayEmail = r.user?.email;
              const displayInstitution = subData.institution;
              const displaySubject = subData.subject;
              const hasCampaignData = Boolean(r.submissionData);

              return (
                <div
                  key={r.id}
                  className="p-4 rounded-2xl bg-card border border-border space-y-3 hover:border-emerald-600/30 transition-colors shadow-2xs"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/50 pb-2.5">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={cn(
                          "h-8 w-8 rounded-full font-bold text-xs flex items-center justify-center border",
                          isGuest
                            ? "bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border-amber-500/30"
                            : "bg-emerald-100 dark:bg-emerald-950 text-primary border-emerald-500/30"
                        )}
                      >
                        {displayName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-foreground">{displayName}</p>
                          {isGuest ? (
                            <span className="bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30 px-2 py-0.2 rounded-full text-[9px] font-bold">
                              নন-ইউজার (Guest)
                            </span>
                          ) : (
                            <span className="bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30 px-2 py-0.2 rounded-full text-[9px] font-bold">
                              নিবন্ধিত সদস্য
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-muted-foreground flex flex-wrap items-center gap-2 mt-0.5">
                          {displayEmail && <span>{displayEmail}</span>}
                          {displayPhone && <span>মোবাইল: {displayPhone}</span>}
                          {displayInstitution && <span>• {displayInstitution}</span>}
                          {displaySubject && <span>({displaySubject})</span>}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="bg-muted px-2 py-0.5 rounded-full text-[10px] font-semibold text-muted-foreground">
                        {r.status}
                      </span>
                      {r.isApproved ? (
                        <span className="bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1">
                          <Check className="h-3 w-3" />
                          অনুমোদিত
                        </span>
                      ) : (
                        <span className="bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          অপেক্ষমাণ
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Campaign Specific Details if Present */}
                  {hasCampaignData && (
                    <div className="rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-500/20 p-3 space-y-2">
                      {/* Title if submitted */}
                      {subData.title && (
                        <div className="font-bold text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5 pb-1 border-b border-emerald-500/20">
                          <BookOpen className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                          <span>শিরোনাম: &ldquo;{subData.title}&rdquo;</span>
                        </div>
                      )}

                      <div className="flex flex-wrap items-center gap-3 text-[11px]">
                        {subData.masjidName && (
                          <span className="inline-flex items-center gap-1 text-muted-foreground">
                            <MapPin className="h-3 w-3 text-emerald-600" />
                            মসজিদ: <strong className="text-foreground">{subData.masjidName}</strong>
                          </span>
                        )}
                        {subData.khutbaTopic && (
                          <span className="inline-flex items-center gap-1 text-muted-foreground">
                            <BookOpen className="h-3 w-3 text-emerald-600" />
                            বিষয়: <strong className="text-foreground">{subData.khutbaTopic}</strong>
                          </span>
                        )}
                      </div>

                      {/* Contact & writing profile details */}
                      {(subData.contactMethod || subData.previousPlatform || subData.writingInterest) && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] bg-background/80 p-2.5 rounded-xl border border-border/60">
                          {subData.contactMethod && (
                            <div>
                              <span className="text-muted-foreground font-semibold">যোগাযোগের মাধ্যম: </span>
                              <span className="text-foreground font-medium">{subData.contactMethod}</span>
                            </div>
                          )}
                          {subData.previousPlatform && (
                            <div>
                              <span className="text-muted-foreground font-semibold">পূর্বে লেখার অভিজ্ঞতা: </span>
                              <span className="text-foreground font-medium">{subData.previousPlatform}</span>
                            </div>
                          )}
                          {subData.writingInterest && (
                            <div className="sm:col-span-2">
                              <span className="text-muted-foreground font-semibold">লেখালেখির আগ্রহ: </span>
                              <span className="text-foreground font-medium">{subData.writingInterest}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {subData.khutbaLesson && (
                        <div className="pt-1">
                          <span className="font-bold text-[11px] text-emerald-900 dark:text-emerald-300">
                            শিক্ষণীয় বিষয়সমূহ:
                          </span>
                          <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap mt-0.5">
                            {subData.khutbaLesson}
                          </p>
                        </div>
                      )}

                      {subData.story && (
                        <div className="pt-1">
                          <span className="font-bold text-[11px] text-emerald-900 dark:text-emerald-300">
                            মূল বক্তব্য / অনুভূতি / গল্প:
                          </span>
                          <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap mt-0.5">
                            {subData.story}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Regular Rating & Comment */}
                  <div className="space-y-1">
                    {r.rating && (
                      <div className="flex items-center text-amber-500">
                        {Array.from({ length: r.rating }).map((_, i) => (
                          <Star key={i} className="h-3.5 w-3.5 fill-amber-500" />
                        ))}
                      </div>
                    )}
                    {r.comment && !hasCampaignData && (
                      <p className="text-muted-foreground leading-relaxed italic bg-muted/30 p-2.5 rounded-xl border border-border/50">
                        &quot;{r.comment}&quot;
                      </p>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/40">
                    <span className="text-[10px] text-muted-foreground font-mono">
                      {new Date(r.createdAt).toLocaleString("bn-BD")}
                    </span>

                    <div className="flex items-center gap-2">
                      {/* Publish as Article Button (Great for 1st, 2nd, 3rd winner campaign stories) */}
                      <button
                        type="button"
                        onClick={() => openPublishModal(r)}
                        disabled={publishingId === r.id}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition-colors cursor-pointer shadow-xs disabled:opacity-50"
                        title="এই লেখাটি বিজয়ী হিসেবে একটি স্বতন্ত্র আর্টিকেল রূপে প্রকাশ করুন"
                      >
                        {publishingId === r.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <FileText className="h-3.5 w-3.5" />
                        )}
                        <span>আর্টিকেল প্রকাশ (Publish Article)</span>
                      </button>

                      {!r.isApproved ? (
                        <button
                          type="button"
                          onClick={() => handleApprove(r.id, true)}
                          disabled={processingId === r.id}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-colors cursor-pointer disabled:opacity-50"
                        >
                          <Check className="h-3.5 w-3.5" />
                          <span>অনুমোদন করুন (Approve)</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleApprove(r.id, false)}
                          disabled={processingId === r.id}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold transition-colors cursor-pointer disabled:opacity-50"
                        >
                          <XCircle className="h-3.5 w-3.5" />
                          <span>অনুমোদন বাতিল করুন (Hide)</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-muted text-foreground text-xs font-bold hover:bg-muted/80 transition-colors cursor-pointer"
          >
            বন্ধ করুন
          </button>
        </div>
      </div>

      {/* Publish Winner Article Dialog */}
      {publishingRecord && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-card w-full max-w-lg rounded-3xl border border-border shadow-2xl p-6 space-y-4 animate-in fade-in-50 zoom-in-95">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground text-sm sm:text-base">
                    ক্যাম্পেইন লেখা আর্টিকেল হিসেবে প্রকাশ
                  </h3>
                  <p className="text-[11px] text-muted-foreground">
                    লেখক:{" "}
                    <strong className="text-foreground">
                      {publishingRecord.user?.name ||
                        (publishingRecord.submissionData as any)?.name ||
                        "শুভাকাঙ্ক্ষী"}
                    </strong>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setPublishingRecord(null)}
                className="p-1 rounded-xl text-muted-foreground hover:bg-muted cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-foreground mb-1.5">
                  পুরস্কার ও সম্মাননা পদবী (Winner Badge / Position)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                  {[
                    "১ম স্থান বিজয়ী",
                    "২য় স্থান বিজয়ী",
                    "৩য় স্থান বিজয়ী",
                    "সেরা ৫ সম্মাননা",
                    "ক্যাম্পেইন লেখক",
                  ].map((pos) => (
                    <button
                      key={pos}
                      type="button"
                      onClick={() => setPublishPosition(pos)}
                      className={cn(
                        "py-1.5 px-2 rounded-xl border text-[11px] font-semibold text-center transition-all cursor-pointer",
                        publishPosition === pos
                          ? "bg-purple-600 text-white border-purple-600 shadow-xs"
                          : "bg-muted/40 hover:bg-muted text-muted-foreground border-border"
                      )}
                    >
                      {pos}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-foreground mb-1">
                  আর্টিকেলের শিরোনাম (Article Title) *
                </label>
                <input
                  type="text"
                  required
                  value={publishTitle}
                  onChange={(e) => setPublishTitle(e.target.value)}
                  className="w-full px-3.5 py-2 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500 font-semibold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-foreground mb-1">
                  ক্যাটাগরি (Category)
                </label>
                <input
                  type="text"
                  value={publishCategory}
                  onChange={(e) => setPublishCategory(e.target.value)}
                  className="w-full px-3.5 py-2 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border">
              <button
                type="button"
                onClick={() => setPublishingRecord(null)}
                className="px-4 py-2 rounded-xl border border-border text-xs font-semibold text-muted-foreground hover:bg-muted cursor-pointer"
              >
                বাতিল
              </button>
              <button
                type="button"
                onClick={handleConfirmPublish}
                disabled={publishingId === publishingRecord.id || !publishTitle.trim()}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all shadow-md disabled:opacity-50 cursor-pointer"
              >
                {publishingId === publishingRecord.id ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Check className="h-3.5 w-3.5" />
                )}
                <span>আর্টিকেল প্রকাশ করুন</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

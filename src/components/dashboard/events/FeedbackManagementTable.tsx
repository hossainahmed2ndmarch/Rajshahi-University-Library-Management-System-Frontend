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
} from "lucide-react";
import { IEvent, IEventMemberRecord } from "@/types/event";
import { EventMemberRecordService } from "@/services/event.service";
import { toast } from "sonner";

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

  const filtered = records.filter((r) => {
    if (approvalFilter === "APPROVED") return r.isApproved;
    if (approvalFilter === "PENDING") return !r.isApproved;
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
            মোট মতামত: <span className="font-bold text-foreground">{filtered.length}</span> টি
          </span>
        </div>

        {/* Body Content */}
        <div className="p-5 overflow-y-auto space-y-3 flex-1 text-xs">
          {isLoading ? (
            <div className="text-center py-12">
              <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
              <p className="text-xs text-muted-foreground mt-2">মতামত লোড হচ্ছে...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground border border-dashed border-border rounded-2xl">
              কোনো মতামত পাওয়া যায়নি।
            </div>
          ) : (
            filtered.map((r) => (
              <div
                key={r.id}
                className="p-4 rounded-2xl bg-card border border-border space-y-3 hover:border-emerald-600/30 transition-colors shadow-2xs"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-full bg-emerald-100 dark:bg-emerald-950 text-primary font-bold text-xs flex items-center justify-center border border-border">
                      {r.user?.name?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <div>
                      <p className="font-bold text-foreground">{r.user?.name}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {r.user?.email} {r.user?.phone ? `• ${r.user.phone}` : ""}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-[10px] font-bold">
                      উপস্থিতি: {r.status}
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

                {/* Rating & Comment */}
                <div className="space-y-1 pl-10">
                  {r.rating && (
                    <div className="flex items-center text-amber-500">
                      {Array.from({ length: r.rating }).map((_, i) => (
                        <Star key={i} className="h-3.5 w-3.5 fill-amber-500" />
                      ))}
                    </div>
                  )}
                  <p className="text-muted-foreground leading-relaxed italic bg-muted/30 p-2.5 rounded-xl border border-border/50">
                    &quot;{r.comment}&quot;
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-2 pt-2 border-t border-border/40">
                  {!r.isApproved ? (
                    <button
                      onClick={() => handleApprove(r.id, true)}
                      disabled={processingId === r.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <Check className="h-3.5 w-3.5" />
                      <span>অনুমোদন করুন (Approve)</span>
                    </button>
                  ) : (
                    <button
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
            ))
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
    </div>
  );
}

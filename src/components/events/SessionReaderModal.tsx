"use client";

import React from "react";
import { X, Calendar, BookOpen, Layers, CheckCircle2 } from "lucide-react";
import { IEventSession } from "@/types/event";
import { AudioPlayerCard } from "./AudioPlayerCard";

interface SessionReaderModalProps {
  session: IEventSession | null;
  isOpen: boolean;
  onClose: () => void;
  eventTitle?: string;
}

export function SessionReaderModal({
  session,
  isOpen,
  onClose,
  eventTitle,
}: SessionReaderModalProps) {
  if (!isOpen || !session) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in-50">
      <div className="bg-card w-full max-w-2xl rounded-3xl border border-border shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border bg-muted/20">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-semibold">
                <Layers className="h-3 w-3" />
                <span>{eventTitle || "পাঠচক্র ও ইভেন্ট সেশন"}</span>
              </span>
              <span className="text-xs text-muted-foreground flex items-center gap-1 font-mono">
                <Calendar className="h-3 w-3" />
                {session.sessionDate
                  ? new Date(session.sessionDate).toLocaleDateString("bn-BD", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "তারিখ নির্ধারিত নয়"}
              </span>
            </div>
            <h3 className="text-lg font-bold text-foreground">
              {session.chapter || "সেশনের বিস্তারিত সারসংক্ষেপ"}
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Audio Player if audioUrl is available */}
          {session.audioUrl && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                রেকর্ডকৃত অডিও সেশন শুনুন
              </h4>
              <AudioPlayerCard
                audioUrl={session.audioUrl}
                chapter={session.chapter || undefined}
                sessionDate={session.sessionDate?.slice(0, 10)}
                sessionId={session.id}
              />
            </div>
          )}

          {/* Reading Content */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <BookOpen className="h-3.5 w-3.5 text-emerald-600" />
              <span>সেশনের মূল আলোচনা ও সারসংক্ষেপ</span>
            </h4>

            {session.summary ? (
              <div className="prose dark:prose-invert max-w-none text-foreground/90 text-sm sm:text-base leading-relaxed p-5 rounded-2xl bg-muted/30 border border-border/70 whitespace-pre-line font-sans">
                {session.summary}
              </div>
            ) : (
              <div className="p-8 text-center rounded-2xl bg-muted/20 border border-dashed border-border text-muted-foreground text-xs">
                এই সেশনের জন্য লিখিত কোনো সারসংক্ষেপ এখনও যুক্ত করা হয়নি। অডিও রেকর্ডিংটি শুনুন।
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border flex justify-end bg-muted/20">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-sm"
          >
            বন্ধ করুন
          </button>
        </div>
      </div>
    </div>
  );
}

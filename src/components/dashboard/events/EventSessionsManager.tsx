"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Plus,
  Trash2,
  Edit,
  Headphones,
  Calendar,
  Loader2,
  Layers,
  Volume2,
} from "lucide-react";
import { IEvent, IEventSession } from "@/types/event";
import { EventSessionService } from "@/services/event.service";
import { FileUploadDropzone } from "@/components/ui/FileUploadDropzone";
import { toast } from "sonner";

interface EventSessionsManagerProps {
  isOpen: boolean;
  onClose: () => void;
  event: IEvent;
  allowDelete: boolean;
  onUpdate: () => void;
}

export function EventSessionsManager({
  isOpen,
  onClose,
  event,
  allowDelete,
  onUpdate,
}: EventSessionsManagerProps) {
  const [sessions, setSessions] = useState<IEventSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Add / Edit session inline form state
  const [editingSession, setEditingSession] = useState<IEventSession | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [sessionDate, setSessionDate] = useState("");
  const [chapter, setChapter] = useState("");
  const [summary, setSummary] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchSessions = async () => {
    try {
      setIsLoading(true);
      const data = await EventSessionService.getSessionsByEvent(event.id);
      setSessions(data);
    } catch {
      toast.error("সেশনসমূহ লোড করতে ব্যর্থ হয়েছে");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchSessions();
    }
  }, [isOpen, event.id]);

  const handleOpenAdd = () => {
    setEditingSession(null);
    setSessionDate(new Date().toISOString().slice(0, 10));
    setChapter("");
    setSummary("");
    setAudioUrl("");
    setShowForm(true);
  };

  const handleOpenEdit = (s: IEventSession) => {
    setEditingSession(s);
    setSessionDate(s.sessionDate ? s.sessionDate.slice(0, 10) : "");
    setChapter(s.chapter || "");
    setSummary(s.summary || "");
    setAudioUrl(s.audioUrl || "");
    setShowForm(true);
  };

  const handleSaveSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionDate) {
      toast.error("সেশনের তারিখ আবশ্যক");
      return;
    }

    try {
      setIsSubmitting(true);
      if (editingSession) {
        await EventSessionService.updateSession(editingSession.id, {
          sessionDate,
          chapter: chapter || undefined,
          summary: summary || undefined,
          audioUrl: audioUrl || undefined,
        });
        toast.success("সেশন সফলভাবে আপডেট করা হয়েছে!");
      } else {
        await EventSessionService.createSession({
          eventId: event.id,
          sessionDate,
          chapter: chapter || undefined,
          summary: summary || undefined,
          audioUrl: audioUrl || undefined,
        });
        toast.success("নতুন সেশন তৈরি হয়েছে!");
      }
      setShowForm(false);
      fetchSessions();
      onUpdate();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "সেশন সংরক্ষণ করতে ব্যর্থ হয়েছে");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSession = async (s: IEventSession) => {
    if (!allowDelete) {
      toast.error("শুধুমাত্র Super Admin সেশন মুছে ফেলতে পারবেন");
      return;
    }

    if (!confirm("আপনি কি নিশ্চিত যে এই সেশনটি মুছে ফেলতে চান?")) return;

    try {
      setDeletingId(s.id);
      await EventSessionService.deleteSession(s.id);
      toast.success("সেশন মুছে ফেলা হয়েছে");
      fetchSessions();
      onUpdate();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "সেশন মুছতে ব্যর্থ হয়েছে");
    } finally {
      setDeletingId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-card w-full max-w-2xl rounded-3xl border border-border shadow-2xl flex flex-col max-h-[90vh] animate-in fade-in-50 zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border bg-muted/20">
          <div>
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <Layers className="h-4 w-4 text-emerald-600" />
              <span>সেশন ব্যবস্থাপনা: {event.title}</span>
            </h2>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              ধারাবাহিক পাঠচক্র ও সেমিনারের নিয়মিত সেশন, আলোচনার সারসংক্ষেপ ও অডিও যুক্ত করুন
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Add Session Trigger Button */}
          {!showForm && (
            <button
              onClick={handleOpenAdd}
              className="w-full py-3 border-2 border-dashed border-emerald-500/40 hover:border-emerald-500 rounded-2xl flex items-center justify-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50/30 dark:bg-emerald-950/20 hover:bg-emerald-50/60 transition-all cursor-pointer shadow-2xs"
            >
              <Plus className="h-4 w-4" />
              <span>নতুন সেশন যুক্ত করুন</span>
            </button>
          )}

          {/* Inline Add / Edit Form */}
          {showForm && (
            <form
              onSubmit={handleSaveSession}
              className="p-4 rounded-2xl bg-muted/30 border border-border space-y-3.5 text-xs animate-in fade-in-50"
            >
              <div className="flex items-center justify-between border-b border-border/60 pb-2">
                <span className="font-bold text-foreground flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-emerald-600" />
                  <span>{editingSession ? "সেশন সম্পাদনা" : "নতুন সেশন ফরম"}</span>
                </span>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="p-1 text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-foreground mb-1">
                    সেশনের তারিখ *
                  </label>
                  <input
                    type="date"
                    required
                    value={sessionDate}
                    onChange={(e) => setSessionDate(e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-2xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-foreground mb-1">
                    আলোচিত অধ্যায় / বিষয় (Chapter)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., অধ্যায় ৩: সালাতের রুকনসমূহ"
                    value={chapter}
                    onChange={(e) => setChapter(e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-2xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-foreground mb-1">
                  সেশনের মূল সারসংক্ষেপ (Summary)
                </label>
                <textarea
                  rows={3}
                  placeholder="সেশনের প্রধান আলোচনা, পয়েন্ট এবং সিদ্ধান্তসমূহ লিখুন..."
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none shadow-2xs"
                />
              </div>

              {/* Direct Audio Upload Component */}
              <FileUploadDropzone
                type="audio"
                value={audioUrl}
                onChange={(url) => setAudioUrl(url)}
                onUpload={EventSessionService.uploadAudio}
                label="সেশনের অডিও রেকর্ডিং (Audio Recording)"
                helperText="সরাসরি অডিও ফাইল আপলোড করুন (MP3, WAV, M4A up to 60MB) অথবা পূর্বে সংরক্ষিত অডিও পরিবর্তন করুন"
              />

              <div className="flex justify-end gap-2 pt-2 border-t border-border/60">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-3.5 py-1.5 rounded-xl border border-border text-foreground hover:bg-muted transition-colors cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50 inline-flex items-center gap-1.5"
                >
                  {isSubmitting && <Loader2 className="h-3 w-3 animate-spin" />}
                  <span>{isSubmitting ? "সংরক্ষণ হচ্ছে..." : "সংরক্ষণ করুন"}</span>
                </button>
              </div>
            </form>
          )}

          {/* Sessions List */}
          {isLoading ? (
            <div className="text-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mx-auto text-emerald-600" />
              <p className="text-xs text-muted-foreground mt-2">সেশন লোড হচ্ছে...</p>
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground border border-dashed border-border rounded-2xl">
              <p className="text-xs">এখনও কোনো সেশন তৈরি করা হয়নি।</p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                বিদ্যমান সেশনসমূহ ({sessions.length})
              </p>
              {sessions.map((s, idx) => (
                <div
                  key={s.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-2xl border border-border bg-card hover:bg-muted/30 transition-colors gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="h-5 w-5 rounded-full bg-emerald-600/10 text-emerald-700 dark:text-emerald-300 text-[10px] font-mono font-bold flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <span className="font-bold text-xs text-foreground">
                        {s.chapter || "সাধারণ সেশন"}
                      </span>
                      <span className="text-[10px] font-mono text-muted-foreground bg-muted px-1.5 py-0.2 rounded">
                        {s.sessionDate ? s.sessionDate.slice(0, 10) : ""}
                      </span>
                    </div>

                    {s.summary && (
                      <p className="text-[11px] text-muted-foreground line-clamp-2 pl-7">
                        {s.summary}
                      </p>
                    )}

                    {s.audioUrl && (
                      <div className="pl-7 pt-1">
                        <audio
                          controls
                          src={s.audioUrl}
                          className="h-7 w-full max-w-xs rounded"
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                    <button
                      onClick={() => handleOpenEdit(s)}
                      className="p-1.5 rounded-lg border border-border hover:bg-blue-50 dark:hover:bg-blue-950/40 text-blue-600 dark:text-blue-400 transition-colors cursor-pointer"
                      title="সম্পাদনা করুন"
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </button>
                    {allowDelete && (
                      <button
                        disabled={deletingId === s.id}
                        onClick={() => handleDeleteSession(s)}
                        className="p-1.5 rounded-lg border border-border hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 transition-colors cursor-pointer disabled:opacity-50"
                        title="মুছে ফেলুন (Super Admin Only)"
                      >
                        {deletingId === s.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="h-3.5 w-3.5" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border flex justify-end bg-muted/20">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-sm"
          >
            সম্পন্ন
          </button>
        </div>
      </div>
    </div>
  );
}

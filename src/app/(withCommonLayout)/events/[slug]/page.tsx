"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import {
  CalendarDays,
  Clock,
  MapPin,
  Sparkles,
  Layers,
  Star,
  CheckCircle,
  AlertCircle,
  Headphones,
  Send,
  UserCheck,
  Building,
  ArrowLeft,
  BookOpen,
  Users,
  Heart,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import {
  EventService,
  EventMemberRecordService,
} from "@/services/event.service";
import {
  IEvent,
  IEventSession,
  IEventMemberRecord,
  IAttendanceStats,
} from "@/types/event";
import { useGetMe } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { AudioPlayerCard } from "@/components/events/AudioPlayerCard";
import { LivePresenceCounter } from "@/components/events/LivePresenceCounter";
import { SessionReaderModal } from "@/components/events/SessionReaderModal";
import { CampaignSubmissionModal } from "@/components/events/CampaignSubmissionModal";

interface EventDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default function EventDetailPage({ params }: EventDetailPageProps) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;

  const { data: user } = useGetMe();

  const [event, setEvent] = useState<IEvent | null>(null);
  const [stats, setStats] = useState<IAttendanceStats | null>(null);
  const [myRecords, setMyRecords] = useState<IEventMemberRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Selected session for full reader modal
  const [readingSession, setReadingSession] = useState<IEventSession | null>(null);
  const [isCampaignModalOpen, setIsCampaignModalOpen] = useState(false);

  // Feedback form state
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>("");
  const [selectedSessionId, setSelectedSessionId] = useState<string>("");
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [isRegisteringAttendance, setIsRegisteringAttendance] = useState(false);

  const fetchEventData = async () => {
    try {
      setIsLoading(true);
      const ev = await EventService.getEventBySlug(slug);
      setEvent(ev);

      if (ev?.id) {
        // Fetch stats
        EventMemberRecordService.getEventStats(ev.id)
          .then((s) => setStats(s))
          .catch(() => {});

        // If user logged in, fetch user's record for this event
        if (user) {
          EventMemberRecordService.getMyRecords(ev.id)
            .then((recs) => setMyRecords(recs))
            .catch(() => {});
        }
      }
    } catch {
      toast.error("ইভেন্ট লোড করতে ব্যর্থ হয়েছে");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEventData();
  }, [slug, user?.id]);

  // Attendance checking
  // A record counts as actual attendee if admin marked status as PRESENT or COMPLETED
  const isActualPresent = myRecords.some(
    (r) => r.status === "PRESENT" || r.status === "COMPLETED"
  );

  const adminAttendanceRecord = myRecords.find(
    (r) =>
      r.status === "PRESENT" ||
      r.status === "COMPLETED" ||
      r.status === "ABSENT" ||
      r.status === "EXCUSED"
  );

  const isInterested = myRecords.some((r) => r.status === "INTERESTED");
  const existingFeedbackRecord = myRecords.find((r) => Boolean(r.comment));

  // Check if admin enabled feedback without attendance
  const eventMetadata = (event?.metadata as any) || {};
  const allowOpenFeedback = Boolean(
    eventMetadata.allowOpenFeedback || eventMetadata.allowFeedbackWithoutAttendance
  );

  // User can give feedback if: admin gave attendance OR admin enabled open feedback
  const canProvideFeedback = Boolean(adminAttendanceRecord || allowOpenFeedback);

  // Total attendees only count actually present/completed
  const attendeesCount =
    stats?.attendees !== undefined
      ? stats.attendees
      : (stats?.present || 0) + (stats?.completed || 0);

  const interestedCount = stats?.interested || 0;

  // Handle Attendance Interest / Check-In
  const handleRegisterAttendance = async () => {
    if (!user) {
      toast.error("উপস্থিতি রেকর্ড করতে অনুগ্রহ করে লগইন করুন");
      return;
    }
    if (!event) return;

    try {
      setIsRegisteringAttendance(true);
      const res = await EventMemberRecordService.recordSelfAttendance({
        eventId: event.id,
        sessionId: selectedSessionId ? Number(selectedSessionId) : null,
        status: "INTERESTED",
      });
      toast.success(res.message || "উপস্থিতির আগ্রহ সফলভাবে রেকর্ড করা হয়েছে");
      fetchEventData();
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "উপস্থিতি রেকর্ড করতে ব্যর্থ হয়েছে"
      );
    } finally {
      setIsRegisteringAttendance(false);
    }
  };

  // Handle Feedback Submission
  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("মতামত প্রদান করতে লগইন আবশ্যক");
      return;
    }
    if (!event) return;
    if (!comment.trim()) {
      toast.error("অনুগ্রহ করে আপনার মতামত লিখুন");
      return;
    }

    try {
      setIsSubmittingFeedback(true);
      await EventMemberRecordService.submitFeedback({
        eventId: event.id,
        sessionId: selectedSessionId ? Number(selectedSessionId) : null,
        rating,
        comment,
      });
      toast.success(
        "আপনার মতামত সফলভাবে জমা হয়েছে! অ্যাডমিন অনুমোদনের পর তা প্রদর্শিত হবে।"
      );
      setComment("");
      fetchEventData();
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "মতামত জমা দিতে ব্যর্থ হয়েছে"
      );
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 space-y-8 animate-pulse">
        <div className="h-64 rounded-3xl bg-muted/60" />
        <div className="h-96 rounded-3xl bg-muted/40" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20 text-center space-y-4">
        <AlertCircle className="h-12 w-12 mx-auto text-rose-500" />
        <h2 className="text-xl font-bold">ইভেন্টটি খুঁজে পাওয়া যায়নি</h2>
        <Link
          href="/events"
          className="inline-flex items-center gap-2 text-primary font-bold hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          সকল ইভেন্টে ফিরে যান
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-10 py-8 sm:py-12">
      {/* Top Breadcrumb & Return */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Link
          href="/events"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>সকল ইভেন্টস</span>
        </Link>
      </div>

      {/* Hero Banner Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-card border border-border overflow-hidden shadow-xl">
          {/* Cover Photo */}
          <div className="relative h-64 sm:h-80 w-full overflow-hidden bg-gradient-to-tr from-[#003824] via-[#004F32] to-[#040D09]">
            {event.bannerImage ? (
              <img
                src={event.bannerImage}
                alt={event.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center opacity-15">
                <CalendarDays className="h-32 w-32 text-white" />
              </div>
            )}

            {/* Badges Over Cover */}
            <div className="absolute top-4 left-4 flex flex-wrap gap-2">
              <span className="rounded-full bg-emerald-500 text-white px-3 py-1 text-xs font-bold shadow-md">
                {event.status}
              </span>
              <span className="rounded-full bg-black/60 text-white px-3 py-1 text-xs font-mono backdrop-blur-md">
                {event.org}
              </span>
              {event.category && (
                <span className="rounded-full bg-[#C78700] text-white px-3 py-1 text-xs font-semibold shadow-md">
                  {event.category}
                </span>
              )}
            </div>

            {/* Live Presence Badge Over Cover */}
            <div className="absolute bottom-4 right-4">
              <LivePresenceCounter eventId={event.id} variant="badge" />
            </div>
          </div>

          {/* Details Row under banner */}
          <div className="p-6 sm:p-8 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
              <div className="space-y-2">
                {event.activity && (
                  <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#004F32] dark:text-emerald-400">
                    <Layers className="h-3.5 w-3.5" />
                    <span>{event.activity.title}</span>
                  </div>
                )}
                <h1 className="text-2xl sm:text-4xl font-black text-foreground tracking-tight">
                  {event.title}
                </h1>
                {event.currentChapter && (
                  <p className="text-sm font-semibold text-amber-600 dark:text-amber-400">
                    বিষয়বস্তু: {event.currentChapter}
                  </p>
                )}
              </div>

              {/* Attendance Status Quick View */}
              {user && (
                <div className="shrink-0 flex items-center gap-2">
                  {isActualPresent ? (
                    <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 text-xs font-bold">
                      <CheckCircle className="h-4 w-4 text-emerald-500" />
                      <span>উপস্থিতি নিশ্চিতকৃত</span>
                    </div>
                  ) : isInterested ? (
                    <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-xs font-bold">
                      <Heart className="h-4 w-4 text-amber-500 fill-amber-500" />
                      <span>আগ্রহী হিসেবে নথিভুক্ত</span>
                    </div>
                  ) : null}
                </div>
              )}
            </div>

            {/* Info Grid & Verified Attendance Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-muted/40 border border-border/70 space-y-1">
                <span className="text-[11px] font-bold text-muted-foreground uppercase flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-emerald-600" />
                  <span>সময়সূচি</span>
                </span>
                <p className="text-xs sm:text-sm font-semibold text-foreground">
                  {event.scheduleText || "নির্ধারিত নয়"}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-muted/40 border border-border/70 space-y-1">
                <span className="text-[11px] font-bold text-muted-foreground uppercase flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-emerald-600" />
                  <span>স্থান</span>
                </span>
                <p className="text-xs sm:text-sm font-semibold text-foreground">
                  {event.location || "রাবি ক্যাম্পাস"}
                </p>
              </div>

              {/* Actual Present Attendees Count */}
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-1">
                <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 uppercase flex items-center gap-1.5">
                  <UserCheck className="h-3.5 w-3.5 text-emerald-600" />
                  <span>উপস্থিত অংশগ্রহণকারী</span>
                </span>
                <p className="text-sm sm:text-lg font-black text-emerald-700 dark:text-emerald-400">
                  {attendeesCount} জন
                </p>
              </div>

              {/* Interested Count */}
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-1">
                <span className="text-[11px] font-bold text-amber-800 dark:text-amber-300 uppercase flex items-center gap-1.5">
                  <Heart className="h-3.5 w-3.5 text-amber-600" />
                  <span>আগ্রহী সদস্য</span>
                </span>
                <p className="text-sm sm:text-lg font-black text-amber-700 dark:text-amber-400">
                  {interestedCount} জন
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content: Sessions & Interactive Panel */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Sessions & Audio Player & Reviews (2 cols) */}
          <div className="lg:col-span-2 space-y-8">
            {/* Live Presence Card */}
            <LivePresenceCounter eventId={event.id} variant="card" />

            {/* Connected Books Section */}
            {event.books && event.books.length > 0 && (
              <div className="rounded-3xl border border-border bg-card p-5 sm:p-6 space-y-4 shadow-xs">
                <div className="flex items-center gap-2 border-b border-border/60 pb-3">
                  <BookOpen className="h-5 w-5 text-emerald-600" />
                  <h3 className="text-base font-bold text-foreground">
                    পাঠ্য বা সম্পর্কিত বইসমূহ ({event.books.length})
                  </h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {event.books.map((b) => (
                    <Link
                      key={b.id}
                      href={`/books/${b.id}`}
                      className="flex items-center gap-3 p-3 rounded-2xl bg-muted/30 hover:bg-muted/70 border border-border transition-all group"
                    >
                      {b.coverImage ? (
                        <img
                          src={b.coverImage}
                          alt={b.title}
                          className="h-14 w-10 rounded-lg object-cover shadow-xs shrink-0"
                        />
                      ) : (
                        <div className="h-14 w-10 rounded-lg bg-emerald-600/10 text-emerald-600 flex items-center justify-center font-bold text-xs shrink-0">
                          <BookOpen className="h-4 w-4" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-foreground group-hover:text-emerald-600 transition-colors line-clamp-1">
                          {b.title}
                        </p>
                        <p className="text-[11px] text-muted-foreground truncate">{b.author}</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-emerald-600 transition-colors shrink-0" />
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Sessions Header */}
            <div className="border-b border-border pb-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-foreground flex items-center gap-2">
                  <Layers className="h-5 w-5 text-emerald-600" />
                  <span>ধারাবাহিক সেশনসমূহ ({event.sessions?.length || 0})</span>
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  সেশনের বিস্তারিত আলোচনা পড়ুন এবং সরাসরি অডিও শুনুন
                </p>
              </div>
            </div>

            {/* Sessions List with Integrated Audio Player */}
            {!event.sessions || event.sessions.length === 0 ? (
              <div className="text-center py-12 bg-card rounded-3xl border border-dashed border-border p-6">
                <CalendarDays className="h-10 w-10 mx-auto text-muted-foreground/60 mb-2" />
                <p className="text-xs text-muted-foreground">
                  এই ইভেন্টের অধীনে এখনও কোনো সেশন যুক্ত করা হয়নি।
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                {event.sessions.map((session, index) => (
                  <div
                    key={session.id}
                    className="rounded-3xl border border-border bg-card p-5 sm:p-6 space-y-4 hover:border-emerald-600/40 transition-all shadow-xs"
                  >
                    {/* Session Top Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-3">
                      <div className="flex items-center gap-2.5">
                        <span className="h-7 w-7 rounded-xl bg-emerald-600/10 text-emerald-700 dark:text-emerald-300 font-bold text-xs flex items-center justify-center">
                          {index + 1}
                        </span>
                        <div>
                          <h4 className="text-sm sm:text-base font-bold text-foreground">
                            {session.chapter || `সেশন #${index + 1}`}
                          </h4>
                          <span className="text-[11px] text-muted-foreground font-mono">
                            {new Date(session.sessionDate).toLocaleDateString("bn-BD", {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setReadingSession(session)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-muted/60 hover:bg-muted text-xs font-semibold text-foreground transition-colors cursor-pointer border border-border shadow-2xs"
                      >
                        <BookOpen className="h-3.5 w-3.5 text-emerald-600" />
                        <span>বিস্তারিত পড়ুন</span>
                      </button>
                    </div>

                    {/* Inline Summary */}
                    {session.summary && (
                      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed line-clamp-3">
                        {session.summary}
                      </p>
                    )}

                    {/* Integrated Audio Player Card */}
                    {session.audioUrl && (
                      <div className="pt-1">
                        <AudioPlayerCard
                          audioUrl={session.audioUrl}
                          chapter={session.chapter || `সেশন #${index + 1}`}
                          sessionDate={session.sessionDate?.slice(0, 10)}
                          sessionId={session.id}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Approved Public Reviews / Feedbacks */}
            {event.memberRecords && event.memberRecords.length > 0 && (
              <div className="pt-6 space-y-4">
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2 border-b border-border pb-3">
                  <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                  <span>অনুমোদিত পর্যালোচনা ও মতামত ({event.memberRecords.length})</span>
                </h3>

                <div className="space-y-3">
                  {event.memberRecords.map((rec) => {
                    const subData = (rec.submissionData as Record<string, any>) || {};
                    const displayName = rec.user?.name || subData.name || "সম্মানিত পাঠক / শুভাকাঙ্ক্ষী";
                    const displayInstitution = subData.institution || (rec.user ? "RUIL সদস্য" : null);
                    const displayTopic = subData.khutbaTopic;
                    const displayMasjid = subData.masjidName;
                    const displayLesson = subData.khutbaLesson;
                    const displayComment = rec.comment || subData.story || displayLesson;

                    return (
                      <div
                        key={rec.id}
                        className="p-4 sm:p-5 rounded-2xl bg-card border border-border space-y-3 shadow-2xs hover:border-emerald-600/30 transition-colors"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <div className="h-8 w-8 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold text-xs flex items-center justify-center border border-emerald-500/20">
                              {displayName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-foreground">
                                {displayName}
                              </p>
                              {displayInstitution && (
                                <p className="text-[10px] text-muted-foreground">
                                  {displayInstitution}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {rec.rating && (
                              <div className="flex items-center text-amber-500 text-xs">
                                {Array.from({ length: rec.rating }).map((_, i) => (
                                  <Star key={i} className="h-3 w-3 fill-amber-500" />
                                ))}
                              </div>
                            )}
                            <span className="text-[10px] text-muted-foreground font-mono">
                              {new Date(rec.createdAt).toLocaleDateString("bn-BD")}
                            </span>
                          </div>
                        </div>

                        {/* If campaign topics exist */}
                        {(displayTopic || displayMasjid) && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {displayMasjid && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-muted text-[10px] font-medium text-foreground">
                                <MapPin className="h-2.5 w-2.5 text-emerald-600" />
                                {displayMasjid}
                              </span>
                            )}
                            {displayTopic && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 text-[10px] font-semibold border border-emerald-500/20">
                                {displayTopic}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Content / Comment */}
                        {displayComment && (
                          <p className="text-xs text-muted-foreground leading-relaxed pl-1 sm:pl-2 border-l-2 border-emerald-500/30 italic">
                            &quot;{displayComment}&quot;
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Attendance & Feedback Panel */}
          <div className="space-y-6">
            <div className="rounded-3xl border border-border bg-card p-6 space-y-6 shadow-md sticky top-24">
              <div>
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <UserCheck className="h-5 w-5 text-emerald-600" />
                  <span>উপস্থিতি ও মতামত পোর্টাল</span>
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {allowOpenFeedback
                    ? "এই ইভেন্টে সরাসরি উন্মুক্ত ফিডব্যাক অনুমোদিত রয়েছে।"
                    : "অ্যাডমিন উপস্থিতি নিশ্চিত করার পর আপনি এই ইভেন্টে মতামত ও রেটিং প্রদান করতে পারবেন।"}
                </p>
              </div>

              {/* Public Campaign Action Card (For Members & Non-members) */}
              <div className="rounded-2xl border-2 border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent p-4 space-y-2.5 shadow-2xs">
                <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300">
                  <Sparkles className="h-4 w-4 text-emerald-600" />
                  <span className="font-bold text-xs">বিশেষ ক্যাম্পেইন / খুতবার শিক্ষা</span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  জুমুআর খুতবা, শিক্ষণীয় ঘটনা বা অনুভূতি লিখে পাঠান — যেকোনো ব্যক্তি (ইউজার বা নন-ইউজার) সরাসরি অংশ নিতে পারেন!
                </p>
                <button
                  type="button"
                  onClick={() => setIsCampaignModalOpen(true)}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>ক্যাম্পেইনে লেখা পাঠান</span>
                </button>
              </div>

              {!user ? (
                /* User not logged in */
                <div className="rounded-2xl bg-muted/60 p-5 text-center space-y-3 border border-border">
                  <AlertCircle className="h-8 w-8 mx-auto text-amber-500" />
                  <p className="text-xs text-muted-foreground">
                    উপস্থিতি যাচাই বা মতামত প্রদান করতে অনুগ্রহ করে লগইন করুন।
                  </p>
                  <Link
                    href="/login"
                    className="inline-block px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors shadow-sm"
                  >
                    লগইন করুন
                  </Link>
                </div>
              ) : (
                /* User Logged in */
                <div className="space-y-5">
                  {/* Attendance Status Box */}
                  <div className="rounded-2xl bg-background border border-border p-4 space-y-2.5">
                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                      আপনার বর্তমান অবস্থা:
                    </span>

                    {isActualPresent ? (
                      <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                        <CheckCircle className="h-4 w-4" />
                        <span>অ্যাডমিন কর্তৃক উপস্থিতি নিশ্চিতকৃত (PRESENT)</span>
                      </div>
                    ) : adminAttendanceRecord ? (
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 font-semibold text-xs">
                        <CheckCircle className="h-4 w-4" />
                        <span>হাজিরা স্ট্যাটাস: {adminAttendanceRecord.status}</span>
                      </div>
                    ) : isInterested ? (
                      <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-semibold text-xs">
                        <Heart className="h-4 w-4 fill-amber-500" />
                        <span>আপনি এই ইভেন্টে আগ্রহী হিসেবে নথিভুক্ত</span>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-xs text-muted-foreground">
                          হাজিরা এখনও রেকর্ড করা হয়নি। ইভেন্টে অংশ নিতে আপনার আগ্রহ নথিভুক্ত করুন।
                        </p>
                        <button
                          type="button"
                          disabled={isRegisteringAttendance}
                          onClick={handleRegisterAttendance}
                          className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50"
                        >
                          {isRegisteringAttendance ? "নথিভুক্ত হচ্ছে..." : "অংশগ্রহণের আগ্রহ প্রকাশ করুন"}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Feedback Box */}
                  {existingFeedbackRecord ? (
                    <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-4 space-y-2">
                      <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-bold text-xs">
                        <CheckCircle className="h-4 w-4" />
                        <span>আপনার মতামত জমা রয়েছে</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {existingFeedbackRecord.isApproved
                          ? "আপনার মতামতটি অনুমোদিত হয়েছে এবং সবার জন্য প্রদর্শিত হচ্ছে।"
                          : "আপনার মতামতটি অ্যাডমিন পর্যালোচনার অপেক্ষায় রয়েছে।"}
                      </p>
                      {existingFeedbackRecord.comment && (
                        <p className="text-xs italic text-foreground/80 bg-background/80 p-2.5 rounded-xl border border-border">
                          "{existingFeedbackRecord.comment}"
                        </p>
                      )}
                    </div>
                  ) : canProvideFeedback ? (
                    /* Feedback Form: enabled because user is present OR open feedback enabled */
                    <form
                      onSubmit={handleSubmitFeedback}
                      className="rounded-2xl bg-background border border-border p-4 space-y-4"
                    >
                      <div className="flex items-center justify-between border-b border-border pb-2">
                        <span className="text-xs font-bold text-foreground">
                          আপনার মূল্যায়ন ও মতামত প্রদান করুন
                        </span>
                        {allowOpenFeedback && !adminAttendanceRecord && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold">
                            Open Feedback
                          </span>
                        )}
                      </div>

                      {/* Star Rating Selection */}
                      <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                          রেটিং (Rating)
                        </label>
                        <div className="flex items-center gap-1.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setRating(star)}
                              className="p-1 hover:scale-110 transition-transform cursor-pointer"
                            >
                              <Star
                                className={cn(
                                  "h-5 w-5",
                                  star <= rating
                                    ? "text-amber-500 fill-amber-500"
                                    : "text-muted-foreground/40"
                                )}
                              />
                            </button>
                          ))}
                          <span className="text-xs font-bold text-amber-500 ml-2">
                            {rating} / 5
                          </span>
                        </div>
                      </div>

                      {/* Comment Input */}
                      <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1">
                          আপনার অভিজ্ঞতা ও গঠনমূলক মতামত *
                        </label>
                        <textarea
                          rows={3}
                          required
                          placeholder="আলোচনা ও আয়োজন কেমন লেগেছে? আপনার কোনো পরামর্শ থাকলে লিখুন..."
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          className="w-full px-3 py-2 bg-muted/20 border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none shadow-2xs"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmittingFeedback}
                        className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <Send className="h-3.5 w-3.5" />
                        <span>
                          {isSubmittingFeedback ? "মতামত জমা হচ্ছে..." : "মতামত সাবমিট করুন"}
                        </span>
                      </button>
                    </form>
                  ) : (
                    /* Feedback Disabled Notice */
                    <div className="rounded-2xl bg-muted/40 p-4 border border-border text-center space-y-2">
                      <p className="text-xs text-muted-foreground">
                        এই ইভেন্টে মতামত প্রদানের জন্য অ্যাডমিন কর্তৃক উপস্থিতি রেকর্ড নিশ্চিত করা প্রয়োজন।
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Full Session Reader Modal */}
      <SessionReaderModal
        session={readingSession}
        isOpen={Boolean(readingSession)}
        onClose={() => setReadingSession(null)}
        eventTitle={event.title}
      />

      {/* Campaign / Non-member Submission Modal */}
      <CampaignSubmissionModal
        isOpen={isCampaignModalOpen}
        onClose={() => setIsCampaignModalOpen(false)}
        event={event}
        onSuccess={fetchEventData}
      />
    </div>
  );
}

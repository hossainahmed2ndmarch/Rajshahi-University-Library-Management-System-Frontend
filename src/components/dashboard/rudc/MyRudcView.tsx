"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  Banknote,
  CalendarCheck,
  CheckCircle2,
  Clock,
  CreditCard,
  Edit2,
  ExternalLink,
  Eye,
  HeartHandshake,
  Info,
  Layers,
  Newspaper,
  Phone,
  PenLine,
  Receipt,
  Shield,
  ShieldCheck,
  Sparkles,
  Trash2,
  User,
  UserCheck,
  UserMinus,
  UserPlus,
  Users,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { useMyRudcProfile, useRecordIyanotPayment } from "@/hooks/useRudc";
import { useGetMe } from "@/hooks/useAuth";
import { useGetArticles, useDeleteArticle, useUpdateArticle } from "@/hooks/useArticles";
import { PublicationFormModal } from "@/components/dashboard/publications/PublicationFormModal";
import { PublicationDeleteModal } from "@/components/dashboard/publications/PublicationDeleteModal";
import { SubmitArticleModal } from "@/components/articles/SubmitArticleModal";
import { IArticle, ICreateArticlePayload } from "@/types/article";
import { RudcApplicationStatus, RudcMemberType } from "@/types/rudc";

// ── Helpers & Constants ────────────────────────────────────────────────────────

const STATUS_META: Record<
  RudcApplicationStatus,
  { label: string; enLabel: string; color: string; badgeBg: string; cardBg: string; icon: React.ReactNode; description: string }
> = {
  PENDING_REVIEW: {
    label: "আবেদন পর্যালোচনায়",
    enLabel: "Pending Review",
    color: "text-amber-700 dark:text-amber-400",
    badgeBg: "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-500/30",
    cardBg: "bg-amber-50/70 dark:bg-amber-950/30 border-amber-500/30",
    icon: <Clock className="h-5 w-5 text-amber-500" />,
    description: "আপনার আবেদনটি আমাদের দায়িত্বশীল টিম পর্যালোচনা করছেন। শীঘ্রই সাক্ষাৎকারের জন্য যোগাযোগ করা হবে।",
  },
  INTERVIEW_CALLED: {
    label: "ইন্টারভিউতে আমন্ত্রিত",
    enLabel: "Interview Called",
    color: "text-blue-700 dark:text-blue-400",
    badgeBg: "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-500/30",
    cardBg: "bg-blue-50/70 dark:bg-blue-950/30 border-blue-500/30",
    icon: <CalendarCheck className="h-5 w-5 text-blue-500" />,
    description: "আলহামদুলিল্লাহ! আপনাকে সাক্ষাৎকারের জন্য আমন্ত্রণ জানানো হয়েছে। নির্ধারিত তারিখ ও সময়ে উপস্থিত থাকুন।",
  },
  INTERVIEW_COMPLETED: {
    label: "ইন্টারভিউ সম্পন্ন",
    enLabel: "Interview Completed",
    color: "text-purple-700 dark:text-purple-400",
    badgeBg: "bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border-purple-500/30",
    cardBg: "bg-purple-50/70 dark:bg-purple-950/30 border-purple-500/30",
    icon: <ShieldCheck className="h-5 w-5 text-purple-500" />,
    description: "আপনার সাক্ষাৎকার সফলভাবে সম্পন্ন হয়েছে। চূড়ান্ত অনুমোদন ও টিম অ্যাসাইনমেন্ট প্রক্রিয়াধীন রয়েছে।",
  },
  APPROVED: {
    label: "অনুমোদিত ও সক্রিয়",
    enLabel: "Approved Member",
    color: "text-emerald-700 dark:text-emerald-400",
    badgeBg: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-500/30",
    cardBg: "bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-500/30",
    icon: <CheckCircle2 className="h-5 w-5 text-emerald-500" />,
    description: "আপনি RUDC-এর একজন সক্রিয় সদস্য। নিয়মিত দাওয়াহ ও সমাজকল্যাণ কার্যক্রমে সক্রিয়ভাবে অংশগ্রহণ করুন।",
  },
  REJECTED: {
    label: "আবেদন বিবেচনায় স্থগিত",
    enLabel: "Not Accepted",
    color: "text-red-700 dark:text-red-400",
    badgeBg: "bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300 border-red-500/30",
    cardBg: "bg-red-50/70 dark:bg-red-950/30 border-red-500/30",
    icon: <XCircle className="h-5 w-5 text-red-500" />,
    description: "দুঃখিত, এই অধিবেশনে আপনার আবেদনটি গ্রহণ করা সম্ভব হয়নি। পরবর্তী সেশনে পুনরায় আবেদন করতে পারেন।",
  },
};

const MEMBER_TYPE_LABELS: Record<string, { label: string; bnLabel: string }> = {
  VOLUNTEER: { label: "Volunteer", bnLabel: "ভলান্টিয়ার" },
  MEMBER: { label: "General Member", bnLabel: "সাধারণ সদস্য" },
  EXECUTIVE_COMMITTEE: { label: "Executive Committee", bnLabel: "কার্যনির্বাহী পরিষদ" },
  SHURA_MEMBER: { label: "Majlis ash-Shura", bnLabel: "মজলিসে শূরা" },
  ALUMNI: { label: "Alumni", bnLabel: "অ্যালামনাই" },
};

const monthNames = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const monthBanglaNames = [
  "জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন",
  "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর",
];

// ── Component ──────────────────────────────────────────────────────────────────

export function MyRudcView() {
  const { data: user, isLoading: userLoading } = useGetMe();
  const { data: myProfile, isLoading: profileLoading } = useMyRudcProfile();
  const { mutateAsync: recordIyanot, isPending: isPaying } = useRecordIyanotPayment();

  // Combine profile: prefer full myProfile (with relations), fallback to user from useGetMe()
  const effectiveProfile = myProfile || (user ? {
    id: Number(user.id),
    name: user.name,
    email: user.email,
    phone: user.phone || "",
    studentOrVoterId: user.studentOrVoterId || "—",
    department: user.department || null,
    faculty: (user as any).faculty || null,
    skills: [],
    isRudcMember: Boolean((user as any).isRudcMember),
    rudcMemberType: (user as any).rudcMemberType || ("MEMBER" as RudcMemberType),
    rudcStatus: (user as any).rudcStatus || null,
    rudcJoinedAt: (user as any).rudcJoinedAt || null,
    interviewDate: (user as any).interviewDate || null,
    supervisor: null,
    supervisedVolunteers: [],
    rudcTeams: [],
    iyanotPayments: [],
  } : null);

  // Articles state
  const { data: articlesData, isLoading: articlesLoading } = useGetArticles(
    effectiveProfile?.id ? { authorUserId: Number(effectiveProfile.id) } : undefined
  );
  const { mutateAsync: deleteArticle, isPending: isDeleting } = useDeleteArticle();
  const { mutateAsync: updateArticle, isPending: isUpdating } = useUpdateArticle();

  const [editArticle, setEditArticle] = useState<IArticle | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<IArticle | null>(null);
  const [submitOpen, setSubmitOpen] = useState(false);
  const [payYear, setPayYear] = useState(new Date().getFullYear());

  const handleSelfPay = async (m: number, y: number) => {
    if (!effectiveProfile) return;
    try {
      await recordIyanot({
        userId: Number(effectiveProfile.id),
        month: m,
        year: y,
        amount: 50,
        paymentMethod: "ONLINE",
        transactionId: `TXN-ONLINE-${Date.now().toString().slice(-6)}`,
        remarks: "Online self-payment via Member Dashboard",
      });
      toast.success(`Iyanot for ${monthNames[m - 1]} ${y} submitted successfully!`);
    } catch {
      // toast handled in hook
    }
  };

  const handleEditSubmit = async (data: ICreateArticlePayload) => {
    if (!editArticle) return;
    try {
      await updateArticle({ id: editArticle.id, ...data });
      setEditArticle(null);
    } catch {
      // toast handled in hook
    }
  };

  // Loading state
  if ((profileLoading && userLoading) || (!effectiveProfile && (profileLoading || userLoading))) {
    return (
      <div className="p-16 text-center space-y-3">
        <div className="h-10 w-10 border-4 border-[#004F32] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-muted-foreground font-medium">
          Loading your RUDC status and dashboard...
        </p>
      </div>
    );
  }

  // Not signed in at all
  if (!effectiveProfile) {
    return (
      <div className="max-w-xl mx-auto rounded-3xl border border-dashed border-border p-8 sm:p-12 text-center space-y-5 bg-card">
        <div className="h-16 w-16 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-[#004F32] dark:text-emerald-400 mx-auto">
          <Users className="h-8 w-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl sm:text-2xl font-black text-foreground">
            Sign In Required
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Please log in to your account to view your RUDC member status, assigned teams, and iyanot records.
          </p>
        </div>
        <div className="pt-2">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#004F32] hover:bg-[#003e27] text-white font-bold text-xs shadow-md transition-all"
          >
            <span>Log In to Account</span>
          </Link>
        </div>
      </div>
    );
  }

  // Status & Member Type details
  const status = effectiveProfile.rudcStatus as RudcApplicationStatus | null | undefined;
  const statusMeta = status ? STATUS_META[status] : null;
  const memberTypeInfo =
    MEMBER_TYPE_LABELS[effectiveProfile.rudcMemberType ?? ""] || {
      label: effectiveProfile.rudcMemberType || "Member",
      bnLabel: "সদস্য",
    };

  const isApproved = status === "APPROVED";
  const isPending = status === "PENDING_REVIEW";
  const isInterviewCalled = status === "INTERVIEW_CALLED";
  const isInterviewDone = status === "INTERVIEW_COMPLETED";
  const isRejected = status === "REJECTED";
  const hasNotApplied = !effectiveProfile.isRudcMember && !status;

  const paidMonths = new Set(
    effectiveProfile.iyanotPayments
      ?.filter((p) => p.status === "PAID" && p.year === payYear)
      .map((p) => p.month) || []
  );

  const myArticles = articlesData?.data || [];

  return (
    <div className="space-y-8 max-w-5xl mx-auto">

      {/* ── Optional Application CTA Banner for unapplied general members ── */}
      {hasNotApplied && (
        <div className="rounded-3xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-amber-500/5 p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="h-10 w-10 rounded-2xl bg-amber-500/20 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-black text-foreground">
                Join RUDC as an Active Volunteer / Member!
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed max-w-xl">
                You are registered on the platform. Apply now to join campus Dawah circles, welfare initiatives, and specialized teams.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 shrink-0">
            <Link
              href="/rudc/join"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#004F32] hover:bg-[#003824] text-white text-xs font-bold shadow-xs transition-colors"
            >
              <UserPlus className="h-3.5 w-3.5 text-amber-300" />
              <span>Apply Volunteer Now</span>
            </Link>
            <Link
              href="/rudc"
              className="inline-flex items-center gap-1 px-3 py-2.5 rounded-xl border border-border bg-card hover:bg-muted text-foreground text-xs font-semibold"
            >
              <span>Explore RUDC</span>
            </Link>
          </div>
        </div>
      )}

      {/* ── 1. Top Profile & Status Banner ── */}
      <div className="rounded-3xl bg-gradient-to-br from-[#004F32] via-[#003e27] to-[#01281a] p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        {/* Decorative background shapes */}
        <div className="absolute -right-10 -top-10 h-56 w-56 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute right-32 -bottom-16 h-40 w-40 rounded-full bg-white/5 pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            {/* Badges: Member Type + Status */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="px-3.5 py-1 rounded-full text-[11px] font-black bg-amber-400 text-emerald-950 uppercase tracking-wider shadow-xs">
                {memberTypeInfo.bnLabel} ({memberTypeInfo.label})
              </span>

              {status ? (
                <span className={`px-3 py-1 rounded-full text-[11px] font-bold border backdrop-blur-md ${statusMeta?.badgeBg}`}>
                  {statusMeta?.label} • {statusMeta?.enLabel}
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-white/15 text-emerald-100 border border-white/20">
                  সাধারণ নিবন্ধিত সদস্য (General User)
                </span>
              )}

              {effectiveProfile.isRudcMember && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-200 border border-emerald-400/30">
                  <ShieldCheck className="h-3 w-3 text-emerald-300" />
                  RUDC Community Member
                </span>
              )}
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight">{effectiveProfile.name}</h2>
              <p className="text-xs sm:text-sm text-emerald-100/90 mt-1">
                {effectiveProfile.department ? `Department of ${effectiveProfile.department}` : "Rajshahi University"}
                {" "}• Student/Voter ID: <span className="font-mono font-bold text-amber-300">{effectiveProfile.studentOrVoterId}</span>
              </p>
              <div className="flex items-center gap-3 text-[11px] text-emerald-200/80 mt-1">
                <span>Email: {effectiveProfile.email}</span>
                <span>•</span>
                <span>Phone: {effectiveProfile.phone}</span>
                {effectiveProfile.rudcJoinedAt && (
                  <>
                    <span>•</span>
                    <span>Joined: {format(new Date(effectiveProfile.rudcJoinedAt), "MMM yyyy")}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Right Summary Card */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/15 p-4 sm:p-5 text-right shrink-0 min-w-[200px] space-y-1">
            <p className="text-[11px] text-amber-300 font-bold uppercase tracking-wider">
              মাসিক ইয়ানত (Iyanot)
            </p>
            <p className="text-2xl sm:text-3xl font-black">50 ৳ <span className="text-xs font-normal text-emerald-200">/ মাস</span></p>
            <p className="text-[10px] text-emerald-100/80">দাওয়াহ ও সামাজিক কার্যক্রম ফান্ড</p>
          </div>
        </div>
      </div>

      {/* ── 2. Application Status / Timeline Card ── */}
      {status && (
        <div className={`rounded-3xl border p-6 space-y-4 shadow-xs ${statusMeta?.cardBg}`}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="mt-0.5 shrink-0">{statusMeta?.icon}</div>
              <div className="space-y-1">
                <h3 className={`text-base font-black ${statusMeta?.color}`}>
                  {statusMeta?.label} ({statusMeta?.enLabel})
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed max-w-2xl">
                  {statusMeta?.description}
                </p>

                {effectiveProfile.interviewDate && (
                  <div className="mt-3 p-3 rounded-2xl bg-card border border-border inline-flex items-center gap-2 text-xs">
                    <CalendarCheck className="h-4 w-4 text-blue-600" />
                    <span>
                      <strong>ইন্টারভিউ শিডিউল:</strong>{" "}
                      {format(new Date(effectiveProfile.interviewDate), "dd MMMM yyyy, hh:mm a")}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {isRejected && (
              <Link
                href="/rudc/join"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#004F32] hover:bg-[#003e27] text-white text-xs font-bold shrink-0 transition-colors"
              >
                <UserPlus className="h-3.5 w-3.5 text-amber-300" />
                <span>Re-apply</span>
              </Link>
            )}
          </div>

          {/* Steps Timeline for non-approved states */}
          {!isApproved && !isRejected && (
            <div className="pt-3 border-t border-border/50">
              <p className="text-[11px] font-bold text-foreground mb-3 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                আবেদন প্রক্রিয়ার ধাপসমূহ (Application Progress):
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                {(
                  [
                    { key: "PENDING_REVIEW", label: "১. আবেদন পর্যালোচনা" },
                    { key: "INTERVIEW_CALLED", label: "২. সাক্ষাৎকার আহ্বান" },
                    { key: "INTERVIEW_COMPLETED", label: "৩. সাক্ষাৎকার সম্পন্ন" },
                    { key: "APPROVED", label: "৪. অনুমোদন ও দায়িত্ব বণ্টন" },
                  ] as { key: RudcApplicationStatus; label: string }[]
                ).map((step, idx) => {
                  const stepOrder: RudcApplicationStatus[] = [
                    "PENDING_REVIEW",
                    "INTERVIEW_CALLED",
                    "INTERVIEW_COMPLETED",
                    "APPROVED",
                  ];
                  const currentIdx = stepOrder.indexOf(status);
                  const stepIdx = stepOrder.indexOf(step.key);
                  const isDone = stepIdx < currentIdx;
                  const isCurrent = stepIdx === currentIdx;

                  return (
                    <div
                      key={step.key}
                      className={`p-3 rounded-2xl border text-xs flex items-center gap-2.5 transition-all ${
                        isDone
                          ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500/40 text-emerald-800 dark:text-emerald-300 font-semibold"
                          : isCurrent
                          ? "bg-amber-50 dark:bg-amber-950/50 border-amber-500 text-amber-900 dark:text-amber-300 font-bold shadow-xs"
                          : "bg-muted/40 border-border text-muted-foreground"
                      }`}
                    >
                      <span
                        className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${
                          isDone
                            ? "bg-emerald-500 text-white"
                            : isCurrent
                            ? "bg-amber-400 text-emerald-950"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {isDone ? <CheckCircle2 className="h-3.5 w-3.5" /> : idx + 1}
                      </span>
                      <span className="truncate">{step.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── 3. Grid: Assigned Teams & Supervisor ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Working Teams Card */}
        <div className="rounded-3xl border border-border bg-card p-6 sm:p-7 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-border/60 pb-3.5">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <Layers className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-foreground">আমার কার্যকারী টিমসমূহ (Assigned Teams)</h3>
                <p className="text-[10px] text-muted-foreground">আপনার অন্তর্ভুক্ত কাজের গ্রুপ ও দায়িত্ব</p>
              </div>
            </div>
            {effectiveProfile.rudcTeams && effectiveProfile.rudcTeams.length > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                {effectiveProfile.rudcTeams.length} টি টিম
              </span>
            )}
          </div>

          {effectiveProfile.rudcTeams && effectiveProfile.rudcTeams.length > 0 ? (
            <div className="space-y-3">
              {effectiveProfile.rudcTeams.map((t) => (
                <div
                  key={t.id}
                  className="p-4 rounded-2xl border border-border bg-muted/20 hover:bg-muted/40 transition-colors flex items-start justify-between gap-3"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-foreground">{t.team.name}</p>
                    {t.team.description && (
                      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                        {t.team.description}
                      </p>
                    )}
                  </div>
                  <span className="px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950 text-[#004F32] dark:text-emerald-400 border border-emerald-600/20 shrink-0">
                    {t.role || "MEMBER"}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-muted-foreground space-y-2">
              <Layers className="h-8 w-8 text-muted-foreground/40 mx-auto" />
              <p className="font-bold text-foreground">আপাতত কোনো টিমে অ্যাসাইন করা হয়নি</p>
              <p className="max-w-xs mx-auto text-[11px] leading-relaxed">
                আপনার দক্ষতা ও পছন্দ অনুসারে কেন্দ্রীয় সমন্বয়কারী আপনাকে নির্দিষ্ট কার্যকারী টিমে (দাওয়াহ, মিডিয়া, লাইব্রেরি ইত্যাদি) যুক্ত করবেন।
              </p>
            </div>
          )}
        </div>

        {/* Supervisor Card */}
        <div className="rounded-3xl border border-border bg-card p-6 sm:p-7 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-border/60 pb-3.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-[#004F32] dark:text-emerald-400">
              <UserCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-foreground">তত্ত্বাবধায়ক ও দিকনির্দেশনা (Supervisor)</h3>
              <p className="text-[10px] text-muted-foreground">আপনার গ্রুপ লিডার বা মেন্টর</p>
            </div>
          </div>

          {effectiveProfile.supervisor ? (
            <div className="space-y-3.5 text-xs">
              <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-muted/30 border border-border/60">
                <div className="h-11 w-11 rounded-2xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center font-black text-emerald-700 dark:text-emerald-400 text-sm shrink-0">
                  {effectiveProfile.supervisor.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-foreground text-sm truncate">{effectiveProfile.supervisor.name}</p>
                  <p className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold">
                    {MEMBER_TYPE_LABELS[effectiveProfile.supervisor.rudcMemberType ?? ""]?.bnLabel || "দায়িত্বশীল"}
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-muted/40 space-y-2 text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  <span className="font-mono text-foreground font-semibold">{effectiveProfile.supervisor.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-[11px]">
                  <HeartHandshake className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                  <span>যেকোনো জিজ্ঞাসা বা অফলাইন চাঁদা প্রদানের জন্য সরাসরি যোগাযোগ করতে পারেন।</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-muted-foreground space-y-2">
              <Clock className="h-8 w-8 text-amber-500/50 mx-auto" />
              <p className="font-bold text-foreground">তত্ত্বাবধায়ক বরাদ্দ প্রক্রিয়াধীন</p>
              <p className="max-w-xs mx-auto text-[11px] leading-relaxed">
                আপনার জন্য একজন তত্ত্বাবধায়ক (Supervisor) নির্ধারণ করা হচ্ছে, যিনি নিয়মিত পরামর্শ ও কার্যক্রমে সহায়তা করবেন।
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── 4. Monthly Iyanot Process & Records List ── */}
      <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-xs space-y-7">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-[#004F32] dark:text-emerald-400">
                <Receipt className="h-5 w-5" />
              </div>
              <h3 className="text-base sm:text-lg font-black text-foreground">
                মাসিক ইয়ানত ট্র্যাকার ও হিসেব ({payYear})
              </h3>
            </div>
            <p className="text-xs text-muted-foreground max-w-xl">
              প্রতিটি সক্রিয় সদস্য ক্যাম্পাসে দাওয়াহ ও সমাজসেবা পরিচালনার জন্য প্রতি মাসে ৫০ টাকা ইয়ানত অনুদান প্রদান করেন।
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-semibold text-muted-foreground">বছর:</span>
            <select
              value={payYear}
              onChange={(e) => setPayYear(Number(e.target.value))}
              className="px-3.5 py-2 rounded-xl border border-border bg-background text-foreground text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#004F32]"
            >
              <option value={2024}>2024</option>
              <option value={2025}>2025</option>
              <option value={2026}>2026</option>
              <option value={2027}>2027</option>
            </select>
          </div>
        </div>

        {/* 12-Month Interactive Grid */}
        <div>
          <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
            {payYear} সালের মাসিক প্রদান চিত্র (Monthly Grid):
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {monthNames.map((m, idx) => {
              const monthNum = idx + 1;
              const isPaid = paidMonths.has(monthNum);
              return (
                <div
                  key={idx}
                  className={`rounded-2xl border p-3.5 text-center space-y-2.5 transition-all ${
                    isPaid
                      ? "bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-500/40 shadow-xs"
                      : "bg-muted/20 border-border hover:border-emerald-600/30"
                  }`}
                >
                  <div>
                    <p className="text-xs font-black text-foreground">{m}</p>
                    <p className="text-[10px] text-muted-foreground">{monthBanglaNames[idx]}</p>
                  </div>

                  <div>
                    {isPaid ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-700 dark:text-emerald-400 bg-emerald-100/80 dark:bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-500/30">
                        <CheckCircle2 className="h-3 w-3" />
                        <span>পরিশোধ (৫০৳)</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => handleSelfPay(monthNum, payYear)}
                        disabled={isPaying}
                        className="w-full px-2 py-1.5 rounded-xl bg-[#004F32] hover:bg-[#003824] text-white text-[10px] font-bold shadow-xs cursor-pointer disabled:opacity-50 transition-colors"
                      >
                        {isPaying ? "জমা হচ্ছে..." : "Pay 50৳"}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Payment Process Guide */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="p-4 rounded-2xl bg-muted/40 border border-border/80 space-y-1.5 text-xs text-muted-foreground">
            <p className="font-bold text-foreground flex items-center gap-1.5">
              <CreditCard className="h-4 w-4 text-[#004F32] dark:text-emerald-400" />
              অনলাইনে ইয়ানত প্রদান:
            </p>
            <p className="leading-relaxed">
              উপরের মাসের কার্ডে &quot;Pay 50৳&quot; বাটনে ক্লিক করে তাৎক্ষণিক অনলাইন সিস্টেমে আপনার মাসিক চাঁদা এন্ট্রি ও পরিশোধ করতে পারেন।
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-muted/40 border border-border/80 space-y-1.5 text-xs text-muted-foreground">
            <p className="font-bold text-foreground flex items-center gap-1.5">
              <HeartHandshake className="h-4 w-4 text-[#C78700] dark:text-amber-400" />
              অফলাইনে তত্ত্বাবধায়কের নিকট প্রদান:
            </p>
            <p className="leading-relaxed">
              সরাসরি আপনার সুপারভাইজার বা কালেকশন বুথে নগদ ৫০ টাকা প্রদান করতে পারেন। তিনি সিস্টেমে রিসিট যুক্ত করলে আপনার স্টেটাস &quot;PAID&quot; হয়ে যাবে।
            </p>
          </div>
        </div>

        {/* Iyanot Records Table */}
        {effectiveProfile.iyanotPayments && effectiveProfile.iyanotPayments.length > 0 && (
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
              <Receipt className="h-4 w-4 text-[#004F32] dark:text-emerald-400" />
              সাম্প্রতিক প্রদান তালিকা (Payment History Records):
            </h4>
            <div className="overflow-x-auto rounded-2xl border border-border">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/60 text-muted-foreground border-b border-border text-[11px] font-bold">
                  <tr>
                    <th className="px-4 py-3">মাস ও বছর</th>
                    <th className="px-4 py-3">পরিমাণ</th>
                    <th className="px-4 py-3">পদ্ধতি</th>
                    <th className="px-4 py-3">অবস্থা</th>
                    <th className="px-4 py-3">রিসিট নম্বর</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {effectiveProfile.iyanotPayments.map((record) => (
                    <tr key={record.id} className="hover:bg-muted/20">
                      <td className="px-4 py-3 font-semibold text-foreground">
                        {monthNames[record.month - 1]} {record.year}
                      </td>
                      <td className="px-4 py-3 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {record.amount} ৳
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {record.paymentMethod === "ONLINE" ? "অনলাইন (Online)" : "নগদ (Cash)"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            record.status === "PAID"
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                              : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                          }`}
                        >
                          {record.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-[11px] text-muted-foreground">
                        {record.receiptNo || record.transactionId || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ── 5. My Published Articles (with Edit, Delete, Submit New) ── */}
      <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-[#004F32] dark:text-emerald-400">
                <Newspaper className="h-5 w-5" />
              </div>
              <h3 className="text-base sm:text-lg font-black text-foreground">
                আমার প্রকাশিত ও জমাকৃত প্রবন্ধসমূহ (My Published Articles)
              </h3>
            </div>
            <p className="text-xs text-muted-foreground">
              আপনার রচিত প্রবন্ধসমূহ সম্পাদনা (Edit), মুছতে (Delete) অথবা নতুন প্রবন্ধ জমা দিতে পারবেন।
            </p>
          </div>

          <button
            onClick={() => setSubmitOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#004F32] hover:bg-[#003824] text-white text-xs font-black shadow-xs transition-colors cursor-pointer shrink-0"
          >
            <PenLine className="h-3.5 w-3.5 text-amber-300" />
            <span>নতুন প্রবন্ধ জমা দিন (Submit Article)</span>
          </button>
        </div>

        {articlesLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 rounded-2xl bg-muted/40 animate-pulse" />
            ))}
          </div>
        ) : myArticles.length === 0 ? (
          <div className="py-12 text-center space-y-3 bg-muted/10 rounded-2xl border border-dashed border-border p-6">
            <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground/60">
              <Newspaper className="h-7 w-7" />
            </div>
            <p className="text-sm font-bold text-foreground">আপনার এখনও কোনো প্রবন্ধ জমা দেওয়া হয়নি</p>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
              ইসলামী জ্ঞানচর্চা, দাওয়াহ ও গবেষণা বিষয়ক লেখা লিখে ক্যাম্পাস কমিউনিটির সাথে শেয়ার করুন।
            </p>
            <button
              onClick={() => setSubmitOpen(true)}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#004F32] hover:bg-[#003824] text-white text-xs font-bold transition-colors cursor-pointer"
            >
              <PenLine className="h-3.5 w-3.5 text-amber-300" />
              <span>প্রথম প্রবন্ধ জমা দিন</span>
            </button>
          </div>
        ) : (
          <div className="space-y-3.5">
            {myArticles.map((article) => {
              const date = article.createdAt
                ? format(new Date(article.createdAt), "dd MMM yyyy")
                : "—";

              return (
                <div
                  key={article.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl border border-border bg-muted/20 hover:bg-muted/40 transition-colors"
                >
                  <div className="flex items-start gap-3.5 min-w-0 flex-1">
                    {/* Cover Thumbnail */}
                    {article.coverImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={article.coverImage}
                        alt={article.title}
                        className="h-16 w-16 rounded-xl object-cover shrink-0 border border-border"
                      />
                    ) : (
                      <div className="h-16 w-16 rounded-xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center shrink-0">
                        <Newspaper className="h-6 w-6 text-[#004F32] dark:text-emerald-400" />
                      </div>
                    )}

                    <div className="min-w-0 flex-1 space-y-1.5">
                      <p className="text-sm font-bold text-foreground leading-snug line-clamp-1">
                        {article.title}
                      </p>

                      <div className="flex items-center gap-2 flex-wrap text-[10px]">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md font-semibold bg-emerald-50 dark:bg-emerald-950 text-[#004F32] dark:text-emerald-400 border border-emerald-600/20">
                          {article.category}
                        </span>
                        {article.org && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md font-semibold bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border border-amber-600/20">
                            {article.org}
                          </span>
                        )}
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-semibold border ${
                            article.isPublished
                              ? "bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 border-green-600/20"
                              : "bg-yellow-50 dark:bg-yellow-950/30 text-yellow-700 dark:text-yellow-400 border-yellow-600/20"
                          }`}
                        >
                          {article.isPublished ? (
                            <><CheckCircle2 className="h-2.5 w-2.5" /> Published</>
                          ) : (
                            <><Clock className="h-2.5 w-2.5" /> Pending Review</>
                          )}
                        </span>
                      </div>

                      <p className="text-[11px] text-muted-foreground">
                        {date} • {article.totalViews || 0} views • {article.totalReadTime || 3} min read
                      </p>
                    </div>
                  </div>

                  {/* Actions: View, Edit, Delete */}
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <Link
                      href={`/publications/${article.slug || article.id}`}
                      target="_blank"
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground text-xs font-semibold transition-colors"
                      title="View Article"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span>View</span>
                    </Link>
                    <button
                      onClick={() => setEditArticle(article)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-border bg-background hover:bg-emerald-50 dark:hover:bg-emerald-950 text-muted-foreground hover:text-[#004F32] dark:hover:text-emerald-400 text-xs font-semibold transition-colors cursor-pointer"
                      title="Edit Article"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => setDeleteTarget(article)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-red-200 dark:border-red-900 bg-background hover:bg-red-50 dark:hover:bg-red-950/30 text-muted-foreground hover:text-red-600 dark:hover:text-red-400 text-xs font-semibold transition-colors cursor-pointer"
                      title="Delete Article"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Modals ── */}
      <SubmitArticleModal
        isOpen={submitOpen}
        onClose={() => setSubmitOpen(false)}
        org="BOTH"
      />

      {editArticle && (
        <PublicationFormModal
          isOpen={true}
          onClose={() => setEditArticle(null)}
          selectedArticle={editArticle}
          onSubmit={handleEditSubmit}
          isSubmitting={isUpdating}
        />
      )}

      {deleteTarget && (
        <PublicationDeleteModal
          isOpen={true}
          onClose={() => setDeleteTarget(null)}
          article={deleteTarget}
          onConfirm={async (id: number) => {
            try {
              await deleteArticle(id);
              setDeleteTarget(null);
            } catch {
              // toast in hook
            }
          }}
          isDeleting={isDeleting}
        />
      )}
    </div>
  );
}

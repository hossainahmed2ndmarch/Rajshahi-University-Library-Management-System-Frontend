"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Sparkles,
  Send,
  Loader2,
  User,
  Phone,
  Building,
  Mail,
  CheckCircle2,
  AlertCircle,
  Star,
  FileText,
} from "lucide-react";
import { IEvent, ICampaignFormField } from "@/types/event";
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

  // Guest details (used if !user)
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestInstitution, setGuestInstitution] = useState("");

  // Dynamic answers keyed by field.id
  const [dynamicAnswers, setDynamicAnswers] = useState<Record<string, any>>({});
  const [rating, setRating] = useState<number>(5);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isAlreadySubmitted, setIsAlreadySubmitted] = useState(false);

  // Extract campaign configuration from metadata
  const eventMetadata = (event.metadata as Record<string, any>) || {};
  const campaignConfig = eventMetadata.campaign;
  const campaignTitle = campaignConfig?.title || event.title;
  const campaignDesc =
    campaignConfig?.description ||
    "আপনার মূল্যবান লেখা বা অভিজ্ঞতা শেয়ার করে অংশ নিন এই বিশেষ ক্যাম্পেইনে।";

  // Check one-time participation from localStorage or user records
  useEffect(() => {
    if (!isOpen) return;

    if (typeof window !== "undefined") {
      const localFlag = localStorage.getItem(`campaign_submitted_${event.id}`);
      if (localFlag === "true") {
        setIsAlreadySubmitted(true);
        return;
      }
    }

    if (user && event.memberRecords) {
      const userRecord = event.memberRecords.find(
        (r) => r.userId === user.id && (r.submissionData || r.comment)
      );
      if (userRecord) {
        setIsAlreadySubmitted(true);
        return;
      }
    }

    setIsAlreadySubmitted(false);
  }, [isOpen, event.id, user, event.memberRecords]);

  // Determine form fields: use custom fields from campaignConfig if available
  const customFields: ICampaignFormField[] =
    campaignConfig && Array.isArray(campaignConfig.fields) && campaignConfig.fields.length > 0
      ? campaignConfig.fields
      : [
          // Fallback legacy fields if admin didn't configure custom fields
          {
            id: "khutbaTopic",
            label: "খুতবার মূল বিষয় বা আলোচনার শিরোনাম",
            type: "text",
            placeholder: "যেমন: আত্মশুদ্ধি ও তাওবা",
            required: true,
          },
          {
            id: "masjidName",
            label: "মসজিদ বা প্রতিষ্ঠানের নাম",
            type: "text",
            placeholder: "যেমন: কেন্দ্রীয় জামে মসজিদ",
            required: false,
          },
          {
            id: "khutbaLesson",
            label: "প্রধান শিক্ষণীয় বক্তব্য বা আলোচনা পয়েন্ট",
            type: "textarea",
            placeholder: "আলোচনার প্রধান বার্তা বা শিক্ষণীয় বিষয়গুলো লিখুন...",
            required: true,
          },
          {
            id: "story",
            label: "ব্যক্তিগত উপলব্ধি বা বাস্তব গল্প (ঐচ্ছিক)",
            type: "textarea",
            placeholder: "আপনার অনুভূতি বা উপলব্ধি শেয়ার করুন...",
            required: false,
          },
        ];

  const handleFieldChange = (fieldId: string, value: any) => {
    setDynamicAnswers((prev) => ({
      ...prev,
      [fieldId]: value,
    }));
  };

  const handleCheckboxToggle = (fieldId: string, option: string) => {
    setDynamicAnswers((prev) => {
      const currentList: string[] = Array.isArray(prev[fieldId]) ? prev[fieldId] : [];
      if (currentList.includes(option)) {
        return { ...prev, [fieldId]: currentList.filter((item) => item !== option) };
      } else {
        return { ...prev, [fieldId]: [...currentList, option] };
      }
    });
  };

  const handleResetAndClose = () => {
    setIsSuccess(false);
    setGuestName("");
    setGuestPhone("");
    setGuestEmail("");
    setGuestInstitution("");
    setDynamicAnswers({});
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent submission if already submitted
    if (isAlreadySubmitted) {
      toast.error("আপনি ইতিমধ্যে এই ক্যাম্পেইনে অংশগ্রহণ করেছেন!");
      return;
    }

    // Guest validation
    if (!user) {
      if (!guestName.trim()) {
        toast.error("অনুগ্রহ করে আপনার নাম লিখুন");
        return;
      }
      if (!guestPhone.trim() || guestPhone.trim().length < 7) {
        toast.error("অনুগ্রহ করে সঠিক মোবাইল নম্বর প্রদান করুন");
        return;
      }
    }

    // Dynamic field validation
    for (const field of customFields) {
      if (field.required) {
        const val = dynamicAnswers[field.id];
        if (
          val === undefined ||
          val === null ||
          (typeof val === "string" && val.trim() === "") ||
          (Array.isArray(val) && val.length === 0)
        ) {
          toast.error(`"${field.label}" ফিল্ডটি পূরণ করা আবশ্যক!`);
          return;
        }
      }
    }

    try {
      setIsSubmitting(true);

      const submissionData: Record<string, any> = {
        name: user ? user.name : guestName.trim(),
        phone: user ? (user.phone || guestPhone.trim()) : guestPhone.trim(),
        email: user?.email || (guestEmail.trim() || undefined),
        institution: guestInstitution.trim() || undefined,
        submittedAt: new Date().toISOString(),
        ...dynamicAnswers,
      };

      // Generate summary comment for display
      const firstTextVal = Object.values(dynamicAnswers).find(
        (v) => typeof v === "string" && v.length > 5
      );
      const generatedComment =
        firstTextVal && typeof firstTextVal === "string"
          ? firstTextVal.slice(0, 300)
          : `${submissionData.name} এর ক্যাম্পেইন সাবমিশন`;

      await EventMemberRecordService.submitCampaign({
        eventId: event.id,
        rating: dynamicAnswers["rating"] ? Number(dynamicAnswers["rating"]) : rating,
        comment: generatedComment,
        submissionData,
      });

      // Mark locally as participated so guest cannot submit again
      if (typeof window !== "undefined") {
        localStorage.setItem(`campaign_submitted_${event.id}`, "true");
      }

      setIsSuccess(true);
      setIsAlreadySubmitted(true);
      toast.success("আপনার লেখা সফলভাবে জমা হয়েছে!");

      if (onSuccess) onSuccess();

      // AUTO-CLOSE MODAL AFTER 1.5 SECONDS
      setTimeout(() => {
        handleResetAndClose();
      }, 1500);
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "লেখা জমা দিতে ব্যর্থ হয়েছে। পুনরায় চেষ্টা করুন।"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-card w-full max-w-2xl rounded-3xl border border-border shadow-2xl flex flex-col max-h-[92vh] animate-in fade-in-50 zoom-in-95 overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-border bg-emerald-500/10">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shrink-0">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-foreground line-clamp-1">
                {campaignTitle}
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

        {/* Success Screen with Auto-close */}
        {isSuccess ? (
          <div className="p-8 text-center space-y-4 my-auto">
            <div className="h-16 w-16 mx-auto rounded-full bg-emerald-500/20 text-emerald-600 flex items-center justify-center animate-bounce">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <h3 className="text-xl font-bold text-foreground">
              আলহামদুলিল্লাহ! আপনার লেখাটি সফলভাবে জমা হয়েছে
            </h3>
            <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
              আপনার সাবমিশন অ্যাডমিন প্যানেলে জমা হয়েছে। যাচাই-বাছাই শেষে নির্বাচিত লেখাটি ওয়েবসাইটে প্রদর্শিত হবে।
            </p>
            <div className="pt-2 text-xs text-emerald-600 font-bold flex items-center justify-center gap-1.5">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span>উইন্ডোটি স্বয়ংক্রিয়ভাবে বন্ধ হচ্ছে...</span>
            </div>
            <div className="pt-3">
              <button
                type="button"
                onClick={handleResetAndClose}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
              >
                এখনই বন্ধ করুন
              </button>
            </div>
          </div>
        ) : isAlreadySubmitted ? (
          /* Already Submitted Screen */
          <div className="p-8 text-center space-y-4 my-auto">
            <div className="h-14 w-14 mx-auto rounded-full bg-amber-500/20 text-amber-600 flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-bold text-foreground">
              আপনি ইতিমধ্যে এই ক্যাম্পেইনে অংশগ্রহণ করেছেন!
            </h3>
            <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
              নিয়মানুযায়ী একজন অংশগ্রহণকারী একটি ক্যাম্পেইনে কেবল একবারই তার লেখা বা মতামত পাঠাতে পারবেন। আমাদের সাথে যুক্ত থাকার জন্য জাযাকাল্লাহু খাইরান।
            </p>
            <div className="pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-muted hover:bg-muted/80 text-foreground text-xs font-bold transition-all cursor-pointer"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        ) : (
          /* Submission Form */
          <form
            onSubmit={handleSubmit}
            className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1"
          >
            {/* Campaign Description Banner */}
            {campaignDesc && (
              <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 text-xs text-muted-foreground leading-relaxed">
                <p className="font-semibold text-foreground mb-1 flex items-center gap-1.5">
                  <FileText className="h-4 w-4 text-emerald-600" />
                  <span>ক্যাম্পেইন নির্দেশনা:</span>
                </p>
                <p className="whitespace-pre-wrap">{campaignDesc}</p>
              </div>
            )}

            {/* Participant Profile Section */}
            <div className="space-y-3 p-4 rounded-2xl bg-muted/20 border border-border">
              <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5 border-b border-border/60 pb-2">
                <User className="h-4 w-4 text-emerald-600" />
                <span>অংশগ্রহণকারীর তথ্য (Participant Info)</span>
              </h4>

              {user ? (
                /* Authenticated User Badge */
                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-background border border-border text-xs">
                  <div className="h-9 w-9 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-foreground">{user.name}</p>
                    <p className="text-[11px] text-muted-foreground">{user.email}</p>
                  </div>
                </div>
              ) : (
                /* Guest Inputs */
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-muted-foreground mb-1">
                      আপনার নাম *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        placeholder="আপনার পূর্ণ নাম লিখুন"
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        className="w-full pl-8 pr-3 py-2 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                      <User className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-muted-foreground mb-1">
                      মোবাইল নম্বর * (যাচাইয়ের জন্য)
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        required
                        placeholder="01XXXXXXXXX"
                        value={guestPhone}
                        onChange={(e) => setGuestPhone(e.target.value)}
                        className="w-full pl-8 pr-3 py-2 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                      <Phone className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-muted-foreground mb-1">
                      ইমেইল (ঐচ্ছিক)
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        placeholder="example@mail.com"
                        value={guestEmail}
                        onChange={(e) => setGuestEmail(e.target.value)}
                        className="w-full pl-8 pr-3 py-2 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                      <Mail className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-muted-foreground mb-1">
                      প্রতিষ্ঠান / বিশ্ববিদ্যালয় (ঐচ্ছিক)
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="যেমন: রাজশাহী বিশ্ববিদ্যালয়"
                        value={guestInstitution}
                        onChange={(e) => setGuestInstitution(e.target.value)}
                        className="w-full pl-8 pr-3 py-2 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                      <Building className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Google Forms-like Dynamic Custom Fields */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5 border-b border-border/60 pb-2">
                <Sparkles className="h-4 w-4 text-emerald-600" />
                <span>ক্যাম্পেইনের নির্ধারিত প্রশ্নাবলি ও উত্তর</span>
              </h4>

              {customFields.map((field) => (
                <div key={field.id} className="space-y-1.5">
                  <label className="block text-xs font-bold text-foreground">
                    {field.label} {field.required && <span className="text-rose-500">*</span>}
                  </label>

                  {field.helperText && (
                    <p className="text-[11px] text-muted-foreground">{field.helperText}</p>
                  )}

                  {/* Render based on field.type */}
                  {field.type === "text" && (
                    <input
                      type="text"
                      required={field.required}
                      placeholder={field.placeholder || "আপনার উত্তর লিখুন..."}
                      value={dynamicAnswers[field.id] || ""}
                      onChange={(e) => handleFieldChange(field.id, e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
                    />
                  )}

                  {field.type === "number" && (
                    <input
                      type="number"
                      required={field.required}
                      placeholder={field.placeholder || "সংখ্যা লিখুন..."}
                      value={dynamicAnswers[field.id] || ""}
                      onChange={(e) => handleFieldChange(field.id, e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
                    />
                  )}

                  {field.type === "textarea" && (
                    <textarea
                      rows={4}
                      required={field.required}
                      placeholder={field.placeholder || "এখানে বিস্তারিত লিখুন..."}
                      value={dynamicAnswers[field.id] || ""}
                      onChange={(e) => handleFieldChange(field.id, e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs resize-none"
                    />
                  )}

                  {field.type === "select" && (
                    <select
                      required={field.required}
                      value={dynamicAnswers[field.id] || ""}
                      onChange={(e) => handleFieldChange(field.id, e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
                    >
                      <option value="">-- অপশন নির্বাচন করুন --</option>
                      {(field.options || []).map((opt, i) => (
                        <option key={i} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  )}

                  {field.type === "radio" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      {(field.options || []).map((opt, i) => {
                        const isSelected = dynamicAnswers[field.id] === opt;
                        return (
                          <label
                            key={i}
                            className={cn(
                              "flex items-center gap-2.5 p-3 rounded-xl border text-xs cursor-pointer transition-all",
                              isSelected
                                ? "bg-emerald-500/10 border-emerald-500/50 text-foreground font-bold"
                                : "bg-muted/20 border-border text-muted-foreground hover:bg-muted/40"
                            )}
                          >
                            <input
                              type="radio"
                              name={field.id}
                              value={opt}
                              checked={isSelected}
                              onChange={() => handleFieldChange(field.id, opt)}
                              className="text-emerald-600 focus:ring-emerald-500"
                            />
                            <span>{opt}</span>
                          </label>
                        );
                      })}
                    </div>
                  )}

                  {field.type === "checkbox" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      {(field.options || []).map((opt, i) => {
                        const list = Array.isArray(dynamicAnswers[field.id])
                          ? dynamicAnswers[field.id]
                          : [];
                        const isChecked = list.includes(opt);
                        return (
                          <label
                            key={i}
                            className={cn(
                              "flex items-center gap-2.5 p-3 rounded-xl border text-xs cursor-pointer transition-all",
                              isChecked
                                ? "bg-emerald-500/10 border-emerald-500/50 text-foreground font-bold"
                                : "bg-muted/20 border-border text-muted-foreground hover:bg-muted/40"
                            )}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleCheckboxToggle(field.id, opt)}
                              className="rounded border-border text-emerald-600 focus:ring-emerald-500"
                            />
                            <span>{opt}</span>
                          </label>
                        );
                      })}
                    </div>
                  )}

                  {field.type === "rating" && (
                    <div className="flex items-center gap-2 pt-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => handleFieldChange(field.id, star)}
                          className="p-1 hover:scale-110 transition-transform cursor-pointer"
                        >
                          <Star
                            className={cn(
                              "h-6 w-6",
                              star <= (dynamicAnswers[field.id] || 5)
                                ? "text-amber-500 fill-amber-500"
                                : "text-muted-foreground/30"
                            )}
                          />
                        </button>
                      ))}
                      <span className="text-xs font-bold text-amber-500 ml-2">
                        {dynamicAnswers[field.id] || 5} / 5
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Submit Button */}
            <div className="pt-4 border-t border-border flex items-center justify-between gap-3">
              <span className="text-[11px] text-muted-foreground">
                * একবার সাবমিট করার পর তথ্য পরিবর্তন করা যাবে না
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="px-4 py-2.5 rounded-xl border border-border text-xs font-bold text-muted-foreground hover:bg-muted transition-colors cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-md cursor-pointer disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  <span>{isSubmitting ? "জমা হচ্ছে..." : "সাবমিট করুন"}</span>
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

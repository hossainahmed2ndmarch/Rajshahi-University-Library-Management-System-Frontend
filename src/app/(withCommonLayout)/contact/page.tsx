"use client";

import React, { useState } from "react";
import {
  PhoneCall,
  Send,
  CheckCircle2,
  Loader2,
  Mail,
  User,
  MessageSquare,
  BookOpen,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { ShiftScheduleSection } from "@/components/shared/ShiftScheduleSection";
import { DonationBanner } from "@/components/shared/DonationBanner";
import { SectionHeader } from "@/components/shared/SectionHeader";

/* ------------------------------------------------------------------ */
/* Types                                                                */
/* ------------------------------------------------------------------ */

interface ContactFormValues {
  name: string;
  email: string;
  subject: string;
  message: string;
}

/* ------------------------------------------------------------------ */
/* Page component                                                       */
/* ------------------------------------------------------------------ */

export default function ContactPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ContactFormValues>();

  const onSubmit = async (data: ContactFormValues) => {
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message ?? "Unknown error");
      setIsSubmitted(true);
      reset();
      toast.success("বার্তা পাঠানো হয়েছে! আমরা শীঘ্রই সাড়া দেব।");
    } catch {
      toast.error("বার্তা পাঠাতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।");
    }
  };


  return (
    <div className="space-y-10 py-8 sm:py-12">
      {/* ─── Hero Header ─── */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-br from-[#004F32] via-[#003824] to-[#040D09] p-8 sm:p-14 text-white shadow-xl relative overflow-hidden">
          <div className="max-w-2xl space-y-4 relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#C78700]/20 px-3.5 py-1 text-xs font-bold text-amber-300 border border-[#C78700]/30">
              <PhoneCall className="h-3.5 w-3.5" />
              <span>যোগাযোগ করুন</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              আমাদের সাথে যোগাযোগ
            </h1>
            <p className="text-sm sm:text-base text-emerald-100/90 leading-relaxed font-light">
              লাইব্রেরি সম্পর্কিত যেকোনো তথ্য, বই ধার বা ক্রয়, সদস্যপদ বা
              অন্য যেকোনো বিষয়ে আমাদের ডিউটি শিফটার বা ইমেইলের মাধ্যমে
              যোগাযোগ করুন।
            </p>
          </div>
          {/* Decorative elements */}
          <div className="absolute -right-12 -top-12 h-56 w-56 rounded-full bg-white/5 pointer-events-none" />
          <div className="absolute -right-4 -bottom-20 h-72 w-72 rounded-full bg-[#C78700]/10 pointer-events-none" />
          <div className="absolute right-32 top-6 h-24 w-24 rounded-full bg-white/3 pointer-events-none" />
          {/* Corner icon */}
          <div className="absolute bottom-6 right-6 sm:right-14 opacity-10 pointer-events-none">
            <BookOpen className="h-24 w-24 sm:h-32 sm:w-32 text-white" />
          </div>
        </div>
      </section>

      {/* ─── Full shift schedule + contact info ─── */}
      <ShiftScheduleSection />

      {/* ─── Email / Message Form ─── */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left info panel */}
          <div className="lg:col-span-2 flex flex-col gap-5">
            <SectionHeader
              icon={Mail}
              subtitleKey="contact.emailSubtitle"
              titleKey="contact.emailTitle"
              descriptionKey="contact.emailDesc"
              className="mb-0"
            />

            {/* Info chips */}
            <div className="space-y-3">
              <div className="flex items-start gap-3 bg-card border border-border rounded-2xl p-4">
                <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Mail className="h-4.5 w-4.5 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground">
                    ইমেইল ঠিকানা
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    ruislamiclibrary@gmail.com
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-card border border-border rounded-2xl p-4">
                <div className="h-9 w-9 rounded-xl bg-secondary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <MessageSquare className="h-4.5 w-4.5 text-secondary" />
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground">
                    উত্তরের সময়
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    সাধারণত ২৪ ঘণ্টার মধ্যে
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-card border border-border rounded-2xl p-4">
                <div className="h-9 w-9 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0 mt-0.5">
                  <User className="h-4.5 w-4.5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground">
                    সদস্যপদ ও সাহায্য
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    সদস্য হওয়া, বই সংক্রান্ত তথ্য বা যেকোনো সাহায্য
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right — Form */}
          <div className="lg:col-span-3">
            <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-sm">
              {isSubmitted ? (
                /* ── Success state ── */
                <div className="flex flex-col items-center justify-center py-12 text-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center">
                    <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h3 className="text-xl font-black text-foreground">
                    বার্তা পাঠানো হয়েছে!
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-xs">
                    আপনার বার্তা আমরা পেয়েছি। আমরা শীঘ্রই আপনার ইমেইলে উত্তর
                    দেব।
                  </p>
                  <button
                    onClick={() => setIsSubmitted(false)}
                    className="mt-2 text-xs font-bold text-primary hover:underline"
                  >
                    আরও একটি বার্তা পাঠান →
                  </button>
                </div>
              ) : (
                /* ── Form ── */
                <form
                  onSubmit={handleSubmit(onSubmit)}
                  className="space-y-5"
                  noValidate
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Name */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-foreground">
                        আপনার নাম{" "}
                        <span className="text-destructive ml-0.5">*</span>
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                        <input
                          type="text"
                          placeholder="মোহাম্মদ রাফি"
                          {...register("name", {
                            required: "নাম আবশ্যক",
                            maxLength: {
                              value: 100,
                              message: "নাম সর্বোচ্চ ১০০ অক্ষর",
                            },
                          })}
                          className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-background border text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all ${
                            errors.name
                              ? "border-destructive focus:ring-destructive/30"
                              : "border-border"
                          }`}
                        />
                      </div>
                      {errors.name && (
                        <p className="text-[11px] text-destructive font-medium">
                          {errors.name.message}
                        </p>
                      )}
                    </div>

                    {/* Email */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-foreground">
                        ইমেইল ঠিকানা{" "}
                        <span className="text-destructive ml-0.5">*</span>
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                        <input
                          type="email"
                          placeholder="you@example.com"
                          {...register("email", {
                            required: "ইমেইল ঠিকানা আবশ্যক",
                            pattern: {
                              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                              message: "বৈধ ইমেইল ঠিকানা দিন",
                            },
                          })}
                          className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-background border text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all ${
                            errors.email
                              ? "border-destructive focus:ring-destructive/30"
                              : "border-border"
                          }`}
                        />
                      </div>
                      {errors.email && (
                        <p className="text-[11px] text-destructive font-medium">
                          {errors.email.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Subject */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-foreground">
                      বিষয়{" "}
                      <span className="text-destructive ml-0.5">*</span>
                    </label>
                    <div className="relative">
                      <MessageSquare className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                      <input
                        type="text"
                        placeholder="যেমন: বই সম্পর্কে তথ্য জানতে চাই"
                        {...register("subject", {
                          required: "বিষয় আবশ্যক",
                          maxLength: {
                            value: 200,
                            message: "বিষয় সর্বোচ্চ ২০০ অক্ষর",
                          },
                        })}
                        className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-background border text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all ${
                          errors.subject
                            ? "border-destructive focus:ring-destructive/30"
                            : "border-border"
                        }`}
                      />
                    </div>
                    {errors.subject && (
                      <p className="text-[11px] text-destructive font-medium">
                        {errors.subject.message}
                      </p>
                    )}
                  </div>

                  {/* Message */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-foreground">
                      বার্তা{" "}
                      <span className="text-destructive ml-0.5">*</span>
                    </label>
                    <textarea
                      rows={5}
                      placeholder="আপনার বার্তা এখানে লিখুন..."
                      {...register("message", {
                        required: "বার্তা আবশ্যক",
                        minLength: {
                          value: 10,
                          message: "বার্তা কমপক্ষে ১০ অক্ষর হতে হবে",
                        },
                        maxLength: {
                          value: 2000,
                          message: "বার্তা সর্বোচ্চ ২০০০ অক্ষর",
                        },
                      })}
                      className={`w-full px-4 py-3 rounded-xl bg-background border text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all resize-none ${
                        errors.message
                          ? "border-destructive focus:ring-destructive/30"
                          : "border-border"
                      }`}
                    />
                    {errors.message && (
                      <p className="text-[11px] text-destructive font-medium">
                        {errors.message.message}
                      </p>
                    )}
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed text-primary-foreground font-bold text-sm px-6 py-3.5 transition-all shadow-sm hover:shadow-md"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        পাঠানো হচ্ছে...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        বার্তা পাঠান
                      </>
                    )}
                  </button>

                  <p className="text-center text-[11px] text-muted-foreground">
                    আপনার তথ্য সম্পূর্ণ নিরাপদ থাকবে এবং কোনো তৃতীয় পক্ষকে
                    দেওয়া হবে না।
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Google Map ─── */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden border border-border shadow-sm h-80 sm:h-[420px] bg-muted">
          <iframe
            title="RU Islamic Library Location"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3634.364716499313!2d88.62589577535503!3d24.36868847824982!2m3!1f0!2f0!3f0!3m2!1i1024!2f768!4f13.1!3m3!1m2!1s0x39fbefd0728c3ccf%3A0x6b16e45de9b37a50!2sCentral%20Library%2C%20University%20of%20Rajshahi!5e0!3m2!1sbn!2sbd!4v1700000000000!5m2!1sbn!2sbd"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen={false}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="w-full h-full grayscale hover:grayscale-0 transition-all duration-500"
          />
          {/* Map label badge */}
          <div className="absolute bottom-4 left-4 bg-card/95 backdrop-blur-sm border border-border rounded-2xl px-4 py-3 shadow-lg flex items-center gap-3">
            <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <BookOpen className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-xs font-black text-foreground leading-tight">
                RU Islamic Library
              </p>
              <p className="text-[10px] text-muted-foreground">
                2nd Floor, Central Library, Rajshahi University
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Donation Banner ─── */}
      <DonationBanner />
    </div>
  );
}

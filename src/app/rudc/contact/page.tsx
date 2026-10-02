"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Send,
  User,
} from "lucide-react";
import { toast } from "sonner";

export default function RudcContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("আপনার বার্তা সফলভাবে পাঠানো হয়েছে! দ্রুত যোগাযোগ করা হবে।");
    setName("");
    setEmail("");
    setSubject("");
    setMessage("");
  };

  return (
    <div className="py-12 lg:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-600/30 text-[#004F32] dark:text-emerald-300 text-xs font-bold">
            <Phone className="h-3.5 w-3.5 text-[#C78700] dark:text-amber-400" />
            <span>Connect with RUDC</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-foreground">
            Contact & Headquarters
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Have questions regarding membership, volunteer applications, or campus dawah activities?
            Visit our physical office or write to us directly.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Details Card */}
          <div className="rounded-3xl border border-border/80 bg-card p-6 sm:p-8 space-y-6 shadow-xs">
            <div>
              <h3 className="text-lg font-bold text-foreground mb-1">Office Location</h3>
              <p className="text-xs text-muted-foreground">
                Our official headquarters and coordination desk is situated inside RU Islamic Library.
              </p>
            </div>

            <div className="space-y-4 text-xs text-muted-foreground">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-foreground">RU Islamic Library</p>
                  <p>Shop No. 44, Stadium Market, Rajshahi University, Rajshahi-6205.</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <div>
                  <p className="font-bold text-foreground">Official Email</p>
                  <a
                    href="mailto:rudc.rajshahi@gmail.com"
                    className="hover:text-emerald-500 transition-colors"
                  >
                    rudc.rajshahi@gmail.com
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <div>
                  <p className="font-bold text-foreground">Helpline & WhatsApp</p>
                  <p>+880 1700-000000 / +880 1800-000000</p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-border">
              <Link
                href="/"
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl border border-emerald-600/30 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 text-[#004F32] dark:text-emerald-300 text-xs font-bold transition-colors"
              >
                <BookOpen className="h-4 w-4 text-amber-500" />
                <span>Visit RU Islamic Library</span>
              </Link>
            </div>
          </div>

          {/* Contact Message Form */}
          <div className="lg:col-span-2 rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-xs">
            <h3 className="text-lg font-bold text-foreground mb-4">Send Us a Direct Message</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">আপনার নাম (Name)</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Full name"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    ইমেইল (Email Address)
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email address"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">বিষয় (Subject)</label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Subject or Query"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">বার্তা (Message)</label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Write your query or message..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                />
              </div>

              <button
                type="submit"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#004F32] hover:bg-[#003e27] text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
              >
                <Send className="h-3.5 w-3.5 text-amber-300" />
                <span>বার্তা পাঠান</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

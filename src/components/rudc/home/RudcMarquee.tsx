"use client";

import React from "react";
import Link from "next/link";
import {
  Bell,
  BookOpen,
  Calendar,
  Camera,
  Clock,
  MapPin,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import { useGetEvents, useGetActivities } from "@/hooks/useEvents";
import { useGetArticles } from "@/hooks/useArticles";

export function RudcMarquee() {
  const { data: eventsData } = useGetEvents({ org: "RUDC", limit: 2 });
  const { data: activitiesData } = useGetActivities({ org: "RUDC", limit: 2 });
  const { data: articlesData } = useGetArticles({ org: "RUDC", limit: 2 });

  const latestEvent = eventsData?.data?.[0]?.title;
  const latestActivity = activitiesData?.data?.[0]?.title;
  const latestArticle = articlesData?.data?.[0]?.title;

  const announcements = [
    {
      icon: MapPin,
      label: "হেডকোয়ার্টার ও অফিস",
      text: "আর ইউ ইসলামিক লাইব্রেরি, দোকান নং ৪৪, স্টেডিয়াম মার্কেট, রাজশাহী বিশ্ববিদ্যালয়",
      color: "text-emerald-400",
      href: "/rudc/contact",
    },
    {
      icon: Clock,
      label: "সাপ্তাহিক পাঠচক্র",
      text: "প্রতি শনিবার বিকেল ৪:০০ টা — সাপ্তাহিক তাযকিয়াহ ও বই পর্যালোচনা পাঠচক্র",
      color: "text-amber-400",
      href: "/rudc/activities",
    },
    {
      icon: Sparkles,
      label: "RUDC কার্যক্রম",
      text: latestActivity
        ? `চলমান কার্যক্রম: ${latestActivity} — ক্যাম্পাসে দাওয়াহ ও চারিত্রিক পরিশুদ্ধি`
        : "ক্যাম্পাসে কুরআন-সুন্নাহর দাওয়াহ, নীতি-নৈতিকতার প্রচার ও শিক্ষার্থীদের আত্মশুদ্ধির কার্যক্রম",
      color: "text-emerald-400",
      href: "/rudc/activities",
    },
    {
      icon: Calendar,
      label: "ইভেন্ট ও সেমিনার",
      text: latestEvent
        ? `আসন্ন ইভেন্ট: ${latestEvent} — বিস্তারিত দেখতে ক্লিক করুন`
        : "মাসিক তাযকিয়াহ সেমিনার ও ক্যাম্পাস ওরিয়েন্টেশন প্রোগ্রাম অনুষ্ঠিত হচ্ছে",
      color: "text-amber-400",
      href: "/rudc/events",
    },
    {
      icon: BookOpen,
      label: "প্রকাশনা ও প্রবন্ধ",
      text: latestArticle
        ? `নতুন প্রবন্ধ: ${latestArticle} — এখন ওয়েবসাইটে পাঠযোগ্য`
        : "সংশয় নিরসন ও যুব সমাজের চারিত্রিক হেদায়েত সংক্রান্ত জ্ঞানগর্ভ আর্টিকেলের সংকলন",
      color: "text-sky-400",
      href: "/rudc/publications",
    },
    {
      icon: Camera,
      label: "গ্যালারি ও চিত্রশালা",
      text: "দাওয়াহ মাহফিল, বই প্রদর্শনী ও ক্যাম্পাস আয়োজনের স্থিরচিত্র লাইব্রেরি গ্যালারিতে সংরক্ষিত",
      color: "text-pink-400",
      href: "/gallery",
    },
    {
      icon: MessageSquare,
      label: "সদস্য রিভিউ ও মতামত",
      text: "RUDC কার্যক্রম সম্পর্কে আপনার মূল্যবান অভিজ্ঞতা ও পরামর্শ শেয়ার করুন",
      color: "text-emerald-300",
      href: "/rudc#reviews",
    },
  ];

  return (
    <div className="relative border-y border-emerald-600/20 bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 text-white overflow-hidden py-2.5 sm:py-3 shadow-inner select-none">
      <div className="flex items-center">
        {/* Static Badge on the left */}
        <div className="z-10 shrink-0 px-3 sm:px-4 py-1 bg-gradient-to-r from-emerald-700 to-[#004F32] rounded-r-full flex items-center gap-1.5 shadow-md border-r border-emerald-400/40">
          <Bell className="h-3.5 w-3.5 text-amber-300 animate-bounce" />
          <span className="text-[11px] font-black uppercase tracking-wider text-emerald-50">
            RUDC বুলেটিন
          </span>
        </div>

        {/* Marquee Scroller */}
        <div className="overflow-hidden whitespace-nowrap w-full group">
          <div className="inline-flex animate-marquee group-hover:[animation-play-state:paused] space-x-8 pl-4">
            {announcements.concat(announcements).map((item, idx) => {
              const Icon = item.icon;
              return (
                <Link
                  key={idx}
                  href={item.href}
                  className="inline-flex items-center space-x-2 text-xs font-medium text-slate-200 hover:text-white transition-colors"
                >
                  <Icon className={`h-3.5 w-3.5 ${item.color} shrink-0`} />
                  <span className="font-bold text-amber-300 underline decoration-amber-400/40">
                    [{item.label}]
                  </span>
                  <span className="text-slate-200">{item.text}</span>
                  <span className="text-slate-600 ml-4 font-bold">•</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-marquee {
          display: inline-flex;
          animation: marquee 35s linear infinite;
        }
      `}</style>
    </div>
  );
}

"use client";

import React from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  CheckCircle,
  FileCheck2,
  HeartHandshake,
  MapPin,
  ShieldAlert,
  UserPlus,
} from "lucide-react";

export default function RudcTermsPage() {
  const termsList = [
    {
      num: 1,
      titleEn: "Five Daily Prayers in Mosque & Ramadan Fasting",
      titleBn: "মসজিদে ৫ ওয়াক্ত জামাতে সালাত আদায় ও রমযানের সিয়াম পালন",
      descEn:
        "One must perform the five daily prayers (Salah) in the mosque in congregation (unless there is a valid Shari'ah-approved excuse) and observe complete fasting during the blessed month of Ramadan.",
      descBn:
        "শরীয়তসম্মত ওজর ব্যতীত প্রত্যেক সদস্যকে অবশ্যই জামায়াতের সাথে মসজিদে পাঁচ ওয়াক্ত সালাত আদায় করতে হবে এবং রমজান মাসের সিয়াম যথাযথভাবে পালন করতে হবে।",
    },
    {
      num: 2,
      titleEn: "Islamic Sunnah Appearance & Proper Attire",
      titleBn: "সুন্নাহসম্মত দাড়ি ও শালীন পোশাক পরিধান",
      descEn:
        "One must maintain a beard in accordance with Islamic guidelines and wear clothing that adheres to the Sunnah. Wearing a Panjabi or Jubba-Pajama is preferable; if trousers are worn, they must strictly be above the ankles.",
      descBn:
        "ইসলামি নির্দেশনা অনুযায়ী এক মুষ্টি পরিমাণ দাড়ি রাখা এবং সুন্নাহসম্মত শালীন পোশাক পরিধান করা আবশ্যক। পাঞ্জাবি বা জুব্বা-পায়জামা পরিধান করা উত্তম; প্যান্ট পরিধান করলে তা অবশ্যই টাখনুর উপরে পরিধান করতে হবে।",
    },
    {
      num: 3,
      titleEn: "Strict Non-Affiliation with Politics or Secret Factions",
      titleBn: "রাজনৈতিক দল বা গোপন সংগঠনের সাথে সম্পৃক্ততা না থাকা",
      descEn:
        "One must not be affiliated with any political party, student political organization, or clandestine group.",
      descBn:
        "কোনো রাজনৈতিক দল, ছাত্র রাজনৈতিক সংগঠন বা গোপন কোনো সংগঠনের সাথে প্রত্যক্ষ বা পরোক্ষভাবে যুক্ত থাকা যাবে না।",
    },
    {
      num: 4,
      titleEn: "Abstinence from Haram Relationships, Music & Sins",
      titleBn: "হারাম সম্পর্ক, গায়রে-মাহরাম মেলামেশা, গান-বাজনা ও কবিরা গুনাহ বর্জন",
      descEn:
        "One must abstain from Haram romantic relationships, telling inappropriate jokes, interacting unnecessarily with Ghayr-Mahram (non-marriageable kin of opposite gender), playing or listening to music, and all forms of sins, whether public or private.",
      descBn:
        "হারাম সম্পর্ক, অশোভন কৌতুক, গায়রে-মাহরাম নারীর সাথে অপ্রয়োজনীয় মেলামেশা বা কথাবার্তা, গান-বাজনা শোনা এবং প্রকাশ্যে বা গোপনে সব ধরণের কবিরা গুনাহ থেকে নিজেকে পবিত্র রাখতে হবে।",
    },
    {
      num: 5,
      titleEn: "No Unauthorized Public Speeches or Processions",
      titleBn: "অনুমোদন ব্যতীত মিছিল, সমাবেশ বা কোনো ফোরামে বক্তব্য প্রদান না করা",
      descEn:
        "One must not participate in or deliver speeches at any procession, demonstration, meeting, or gathering without the explicit authorization of the RUDC leadership.",
      descBn:
        "সংগঠনের দায়িত্বশীলদের অনুমোদন ব্যতীত কোনো মিছিল, বিক্ষোভ সমাবেশ বা সম্মেলনে অংশগ্রহণ কিংবা বক্তব্য প্রদান করা যাবে না।",
    },
    {
      num: 6,
      titleEn: "Refined & Dignified Conduct on Social Media",
      titleBn: "সোশ্যাল মিডিয়ায় মার্জিত ও শালীন ভাষা রক্ষা করা",
      descEn:
        "Members must always maintain refined, decent, respectful, and constructive conduct in their Facebook, WhatsApp, and social media posts and comments.",
      descBn:
        "ফেসবুক, ইউটিউব বা সোশ্যাল মিডিয়ার পোস্ট ও মন্তব্যে সর্বদা মার্জিত, রুচিশীল ও শালীন ভাষা ব্যবহার করতে হবে; কোনো প্রকার অশ্লীল বা উস্কানিমূলক কথা বলা যাবে না।",
    },
    {
      num: 7,
      titleEn: "No Hate or Derogatory Remarks Towards Islamic Groups/Scholars",
      titleBn: "কোনো ইসলামিক সংগঠন বা আলেমের প্রতি বিদ্বেষমূলক মন্তব্য না করা",
      descEn:
        "One must not make hateful, derogatory, or disparaging remarks about any recognized Islamic organization or Islamic scholar (Alim).",
      descBn:
        "কোনো ইসলামিক সংগঠন বা প্রখ্যাত আলেম-ওলামাদের শানে কোনো ধরনের কটূক্তি, কুরুচিপূর্ণ বা বিদ্বেষমূলক বক্তব্য প্রদান করা কঠোরভাবে নিষিদ্ধ।",
    },
    {
      num: 8,
      titleEn: "Diligence & Seriousness in Assigned Responsibilities",
      titleBn: "অর্পিত সাংগঠনিক দায়িত্ব নিষ্ঠা ও গুরুত্বের সাথে পালন",
      descEn:
        "Any responsibility or task assigned by the organization must be fulfilled with due diligence, integrity, and utmost seriousness for the sake of Allah.",
      descBn:
        "সংগঠনের পক্ষ থেকে অর্পিত যেকোনো দায়িত্ব বা কাজকে আল্লাহর সন্তুষ্টির উদ্দেশ্যে আন্তরিকতা ও অত্যন্ত গুরুত্বের সাথে সময়মতো সম্পন্ন করতে হবে।",
    },
    {
      num: 9,
      titleEn: "Tolerance Across Madhhabs & Manhaj of Ahlus Sunnah",
      titleBn: "আহলুস সুন্নাহর সকল স্বীকৃত মাযহাব ও মানহাজের প্রতি সহনশীলতা",
      descEn:
        "One must maintain an attitude of broad-minded tolerance, brotherhood, and flexibility regarding all recognized Madhhabs (Hanafi, Shafi'i, Maliki, Hanbali), Manhaj, and Fiqhi differences within Ahlus Sunnah wal Jama'ah; one-sided fanaticism is strictly prohibited.",
      descBn:
        "আহলুস সুন্নাহ ওয়াল জামায়াতের অন্তর্ভুক্ত সকল স্বীকৃত মাযহাব, মানহাজ ও ফিকহি মতপার্থক্যের ক্ষেত্রে উদারতা ও সহনশীলতার মনোভাব বজায় রাখতে হবে; কোনো ধরনের গোঁড়ামি বা সংকীর্ণতা গ্রহণযোগ্য নয়।",
    },
    {
      num: 10,
      titleEn: "Abstinence from Jahili & Un-Islamic Festivals",
      titleBn: "জাহেলী বা ইসলামবিরোধী উৎসব ও দ্বীন বিকৃতকারী কর্মকা্ল্ড থেকে দূরে থাকা",
      descEn:
        "One must not participate in Jahili (pre-Islamic/un-Islamic) festivals, bid'ah practices, or engage in thoughts and activities that distort the pure Deen of Islam.",
      descBn:
        "জাহেলী, বিজাতীয় বা ইসলামবিরোধী কোনো ধরনের মেলা, উৎসব বা কর্মকাণ্ডে অংশগ্রহণ করা যাবে না এবং দ্বীনের মৌলিক শিক্ষাকে বিকৃত করে এমন যেকোনো কাজ থেকে দূরে থাকতে হবে।",
    },
  ];

  return (
    <div className="py-12 lg:py-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Header Document Banner */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-600/30 text-[#004F32] dark:text-emerald-300 text-xs font-bold">
            <FileCheck2 className="h-3.5 w-3.5 text-[#C78700] dark:text-amber-400" />
            <span>Official Membership Document</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-foreground">
            Membership Form & Conditions (শর্তাবলী)
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground font-medium max-w-2xl mx-auto leading-relaxed">
            Rajshahi University Dawah Community (RUDC) is a social, non-political, and
            service-oriented campus-based Dawah organization.
          </p>

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-card border border-border text-xs text-muted-foreground shadow-xs">
            <MapPin className="h-4 w-4 text-[#004F32] dark:text-emerald-400 shrink-0" />
            <span>RU Islamic Library, Shop No. 44, Stadium Market, Rajshahi University</span>
          </div>
        </div>

        {/* Notice Box */}
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5 flex items-start gap-3.5 text-xs text-amber-900 dark:text-amber-200">
          <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1 leading-relaxed">
            <p className="font-bold">গুরুত্বপূর্ণ নির্দেশনা / Important Notice:</p>
            <p>
              RUDC-এর সদস্য বা ভলান্টিয়ার হিসেবে যুক্ত হতে হলে নিচের প্রতিটি শর্ত আন্তরিকভাবে মেনে
              চলার অঙ্গীকার করতে হবে। আবেদন ফর্মে উল্লেখিত শর্তাবলী মেনে চলার সম্মতি বাধ্যতামূলক।
            </p>
          </div>
        </div>

        {/* 10 Detailed Conditions */}
        <div className="space-y-4">
          {termsList.map((term) => (
            <div
              key={term.num}
              className="rounded-2xl border border-border/80 bg-card p-5 sm:p-6 shadow-xs hover:border-emerald-600/40 transition-colors"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-8 w-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 items-center justify-center text-xs font-black text-[#004F32] dark:text-emerald-400 shrink-0">
                  {term.num}
                </div>
                <div className="space-y-2 flex-1">
                  <div className="space-y-0.5">
                    <h3 className="text-sm sm:text-base font-bold text-foreground">
                      {term.titleBn}
                    </h3>
                    <p className="text-xs font-semibold text-[#004F32] dark:text-emerald-400">
                      {term.titleEn}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {term.descBn}
                  </p>
                  <p className="text-xs text-muted-foreground/80 leading-relaxed italic border-t border-border/40 pt-1.5 mt-1.5">
                    {term.descEn}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Supervision & Iyanot Rule */}
        <div className="rounded-2xl border border-emerald-600/30 bg-emerald-50/50 dark:bg-emerald-950/30 p-6 space-y-3">
          <h3 className="text-sm font-bold text-[#004F32] dark:text-emerald-300 flex items-center gap-2">
            <HeartHandshake className="h-4 w-4 text-[#C78700] dark:text-amber-400" />
            <span>তত্ত্বাবধান (Supervision) ও মাসিক চাঁদা (Iyanot) সংক্রান্ত নিয়ম:</span>
          </h3>
          <ul className="space-y-2 text-xs text-foreground/90 list-disc list-inside leading-relaxed">
            <li>
              প্রত্যেক ভলান্টিয়ারকে ছোট ছোট গ্রুপে বিভক্ত করে একজন টিম লিডার বা সুপারভাইজারের
              অধীনে রাখা হয়, যিনি তাদের দ্বীনি অগ্রগতি ও কার্যক্রম পর্যবেক্ষণ করেন।
            </li>
            <li>
              ভলান্টিয়ারদের মেধা ও দক্ষতার উপর ভিত্তি করে ফুড টিম, গ্রাফিক্স টিম, মিডিয়া টিম
              ইত্যাদিতে কাজের দায়িত্ব বণ্টন করা হয়।
            </li>
            <li>
              দাওয়াহ কার্যক্রম পরিচালনার জন্য প্রত্যেক সদস্য/ভলান্টিয়ারের মাসিক ৫০/- (পঞ্চাশ) টাকা
              করে চাঁদা বা ইয়ানত জমা দিতে হয়, যা অনলাইন বা সুপারভাইজারের মাধ্যমে অফলাইনে রশিদ গ্রহণ
              করে প্রদান করা যায়।
            </li>
          </ul>
        </div>

        {/* Action Button */}
        <div className="pt-4 text-center space-y-3">
          <Link
            href="/rudc/join"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[#004F32] to-[#016842] hover:from-[#003e27] hover:to-[#004F32] text-sm font-bold text-white shadow-md hover:shadow-lg transition-all"
          >
            <UserPlus className="h-4 w-4 text-amber-300" />
            <span>আমি শর্তসমূহে একমত — ভলান্টিয়ার আবেদন করুন</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
          <div>
            <Link
              href="/"
              className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
            >
              <BookOpen className="h-3.5 w-3.5 text-amber-500" />
              <span>RU Islamic Library-এর হোমপেজে যান</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import React from "react";
import Link from "next/link";
import {
  HeartHandshake,
  ArrowRight,
  Building2,
  Truck,
  Package,
  Quote,
  BookOpen,
} from "lucide-react";
import { useLanguageStore } from "@/store/useLanguageStore";
import { cn } from "@/lib/utils";

interface DonationBannerProps {
  className?: string;
  showHeaderBadge?: boolean;
}

export function DonationBanner({
  className = "",
  showHeaderBadge = true,
}: DonationBannerProps) {
  const { language } = useLanguageStore();
  const currentLang = (language as "bn" | "en" | "ar") || "bn";

  const content = {
    badge: {
      bn: "সদকায়ে জারিয়া ও কিতাব ওয়াকফ প্রকল্প",
      en: "Sadaqah Jariyah & Book Endowment",
      ar: "مشروع الوقف العلمي والصدقة الجارية",
    },
    title: {
      bn: "বই দান করুন, তৈরি করুন ভবিষ্যৎ গবেষকদের অনন্ত জ্ঞানের ভিত্তি",
      en: "Donate Books & Build Eternal Knowledge for Future Scholars",
      ar: "تبرع بالكتب وأسهم في بناء صرح المعرفة لعلماء المستقبل",
    },
    subtitle: {
      bn: "আপনার দানকৃত ইসলামিক কিতাব, গবেষণাপত্র ও তাফসির গ্রন্থসমূহ যাচাই ও বারকোড বরাদ্দ করে রাজশাহী বিশ্ববিদ্যালয়ের হাজারো শিক্ষার্থী ও আলেমের জ্ঞানচর্চায় উন্মুক্ত করা হয়।",
      en: "Your contributed Islamic texts, academic treatises, and manuscripts are verified, cataloged with barcodes, and made accessible to thousands of Rajshahi University researchers.",
      ar: "يتم فحص وتوثيق وفهرسة ما تتبرع به من كتب ورسائل علمية ومخطوطات لتكون في متناول آلاف الطلاب والباحثين بجامعة راجشاهي.",
    },
    hadithQuote: {
      bn: "«মানুষ যখন মারা যায়, তার সমস্ত আমল বন্ধ হয়ে যায়—কেবল তিনটি ছাড়া: সদকায়ে জারিয়া, এমন জ্ঞান যা মানুষের উপকারে আসে, অথবা নেক সন্তান যে তার জন্য দোয়া করে।»",
      en: "“When a human being dies, all their deeds come to an end except three: a continuing charity (Sadaqah Jariyah), beneficial knowledge, or a righteous child who prays for them.”",
      ar: "«إِذَا مَاتَ الإِنْسَانُ انْقَطَعَ عَنْهُ عَمَلُهُ إِلاَّ مِنْ ثَلاَثَةٍ: إِلاَّ مِنْ صَدَقَةٍ جَارِيَةٍ، أَوْ عِلْمٍ يُنْتَفَعُ بِهِ، أَوْ وَلَدٍ صَالِحٍ يَدْعُو لَهُ»",
    },
    hadithSource: {
      bn: "সহিহ মুসলিম: ১৬৩১",
      en: "Sahih Muslim: 1631",
      ar: "صحيح مسلم: 1631",
    },
    primaryCta: {
      bn: "বই দান ফরম পূরণ করুন",
      en: "Submit Book Donation",
      ar: "تقديم طلب التبرع بالكتب",
    },
    secondaryCta: {
      bn: "দান নির্দেশিকা ও পদ্ধতি",
      en: "Donation Guidelines",
      ar: "إرشادات وضوابط التبرع",
    },
  };

  return (
    <section
      className={cn(
        "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-5 sm:py-8",
        className,
      )}
    >
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#004F32] via-[#003824] to-[#040D09] p-8 sm:p-12 lg:p-14 text-white border border-emerald-800/80 dark:border-emerald-700/60 shadow-2xl">
        {/* Ambient Decorative Radial Flares */}
        <div className="pointer-events-none absolute -left-20 -top-20 h-80 w-80 rounded-full bg-emerald-500/15 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 -bottom-20 h-96 w-96 rounded-full bg-[#C78700]/15 blur-3xl" />

        {/* Decorative Watermark Outline Icon */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/4 opacity-5 pointer-events-none hidden lg:block">
          <HeartHandshake className="h-[480px] w-[480px] text-amber-300" />
        </div>

        <div className="relative z-10 space-y-8">
          {/* Top Banner Header */}
          <div className="max-w-3xl space-y-4">
            {showHeaderBadge && (
              <div className="inline-flex items-center gap-2 rounded-full bg-[#C78700]/20 px-4 py-1.5 text-xs font-bold text-amber-300 border border-[#C78700]/40 backdrop-blur-xs shadow-2xs">
                <HeartHandshake className="h-4 w-4 text-amber-400" />
                <span>{content.badge[currentLang]}</span>
              </div>
            )}

            <h2 className="text-2xl sm:text-4xl font-black tracking-tight leading-[1.15] text-white">
              {content.title[currentLang]}
            </h2>

            <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed font-light max-w-2xl">
              {content.subtitle[currentLang]}
            </p>
          </div>

          {/* Prophetic Hadith Callout Box */}
          <div className="relative rounded-2xl bg-white/5 border border-white/10 p-5 sm:p-6 backdrop-blur-md max-w-3xl">
            <Quote className="h-6 w-6 text-amber-400/80 mb-2 opacity-80" />
            <p className="text-xs sm:text-sm text-emerald-50/95 italic leading-relaxed font-medium">
              {content.hadithQuote[currentLang]}
            </p>
            <p className="text-[11px] font-bold text-amber-300/90 mt-2 text-right">
              — {content.hadithSource[currentLang]}
            </p>
          </div>

          {/* Action CTAs */}
          <div className="pt-2 flex flex-wrap items-center gap-4">
            <Link
              href="/donate"
              className="inline-flex items-center gap-2 rounded-xl bg-[#C78700] hover:bg-amber-600 px-6 py-3.5 text-xs sm:text-sm font-bold text-white shadow-lg shadow-[#C78700]/25 transition-all hover:gap-3"
            >
              <HeartHandshake className="h-4 w-4" />
              <span>{content.primaryCta[currentLang]}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              href="/about"
              className="inline-flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 px-5 py-3.5 text-xs sm:text-sm font-semibold text-white transition-colors"
            >
              <BookOpen className="h-4 w-4 text-emerald-200" />
              <span>{content.secondaryCta[currentLang]}</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default DonationBanner;
